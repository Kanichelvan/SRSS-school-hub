// System and communication management (Admin hub): roles & permissions, school settings and
// configuration lists, consent questions, announcements and the school calendar.
import { useState } from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { ADDITIONAL_ROLES, MODULES, PRIMARY_ROLES, ROLES, can } from "../../auth/permissions";
import { configList, forget, list, schoolSettings, staffNames, today, useLoad } from "../data";
import { CONSENT_ITEMS, mergeConsentItems } from "../consentForm";
import { ANNOUNCEMENT_CATEGORIES, EVENT_CATEGORIES, audienceError, audienceFields, describeAudience, draftFromKeys, keysFromDraft, linksError, linksText, parseLinks } from "../audience";
import { AuditLine, RecordManager, saveErrorMessage, slug } from "../manage";
import { ErrorNote, Loading, PageHeader, Section, StatusBadge, formatDate } from "../ui";
import { classOptions, schoolLookups, yearOptions } from "./setup";

// ---------- Roles & permissions ----------
const ACTION_NAMES = { V: "View", C: "Create", U: "Edit", A: "Approve / publish" };
export function RolesMatrix() {
  const [extra, setExtra] = useState(false);
  const roles = extra ? [...PRIMARY_ROLES, ...ADDITIONAL_ROLES] : PRIMARY_ROLES;
  const { data: users } = useLoad(() => list("users").catch(() => []), []);
  const holders = (role) => (users || []).filter((user) => (user.roles || []).includes(role) && user.status !== "disabled").length;
  const cell = (role, module) => {
    const actions = ["V", "C", "U", "A"].map((action) => [action, can([role], module, action)]).filter(([, scope]) => scope && scope !== "restricted");
    if (!actions.length) return can([role], module, "V") === "restricted" ? <span className="hub-cell-muted">By exception</span> : <span className="hub-cell-muted" aria-label="No access">—</span>;
    const scope = actions[0][1];
    return <span title={actions.map(([action, value]) => `${ACTION_NAMES[action]} (${value})`).join(", ")}>{actions.map(([action]) => action).join("")}{scope !== "all" ? <small> · {scope}</small> : null}</span>;
  };
  const modules = Object.entries(MODULES).filter(([, module]) => module.phase === 1);
  return <>
    <PageHeader kicker="System" title="Roles & permissions">What each role can do. A person can hold several roles. These limits are enforced by the database security rules and server functions — hiding a menu item is never the protection.</PageHeader>
    <Section title="Who holds each role" action={<label className="hub-check"><input type="checkbox" checked={extra} onChange={(event) => setExtra(event.target.checked)} />Show additional responsibilities</label>}>
      <ul className="hub-role-chips">{roles.map((role) => <li key={role}><strong>{ROLES[role].label}</strong><span>{users ? `${holders(role)} ${holders(role) === 1 ? "person" : "people"}` : "…"}</span></li>)}</ul>
    </Section>
    <Section title="Permission matrix">
      <p className="hub-hint">V view · C create · U edit · A approve or publish. “class”, “child”, “own” and similar mean the access is limited to the person’s assigned classes, linked children or own records. Access to a class always comes from an active teacher assignment for the current academic year.</p>
      <div className="hub-table-scroll"><table className="hub-table hub-matrix"><thead><tr><th scope="col">Area</th>{roles.map((role) => <th key={role} scope="col">{ROLES[role].label}</th>)}</tr></thead>
        <tbody>{modules.map(([id, module]) => <tr key={id}><th scope="row">{module.label}</th>{roles.map((role) => <td key={role}>{cell(role, id)}</td>)}</tr>)}</tbody></table></div>
      <p className="hub-hint">Roles are given and changed in People › User accounts. The school office can give family and teacher roles; administrator and other staff roles need a Super Administrator. Nobody can change their own roles or assign themselves to a class.</p>
    </Section>
  </>;
}

