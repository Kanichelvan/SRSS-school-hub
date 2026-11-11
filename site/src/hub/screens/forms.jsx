import { isRetiredPaymentForm } from "../../../functions/forms-registry.js";
// Forms & Response Centre (staff) and My requests & forms (everyone). The registry, routing and every
// status change live on the server (functions/forms-service.js); these screens read cases and call it.
// The Centre is an operational overview, not a second database: each case links to its source module.
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { doc, orderBy, setDoc, serverTimestamp, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, one, today, useLoad } from "../data";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";
import { FormRunner } from "../forms/FormRunner";
import {
  CATEGORIES, CLASSIFICATIONS, CONTACT_FIELDS, FORM, FORMS, FORM_TYPES, HANDLER_ROLES, LEVELS, RESPONSE_TEMPLATES, ROLE_LABELS,
  STATUSES, SUBMITTER_STATUS, TARGETS, canStart, fillTemplate, isOpen, workingDaysBetween,
} from "../../../functions/forms-registry.js";

const OFFICE = ["schoolAdmin", "superAdmin", "leadership"];
const TONE = { new: "new", assigned: "open", inProgress: "open", awaitingInformation: "pending", awaitingApproval: "review", approved: "approved", rejected: "declined", completed: "complete", closed: "completed", cancelled: "withdrawn" };
const caseStatus = (status, submitter = false) => <StatusBadge status={TONE[status] || status} label={(submitter ? SUBMITTER_STATUS : STATUSES)[status] || status} />;
const callCase = (payload) => httpsCallable(functions, "caseAction")(payload).then((result) => result.data);
const dateOf = (value) => formatDate(value, { day: "numeric", month: "short", year: "numeric" });
const isOverdue = (item, on = today()) => isOpen(item.status) && item.status !== "awaitingInformation" && item.dueAt && item.dueAt < on;
const roleName = (role) => ROLE_LABELS[role] || role;

// Cases the signed-in person may see. The office sees every ordinary case; others query by the roles
// they hold (the rules check the same fields). Restricted cases are only ever loaded by their own roles.
async function loadCases(auth, restricted) {
  const collectionId = restricted ? "restrictedCases" : "formCases";
  const handlerRoles = auth.roles.filter((role) => HANDLER_ROLES.includes(role));
  if (!restricted && auth.roles.some((role) => OFFICE.includes(role))) return list(collectionId, orderBy("submittedAt", "desc"));
  const queries = [list(collectionId, where("assignedToUid", "==", auth.user.uid)), ...handlerRoles.flatMap((role) => ["picRole", "backupRole", "escalationRole"].map((field) => list(collectionId, where(field, "==", role))))];
  const rows = (await Promise.all(queries.map((query) => query.catch(() => [])))).flat();
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a, b) => String(b.submittedOn).localeCompare(String(a.submittedOn)));
}

const TABS = [
  ["overview", "Overview"], ["all", "All submissions"], ["mine", "Assigned to me"], ["approval", "Awaiting approval"], ["overdue", "Overdue"],
  ["completed", "Completed"], ["restricted", "Restricted"], ["registry", "Form definitions"], ["rules", "Workflow rules"], ["templates", "Response templates"], ["reports", "Reports"],
];
const FILTERS = {
  all: () => true,
  mine: (item, auth) => item.assignedToUid === auth.user.uid,
  approval: (item) => item.status === "awaitingApproval" || (FORM[item.formId]?.reply === "decision" && ["new", "assigned", "inProgress"].includes(item.status)),
  overdue: (item) => isOverdue(item),
  completed: (item) => !isOpen(item.status),
};

export function FormsCentre() {
  const auth = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("view") || "overview";
  const restrictedRoles = auth.roles.filter((role) => FORMS.some((form) => form.restricted && [form.pic, form.backup, form.escalation].includes(role)));
  const canConfigure = auth.roles.some((role) => ["schoolAdmin", "superAdmin", "technicalAdmin"].includes(role));
  const cases = useLoad(() => loadCases(auth, false), [auth.user.uid, auth.roles.join()]);
  const restricted = useLoad(() => (restrictedRoles.length ? loadCases(auth, true) : []), [auth.user.uid, restrictedRoles.join()]);
  const tabs = TABS.filter(([id]) => (id !== "restricted" || restrictedRoles.length) && (id !== "rules" || canConfigure));
  const go = (view, extra = {}) => setParams({ view, ...extra });

  return <>
    <PageHeader kicker="Forms & Response Centre" title="Forms & responses">Every submission has a reference, a person in charge, a response target and a recorded outcome. Each case opens in its own module when there is one.</PageHeader>
    <div className="hub-tabs" role="tablist" aria-label="Forms & Response Centre">{tabs.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => go(id)}>{label}{id === "overdue" && cases.data?.filter(FILTERS.overdue).length ? ` (${cases.data.filter(FILTERS.overdue).length})` : ""}</button>)}</div>
    <div className="hub-tab-panel">
      <ErrorNote error={cases.error} />
      {tab === "overview" ? <Overview cases={cases} restricted={restricted} go={go} />
        : tab === "restricted" ? <CaseTable state={restricted} restricted />
        : tab === "registry" ? <Registry />
        : tab === "rules" ? <WorkflowRules />
        : tab === "templates" ? <Templates canEdit={canConfigure || auth.roles.includes("leadership")} />
        : tab === "reports" ? <Reports cases={cases} />
        : <CaseTable state={cases} filter={(item) => (FILTERS[tab] || FILTERS.all)(item, auth)} initialCategory={params.get("category") || ""} initialStatus={params.get("status") || ""} />}
    </div>
  </>;
}

