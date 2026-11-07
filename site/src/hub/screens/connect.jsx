// SRSS Connect screens (spec Part 1 §6–§12): the communications workspace and editor for the office and for
// teachers, the manage/review/report page, the recipient's notice page with acknowledgement, the Notification
// Centre with preferences, and the header bell. Every change is a `connect` Cloud Function call.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { doc, limit, orderBy, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { announcementsFor, getMany, list, one, useLoad } from "../data";
import { linksText, parseLinks } from "../audience";
import {
  ACTION_TYPES, AUDIENCE_CHOICES, CATEGORIES, OPTIONAL_CATEGORY_IDS, PRIORITIES, PRIORITY_IDS, PRIORITY_TONES, STATUSES, STATUS_TONES, TEACHER_CHOICES, TYPES,
  audienceLabel, canAuthor, canEdit, canReport, canReview, categoryOf, choiceFromKeys, connectCall, feedOrder, fromLocalInput, hasCapability, isImportant,
  isOffice, keysFromChoice, priorityOf, publishDecision, reviewDecision, toLocalInput, validateNotice, workspacePath,
} from "../connect";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";
import "../connect.css";

const when = (value) => formatDate(value, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const day = (value) => (value ? formatDate(`${value}T12:00:00`, { day: "numeric", month: "short", year: "numeric" }) : "—");

// ---------- shared pieces ----------
// Shows a message passed through navigation once, then clears it from history so a reload doesn't repeat it.
function useFlash() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(location.state?.flash || "");
  useEffect(() => { if (location.state?.flash) navigate(location.pathname + location.search, { replace: true, state: null }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [flash, setFlash];
}

export function PriorityBadge({ notice, always = false }) {
  const priority = priorityOf(notice);
  if (!always && !isImportant(notice)) return null;
  return <StatusBadge status={PRIORITY_TONES[priority]} label={`${priority} · ${PRIORITIES[priority].label}`} />;
}
export function NoticeStatus({ notice }) { return <StatusBadge status={STATUS_TONES[notice.status] || "neutral"} label={STATUSES[notice.status] || notice.status} />; }

// The message as recipients see it (also the editor's live preview).
export function NoticeBody({ notice, lookups, compact = false }) {
  const priority = priorityOf(notice);
  return <article className={`connect-notice connect-${priority}`}>
    {priority === "P1" && <p className="connect-alert" role="alert">Emergency notice</p>}
    <p className="connect-meta">{[TYPES[notice.type] || "Announcement", categoryOf(notice.category).label, notice.reference].filter(Boolean).join(" · ")}</p>
    <h2>{notice.title || "Your headline"}</h2>
    {notice.summary && !String(notice.body || "").replace(/\s+/g, " ").startsWith(notice.summary.slice(0, 190)) && <p className="connect-summary">{notice.summary}</p>}
    {!compact && <div className="connect-text">{notice.body || "Your message appears here."}</div>}
    {!compact && (notice.effectiveDate || notice.issuingDepartment) && <dl className="hub-facts connect-facts">{notice.issuingDepartment && <div><dt>Issued by</dt><dd>{notice.issuingDepartment}</dd></div>}{notice.effectiveDate && <div><dt>Effective</dt><dd>{day(notice.effectiveDate)}</dd></div>}</dl>}
    {!compact && notice.attachments?.length > 0 && <ul className="hub-attachments">{notice.attachments.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul>}
    {notice.action?.href && <p className="connect-action-line">{notice.action.href.startsWith("/") ? <Link className="hub-button" to={notice.action.href}>{notice.action.label}</Link> : <a className="hub-button" href={notice.action.href} target="_blank" rel="noreferrer">{notice.action.label}</a>}{notice.action.deadline && <small>by {day(notice.action.deadline)}</small>}</p>}
    {lookups && <p className="connect-meta">For {audienceLabel(notice.audienceKeys, lookups)}</p>}
  </article>;
}

// ---------- workspace (Part 1 §12.1) ----------
const TABS = [["all", "All"], ["drafts", "Drafts"], ["pending", "Pending approval"], ["scheduled", "Scheduled"], ["published", "Published"], ["expired", "Expired"], ["archived", "Archived"]];
const IN_TAB = {
  all: () => true, drafts: (s) => ["draft", "rejected", "approved"].includes(s), pending: (s) => s === "pending_review", scheduled: (s) => s === "scheduled",
  published: (s) => s === "published", expired: (s) => s === "expired", archived: (s) => ["archived", "cancelled"].includes(s),
};
async function lookupsFor(mode, auth) {
  if (mode === "teacher") return { classes: await getMany("classes", (auth.scope?.publishKeys || []).map((key) => key.slice(6))), users: [], people: {} };
  const [classes, users] = await Promise.all([list("classes").catch(() => []), list("users").catch(() => [])]);
  return { classes, users, people: Object.fromEntries(users.map((user) => [user.id, user.displayName || user.email || "Hub user"])) };
}

function Workspace({ mode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "all";
  const teacher = mode === "teacher";
  const [notice, setNotice] = useFlash();
  const { data, loading, error, reload } = useLoad(async () => {
    const [rows, lookups] = await Promise.all([teacher ? list("announcements", where("createdBy", "==", auth.user.uid)) : list("announcements"), lookupsFor(mode, auth)]);
    return { rows, lookups };
  }, [mode, auth.user.uid]);
  const rows = data?.rows || [];
  const count = (key) => rows.filter((row) => IN_TAB[key](row.status)).length;
  const reviewer = canReview(auth.roles);
  async function runSchedule() {
    try { const { data: result } = await httpsCallable(functions, "runAnnouncementSchedule")({}); setNotice(`${result.published} scheduled ${result.published === 1 ? "notice" : "notices"} published, ${result.expired} expired.`); reload(); }
    catch (failure) { setNotice(failure.message); }
  }
  const columns = [
    { key: "title", label: teacher ? "Notice" : "Announcement", render: (row) => <span><span className="hub-cell-strong">{row.title}</span>{row.pinned && <> <StatusBadge status="pending" label="Pinned" /></>}<br /><small>{[TYPES[row.type || "announcement"], row.reference, row.requiresAcknowledgement && "Acknowledgement"].filter(Boolean).join(" · ")}</small></span> },
    { key: "category", label: "Category", render: (row) => categoryOf(row.category).label },
    { key: "audience", label: "Audience", sortValue: (row) => audienceLabel(row.audienceKeys, data.lookups), csv: (row) => audienceLabel(row.audienceKeys, data.lookups), render: (row) => audienceLabel(row.audienceKeys, data.lookups) },
    { key: "priority", label: "Priority", sortValue: (row) => priorityOf(row), csv: (row) => priorityOf(row), render: (row) => <PriorityBadge notice={row} always /> },
    ...(teacher ? [] : [{ key: "author", label: "Author", sortValue: (row) => row.createdByName || "", csv: (row) => row.createdByName || "", render: (row) => row.createdByName || data.lookups.people[row.createdBy] || "—" }]),
    { key: "status", label: "Status", csv: (row) => row.status, render: (row) => <NoticeStatus notice={row} /> },
    { key: "publication", label: "Publication", sortValue: (row) => row.publishedAt?.seconds || Date.parse(row.publishAt || 0) / 1000 || 0, csv: (row) => (row.status === "scheduled" ? row.publishAt : when(row.publishedAt)), render: (row) => (row.status === "scheduled" ? `Scheduled ${when(row.publishAt)}` : row.publishedAt ? when(row.publishedAt) : "—") },
    { key: "expiresAt", label: "Until", render: (row) => (row.expiresAt ? day(row.expiresAt) : "—") },
  ];
  return <>
    <PageHeader kicker={teacher ? "Teaching · SRSS Connect" : "Content & communication · SRSS Connect"} title={teacher ? "Class notices" : "Announcements & circulars"}
      actions={<>{canAuthor(auth.roles) && <Link className="hub-button" to={`${workspacePath(mode)}/new`}>{teacher ? "New class notice" : "New announcement"}</Link>}{hasCapability(auth.roles, "circular.create") && !teacher && <Link className="hub-button hub-button-quiet" to={`${workspacePath(mode)}/new?type=circular`}>New circular</Link>}{!teacher && reviewer && rows.some((row) => row.status === "scheduled") && <button type="button" className="hub-button hub-button-quiet" onClick={runSchedule}>Publish due notices now</button>}</>}>
      {teacher ? "Post routine notices to your own classes in a few steps. Parents are found from the school's enrolment and guardian records — no mailing lists to keep." : "One place for school notices and formal circulars: draft, approve, schedule, publish and see who has been reached. Notices reach people through their verified school relationships."}
    </PageHeader>
    {notice && <p className="hub-note" role="status">{notice} <button type="button" className="hub-link-button" onClick={() => setNotice("")}>Dismiss</button></p>}
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-stats">
        <StatCard label="Published now" value={count("published")} tone="good" />
        <StatCard label="Pending approval" value={count("pending")} tone={count("pending") ? "warn" : "neutral"} detail={reviewer ? "Waiting for you or a colleague" : "Waiting for a reviewer"} />
        <StatCard label="Scheduled" value={count("scheduled")} />
        <StatCard label="Asking for acknowledgement" value={rows.filter((row) => row.status === "published" && row.requiresAcknowledgement).length} />
      </div>
      <div className="hub-tabs" role="tablist" aria-label="Notice status">{TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setParams(id === "all" ? {} : { tab: id })}>{label} <span className="connect-tab-count">{count(id)}</span></button>)}</div>
      <div className="hub-tab-panel">
        <DataTable columns={columns} rows={rows.filter((row) => IN_TAB[tab](row.status))} searchKeys={["title", "summary", "body", "reference"]} exportName="srss-connect" initialSort={{ key: "publication", dir: -1 }}
          filters={[{ key: "category", label: "Category", options: CATEGORIES.map((item) => [item.id, item.label]), value: (row) => categoryOf(row.category).id }, { key: "priority", label: "Priority", options: PRIORITY_IDS.map((id) => [id, `${id} ${PRIORITIES[id].label}`]), value: (row) => priorityOf(row) }]}
          onRowClick={(row) => navigate(workspacePath(mode, row.id))} empty={teacher ? "Notices you write appear here." : "No notices here yet."} />
      </div>
    </>}
  </>;
}
export const AdminCommunications = () => <Workspace mode="admin" />;
export const TeacherCommunications = () => <Workspace mode="teacher" />;

// ---------- editor (Part 1 §12.2) ----------
const EMPTY = { type: "announcement", title: "", summary: "", body: "", category: "general", priority: "P3", audience: "school", standards: [], classes: [], users: [], publicListing: false, pinned: false,
  timing: "now", publishAtLocal: "", expiresAt: "", requiresAcknowledgement: false, acknowledgementDeadline: "", effectiveDate: "", issuingDepartment: "",
  actionType: "", actionLabel: "", actionHref: "", actionDeadline: "", attachmentsText: "", notifyAgain: false };
function formFrom(notice, { duplicate = false } = {}) {
  return { ...EMPTY, ...Object.fromEntries(Object.entries(notice).filter(([key]) => key in EMPTY)), ...choiceFromKeys(notice.audienceKeys), category: categoryOf(notice.category).id, priority: priorityOf(notice),
    title: duplicate ? `Copy of ${notice.title}` : notice.title, timing: !duplicate && notice.publishAt && notice.status !== "published" ? "schedule" : "now", publishAtLocal: duplicate ? "" : toLocalInput(notice.publishAt),
    expiresAt: duplicate ? "" : notice.expiresAt || "", acknowledgementDeadline: duplicate ? "" : notice.acknowledgementDeadline || "", effectiveDate: notice.effectiveDate || "", issuingDepartment: notice.issuingDepartment || "",
    actionType: notice.action?.type || "", actionLabel: notice.action?.label || "", actionHref: notice.action?.href || "", actionDeadline: duplicate ? "" : notice.action?.deadline || "", attachmentsText: linksText(notice.attachments), notifyAgain: false };
}
function noticeFrom(form) {
  return {
    type: form.type, title: form.title, summary: form.summary, body: form.body, category: form.category, priority: form.priority, audienceKeys: keysFromChoice(form),
    publicListing: form.publicListing, pinned: form.pinned, requiresAcknowledgement: form.requiresAcknowledgement, acknowledgementDeadline: form.requiresAcknowledgement ? form.acknowledgementDeadline || null : null,
    expiresAt: form.expiresAt || null, effectiveDate: form.effectiveDate || null, issuingDepartment: form.issuingDepartment, publishAt: form.timing === "schedule" ? fromLocalInput(form.publishAtLocal) : null,
    action: form.actionHref ? { type: form.actionType || "link", label: form.actionLabel || ACTION_TYPES[form.actionType || "link"], href: form.actionHref.trim(), deadline: form.actionDeadline || null } : null,
    attachments: parseLinks(form.attachmentsText),
  };
}

function Editor({ mode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const teacher = mode === "teacher";
  const source = id || params.get("duplicate");
  const { data, loading, error } = useLoad(async () => ({ original: source ? await one(`announcements/${source}`) : null, lookups: await lookupsFor(mode, auth) }), [source, mode]);
  const original = id ? data?.original : null;
  const [form, setForm] = useState(null);
  const [wider, setWider] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState("");
  const [failure, setFailure] = useState("");
  const [reach, setReach] = useState(null);

  useEffect(() => {
    if (!data || form) return;
    if (data.original) { const next = formFrom(data.original, { duplicate: !id }); setForm(next); setWider(teacher && !["class", "classParents"].includes(next.audience)); return; }
    const classId = params.get("class");
    const ownClasses = (auth.scope?.publishKeys || []).map((key) => key.slice(6));
    setForm(teacher ? { ...EMPTY, category: "class", audience: "classParents", classes: classId && ownClasses.includes(classId) ? [classId] : ownClasses.slice(0, 1) }
      : { ...EMPTY, type: params.get("type") === "circular" ? "circular" : "announcement", category: params.get("type") === "circular" ? "administrative" : "general", requiresAcknowledgement: params.get("type") === "circular" });
  }, [data, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const notice = useMemo(() => (form ? noticeFrom(form) : null), [form]);
  const keysKey = notice?.audienceKeys.join("|") || "";
  useEffect(() => {
    if (!keysKey) { setReach(null); return undefined; }
    let live = true;
    const timer = setTimeout(() => connectCall("preview", { audienceKeys: keysKey.split("|") }).then((result) => live && setReach(result), () => live && setReach({ failed: true })), 400);
    return () => { live = false; clearTimeout(timer); };
  }, [keysKey]);

  if (loading || !form) return error ? <ErrorNote error={error} /> : <Loading />;
  if (original && !canEdit(auth.roles, original, auth.user.uid)) return <EmptyState title="You can't edit this notice." />;
  if (original && ["expired", "archived", "cancelled"].includes(original.status)) return <EmptyState title="This notice can no longer be edited."><Link to={`${workspacePath(mode)}/new?duplicate=${original.id}`}>Make a copy</Link></EmptyState>;

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
  const toggle = (key, value) => setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const { errors } = validateNotice(notice);
  if (form.timing === "schedule" && (!form.publishAtLocal || new Date(form.publishAtLocal) <= new Date())) errors.publishAt = "Choose a time in the future.";
  if (form.requiresAcknowledgement && form.acknowledgementDeadline && form.expiresAt && form.acknowledgementDeadline > form.expiresAt) errors.acknowledgementDeadline = "The deadline is after the notice is removed.";
  const shown = (key) => (tried ? errors[key] : null);
  const decision = publishDecision({ roles: auth.roles, scope: auth.scope || {}, uid: auth.user.uid, notice: { ...notice, createdBy: original?.createdBy || auth.user.uid } });
  const published = original?.status === "published";
  const classOptions = data.lookups.classes.filter((cls) => (cls.status ?? "active") === "active").sort((a, b) => (a.standard || 0) - (b.standard || 0) || String(a.name).localeCompare(String(b.name)));
  const choices = teacher && !wider ? TEACHER_CHOICES : AUDIENCE_CHOICES.filter(([value]) => !teacher || value !== "users");

  async function go(kind) {
    setTried(true); setFailure("");
    const blocking = Object.keys(errors).filter((key) => kind !== "draft" || ["title", "body", "audienceKeys"].includes(key));
    if (blocking.length) { setFailure("Please check the highlighted fields."); return; }
    setBusy(kind);
    try {
      const saved = await connectCall("save", { id: original?.id, notice, revision: original?.revision, notifyAgain: form.notifyAgain });
      let outcome = saved;
      if (kind === "publish" && saved.status !== "published") outcome = await connectCall("publish", { id: saved.id, revision: saved.revision, publishAt: notice.publishAt });
      if (kind === "submit") outcome = await connectCall("submit", { id: saved.id, revision: saved.revision });
      const flash = { draft: "Draft saved.", publish: outcome.status === "scheduled" ? "Scheduled. It will be published automatically." : published ? "Changes published." : "Published. Recipients are being notified.", submit: "Sent for approval. A reviewer has been notified." }[kind];
      navigate(workspacePath(mode, saved.id), { state: { flash } });
    } catch (problem) { setFailure(problem.message); setBusy(""); }
  }

  const field = (key, label, input, help) => <label className={`hub-field ${["title", "summary", "body", "attachmentsText"].includes(key) ? "hub-field-wide" : ""}`}>{label}{input}{help && <small className="hub-field-help">{help}</small>}{shown(key) && <small className="hub-field-error">{shown(key)}</small>}</label>;
  return <>
    <PageHeader kicker={teacher ? "Teaching · SRSS Connect" : "SRSS Connect"} title={original ? `Edit: ${original.title}` : form.type === "circular" ? "New circular" : teacher ? "New class notice" : "New announcement"}
      actions={<Link className="hub-button hub-button-quiet" to={original ? workspacePath(mode, original.id) : workspacePath(mode)}>Cancel</Link>}>
      {published ? "This notice is live. Saving creates a new revision; earlier revisions and acknowledgements stay on record." : original?.status && original.status !== "draft" ? "Editing returns this notice to draft, so it needs publishing or approval again." : null}
    </PageHeader>
    <div className="connect-editor">
      <form className="connect-form" onSubmit={(event) => { event.preventDefault(); go(decision.allowed ? "publish" : "submit"); }} noValidate>
        <Section title="1 · Message">
          <div className="hub-form-row">
            {!teacher && field("type", "Type", <select value={form.type} onChange={set("type")}>{Object.entries(TYPES).filter(([value]) => value === "announcement" || hasCapability(auth.roles, "circular.create")).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>, form.type === "circular" ? "Formal communication with a reference number, e.g. SRSS/CIR/2027/004." : null)}
            {field("category", "Category", <select value={form.category} onChange={set("category")}>{CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>)}
            {field("priority", "Priority", <select value={form.priority} onChange={set("priority")}>{PRIORITY_IDS.map((value) => <option key={value} value={value}>{value} · {PRIORITIES[value].label}</option>)}</select>, PRIORITIES[form.priority].detail)}
          </div>
          {field("title", "Headline", <input value={form.title} maxLength={140} onChange={set("title")} aria-invalid={Boolean(shown("title"))} required />)}
          {field("summary", "Summary (optional)", <input value={form.summary} maxLength={300} onChange={set("summary")} placeholder="One line shown in notifications and lists" />, "Leave empty to use the start of the message.")}
          {field("body", "Message", <textarea value={form.body} rows={7} maxLength={5000} onChange={set("body")} aria-invalid={Boolean(shown("body"))} required />, "Plain text. Keep private student details out of notices.")}
          {form.type === "circular" && <div className="hub-form-row">{field("issuingDepartment", "Issuing department", <input value={form.issuingDepartment} maxLength={80} onChange={set("issuingDepartment")} placeholder="School Office" />)}{field("effectiveDate", "Effective date", <input type="date" value={form.effectiveDate} onChange={set("effectiveDate")} />)}</div>}
        </Section>

        <Section title="2 · Audience">
          {field("audience", "Who should receive this?", <select value={form.audience} onChange={set("audience")}>{choices.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>)}
          {teacher && <label className="hub-check"><input type="checkbox" checked={wider} onChange={(event) => { setWider(event.target.checked); if (!event.target.checked) setForm((current) => ({ ...current, audience: "classParents" })); }} /> Reach a wider audience (sent to the office for approval)</label>}
          {["standard", "standardParents"].includes(form.audience) && <fieldset className="hub-checkset"><legend>Standards</legend><div className="connect-checks">{[1, 2, 3, 4, 5, 6].map((level) => <label key={level} className="hub-check"><input type="checkbox" checked={form.standards.includes(String(level))} onChange={() => toggle("standards", String(level))} /> Standard {level}</label>)}</div></fieldset>}
          {["class", "classParents"].includes(form.audience) && <fieldset className="hub-checkset"><legend>Classes</legend>{classOptions.length ? <div className="connect-checks">{classOptions.map((cls) => <label key={cls.id} className="hub-check"><input type="checkbox" checked={form.classes.includes(cls.id)} onChange={() => toggle("classes", cls.id)} /> {cls.name}{cls.standard ? ` · Standard ${cls.standard}` : ""}</label>)}</div> : <p className="hub-note">{teacher ? "You have no class assignment for this year yet. Ask the office to assign your class." : "No classes are set up yet."}</p>}</fieldset>}
          {form.audience === "users" && <fieldset className="hub-checkset"><legend>People</legend><div className="connect-checks connect-checks-long">{data.lookups.users.filter((user) => (user.roles || []).length && (user.status ?? "active") === "active").sort((a, b) => String(data.lookups.people[a.id]).localeCompare(String(data.lookups.people[b.id]))).map((user) => <label key={user.id} className="hub-check"><input type="checkbox" checked={form.users.includes(user.id)} onChange={() => toggle("users", user.id)} /> {data.lookups.people[user.id]}</label>)}</div></fieldset>}
          {shown("audienceKeys") && <p className="hub-field-error">{shown("audienceKeys")}</p>}
          <p className="connect-reach" role="status" aria-live="polite">{!notice.audienceKeys.length ? "Choose an audience to see the estimated reach." : !reach ? "Estimating recipients…" : reach.failed ? "The estimate isn't available right now." : <>Estimated recipients: <strong>{reach.estimated} {reach.estimated === 1 ? "account" : "accounts"}</strong>{` (${reach.parents} parent, ${reach.staff} staff, ${reach.students} student)`}{reach.childRecords ? ` · ${reach.childRecords} linked pupil records` : ""}{reach.inactive ? ` · ${reach.inactive} inactive excluded` : ""}. Families with several children receive one copy.</>}</p>
        </Section>

        <Section title="3 · Timing">
          <div className="hub-form-row">
            {!published && field("timing", "Publish", <select value={form.timing} onChange={set("timing")}><option value="now">As soon as it is published</option><option value="schedule">At a set time</option></select>)}
            {form.timing === "schedule" && !published && field("publishAt", "Publish at (Malaysia time)", <input type="datetime-local" value={form.publishAtLocal} onChange={set("publishAtLocal")} aria-invalid={Boolean(shown("publishAt"))} />, "Published automatically within 15 minutes.")}
            {field("expiresAt", "Remove after (optional)", <input type="date" value={form.expiresAt} onChange={set("expiresAt")} />, "It leaves notice boards after this day; the record is kept.")}
          </div>
        </Section>

        <Section title="4 · Response needed">
          <label className="hub-check"><input type="checkbox" checked={form.requiresAcknowledgement} onChange={set("requiresAcknowledgement")} /> Ask recipients to acknowledge (“I acknowledge”)</label>
          {form.requiresAcknowledgement && <div className="hub-form-row">{field("acknowledgementDeadline", "Acknowledge by (optional)", <input type="date" value={form.acknowledgementDeadline} onChange={set("acknowledgementDeadline")} />, "Families who haven't acknowledged get one reminder the day before.")}</div>}
          <div className="hub-form-row">
            {field("actionType", "Linked action (optional)", <select value={form.actionType} onChange={set("actionType")}><option value="">None</option>{Object.entries(ACTION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>)}
            {form.actionType && field("actionHref", "Link to the form or page", <input value={form.actionHref} onChange={set("actionHref")} placeholder="/hub/forms/… or https://…" />)}
            {form.actionType && field("actionLabel", "Button label", <input value={form.actionLabel} maxLength={40} onChange={set("actionLabel")} placeholder={ACTION_TYPES[form.actionType]} />)}
            {form.actionType && field("actionDeadline", "Deadline (optional)", <input type="date" value={form.actionDeadline} onChange={set("actionDeadline")} />)}
          </div>
          {shown("action") && <p className="hub-field-error">{shown("action")}</p>}
          {form.actionType && <p className="hub-hint">The button opens the real form; its completion shows in the parent's Actions Required, not here.</p>}
        </Section>

        <Section title="5 · Attachments & visibility">
          {field("attachmentsText", "Attachments (links)", <textarea rows={2} value={form.attachmentsText} onChange={set("attachmentsText")} placeholder="Permission slip | https://drive.google.com/…" />, "One link per line, optionally “Label | link”. Files stay in the school's Google Drive with its own sharing settings.")}
          {shown("attachments") && <p className="hub-field-error">{shown("attachments")}</p>}
          {!teacher && <label className="hub-check"><input type="checkbox" checked={form.publicListing} onChange={set("publicListing")} /> Also show on the public website (whole-school notices only)</label>}
          {shown("publicListing") && <p className="hub-field-error">{shown("publicListing")}</p>}
          {!teacher && <label className="hub-check"><input type="checkbox" checked={form.pinned} onChange={set("pinned")} /> Pin to the top of everyone's list</label>}
          {published && <label className="hub-check"><input type="checkbox" checked={form.notifyAgain} onChange={set("notifyAgain")} /> Notify recipients about this change again</label>}
        </Section>

        {failure && <p className="hub-error" role="alert">{failure}</p>}
        {!decision.allowed && <p className="hub-note">{decision.reason}</p>}
        <div className="hub-sticky-actions">
          <button type="submit" className="hub-button" disabled={!!busy}>{busy === "publish" || busy === "submit" ? "Working…" : published ? "Publish changes" : decision.allowed ? (form.timing === "schedule" ? "Schedule" : "Publish now") : "Submit for approval"}</button>
          {!published && <button type="button" className="hub-button hub-button-quiet" disabled={!!busy} onClick={() => go("draft")}>{busy === "draft" ? "Saving…" : "Save draft"}</button>}
        </div>
      </form>
      <aside className="connect-preview" aria-label="Preview"><p className="hub-kicker">Preview — as recipients see it</p><NoticeBody notice={notice} lookups={data.lookups} />{form.requiresAcknowledgement && <div className="connect-ack connect-ack-preview"><button type="button" className="hub-button" disabled>I acknowledge</button><small>{form.acknowledgementDeadline ? `Please acknowledge by ${day(form.acknowledgementDeadline)}.` : "Recipients confirm they have read this notice."}</small></div>}</aside>
    </div>
  </>;
}
export const AdminEditor = () => <Editor mode="admin" />;
export const TeacherEditor = () => <Editor mode="teacher" />;

// ---------- manage, review and report (Part 1 §9.3, §13, §21) ----------
function Manage({ mode }) {
  const auth = useAuth();
  const { id } = useParams();
  const [flash, setFlash] = useFlash();
  const [failure, setFailure] = useState("");
  const [busy, setBusy] = useState("");
  const [asking, setAsking] = useState(null); // "reject" | "cancel"
  const [reason, setReason] = useState("");
  const { data, loading, error, reload } = useLoad(async () => ({ notice: await one(`announcements/${id}`), lookups: await lookupsFor(mode, auth) }), [id, mode]);
  const notice = data?.notice ? { ...data.notice, id } : null;
  const reportable = notice && canReport(auth.roles, notice, auth.user.uid) && ["published", "expired", "cancelled", "archived"].includes(notice.status);
  const report = useLoad(() => (reportable ? connectCall("report", { id }) : null), [id, reportable, notice?.status, notice?.revision]);
  if (loading) return <Loading />;
  if (error || !notice) return error ? <ErrorNote error={error} /> : <EmptyState title="This notice is not available." />;

  const mine = notice.createdBy === auth.user.uid;
  const editable = canEdit(auth.roles, notice, auth.user.uid) && ["draft", "rejected", "pending_review", "approved", "scheduled", "published"].includes(notice.status);
  const decision = publishDecision({ roles: auth.roles, scope: auth.scope || {}, uid: auth.user.uid, notice });
  const review = reviewDecision({ roles: auth.roles, notice });
  const office = isOffice(auth.roles);
  async function run(action, payload, message) {
    setBusy(action); setFailure("");
    try { const result = await connectCall(action, { id, revision: notice.revision, ...payload }); setFlash(typeof message === "function" ? message(result) : message); setAsking(null); setReason(""); reload(); report.reload(); }
    catch (problem) { setFailure(problem.message); }
    finally { setBusy(""); }
  }
  const copyLink = async (path) => { try { await navigator.clipboard.writeText(`${window.location.origin}${path}`); setFlash("Link copied. Paste it into your class or parent group; the hub checks who may open it."); } catch { setFailure("Copy didn't work here; the address is " + window.location.origin + path); } };
  const button = (key, label, onClick, quiet = true) => <button key={key} type="button" className={`hub-button ${quiet ? "hub-button-quiet" : ""}`} disabled={!!busy} onClick={onClick}>{busy === key ? "Working…" : label}</button>;
  const actions = [
    editable && <Link key="edit" className="hub-button hub-button-quiet" to={`${workspacePath(mode, id)}/edit`}>{notice.status === "published" ? "Edit (new revision)" : "Edit"}</Link>,
    ["draft", "approved"].includes(notice.status) && (mine || office) && (decision.allowed ? button("publish", notice.publishAt && Date.parse(notice.publishAt) > Date.now() ? "Schedule" : "Publish now", () => run("publish", {}, (result) => (result.status === "scheduled" ? "Scheduled." : "Published. Recipients are being notified.")), false)
      : button("submit", "Submit for approval", () => run("submit", {}, "Sent for approval."), false)),
    notice.status === "pending_review" && review.allowed && button("approve", "Approve & publish", () => run("approve", {}, (result) => (result.status === "scheduled" ? "Approved and scheduled." : "Approved and published.")), false),
    notice.status === "pending_review" && canReview(auth.roles) && button("reject", "Return for changes", () => setAsking("reject")),
    notice.status === "pending_review" && mine && button("withdraw", "Withdraw", () => run("withdraw", {}, "Withdrawn to draft.")),
    ["scheduled", "published"].includes(notice.status) && (office || mine) && button("cancel", notice.status === "scheduled" ? "Cancel scheduled notice" : "Withdraw notice", () => setAsking("cancel")),
    canTransitionTo(notice, "archived") && (office || mine) && button("archive", notice.status === "draft" ? "Discard draft" : "Archive", () => run("archive", {}, "Archived.")),
    notice.status === "published" && button("copy", "Copy hub link", () => copyLink(`/hub/announcements/${id}`)),
    notice.status === "published" && notice.publicListing && button("copyPublic", "Copy public link", () => copyLink(`/announcements/${id}`)),
    canAuthor(auth.roles) && <Link key="duplicate" className="hub-button hub-button-quiet" to={`${workspacePath(mode)}/new?duplicate=${id}`}>Duplicate</Link>,
  ].filter(Boolean);
  return <>
    <PageHeader kicker={<Link to={workspacePath(mode)}>← {mode === "teacher" ? "Class notices" : "Announcements & circulars"}</Link>} title={notice.title} actions={<NoticeStatus notice={notice} />}>
      {[TYPES[notice.type || "announcement"], notice.reference, `revision ${notice.revision || 1}`].filter(Boolean).join(" · ")}
    </PageHeader>
    {flash && <p className="hub-note" role="status">{flash} <button type="button" className="hub-link-button" onClick={() => setFlash("")}>Dismiss</button></p>}
    {failure && <p className="hub-error" role="alert">{failure}</p>}
    {notice.status === "rejected" && notice.rejectedReason && <p className="hub-note connect-returned"><strong>Changes requested:</strong> {notice.rejectedReason}</p>}
    {notice.status === "cancelled" && <p className="hub-note"><strong>Withdrawn:</strong> {notice.cancelledReason} Already delivered notifications can't be recalled; the notice is no longer shown.</p>}
    {notice.status === "pending_review" && !review.allowed && canReview(auth.roles) && <p className="hub-note">{review.reason}</p>}
    <div className="hub-page-actions connect-actions">{actions}</div>
    {asking && <form className="connect-reason" onSubmit={(event) => { event.preventDefault(); run(asking, { reason }, asking === "reject" ? "Returned to the author with your comment." : "Withdrawn. Pending deliveries have stopped."); }}>
      <label className="hub-field hub-field-wide">{asking === "reject" ? "What needs changing?" : "Reason (recorded in the audit history)"}<textarea rows={2} value={reason} maxLength={500} required onChange={(event) => setReason(event.target.value)} /></label>
      <div className="hub-form-actions"><button type="submit" className={`hub-button ${asking === "cancel" ? "hub-button-danger" : ""}`} disabled={!reason.trim() || !!busy}>{asking === "reject" ? "Return for changes" : "Withdraw"}</button><button type="button" className="hub-button hub-button-quiet" onClick={() => setAsking(null)}>Keep it</button></div>
    </form>}
    <div className="connect-manage">
      <NoticeBody notice={notice} />
      <Section title="Details"><dl className="hub-facts">
        <div><dt>Audience</dt><dd>{audienceLabel(notice.audienceKeys, data.lookups)}</dd></div>
        <div><dt>Priority</dt><dd><PriorityBadge notice={notice} always /></dd></div>
        <div><dt>Category</dt><dd>{categoryOf(notice.category).label}</dd></div>
        <div><dt>Author</dt><dd>{notice.createdByName || data.lookups.people[notice.createdBy] || "—"}</dd></div>
        {notice.submittedAt && <div><dt>Submitted</dt><dd>{when(notice.submittedAt)}</dd></div>}
        {notice.approvedBy && <div><dt>Approved by</dt><dd>{notice.approvedByName || data.lookups.people[notice.approvedBy] || "—"}{notice.approvedRevision ? ` (revision ${notice.approvedRevision})` : ""}</dd></div>}
        <div><dt>{notice.status === "scheduled" ? "Scheduled for" : "Published"}</dt><dd>{notice.status === "scheduled" ? when(notice.publishAt) : notice.publishedAt ? when(notice.publishedAt) : "Not yet"}</dd></div>
        <div><dt>Removed after</dt><dd>{day(notice.expiresAt)}</dd></div>
        {notice.requiresAcknowledgement && <div><dt>Acknowledge by</dt><dd>{notice.acknowledgementDeadline ? day(notice.acknowledgementDeadline) : "No deadline"}</dd></div>}
        <div><dt>Channels</dt><dd>In the hub{notice.publicListing ? " · Public website" : ""}</dd></div>
      </dl></Section>
    </div>
    {reportable && <Report report={report} notice={notice} onRemind={() => run("remind", {}, (result) => `${result.sent} ${result.sent === 1 ? "reminder" : "reminders"} sent.`)} onRetry={() => run("retry", {}, "Delivery restarted.")} busy={busy} roles={auth.roles} mine={mine} />}
  </>;
}
const canTransitionTo = (notice, to) => ({ draft: ["archived"], rejected: ["archived"], published: ["archived"], expired: ["archived"], cancelled: ["archived"] }[notice.status] || []).includes(to);

function Report({ report, notice, onRemind, onRetry, busy, roles, mine }) {
  const data = report.data;
  const job = data?.jobs?.[0];
  const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
  return <Section title="Reach and responses">
    <ErrorNote error={report.error} />
    {report.loading ? <Loading /> : data && <>
      <p className="hub-hint">Delivered means a notification was placed in the person's hub. Read means they opened it. Acknowledged means they pressed “I acknowledge” — it doesn't prove they agreed or understood.</p>
      <div className="hub-stats">
        <StatCard label="Delivered in the hub" value={data.delivered} detail={job ? `${job.targetSnapshotCount} eligible · ${job.skippedCount} muted or already notified` : "—"} />
        <StatCard label="Opened" value={data.read} detail={`${percent(data.read, data.delivered)}% of delivered`} />
        {notice.requiresAcknowledgement && <StatCard label="Acknowledged" value={`${data.acknowledged} of ${data.eligible}`} tone={data.pendingCount ? "warn" : "good"} detail={`${data.pendingCount} pending`} />}
        {job && <StatCard label="Delivery" value={{ completed: "Complete", processing: "In progress", retry_pending: "Retrying", failed: "Failed", cancelled: "Stopped", queued: "Queued" }[job.status] || job.status} tone={job.status === "failed" ? "bad" : job.status === "completed" ? "good" : "neutral"} detail={job.lastErrorCode ? `Last error: ${job.lastErrorCode}` : `Attempt ${job.attemptCount}`} />}
      </div>
      {job && ["failed", "retry_pending"].includes(job.status) && (hasCapability(roles, "notification.delivery.retry") || hasCapability(roles, "announcement.publish")) && <button type="button" className="hub-button hub-button-quiet" onClick={onRetry} disabled={!!busy}>Retry delivery</button>}
      {notice.requiresAcknowledgement && data.pendingCount > 0 && <>
        <div className="hub-section-head connect-pending-head"><h3>Waiting for acknowledgement</h3>{notice.status === "published" && (hasCapability(roles, "circular.remind") || (mine && hasCapability(roles, "circular.remind.own"))) && <button type="button" className="hub-button hub-button-small" disabled={!!busy} onClick={onRemind}>{busy === "remind" ? "Sending…" : "Send a reminder"}</button>}</div>
        {data.pending.length > 0 && <DataTable rows={data.pending.map((person) => ({ ...person, id: person.uid }))} columns={[{ key: "name", label: "Name" }, { key: "group", label: "Group" }]} searchKeys={["name"]} filters={[{ key: "group", label: "Group", options: [["Parent", "Parents"], ["Staff", "Staff"], ["Student", "Students"]] }]} exportName="acknowledgements-pending" pageSize={10} />}
      </>}
    </>}
  </Section>;
}
export const AdminManage = () => <Manage mode="admin" />;
export const TeacherManage = () => <Manage mode="teacher" />;

// ---------- recipient view (Part 1 §7–§9) ----------
async function markSeen(uid, id) {
  // Read receipts and notification read-state are separate records (delivered ≠ read ≠ acknowledged).
  setDoc(doc(db, "announcementReads", `${uid}_${id}`), { ownerUid: uid, announcementId: id, readAt: serverTimestamp() }).catch(() => {});
  const unread = (await list("notificationRecords", where("recipientUid", "==", uid), where("announcementId", "==", id)).catch(() => [])).filter((item) => !item.readAt);
  await Promise.all(unread.map((item) => updateDoc(doc(db, "notificationRecords", item.id), { readAt: serverTimestamp() }).catch(() => {})));
}

export function NoticeDetail() {
  const auth = useAuth();
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const { data, loading, error, reload } = useLoad(async () => {
    const notice = await one(`announcements/${id}`);
    const acks = notice?.requiresAcknowledgement ? await list("announcementAcknowledgements", where("recipientUid", "==", auth.user.uid), where("announcementId", "==", id)) : [];
    return { notice: notice && { ...notice, id }, acks };
  }, [id]);
  useEffect(() => { if (data?.notice?.status === "published") markSeen(auth.user.uid, id); }, [data?.notice?.status, id, auth.user.uid]);
  const student = auth.currentHub === "student";
  if (loading) return <Loading />;
  if (error || !data?.notice) return <div className="hub-message"><h1>This notice isn't available</h1><p>It may have been withdrawn, or it wasn't addressed to you.</p><Link className="hub-button" to="/hub/announcements">All notices</Link></div>;
  const notice = data.notice;
  const ack = data.acks.find((item) => item.announcementRevision === (notice.revision || 1));
  const earlier = data.acks.filter((item) => item !== ack).sort((a, b) => b.announcementRevision - a.announcementRevision)[0];
  const manageable = isOffice(auth.roles) || notice.createdBy === auth.user.uid;
  async function acknowledge() {
    setBusy(true); setFailure("");
    try { await connectCall("acknowledge", { id, revision: notice.revision || 1 }); reload(); }
    catch (problem) { setFailure(problem.code === "CONNECT_REVISION_CONFLICT" ? "This notice was just updated. Please read the latest version, then acknowledge." : problem.message); reload(); }
    finally { setBusy(false); }
  }
  return <div className={student ? "hub-student" : ""}>
    <PageHeader kicker={<Link to={student ? "/hub/student/announcements" : "/hub/announcements"}>← All notices</Link>} title={notice.title} actions={manageable && <Link className="hub-button hub-button-quiet" to={workspacePath(isOffice(auth.roles) ? "admin" : "teacher", id)}>Manage</Link>}>
      {[notice.publishedAt ? `Published ${when(notice.publishedAt)}` : STATUSES[notice.status], notice.expiresAt ? `until ${day(notice.expiresAt)}` : null].filter(Boolean).join(" · ")}
    </PageHeader>
    {notice.status !== "published" && <p className="hub-note">This notice is {STATUSES[notice.status]?.toLowerCase()}; recipients don't see it.</p>}
    <NoticeBody notice={notice} />
    {notice.requiresAcknowledgement && notice.status === "published" && <section className="connect-ack" aria-labelledby="ack-title">
      <h2 id="ack-title">{ack ? "Acknowledged" : "Please acknowledge"}</h2>
      {ack ? <p>You acknowledged this {TYPES[notice.type || "announcement"].toLowerCase()} on {when(ack.acknowledgedAt)} (revision {ack.announcementRevision}).</p>
        : <><p>Pressing the button records that you have read this {TYPES[notice.type || "announcement"].toLowerCase()}{notice.acknowledgementDeadline ? `. Please do so by ${day(notice.acknowledgementDeadline)}` : ""}.{earlier ? ` It has changed since you acknowledged revision ${earlier.announcementRevision}.` : ""}</p>
          <button type="button" className="hub-button" disabled={busy} onClick={acknowledge}>{busy ? "Recording…" : "I acknowledge"}</button></>}
      {failure && <p className="hub-error" role="alert">{failure}</p>}
    </section>}
  </div>;
}

// The recipient feed: important notices first, filters by category and response (Part 1 §8, §15).
export function NoticeFeed() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const [params, setParams] = useSearchParams();
  const filter = params.get("type") || params.get("filter") || "";
  const student = auth.currentHub === "student";
  const { data, loading, error } = useLoad(async () => {
    const [items, acks, reads] = await Promise.all([announcementsFor(keys, 60), list("announcementAcknowledgements", where("recipientUid", "==", auth.user.uid)).catch(() => []), list("announcementReads", where("ownerUid", "==", auth.user.uid)).catch(() => [])]);
    return { items: items.sort(feedOrder), acked: new Set(acks.map((ack) => `${ack.announcementId}_${ack.announcementRevision}`)), read: new Set(reads.map((read) => read.announcementId)) };
  }, [keys.join("|"), auth.user.uid]);
  const items = data?.items || [];
  const needsResponse = (item) => item.requiresAcknowledgement && !data.acked.has(`${item.id}_${item.revision || 1}`);
  const present = CATEGORIES.filter((category) => items.some((item) => categoryOf(item.category).id === category.id));
  const shown = items.filter((item) => !filter || (filter === "circular" ? item.type === "circular" : filter === "respond" ? needsResponse(item) : categoryOf(item.category).id === filter));
  const important = shown.filter(isImportant);
  const rest = shown.filter((item) => !isImportant(item));
  const card = (item) => <li key={item.id} className={`connect-card connect-${priorityOf(item)} ${data.read.has(item.id) ? "" : "connect-new"}`}>
    <Link to={`/hub/announcements/${item.id}`} className="connect-card-link">
      <span className="connect-meta">{[categoryOf(item.category).label, item.reference, formatDate(item.publishedAt)].filter(Boolean).join(" · ")}</span>
      <strong>{item.title}</strong>
      <span className="connect-card-summary">{item.summary || String(item.body || "").slice(0, 200)}</span>
    </Link>
    <div className="hub-badges"><PriorityBadge notice={item} />{!data.read.has(item.id) && <StatusBadge status="new" label="New" />}{item.pinned && <StatusBadge status="pending" label="Pinned" />}{item.requiresAcknowledgement && (needsResponse(item) ? <StatusBadge status="pending" label={item.acknowledgementDeadline ? `Acknowledge by ${day(item.acknowledgementDeadline)}` : "Please acknowledge"} /> : <StatusBadge status="granted" label="Acknowledged" />)}{item.action?.deadline && <StatusBadge status="open" label={`${item.action.label} by ${day(item.action.deadline)}`} />}</div>
  </li>;
  const chip = (value, label) => <button key={value || "all"} type="button" className={filter === value ? "active" : ""} onClick={() => setParams(value ? { filter: value } : {})}>{label}</button>;
  return <div className={student ? "hub-student" : ""}>
    <PageHeader kicker="SRSS Connect" title={student ? "Notices" : "Announcements"} actions={<>{isOffice(auth.roles) && <Link className="hub-button" to="/hub/admin/communications">Manage announcements</Link>}{(auth.scope?.publishKeys || []).length > 0 && <Link className={`hub-button ${isOffice(auth.roles) ? "hub-button-quiet" : ""}`} to="/hub/teacher/announcements/new">Post a class notice</Link>}</>}>
      {student ? "News from your school and your class." : "School notices and circulars meant for you. Important ones stay at the top; a family with several children sees each notice once."}
    </PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      {!student && <div className="hub-chips" role="group" aria-label="Filter notices">{chip("", "All")}{items.some((item) => item.requiresAcknowledgement) && chip("respond", "Needs my response")}{items.some((item) => item.type === "circular") && chip("circular", "Circulars")}{present.map((category) => chip(category.id, category.label))}</div>}
      {!shown.length ? <EmptyState title={filter ? "Nothing in this filter." : "No announcements right now."} /> : <>
        {important.length > 0 && <Section title="Important school notices" className="connect-important"><ul className="connect-cards">{important.map(card)}</ul></Section>}
        {rest.length > 0 && <Section title={important.length ? "Latest announcements" : "Announcements"}><ul className="connect-cards">{rest.map(card)}</ul></Section>}
      </>}
    </>}
  </div>;
}

// ---------- Notification Centre (Part 1 §7.2, §16) ----------
const CENTRE_TABS = [["all", "All"], ["unread", "Unread"], ["important", "Important"], ["actions", "Actions"], ["archived", "Archived"], ["preferences", "Preferences"]];
const isAction = (item) => item.actionRequired || ["forms", "consent", "actionRequired"].includes(item.category);
const PERIODS = [["", "Any time"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 3 months"]];
const createdMs = (item) => (item.createdAt?.toMillis ? item.createdAt.toMillis() : item.createdAt?.seconds ? item.createdAt.seconds * 1000 : 0);
const CATEGORY_NAMES = { attendance: "Attendance", consent: "Consent", forms: "Forms", actionRequired: "Action required", announcement: "Announcement" };
const categoryName = (id) => CATEGORY_NAMES[id] || categoryOf(id).label;

export function NotificationCentre() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "all";
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("");
  const [failure, setFailure] = useState("");
  const { data, loading, error, reload } = useLoad(() => list("notificationRecords", where("recipientUid", "==", auth.user.uid), orderBy("createdAt", "desc"), limit(200)), [auth.user.uid]);
  const items = data || [];
  const since = period ? Date.now() - Number(period) * 86400000 : 0;
  const shown = items.filter((item) => (tab === "archived" ? item.archivedAt : !item.archivedAt)
    && (tab !== "unread" || !item.readAt) && (tab !== "important" || item.critical || isImportant(item)) && (tab !== "actions" || isAction(item))
    && (!category || (item.category || "") === category) && (!since || createdMs(item) >= since));
  const unread = items.filter((item) => !item.readAt && !item.archivedAt);
  const update = async (item, fields) => { try { await updateDoc(doc(db, "notificationRecords", item.id), fields); reload(); } catch { setFailure("That change couldn't be saved. Please try again."); } };
  async function markAll() {
    try { for (let start = 0; start < unread.length; start += 400) { const batch = writeBatch(db); unread.slice(start, start + 400).forEach((item) => batch.update(doc(db, "notificationRecords", item.id), { readAt: serverTimestamp() })); await batch.commit(); } reload(); }
    catch { setFailure("Not everything could be marked as read. Please try again."); }
  }
  const open = async (item) => { if (!item.readAt) await updateDoc(doc(db, "notificationRecords", item.id), { readAt: serverTimestamp() }).catch(() => {}); if (item.link) navigate(item.link); else reload(); };
  return <>
    <PageHeader kicker="SRSS Connect" title="Notifications" actions={tab !== "preferences" && unread.length > 0 && <button type="button" className="hub-button hub-button-quiet" onClick={markAll}>Mark all as read</button>}>Personal alerts about notices, forms, attendance and actions. {unread.length ? `${unread.length} unread.` : "You're up to date."}</PageHeader>
    <div className="hub-tabs" role="tablist" aria-label="Notification views">{CENTRE_TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setParams(id === "all" ? {} : { tab: id })}>{label}{id === "unread" && unread.length ? <span className="connect-tab-count">{unread.length}</span> : null}</button>)}</div>
    <div className="hub-tab-panel">
      {tab === "preferences" ? <NotificationPreferences /> : <>
        <div className="hub-filterbar">
          <label><span className="hub-visually-hidden">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{[...new Set(items.map((item) => item.category).filter(Boolean))].map((id) => <option key={id} value={id}>{categoryName(id)}</option>)}</select></label>
          <label><span className="hub-visually-hidden">Date</span><select value={period} onChange={(event) => setPeriod(event.target.value)}>{PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <span className="hub-count">{shown.length} {shown.length === 1 ? "notification" : "notifications"}</span>
        </div>
        <ErrorNote error={error} />{failure && <p className="hub-error" role="alert">{failure}</p>}
        {loading ? <Loading /> : !shown.length ? <EmptyState title={tab === "archived" ? "Nothing archived." : tab === "unread" ? "No unread notifications." : "No notifications."} /> : <ul className="connect-notifications">{shown.map((item) => <li key={item.id} className={`${item.readAt ? "" : "connect-unread"} ${item.critical ? "connect-critical" : ""}`}>
          <button type="button" className="connect-notification-open" onClick={() => open(item)}>
            <span className="connect-meta">{[categoryName(item.category), item.createdAt ? when(item.createdAt) : null].filter(Boolean).join(" · ")}</span>
            <strong>{!item.readAt && <span className="hub-visually-hidden">Unread: </span>}{item.title}</strong>
            {(item.preview || item.body) && <span>{item.preview || item.body}</span>}
          </button>
          <div className="hub-row-actions">{item.critical && <StatusBadge status="pending" label="Important" />}{isAction(item) && <StatusBadge status="open" label="Action" />}
            {!item.readAt && <button type="button" className="hub-link-button" onClick={() => update(item, { readAt: serverTimestamp() })}>Mark as read</button>}
            {item.archivedAt ? <button type="button" className="hub-link-button" onClick={() => update(item, { archivedAt: null })}>Restore</button> : <button type="button" className="hub-link-button" onClick={() => update(item, { archivedAt: serverTimestamp(), ...(item.readAt ? {} : { readAt: serverTimestamp() }) })}>Archive</button>}
          </div>
        </li>)}</ul>}
      </>}
    </div>
  </>;
}

const LANGUAGES = [["en", "English"], ["ms", "Bahasa Melayu"], ["ta", "தமிழ் (Tamil)"], ["zh", "中文 (Chinese)"]];
function NotificationPreferences() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(() => one(`notificationPreferences/${auth.user.uid}`).catch(() => null), [auth.user.uid]);
  const [muted, setMuted] = useState(null);
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState("");
  useEffect(() => { if (!loading && muted === null) { setMuted(data?.mutedCategories || []); setLanguage(data?.language || "en"); } }, [loading, data, muted]);
  if (loading || muted === null) return error ? <ErrorNote error={error} /> : <Loading />;
  async function save(event) {
    event.preventDefault(); setState("saving");
    try { await setDoc(doc(db, "notificationPreferences", auth.user.uid), { mutedCategories: muted, language, digest: "none", updatedAt: serverTimestamp() }); setState("saved"); }
    catch { setState("failed"); }
  }
  return <form onSubmit={save} className="connect-preferences">
    <Section title="What notifies me in the hub">
      <p className="hub-lede">Essential notices always reach you: emergency and important notices, anything asking for your acknowledgement or a form, health & safety and consent. You can turn the others off; they still appear in your announcements.</p>
      <div className="connect-checks connect-checks-long">{OPTIONAL_CATEGORY_IDS.map((id) => <label key={id} className="hub-check"><input type="checkbox" checked={!muted.includes(id)} onChange={(event) => { setState(""); setMuted((current) => (event.target.checked ? current.filter((item) => item !== id) : [...current, id])); }} /> {categoryOf(id).label}</label>)}</div>
      <ul className="connect-always">{CATEGORIES.filter((item) => item.essential).map((item) => <li key={item.id}>{item.label} — always</li>)}<li>Email and phone alerts — not yet offered; the school will announce them.</li></ul>
    </Section>
    <Section title="Language">
      <label className="hub-field">Preferred language<select value={language} onChange={(event) => { setState(""); setLanguage(event.target.value); }}>{LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small className="hub-field-help">Notices are written in English. When the school publishes an approved translation, you'll see it in this language.</small></label>
    </Section>
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save preferences"}</button>{state === "saved" && <span role="status">Saved.</span>}{state === "failed" && <span className="hub-error" role="alert">Couldn't save. Please try again.</span>}</div>
  </form>;
}

// ---------- header bell (Part 1 §7.1) ----------
// One small query when the page changes (no realtime listener — PRD cost control).
export function NotificationBell() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    let live = true;
    list("notificationRecords", where("recipientUid", "==", auth.user.uid), orderBy("createdAt", "desc"), limit(20)).then((rows) => live && setItems(rows), () => {});
    return () => { live = false; };
  }, [auth.user.uid, location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape" || (event.type === "mousedown" && !box.current?.contains(event.target))) setOpen(false); };
    document.addEventListener("keydown", close); document.addEventListener("mousedown", close);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("mousedown", close); };
  }, [open]);
  const visible = items.filter((item) => !item.archivedAt);
  const unread = visible.filter((item) => !item.readAt).length;
  const label = unread ? `${unread >= 20 ? "20+" : unread}` : "";
  const pick = async (item) => { setOpen(false); if (!item.readAt) { setItems((current) => current.map((row) => (row.id === item.id ? { ...row, readAt: true } : row))); updateDoc(doc(db, "notificationRecords", item.id), { readAt: serverTimestamp() }).catch(() => {}); } navigate(item.link || "/hub/notifications"); };
  return <div className="connect-bell" ref={box}>
    <button type="button" className="connect-bell-button" aria-haspopup="true" aria-expanded={open} aria-label={unread ? `Notifications, ${label} unread` : "Notifications"} onClick={() => setOpen(!open)}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.25-6.78V3.5a1.75 1.75 0 0 0-3.5 0v.72A7 7 0 0 0 5 11v5l-1.7 1.7A1 1 0 0 0 4 19.4h16a1 1 0 0 0 .7-1.7Z" /></svg>
      {label && <span className="connect-bell-count">{label}</span>}
    </button>
    {open && <div className="connect-bell-menu" role="menu" aria-label="Latest notifications">
      <div className="connect-bell-head"><strong>Notifications</strong><Link to="/hub/notifications?tab=preferences" onClick={() => setOpen(false)}>Preferences</Link></div>
      {!visible.length ? <p className="connect-bell-empty">No notifications yet.</p> : <ul>{visible.slice(0, 6).map((item) => <li key={item.id}><button type="button" role="menuitem" className={item.readAt ? "" : "connect-unread"} onClick={() => pick(item)}>
        <span className="connect-meta">{categoryName(item.category)}{item.createdAt ? ` · ${formatDate(item.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</span>
        <strong>{item.title}</strong>{(item.preview || item.body) && <span>{String(item.preview || item.body).slice(0, 90)}</span>}
      </button></li>)}</ul>}
      <Link className="connect-bell-all" to="/hub/notifications" onClick={() => setOpen(false)}>See all notifications</Link>
    </div>}
  </div>;
}