// ---------- Settings ----------
const TABS = [["school", "School information"], ["announcementCategories", "Announcement categories"], ["portfolioCategories", "Portfolio categories"], ["portfolioTags", "Achievement tags"], ["downloadCategories", "Download categories"], ["consent", "Consent questions"]];
export function Settings() {
  const [tab, setTab] = useState("school");
  return <>
    <PageHeader kicker="System" title="Settings">School details and the short lists the hub offers in its forms.</PageHeader>
    <nav className="hub-tabs" aria-label="Settings sections">{TABS.map(([id, label]) => <button key={id} type="button" className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <div className="hub-tab-panel">{tab === "school" ? <SchoolInformation /> : tab === "consent" ? <ConsentQuestions /> : <ConfigList key={tab} collection={tab} title={TABS.find(([id]) => id === tab)[1]} />}</div>
  </>;
}

export function SchoolInformation({ onSaved }) {
  const auth = useAuth();
  const canEdit = can(auth.roles, "settings", "U") === "all";
  const { data, loading, error, reload } = useLoad(async () => { forget("settings"); const [settings, lookups, terms, people] = await Promise.all([schoolSettings(), schoolLookups(), list("terms"), staffNames().catch(() => ({}))]); return { settings, lookups, terms, people }; }, []);
  const [draft, setDraft] = useState(null);
  const [state, setState] = useState({ busy: false, message: null, error: null });
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const values = draft || data.settings;
  const set = (key, value) => setDraft({ ...values, [key]: value });
  async function save(event) {
    event.preventDefault();
    if (!String(values.name || "").trim()) return setState({ busy: false, error: "Enter the school's name." });
    setState({ busy: true });
    try {
      const fields = ["name", "motto", "address", "phone", "email", "currentAcademicYearId", "currentTermId", "attendanceDueTime"];
      await setDoc(doc(db, "settings", "school"), { ...Object.fromEntries(fields.map((key) => [key, typeof values[key] === "string" ? values[key].trim() || null : values[key] ?? null])), updatedAt: serverTimestamp(), updatedBy: auth.user.uid }, { merge: true });
      forget("settings"); setDraft(null); setState({ busy: false, message: "School information saved." }); onSaved?.(); reload();
    } catch (reason) { setState({ busy: false, error: saveErrorMessage(reason) }); }
  }
  const yearTerms = data.terms.filter((term) => term.academicYearId === values.currentAcademicYearId && term.status !== "archived");
  return <form className="hub-form hub-form-wide" onSubmit={save}>
    <AuditLine record={data.settings} people={data.people} />
    <div className="hub-form-row">
      <label>School name<input required disabled={!canEdit} value={values.name || ""} onChange={(event) => set("name", event.target.value)} /></label>
      <label>Motto<input disabled={!canEdit} value={values.motto || ""} onChange={(event) => set("motto", event.target.value)} /></label>
      <label>Phone<input type="tel" disabled={!canEdit} value={values.phone || ""} onChange={(event) => set("phone", event.target.value)} /></label>
      <label>Email<input type="email" disabled={!canEdit} value={values.email || ""} onChange={(event) => set("email", event.target.value)} /></label>
    </div>
    <label>Address<textarea rows={2} disabled={!canEdit} value={values.address || ""} onChange={(event) => set("address", event.target.value)} /></label>
    <div className="hub-form-row">
      <label>Current academic year<select disabled={!canEdit} value={values.currentAcademicYearId || ""} onChange={(event) => setDraft({ ...values, currentAcademicYearId: event.target.value, currentTermId: null })}><option value="">Not set</option>{yearOptions(data.lookups).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>Current term<select disabled={!canEdit} value={values.currentTermId || ""} onChange={(event) => set("currentTermId", event.target.value)}><option value="">Not set</option>{yearTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></label>
      <label>Attendance due by<input type="time" disabled={!canEdit} value={values.attendanceDueTime || "09:00"} onChange={(event) => set("attendanceDueTime", event.target.value)} /></label>
    </div>
    {values.currentAcademicYearId !== data.settings.currentAcademicYearId && <p className="hub-status">Changing the current year moves every teacher, parent and pupil to that year's classes as soon as you save.</p>}
    {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    {state.message && <p className="hub-status" role="status">{state.message}</p>}
    {canEdit && <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state.busy || !draft}>{state.busy ? "Saving…" : "Save school information"}</button></div>}
  </form>;
}

function ConfigList({ collection, title }) {
  const auth = useAuth();
  const writers = { announcementCategories: ["schoolAdmin", "superAdmin"], portfolioCategories: ["schoolAdmin", "superAdmin", "academicCoordinator"], portfolioTags: ["schoolAdmin", "superAdmin", "academicCoordinator"], downloadCategories: ["schoolAdmin", "superAdmin", "contentEditor"] }[collection];
  return <RecordManager kicker="Settings" title={title} noun="entry" collection={collection} canEdit={auth.roles.some((role) => writers.includes(role))}
    intro="Offered in the hub's forms. Archive an entry to stop offering it; records that already use it keep it."
    fields={[
      { key: "name", label: "Name", type: "text", required: true, maxLength: 60 },
      { key: "description", label: "Description", type: "text", maxLength: 300, wide: true },
      { key: "order", label: "Order", type: "number", min: 0, max: 999, help: "Lower numbers come first." },
    ]}
    makeId={(values) => slug(values.name)}
    prepare={(values) => ({ ...values, order: values.order ?? 0 })}
    afterSave={() => forget(`config:${collection}`)}
    columns={() => [{ key: "order", label: "Order", render: (row) => row.order ?? 0 }, { key: "name", label: "Name", render: (row) => <span className="hub-cell-strong">{row.name}</span> }, { key: "description", label: "Description" }]}
    initialSort={{ key: "order", dir: 1 }} />;
}

// Consent questions: the built-in form plus the school's edits. Rewording a question raises its version,
// so families are asked it again; their other answers keep counting.
function ConsentQuestions() {
  const auth = useAuth();
  const canEdit = auth.roles.some((role) => ["privacySteward", "schoolAdmin", "superAdmin"].includes(role));
  const [editing, setEditing] = useState(null);
  const [state, setState] = useState({ busy: false, error: null, message: null });
  const { data, loading, error, reload } = useLoad(async () => { const [docs, people] = await Promise.all([list("consentDefinitions"), staffNames().catch(() => ({}))]); return { docs, people, items: mergeConsentItems(docs) }; }, []);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const stored = (type) => data.docs.find((item) => item.id === type);
  const retired = data.docs.filter((item) => item.status === "archived");

  async function save(event) {
    event.preventDefault();
    const draft = editing;
    if (!draft.title?.trim() || !draft.question?.trim()) return setState({ error: "A title and a question are required." });
    if (!draft.question.includes("{child}")) return setState({ error: "Include {child} in the question where the pupil's name should appear." });
    const type = draft.type || slug(draft.title).replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(/[^A-Za-z]/g, "");
    if (!draft.type && data.items.some((item) => item.type === type)) return setState({ error: "A question with this title already exists." });
    const existing = stored(type);
    const previous = data.items.find((item) => item.type === type) || existing;
    const reworded = previous && previous.question !== draft.question.trim();
    const version = (previous?.version ?? 1) + (reworded ? 1 : 0);
    setState({ busy: true });
    try {
      const stamp = serverTimestamp();
      const body = { type, title: draft.title.trim(), question: draft.question.trim(), detail: draft.detail?.trim() || null, order: Number(draft.order) || 99, version, status: draft.status || "active", policyText: `${draft.question.trim()} ${draft.detail?.trim() || ""}`.trim(), updatedAt: stamp, updatedBy: auth.user.uid };
      if (existing) await updateDoc(doc(db, "consentDefinitions", type), body);
      else await setDoc(doc(db, "consentDefinitions", type), { ...body, createdAt: stamp, createdBy: auth.user.uid });
      forget("consentItems"); setEditing(null);
      setState({ message: reworded ? `Saved. “${body.title}” is now version ${version}; families will be asked it again.` : `Saved “${body.title}”.` }); reload();
    } catch (reason) { setState({ error: saveErrorMessage(reason) }); }
  }
  async function setStatus(item, status) {
    setState({ busy: true });
    try {
      const stamp = serverTimestamp(); const existing = stored(item.type);
      const body = { type: item.type, title: item.title, question: item.question, detail: item.detail || null, order: item.order ?? 99, version: item.version ?? 1, status, updatedAt: stamp, updatedBy: auth.user.uid };
      if (existing) await updateDoc(doc(db, "consentDefinitions", item.type), body); else await setDoc(doc(db, "consentDefinitions", item.type), { ...body, createdAt: stamp, createdBy: auth.user.uid });
      forget("consentItems"); setState({ message: status === "archived" ? `“${item.title}” is no longer asked. Answers already given stay on record.` : `“${item.title}” is asked again.` }); reload();
    } catch (reason) { setState({ error: saveErrorMessage(reason) }); }
  }
  return <>
    <p className="hub-lede">The questions every family answers for each child in the Parents Hub. Changing a question's wording asks families that question again; fixing the explanation underneath does not.</p>
    {state.message && <p className="hub-status" role="status">{state.message}</p>}
    {state.error && !editing && <p className="hub-error" role="alert">{state.error}</p>}
    {canEdit && !editing && <button type="button" className="hub-button" onClick={() => { setState({}); setEditing({ title: "", question: "May {child} …?", detail: "", order: data.items.length + 1 }); }}>Add a question</button>}
    {editing && <form className="hub-form hub-form-wide hub-editor" onSubmit={save}>
      <h2>{editing.type ? `Edit “${editing.title}”` : "Add a consent question"}</h2>
      {editing.type && <AuditLine record={stored(editing.type)} people={data.people} />}
      <div className="hub-form-row"><label>Short title<input required maxLength={120} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label><label>Order<input type="number" min={1} max={99} value={editing.order ?? ""} onChange={(event) => setEditing({ ...editing, order: event.target.value })} /></label></div>
      <label>Question (use {"{child}"} for the pupil's name)<textarea required rows={2} maxLength={400} value={editing.question} onChange={(event) => setEditing({ ...editing, question: event.target.value })} /></label>
      <label>Explanation shown under the question<textarea rows={2} maxLength={600} value={editing.detail || ""} onChange={(event) => setEditing({ ...editing, detail: event.target.value })} /></label>
      {editing.type && data.items.find((item) => item.type === editing.type)?.question !== editing.question && <p className="hub-status">The wording has changed: saving makes this version {(data.items.find((item) => item.type === editing.type)?.version ?? 1) + 1}, and every family will be asked this question again.</p>}
      {state.error && <p className="hub-error" role="alert">{state.error}</p>}
      <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state.busy}>{state.busy ? "Saving…" : "Save question"}</button><button type="button" className="hub-button hub-button-quiet" onClick={() => { setEditing(null); setState({}); }}>Cancel</button></div>
    </form>}
    <ol className="hub-question-list">{data.items.map((item) => <li key={item.type} className="hub-card">
      <div className="hub-card-top"><strong>{item.title}</strong><span className="hub-badges"><StatusBadge status="info" label={`Version ${item.version ?? 1}`} />{item.builtIn && !stored(item.type) && <StatusBadge status="neutral" label="Built-in wording" />}</span></div>
      <p>{item.question.replace("{child}", "[child]")}</p>{item.detail && <small>{item.detail}</small>}
      {canEdit && <div className="hub-row-actions"><button type="button" className="hub-link-button" onClick={() => { setState({}); setEditing({ ...item }); }}>Edit</button><button type="button" className="hub-link-button hub-link-danger" onClick={() => setStatus(item, "archived")}>Stop asking</button></div>}
    </li>)}</ol>
    {retired.length > 0 && <Section title="No longer asked"><ul className="hub-list hub-list-compact">{retired.map((item) => <li key={item.id}><span>{item.title}</span>{canEdit && <button type="button" className="hub-link-button" onClick={() => setStatus({ ...CONSENT_ITEMS.find((built) => built.type === item.id), ...item }, "active")}>Ask again</button>}</li>)}</ul></Section>}
  </>;
}

// ---------- Announcements (admin) ----------
const ANNOUNCEMENT_STATUSES = [["published", "Published"], ["draft", "Draft"], ["scheduled", "Scheduled"], ["archived", "Archived"]];
const toLocalInput = (value) => { const date = value?.toDate ? value.toDate() : value ? new Date(value) : null; if (!date) return ""; const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); };

async function communicationLookups() {
  const [lookups, users, categories] = await Promise.all([schoolLookups(), list("users").catch(() => []), configList("announcementCategories").catch(() => [])]);
  const people = Object.fromEntries([...lookups.staff.filter((person) => person.uid).map((person) => [person.uid, person.name]), ...users.filter((user) => !lookups.staff.some((person) => person.uid === user.id)).map((user) => [user.id, user.displayName || user.email])]);
  return { ...lookups, users, people, categories: categories.length ? categories.map((item) => [item.id, item.name]) : ANNOUNCEMENT_CATEGORIES };
}
const userOptions = (lookups) => lookups.users.filter((user) => (user.roles || []).length && user.status !== "disabled").map((user) => [user.id, lookups.people[user.id] || user.email]).sort((a, b) => String(a[1]).localeCompare(String(b[1])));

export function AnnouncementsAdmin() {
  const auth = useAuth();
  const canEdit = Boolean(can(auth.roles, "announcements", "A") === "all");
  const run = async ({ reload, setNotice }) => {
    try { const { data } = await httpsCallable(functions, "runAnnouncementSchedule")({}); setNotice({ tone: "good", text: `${data.published} scheduled ${data.published === 1 ? "notice" : "notices"} published, ${data.expired} expired.` }); reload(); }
    catch (error) { setNotice({ tone: "bad", text: error.message }); }
  };
  return <RecordManager kicker="Content & communication" title="Announcements" noun="announcement" collection="announcements" nameOf={(row) => row.title} canEdit={canEdit}
    intro="Internal notices for the hub. Public website news is written separately in Website content. Teachers can also post routine notices to their own classes."
    lookups={communicationLookups}
    fields={[
      { key: "title", label: "Headline", type: "text", required: true, maxLength: 140, wide: true },
      { key: "body", label: "Message", type: "textarea", required: true, maxLength: 5000, rows: 5, wide: true },
      { key: "category", label: "Category", type: "select", required: true, options: (lookups) => lookups.categories },
      ...audienceFields({ classOptions: (lookups) => classOptions(lookups), userOptions }),
      { key: "status", label: "Publishing", type: "select", required: true, options: ANNOUNCEMENT_STATUSES },
      { key: "publishAtLocal", label: "Publish at", type: "datetime-local", show: (draft) => draft.status === "scheduled", help: "Published automatically within 15 minutes of this time." },
      { key: "expiresAt", label: "Remove after", type: "date", help: "Optional. Archived automatically after this day." },
      { key: "pinned", label: "Pin to the top of everyone's list", type: "checkbox" },
      { key: "attachmentsText", label: "Attachments (links)", type: "textarea", rows: 2, wide: true, placeholder: "Permission slip | https://drive.google.com/…", help: "One link per line, optionally “Label | link”. Files stay in the school's Google Drive with its sharing settings." },
    ]}
    defaults={() => ({ category: "school", audienceType: "school", status: "published" })}
    toDraft={(row) => ({ ...draftFromKeys(row.audienceKeys), attachmentsText: linksText(row.attachments), publishAtLocal: toLocalInput(row.publishAt) })}
    validate={(values) => ({
      audienceType: audienceError(values), attachmentsText: linksError(values.attachmentsText),
      publishAtLocal: values.status === "scheduled" && !values.publishAtLocal ? "Choose when to publish." : values.status === "scheduled" && new Date(values.publishAtLocal) <= new Date() ? "Choose a time in the future, or publish now." : null,
    })}
    prepare={(values, { original }) => {
      const { audienceType, audienceStandards, audienceClasses, audienceUsers, attachmentsText, publishAtLocal, ...rest } = values;
      const audienceKeys = keysFromDraft({ audienceType, audienceStandards, audienceClasses, audienceUsers });
      const publishing = rest.status === "published" && original?.status !== "published";
      return { ...rest, pinned: Boolean(rest.pinned), audienceKeys, attachments: parseLinks(attachmentsText), publishAt: rest.status === "scheduled" ? new Date(publishAtLocal) : original?.publishAt ?? null, ...(publishing ? { publishedAt: serverTimestamp() } : {}), ...(!original ? { createdBy: auth.user.uid } : {}) };
    }}
    columns={(lookups) => [
      { key: "title", label: "Announcement", render: (row) => <span><span className="hub-cell-strong">{row.title}</span>{row.pinned && <> <StatusBadge status="pending" label="Pinned" /></>}<br /><small>{describeAudience(row.audienceKeys, lookups)}</small></span> },
      { key: "category", label: "Category", render: (row) => lookups.categories.find(([id]) => id === row.category)?.[1] || row.category || "—" },
      { key: "publishedAt", label: "Published", sortValue: (row) => row.publishedAt?.seconds || row.publishAt?.seconds || 0, render: (row) => row.status === "scheduled" ? `Scheduled ${formatDate(row.publishAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : formatDate(row.publishedAt, { day: "numeric", month: "short", year: "numeric" }) },
      { key: "expiresAt", label: "Until", render: (row) => (row.expiresAt ? formatDate(row.expiresAt, { day: "numeric", month: "short" }) : "—") },
      { key: "statusBadge", label: "Status", sortValue: (row) => row.status, csv: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    ]}
    filters={(lookups) => [{ key: "category", label: "Category", options: lookups.categories }]}
    statusOptions={ANNOUNCEMENT_STATUSES}
    headerActions={(ctx) => canEdit && ctx.rows.some((row) => row.status === "scheduled") ? <button type="button" className="hub-button hub-button-quiet" onClick={() => run(ctx)}>Publish due notices now</button> : null}
    searchKeys={["title", "body"]} initialSort={{ key: "publishedAt", dir: -1 }} createLabel="New announcement" />;
}

// ---------- Calendar (admin) ----------
const EVENT_STATUSES = [["published", "Published"], ["draft", "Draft"], ["archived", "Archived"]];
export function CalendarAdmin() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "calendar", "U") === "all";
  return <RecordManager kicker="Content & communication" title="School calendar" noun="event" collection="events" nameOf={(row) => row.title} canEdit={canEdit}
    intro="One school calendar. Each person sees the events meant for them; tick “Show on the public website” for open events such as Sports Day."
    lookups={communicationLookups}
    fields={[
      { key: "title", label: "Event", type: "text", required: true, maxLength: 140, wide: true },
      { key: "category", label: "Type", type: "select", required: true, options: EVENT_CATEGORIES },
      { key: "date", label: "Starts", type: "date", required: true },
      { key: "endDate", label: "Ends", type: "date", help: "Leave empty for a one-day event." },
      { key: "allDay", label: "All day", type: "checkbox" },
      { key: "startTime", label: "Start time", type: "time", show: (draft) => !draft.allDay },
      { key: "endTime", label: "End time", type: "time", show: (draft) => !draft.allDay },
      { key: "location", label: "Location", type: "text", maxLength: 120 },
      { key: "description", label: "Details", type: "textarea", maxLength: 2000, wide: true },
      ...audienceFields({ classOptions: (lookups) => classOptions(lookups), userOptions }),
      { key: "publicListing", label: "Show on the public website calendar", type: "checkbox", wide: true },
      { key: "status", label: "Status", type: "select", required: true, options: EVENT_STATUSES },
      { key: "attachmentsText", label: "Attachments (links)", type: "textarea", rows: 2, wide: true, placeholder: "Programme | https://drive.google.com/…" },
    ]}
    defaults={() => ({ category: "school", audienceType: "school", status: "published", allDay: false })}
    toDraft={(row) => ({ ...draftFromKeys(row.audienceKeys), attachmentsText: linksText(row.attachments) })}
    validate={(values) => ({
      audienceType: audienceError(values), attachmentsText: linksError(values.attachmentsText),
      endDate: values.endDate && values.date && values.endDate < values.date ? "The end can't be before the start." : null,
      endTime: !values.allDay && !values.endDate && values.startTime && values.endTime && values.endTime <= values.startTime ? "The end time must be after the start time." : null,
    })}
    prepare={(values) => {
      const { audienceType, audienceStandards, audienceClasses, audienceUsers, attachmentsText, ...rest } = values;
      return { ...rest, allDay: Boolean(rest.allDay), publicListing: Boolean(rest.publicListing), startTime: rest.allDay ? null : rest.startTime, endTime: rest.allDay ? null : rest.endTime, audienceKeys: keysFromDraft({ audienceType, audienceStandards, audienceClasses, audienceUsers }), attachments: parseLinks(attachmentsText) };
    }}
    columns={(lookups) => [
      { key: "date", label: "When", render: (row) => `${formatDate(row.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}${row.endDate && row.endDate !== row.date ? ` – ${formatDate(row.endDate, { day: "numeric", month: "short" })}` : ""}${row.startTime ? ` · ${row.startTime}` : ""}` },
      { key: "title", label: "Event", render: (row) => <span><span className="hub-cell-strong">{row.title}</span><br /><small>{describeAudience(row.audienceKeys, lookups)}{row.publicListing ? " · on the website" : ""}</small></span> },
      { key: "category", label: "Type", render: (row) => EVENT_CATEGORIES.find(([id]) => id === row.category)?.[1] || row.category || "—" },
      { key: "location", label: "Location" },
      { key: "statusBadge", label: "Status", sortValue: (row) => row.status, csv: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    ]}
    filters={() => [{ key: "category", label: "Type", options: EVENT_CATEGORIES }, { key: "when", label: "When", value: (row) => ((row.endDate || row.date) >= today() ? "upcoming" : "past"), options: [["upcoming", "Upcoming"], ["past", "Past"]] }]}
    initialFilters={() => ({ when: "upcoming" })}
    statusOptions={EVENT_STATUSES} searchKeys={["title", "location"]} initialSort={{ key: "date", dir: 1 }} createLabel="Add event" />;
}