function Overview({ cases, restricted, go }) {
  if (cases.loading) return <Loading />;
  const rows = cases.data || [];
  const open = rows.filter((item) => isOpen(item.status));
  const recent = (item) => item.completedOn && item.completedOn >= new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  return <>
    <div className="hub-stats">
      <StatCard label="New" value={rows.filter((item) => item.status === "new").length} detail="Not yet picked up" tone="info" to="?view=all&status=new" />
      <StatCard label="Awaiting assignment" value={open.filter((item) => !item.assignedToUid).length} detail="No named person yet" tone="warn" to="?view=all&status=new" />
      <StatCard label="Awaiting response" value={open.filter((item) => !item.firstResponseAt && item.status !== "awaitingInformation").length} detail="No reply or call recorded" tone="warn" to="?view=all" />
      <StatCard label="Awaiting approval" value={rows.filter(FILTERS.approval).length} tone="info" to="?view=approval" />
      <StatCard label="Awaiting information" value={rows.filter((item) => item.status === "awaitingInformation").length} detail="Waiting on the submitter" to="?view=all&status=awaitingInformation" />
      <StatCard label="Overdue" value={rows.filter(FILTERS.overdue).length} tone={rows.some(FILTERS.overdue) ? "bad" : "good"} to="?view=overdue" />
      <StatCard label="Completed (30 days)" value={rows.filter((item) => !isOpen(item.status) && recent(item)).length} tone="good" to="?view=completed" />
      {restricted.data?.length > 0 && <StatCard label="Restricted — open" value={restricted.data.filter((item) => isOpen(item.status)).length} detail="Only your roles can see these" tone="bad" to="?view=restricted" />}
    </div>
    <Section title="Open cases by queue">
      {!open.length ? <EmptyState title="Nothing is waiting.">New submissions appear here as soon as they arrive.</EmptyState> : <div className="hub-table-scroll"><table className="hub-table hub-table-compact">
        <thead><tr><th scope="col">Queue</th><th scope="col">Open</th><th scope="col">Overdue</th><th scope="col">Person in charge</th></tr></thead>
        <tbody>{Object.entries(CATEGORIES).map(([key, category]) => { const inQueue = open.filter((item) => item.category === key); if (!inQueue.length) return null; return <tr key={key}><td><button type="button" className="hub-link-button" onClick={() => go("all", { category: key })}>{category.name}</button></td><td>{inQueue.length}</td><td>{inQueue.filter((item) => isOverdue(item)).length || "—"}</td><td>{[...new Set(inQueue.map((item) => item.assignedToName || roleName(item.picRole)))].join(", ")}</td></tr>; })}</tbody>
      </table></div>}
    </Section>
  </>;
}

function CaseTable({ state, filter = () => true, restricted = false, initialCategory = "", initialStatus = "" }) {
  const navigate = useNavigate();
  if (state.loading) return <Loading />;
  const rows = (state.data || []).filter(filter).map((item) => ({ ...item, overdueFlag: isOverdue(item) ? "yes" : "no" }));
  return <DataTable
    rows={rows}
    exportName={restricted ? undefined : "forms-cases"}
    searchKeys={["reference", "formTitle", "submitterName", "studentName", "summary"]}
    initialFilters={{ category: initialCategory, status: initialStatus }}
    initialSort={{ key: "submittedOn", dir: -1 }}
    filters={[
      { key: "category", label: "Queue", options: Object.entries(CATEGORIES).map(([key, category]) => [key, category.name]) },
      { key: "status", label: "Status", options: Object.entries(STATUSES) },
      { key: "overdueFlag", label: "Overdue", options: [["yes", "Overdue"], ["no", "On time"]] },
    ]}
    onRowClick={(row) => navigate(`/hub/admin/forms/case/${row.id}${restricted ? "?restricted=1" : ""}`)}
    rowHref={(row) => `/hub/admin/forms/case/${row.id}${restricted ? "?restricted=1" : ""}`}
    empty="No cases here."
    columns={[
      { key: "reference", label: "Reference" },
      { key: "formTitle", label: "Form", render: (row) => <><strong>{row.formTitle}</strong>{row.summary && !restricted && <small className="hub-hint"> · {row.summary}</small>}</> },
      { key: "submittedOn", label: "Submitted", render: (row) => dateOf(row.submittedOn) },
      { key: "submitterName", label: "From", render: (row) => <>{row.submitterName || "—"}{row.studentName && <small className="hub-hint"> · {row.studentName}</small>}</> },
      { key: "status", label: "Status", render: (row) => <>{caseStatus(row.status)}{row.priority === "high" && <> <StatusBadge status="overdue" label="Priority" /></>}</>, csv: (row) => STATUSES[row.status] },
      { key: "assignedToName", label: "Person in charge", render: (row) => row.assignedToName || <span className="hub-hint">{roleName(row.picRole)}</span>, csv: (row) => row.assignedToName || roleName(row.picRole) },
      { key: "dueAt", label: "Response due", render: (row) => (row.dueAt ? <>{dateOf(row.dueAt)}{row.overdueFlag === "yes" && <> <StatusBadge status="overdue" label="Overdue" /></>}</> : "—") },
    ]}
  />;
}

// ---------- One case: what the PIC sees when a form arrives ----------
const META_KEYS = new Set(["createdAt", "createdBy", "updatedAt", "updatedBy", "status", "caseId", "submittedAt", "submittedByUid", "version", "formId", "formTitle", "studentId", "answers"]);
const labelFor = (form, key) => [...(form?.fields || []), ...CONTACT_FIELDS].find((field) => field.key === key)?.label || key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase());
const fieldFor = (form, key) => [...(form?.fields || []), ...CONTACT_FIELDS].find((field) => field.key === key);
// Rating grids list each row's rating; typed signatures show the name and the date it was signed.
function AnswerValue({ field, value }) {
  if (/^https:\/\//.test(String(value))) return <a href={value} target="_blank" rel="noreferrer">{value}</a>;
  if (value?.signedOn) return <><span className="hub-answer-signature">{value.name}</span> · signed {formatDate(`${value.signedOn}T00:00:00`, { day: "numeric", month: "long", year: "numeric" })}</>;
  if (field?.type === "grid" && value && typeof value === "object") return <ul className="hub-answer-grid">{(field.rows || Object.keys(value)).filter((row) => value[row]).map((row) => <li key={row}>{row}: <strong>{value[row]}</strong></li>)}</ul>;
  return showValue(value);
}
const showValue = (value) => (value === true ? "Yes" : value === false ? "No" : value?.toDate ? dateOf(value) : typeof value === "object" && value ? JSON.stringify(value) : String(value ?? "—"));

export function CaseView() {
  const { caseId } = useParams();
  const [params] = useSearchParams();
  const restricted = params.get("restricted") === "1";
  const auth = useAuth();
  const collectionId = restricted ? "restrictedCases" : "formCases";
  const { data, loading, error, reload } = useLoad(async () => {
    const item = await one(`${collectionId}/${caseId}`);
    if (!item) return null;
    const [activity, source, people] = await Promise.all([
      list(`${collectionId}/${caseId}/activity`, orderBy("at", "asc")),
      item.source?.collection && !restricted ? one(`${item.source.collection}/${item.source.id}`).catch(() => null) : null,
      auth.roles.some((role) => [...OFFICE, "technicalAdmin"].includes(role)) ? Promise.all([item.picRole, item.backupRole, item.escalationRole].map((role) => list("users", where("roles", "array-contains", role)).catch(() => []))).then((groups) => [...new Map(groups.flat().map((user) => [user.id, user])).values()]) : [],
    ]);
    return { item, activity, source, people };
  }, [caseId, restricted]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return <EmptyState title="This case doesn't exist or isn't yours to see." />;
  const { item, activity, source, people } = data;
  const form = FORM[item.formId];
  if (isRetiredPaymentForm(item.formId)) return <EmptyState title="Handled by the school office"><Link to="/hub/admin/fees">View fee information</Link></EmptyState>;
  const answers = restricted ? item.answers : source?.answers || (source ? Object.fromEntries(Object.entries(source).filter(([key]) => !META_KEYS.has(key) && key !== "id")) : null);
  const communication = activity.filter((entry) => ["submitted", "reply", "request", "submitterReply", "call", "meeting", "sourceUpdate"].includes(entry.kind));
  const notes = activity.filter((entry) => entry.kind === "note");
  const workflow = activity.filter((entry) => ["submitted", "assigned", "status", "reopened", "reminder", "escalated", "sourceUpdate"].includes(entry.kind));
  return <>
    <PageHeader kicker={`${CATEGORIES[item.category]?.queue} · ${item.reference}`} title={item.formTitle} actions={<Link className="hub-button hub-button-quiet" to={`/hub/admin/forms${restricted ? "?view=restricted" : ""}`}>Back to the Centre</Link>}>{form?.action ? `Action: ${form.action}.` : ""}</PageHeader>
    <Section title="Submission">
      <dl className="hub-facts">
        <div><dt>Reference</dt><dd>{item.reference}</dd></div>
        <div><dt>Form</dt><dd>{item.formId} · {item.formTitle}</dd></div>
        <div><dt>Submitted</dt><dd>{formatDate(item.submittedAt, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}</dd></div>
        <div><dt>From</dt><dd>{item.submitterName || "—"}{item.submitterEmail && <> · <a href={`mailto:${item.submitterEmail}`}>{item.submitterEmail}</a></>}</dd></div>
        {item.studentName && <div><dt>Child</dt><dd><Link to={`/hub/students/${item.studentId}`}>{item.studentName}</Link></dd></div>}
        <div><dt>Status</dt><dd>{caseStatus(item.status)} {item.priority === "high" && <StatusBadge status="overdue" label="Priority" />}</dd></div>
        <div><dt>Person in charge</dt><dd>{item.assignedToName || "Not assigned"} · {roleName(item.picRole)} (backup: {roleName(item.backupRole)})</dd></div>
        <div><dt>Response due</dt><dd>{item.dueAt ? dateOf(item.dueAt) : TARGETS[form?.target]?.label || "—"}{isOverdue(item) && <> <StatusBadge status="overdue" label="Overdue" /></>}</dd></div>
        <div><dt>Classification</dt><dd>{CLASSIFICATIONS[item.classification]} · {LEVELS[item.level]}</dd></div>
        <div><dt>Last action</dt><dd>{item.lastAction} · {formatDate(item.lastActionAt, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</dd></div>
        {item.source?.link && <div><dt>Source module</dt><dd><Link to={item.source.link}>Open in its module</Link></dd></div>}
      </dl>
    </Section>
    <Section title="Submitted information">
      {answers ? <dl className="hub-facts">{Object.entries(answers).map(([key, value]) => <div key={key}><dt>{labelFor(form, key)}</dt><dd className="hub-preserve"><AnswerValue field={fieldFor(form, key)} value={value} /></dd></div>)}</dl>
        : <EmptyState title="The details are kept in the source module.">{item.source?.link ? <Link to={item.source.link}>Open it there</Link> : "Ask the office if you need access."}</EmptyState>}
    </Section>
    <ResponsePanel item={item} caseId={caseId} restricted={restricted} people={people} auth={auth} reload={reload} />
    <Section title="Communication history"><History entries={communication} /></Section>
    <Section title="Internal notes"><p className="hub-hint">Visible only to staff responsible for this case.</p><History entries={notes} empty="No notes yet." /></Section>
    <Section title="Workflow history"><History entries={workflow} /></Section>
  </>;
}

const KIND_LABELS = { submitted: "Submitted", reply: "Reply sent", request: "More information requested", submitterReply: "Reply from the submitter", call: "Phone call", meeting: "In-person discussion", note: "Note", assigned: "Assigned", status: "Status changed", reopened: "Reopened", reminder: "Reminder", escalated: "Escalated", sourceUpdate: "Update from the module" };
function History({ entries, empty = "Nothing yet.", submitterView = false }) {
  if (!entries.length) return <EmptyState title={empty} />;
  return <ol className="hub-case-history">{entries.map((entry) => <li key={entry.id} className={`hub-case-${entry.kind}`}>
    <div className="hub-case-meta"><strong>{submitterView && entry.kind === "submitterReply" ? "You" : KIND_LABELS[entry.kind] || entry.kind}</strong><span>{entry.actorName && !submitterView ? `${entry.actorName} · ` : ""}{formatDate(entry.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>{entry.toStatus && entry.fromStatus && entry.toStatus !== entry.fromStatus && caseStatus(entry.toStatus, submitterView)}</div>
    {entry.body && <p className="hub-preserve">{entry.body}</p>}
  </li>)}</ol>;
}

function ResponsePanel({ item, caseId, restricted, people, auth, reload }) {
  const [mode, setMode] = useState("reply");
  const [body, setBody] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const custom = useLoad(() => one("settings/formsTemplates").then((doc) => doc?.items || []), []);
  const form = FORM[item.formId];
  if (isRetiredPaymentForm(item.formId)) return <EmptyState title="Handled by the school office"><Link to="/hub/admin/fees">View fee information</Link></EmptyState>;
  const decision = form?.reply === "decision" || form?.type === "update";
  const open = isOpen(item.status);
  const statuses = open ? ["inProgress", "awaitingApproval", ...(decision ? ["approved", "rejected"] : []), "completed", "closed", "cancelled"].filter((status) => status !== item.status) : ["inProgress"];
  async function run(payload, done) {
    setBusy(true); setNotice(null);
    try { await callCase({ caseId, restricted, ...payload }); setBody(""); setNextStatus(""); setNotice({ tone: "good", text: done }); reload(); }
    catch (error) { setNotice({ tone: "bad", text: error.message }); }
    finally { setBusy(false); }
  }
  const templates = [...RESPONSE_TEMPLATES, ...(custom.data || [])];
  const MODES = [["reply", "Reply"], ["requestInfo", "Request information"], ["call", "Record a phone call"], ["meeting", "Record a discussion"], ["note", "Internal note"]];
  return <Section title="Respond" className="hub-response-panel">
    <div className="hub-form-actions hub-case-quick">
      {item.assignedToUid !== auth.user.uid && <button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={busy} onClick={() => run({ action: "take" }, "Assigned to you.")}>Assign to me</button>}
      {people.length > 0 && <label className="hub-inline-field"><span className="hub-visually-hidden">Assign to</span><select value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">Assign to…</option>{people.map((person) => <option key={person.id} value={person.id}>{person.displayName || person.email}</option>)}</select></label>}
      {assignee && <button type="button" className="hub-button hub-button-small" disabled={busy} onClick={() => run({ action: "assign", assignToUid: assignee }, "Assigned.").then(() => setAssignee(""))}>Assign</button>}
    </div>
    {open && <>
      <div className="hub-tabs" role="tablist" aria-label="Response type">{MODES.filter(([id]) => (item.submitterUid || item.submitterEmail) || !["reply", "requestInfo"].includes(id)).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}>{label}</button>)}</div>
      <form className="hub-form hub-form-wide" onSubmit={(event) => { event.preventDefault(); run({ action: mode, body }, mode === "note" ? "Note saved." : ["call", "meeting"].includes(mode) ? "Recorded." : "Sent."); }}>
        {["reply", "requestInfo"].includes(mode) && <label className="hub-field"><span>Start from a template</span><select value="" onChange={(event) => { const template = templates.find((entry) => entry.id === event.target.value); if (template) setBody(fillTemplate(template.body, { reference: item.reference, name: item.submitterName || "" })); }}><option value="">Choose a template…</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}</select></label>}
        <label className="hub-field hub-field-wide"><span>{mode === "note" ? "Note (staff only)" : mode === "call" ? "What was discussed on the call" : mode === "meeting" ? "What was discussed" : "Message to the submitter"}</span><textarea rows={5} maxLength={5000} value={body} onChange={(event) => setBody(event.target.value)} required /></label>
        {["reply", "requestInfo"].includes(mode) && <p className="hub-hint">{item.submitterUid ? "They'll see it in My requests & forms and get a notification." : `It will be emailed to ${item.submitterEmail}.`}{restricted ? " Restricted case: the notification won't include the message." : ""}</p>}
        <div className="hub-form-actions"><button className="hub-button" disabled={busy || !body.trim()}>{busy ? "Saving…" : mode === "reply" ? "Send reply" : mode === "requestInfo" ? "Send request" : "Save"}</button></div>
      </form>
    </>}
    <form className="hub-form hub-form-wide" onSubmit={(event) => { event.preventDefault(); run({ action: "status", status: nextStatus, body: body.trim() }, `Status: ${STATUSES[nextStatus]}.`); }}>
      <div className="hub-form-row">
        <label className="hub-field"><span>{open ? "Update status" : "Reopen this case"}</span><select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} required><option value="">Choose…</option>{statuses.map((status) => <option key={status} value={status}>{open ? STATUSES[status] : "Reopen (keeps the history)"}</option>)}</select></label>
      </div>
      {["approved", "rejected", "completed"].includes(nextStatus) && <p className="hub-hint">The submitter is told the outcome{body.trim() ? ", with your message above" : ""}.{form?.apply === "guardianContact" && nextStatus === "approved" ? " Approving updates the guardian record with the new phone number and address." : ""}{item.source?.collection === "staffLeave" && ["approved", "rejected"].includes(nextStatus) ? " The leave record is updated too." : ""}</p>}
      <div className="hub-form-actions"><button className="hub-button hub-button-quiet" disabled={busy || !nextStatus}>{open ? "Update status" : "Reopen"}</button></div>
    </form>
    {notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role={notice.tone === "bad" ? "alert" : "status"}>{notice.text}</p>}
  </Section>;
}

// ---------- Form definitions (the master registry) ----------
const AVAILABILITY = { form: "In the hub", public: "On the website", module: "In its module", planned: "Planned" };
function Registry() {
  const rows = useMemo(() => FORMS.map((form) => ({ ...form, categoryName: CATEGORIES[form.category].name, picName: roleName(form.pic), backupName: roleName(form.backup), typeName: FORM_TYPES[form.type], targetName: TARGETS[form.target].label })), []);
  return <>
    <p className="hub-lede">The master form registry: {FORMS.length} forms and workflows. {FORMS.filter((form) => ["form", "public"].includes(form.availability)).length} run here as forms, {FORMS.filter((form) => form.availability === "module").length} live in their own module and {FORMS.filter((form) => form.availability === "planned").length} arrive with later modules. Routing and response targets are the specification's proposals, pending leadership approval.</p>
    <DataTable rows={rows} exportName="forms-registry" pageSize={25} searchKeys={["id", "title", "user", "picName"]} initialSort={{ key: "id", dir: 1 }}
      filters={[
        { key: "category", label: "Category", options: Object.entries(CATEGORIES).map(([key, category]) => [key, `${key} · ${category.name}`]) },
        { key: "availability", label: "Where", options: Object.entries(AVAILABILITY) },
        { key: "type", label: "Type", options: Object.entries(FORM_TYPES) },
        { key: "priority", label: "Priority", options: [["P1", "P1"], ["P2", "P2"], ["P3", "P3"]] },
      ]}
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Form", render: (row) => <><strong>{row.title}</strong><small className="hub-hint"> · {row.user}</small></> },
        { key: "availability", label: "Where", render: (row) => (row.link ? <a href={row.link}>{AVAILABILITY[row.availability]}</a> : AVAILABILITY[row.availability]), csv: (row) => AVAILABILITY[row.availability] },
        { key: "typeName", label: "Type" },
        { key: "picName", label: "PIC", render: (row) => <>{row.picName}<small className="hub-hint"> · backup {row.backupName}</small></>, csv: (row) => `${row.picName} / ${row.backupName}` },
        { key: "targetName", label: "Target" },
        { key: "classification", label: "Data", render: (row) => CLASSIFICATIONS[row.classification] },
        { key: "store", label: "Stored in" },
        { key: "priority", label: "Priority" },
      ]} />
  </>;
}

// ---------- Workflow rules: the School's routing choices (settings/formsRouting) ----------
const ROUTABLE = Object.keys(ROLE_LABELS);
function WorkflowRules() {
  const auth = useAuth();
  const { data, loading, error, reload } = useLoad(() => one("settings/formsRouting").then((doc) => doc || {}), []);
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState("");
  if (loading) return <Loading />;
  const rules = draft || { categories: data.categories || {}, forms: data.forms || {} };
  const set = (scope, key, field, value) => setDraft({ ...rules, [scope]: { ...rules[scope], [key]: { ...rules[scope][key], [field]: value || undefined } } });
  async function save() {
    const clean = (map) => Object.fromEntries(Object.entries(map).map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([, role]) => role))]).filter(([, value]) => Object.keys(value).length));
    await setDoc(doc(db, "settings", "formsRouting"), { categories: clean(rules.categories), forms: clean(rules.forms), updatedAt: serverTimestamp(), updatedBy: auth.user.uid });
    setDraft(null); setNotice("Saved. New submissions follow these rules; open cases keep their current person in charge."); reload();
  }
  const select = (scope, key, field, fallback) => <select aria-label={`${field} for ${key}`} value={rules[scope][key]?.[field] || ""} onChange={(event) => set(scope, key, field, event.target.value)}><option value="">Default: {roleName(fallback)}</option>{ROUTABLE.map((role) => <option key={role} value={role}>{roleName(role)}</option>)}</select>;
  const overridden = Object.keys(rules.forms);
  return <>
    <ErrorNote error={error} />
    <p className="hub-lede">Choose who looks after each queue. Leadership names the people by giving them these roles in User accounts. A complaint or grievance about the Headmistress always goes to the independent delegate (Super Administrator), whatever is set here.</p>
    <div className="hub-table-scroll"><table className="hub-table hub-table-compact">
      <thead><tr><th scope="col">Queue</th><th scope="col">Person in charge</th><th scope="col">Backup</th><th scope="col">Escalation (3 working days overdue)</th></tr></thead>
      <tbody>{Object.entries(CATEGORIES).map(([key, category]) => <tr key={key}><td>{key} · {category.name}</td><td>{select("categories", key, "pic", category.pic)}</td><td>{select("categories", key, "backup", category.backup)}</td><td>{select("categories", key, "escalation", category.escalation)}</td></tr>)}</tbody>
    </table></div>
    <Section title="Exceptions for single forms">
      <label className="hub-field"><span>Add an exception</span><select value="" onChange={(event) => event.target.value && setDraft({ ...rules, forms: { ...rules.forms, [event.target.value]: {} } })}><option value="">Choose a form…</option>{FORMS.filter((form) => !overridden.includes(form.id)).map((form) => <option key={form.id} value={form.id}>{form.id} · {form.title}</option>)}</select></label>
      {overridden.length > 0 && <div className="hub-table-scroll"><table className="hub-table hub-table-compact"><thead><tr><th scope="col">Form</th><th scope="col">Person in charge</th><th scope="col">Backup</th></tr></thead>
        <tbody>{overridden.map((id) => <tr key={id}><td>{id} · {FORM[id].title}</td><td>{select("forms", id, "pic", FORM[id].pic)}</td><td>{select("forms", id, "backup", FORM[id].backup)}</td></tr>)}</tbody></table></div>}
    </Section>
    <div className="hub-form-actions"><button type="button" className="hub-button" disabled={!draft} onClick={save}>Save workflow rules</button>{draft && <button type="button" className="hub-button hub-button-quiet" onClick={() => setDraft(null)}>Discard changes</button>}</div>
    {notice && <p className="hub-status" role="status">{notice}</p>}
  </>;
}

// ---------- Response templates ----------
function Templates({ canEdit }) {
  const auth = useAuth();
  const { data, loading, reload } = useLoad(() => one("settings/formsTemplates").then((doc) => doc?.items || []), []);
  const [editing, setEditing] = useState(null);
  if (loading) return <Loading />;
  const save = async (items) => { await setDoc(doc(db, "settings", "formsTemplates"), { items, updatedAt: serverTimestamp(), updatedBy: auth.user.uid }); setEditing(null); reload(); };
  return <>
    <p className="hub-lede">Templates fill the reply box; the PIC edits the text before sending. <code>{"{reference}"}</code> and <code>{"{name}"}</code> are filled in automatically.</p>
    <ul className="hub-cards">
      {RESPONSE_TEMPLATES.map((template) => <li key={template.id} className="hub-card"><strong>{template.title}</strong><p className="hub-preserve">{template.body}</p><small className="hub-hint">Built in</small></li>)}
      {data.map((template) => <li key={template.id} className="hub-card"><strong>{template.title}</strong><p className="hub-preserve">{template.body}</p>{canEdit && <div className="hub-form-actions"><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => setEditing(template)}>Edit</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => save(data.filter((entry) => entry.id !== template.id))}>Remove</button></div>}</li>)}
    </ul>
    {canEdit && (editing ? <form className="hub-form hub-form-wide" onSubmit={(event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const item = { id: editing.id || `custom-${Date.now()}`, title: values.title.trim(), body: values.body.trim() }; save(editing.id ? data.map((entry) => (entry.id === editing.id ? item : entry)) : [...data, item]); }}>
      <label className="hub-field"><span>Title</span><input name="title" defaultValue={editing.title} maxLength={80} required /></label>
      <label className="hub-field hub-field-wide"><span>Text</span><textarea name="body" rows={5} defaultValue={editing.body} maxLength={2000} required /></label>
      <div className="hub-form-actions"><button className="hub-button">Save template</button><button type="button" className="hub-button hub-button-quiet" onClick={() => setEditing(null)}>Cancel</button></div>
    </form> : <button type="button" className="hub-button" onClick={() => setEditing({ title: "", body: "" })}>Add a template</button>)}
  </>;
}

// ---------- Reports ----------
const hoursBetween = (a, b) => (a?.toDate && b?.toDate ? (b.toDate() - a.toDate()) / 36e5 : null);
const average = (values) => { const clean = values.filter((value) => value != null); return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null; };
function Reports({ cases }) {
  if (cases.loading) return <Loading />;
  const rows = (cases.data || []).filter((item) => item.status !== "cancelled");
  const finished = rows.filter((item) => !isOpen(item.status));
  const firstResponse = average(rows.map((item) => hoursBetween(item.submittedAt, item.firstResponseAt)));
  const resolution = average(finished.filter((item) => item.completedOn).map((item) => workingDaysBetween(item.submittedOn, item.completedOn)));
  const count = (filter) => rows.filter(filter).length;
  const byRole = Object.entries(rows.filter((item) => isOpen(item.status)).reduce((totals, item) => ({ ...totals, [item.assignedToName || roleName(item.picRole)]: (totals[item.assignedToName || roleName(item.picRole)] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const months = [...new Set(rows.map((item) => String(item.submittedOn).slice(0, 7)))].sort().slice(-6);
  return <>
    <div className="hub-stats">
      <StatCard label="Total submissions" value={rows.length} />
      <StatCard label="Open" value={rows.length - finished.length} tone="info" />
      <StatCard label="Overdue" value={rows.filter((item) => isOverdue(item)).length} tone={rows.some((item) => isOverdue(item)) ? "bad" : "good"} />
      <StatCard label="Average first response" value={firstResponse == null ? "—" : firstResponse < 24 ? `${Math.round(firstResponse)} h` : `${(firstResponse / 24).toFixed(1)} days`} />
      <StatCard label="Average resolution" value={resolution == null ? "—" : `${resolution.toFixed(1)} working days`} />
      <StatCard label="Completion rate" value={rows.length ? `${Math.round((finished.length / rows.length) * 100)}%` : "—"} tone="good" />
      <StatCard label="Closed without a reply" value={finished.filter((item) => !item.firstResponseAt && FORM[item.formId]?.notify === "pic").length} detail="Check these had a response" tone="warn" />
    </div>
    <Section title="Admissions conversion"><dl className="hub-facts">
      <div><dt>Enquiries and visit requests</dt><dd>{count((item) => ["A02", "A03"].includes(item.formId))}</dd></div>
      <div><dt>Applications submitted</dt><dd>{count((item) => item.formId === "A04")}</dd></div>
      <div><dt>Pupils enrolled</dt><dd>{count((item) => item.formId === "A04" && item.lastAction === "Pupil enrolled")}</dd></div>
    </dl></Section>
    <Section title="Submissions by queue and month">
      <div className="hub-table-scroll"><table className="hub-table hub-table-compact"><thead><tr><th scope="col">Queue</th>{months.map((month) => <th key={month} scope="col">{formatDate(`${month}-01`, { month: "short", year: "2-digit" })}</th>)}<th scope="col">Total</th></tr></thead>
        <tbody>{Object.entries(CATEGORIES).map(([key, category]) => { const inQueue = rows.filter((item) => item.category === key); return inQueue.length ? <tr key={key}><td>{category.name}</td>{months.map((month) => <td key={month}>{inQueue.filter((item) => String(item.submittedOn).startsWith(month)).length || "—"}</td>)}<td>{inQueue.length}</td></tr> : null; })}</tbody></table></div>
    </Section>
    <Section title="Open cases by person in charge">{byRole.length ? <dl className="hub-facts">{byRole.map(([name, total]) => <div key={name}><dt>{name}</dt><dd>{total}</dd></div>)}</dl> : <EmptyState title="No open cases." />}<p className="hub-hint">For spreading the workload fairly, not for measuring individual staff.</p></Section>
    <Section title="Parent feedback"><p>{count((item) => item.formId === "B08")} feedback submissions and {count((item) => item.formId === "B09")} complaints (complaint details stay in the restricted queue). Consent coverage is in <Link to="/hub/admin/consent">Consent</Link>.</p></Section>
  </>;
}

// ---------- My requests & forms (every signed-in person) ----------
export function MyRequests() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(async () => {
    const [ordinary, restricted] = await Promise.all([list("formCases", where("submitterUid", "==", auth.user.uid)), list("restrictedCases", where("submitterUid", "==", auth.user.uid)).catch(() => [])]);
    return [...ordinary, ...restricted.map((item) => ({ ...item, restricted: true }))].sort((a, b) => String(b.submittedOn).localeCompare(String(a.submittedOn)));
  }, [auth.user.uid]);
  const available = FORMS.filter((form) => canStart(form, auth.roles) && form.availability === "form");
  const modules = FORMS.filter((form) => form.availability === "module" && moduleFor(form, auth.roles));
  const groups = Object.entries(CATEGORIES).map(([key, category]) => [category, [...available, ...modules].filter((form) => form.category === key)]).filter(([, forms]) => forms.length);
  return <>
    <PageHeader kicker="My SRSS" title="My requests & forms">Send a request to the school and follow what happens to it. Every request gets a reference number and a reply.</PageHeader>
    <Section title="My submissions">
      <ErrorNote error={error} />
      {loading ? <Loading /> : !data.length ? <EmptyState title="You haven't sent anything yet.">Choose a form below to get started.</EmptyState> : <div className="hub-table-scroll"><table className="hub-table">
        <thead><tr><th scope="col">Submission</th><th scope="col">Reference</th><th scope="col">Status</th><th scope="col">Last updated</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.id}><td data-label="Submission"><Link to={`/hub/requests/${item.id}${item.restricted ? "?restricted=1" : ""}`}>{item.formTitle}</Link>{item.studentName && <small className="hub-hint"> · {item.studentName}</small>}</td><td data-label="Reference">{item.reference}</td><td data-label="Status">{caseStatus(item.status, true)}</td><td data-label="Last updated">{formatDate(item.externalUpdatedAt || item.submittedAt)}</td></tr>)}</tbody>
      </table></div>}
    </Section>
    {groups.map(([category, forms]) => <Section key={category.code} title={category.name}>
      <ul className="hub-cards">{forms.map((form) => <li key={form.id} className="hub-card"><Link to={form.availability === "form" ? `/hub/requests/new/${form.id}` : form.link}><strong>{form.title}</strong></Link><p className="hub-hint">{form.intro || (form.availability === "module" ? "Opens the page where this is done." : "")}</p></li>)}</ul>
    </Section>)}
  </>;
}
// Forms done on another hub page, listed here so people find them in one place (the page enforces access).
const MODULE_SHORTCUTS = { parent: ["A04", "B04", "B05", "C10", "G02"], staff: ["G10", "G11"] };
const moduleFor = (form, roles) => (roles.includes("parent") && MODULE_SHORTCUTS.parent.includes(form.id)) || (roles.some((role) => !["parent", "student"].includes(role)) && MODULE_SHORTCUTS.staff.includes(form.id));

export function StartRequest() {
  const { formId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const form = FORM[formId];
  const needsChild = form?.fields.some((field) => field.type === "child");
  const children = useLoad(() => (needsChild ? getMany("students", auth.scope?.childIds || []) : []), [formId, (auth.scope?.childIds || []).join()]);
  if (!form || !canStart(form, auth.roles) || form.availability !== "form") return <EmptyState title="This form isn't available to your account."><Link to="/hub/requests">Back to My requests & forms</Link></EmptyState>;
  return <>
    <PageHeader kicker={`${CATEGORIES[form.category].name} · ${form.id}`} title={form.title} actions={<Link className="hub-button hub-button-quiet" to="/hub/requests">Back</Link>}>{form.intro}</PageHeader>
    <p className="hub-hint">You'll get a reference number straight away. {TARGETS[form.target].days ? `The school aims to act within ${TARGETS[form.target].label.toLowerCase()}.` : ""}</p>
    {children.loading ? <Loading /> : needsChild && form.fields.some((field) => field.type === "child" && field.required) && !children.data.length ? <EmptyState title="No children are linked to your account yet.">Ask the school office to link your children, then try again.</EmptyState>
      : <FormRunner form={form} childOptions={children.data || []} onSent={(result) => navigate(`/hub/requests/${result.caseId}${result.restricted ? "?restricted=1" : ""}`, { state: { sent: result.reference } })} />}
  </>;
}

export function RequestView() {
  const { caseId } = useParams();
  const [params] = useSearchParams();
  const restricted = params.get("restricted") === "1";
  const collectionId = restricted ? "restrictedCases" : "formCases";
  const { data, loading, error, reload } = useLoad(async () => {
    const item = await one(`${collectionId}/${caseId}`);
    return item && { item, activity: await list(`${collectionId}/${caseId}/activity`, where("visibility", "==", "external")) };
  }, [caseId, restricted]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  if (loading && !data) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return <EmptyState title="This request doesn't exist or isn't yours."><Link to="/hub/requests">Back to My requests & forms</Link></EmptyState>;
  const { item } = data;
  const activity = [...data.activity].sort((a, b) => (a.at?.toMillis?.() || 0) - (b.at?.toMillis?.() || 0));
  const act = async (action) => { setBusy(true); setFailure(""); try { await callCase({ caseId, restricted, action, body }); setBody(""); reload(); } catch (e) { setFailure(e.message); } finally { setBusy(false); } };
  return <>
    <PageHeader kicker={`My requests & forms · ${item.reference}`} title={item.formTitle} actions={<Link className="hub-button hub-button-quiet" to="/hub/requests">All my requests</Link>}>Sent {dateOf(item.submittedOn)}{item.studentName ? ` about ${item.studentName}` : ""}.</PageHeader>
    <Section title="Status"><p className="hub-case-status">{caseStatus(item.status, true)}</p>{item.status === "awaitingInformation" && <p>The school has asked for more information — please reply below.</p>}</Section>
    <Section title="Updates"><History entries={activity} submitterView /></Section>
    {isOpen(item.status) && <Section title={item.status === "awaitingInformation" ? "Reply to the school" : "Add a message"}>
      <form className="hub-form hub-form-wide" onSubmit={(event) => { event.preventDefault(); act("submitterReply"); }}>
        <label className="hub-field hub-field-wide"><span>Your message</span><textarea rows={4} maxLength={5000} value={body} onChange={(event) => setBody(event.target.value)} required /></label>
        <div className="hub-form-actions"><button className="hub-button" disabled={busy || !body.trim()}>Send</button><button type="button" className="hub-button hub-button-quiet" disabled={busy} onClick={() => { if (window.confirm("Withdraw this request? The school will stop working on it.")) act("withdraw"); }}>Withdraw request</button></div>
        {failure && <p className="hub-error" role="alert">{failure}</p>}
      </form>
    </Section>}
  </>;
}

