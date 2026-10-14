// People (Admin hub): students, guardians, staff, guardian–student links and user accounts.
// Person records are edited here; sign-in accounts and roles are created only by server functions
// (provisionAccount, setUserRoles, setAccountStatus), which re-check who may grant which role.
import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { ADDITIONAL_ROLES, PRIMARY_ROLES, ROLES, assignableRoles, can, isSuperAdmin } from "../../auth/permissions";
import { forget, list, today, useLoad } from "../data";
import { COMPLETENESS_FIELDS, completeness } from "../logic/dashboard";
import { RecordManager, isActive } from "../manage";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, StatusBadge } from "../ui";
import { classOptions, schoolLookups } from "./setup";

export const RELATIONSHIPS = [["mother", "Mother"], ["father", "Father"], ["legalGuardian", "Legal guardian"], ["caregiver", "Authorised caregiver"], ["emergencyContact", "Emergency contact only"], ["collectionPerson", "Authorised collection person"]];
const LANGUAGES = [["English", "English"], ["Bahasa Melayu", "Bahasa Melayu"], ["Tamil", "Tamil"], ["Mandarin", "Mandarin"]];
const roleLabel = (role) => ROLES[role]?.label || role;
const callable = (name) => httpsCallable(functions, name);
const functionError = (error) => error?.message?.replace(/^.*?:\s*/, "") || "That didn't work. Please try again.";

// ---------- Create a sign-in account for a person (one step: account + roles + link) ----------
export function AccountInvite({ person, personType, defaultRoles, onDone, onCancel }) {
  const auth = useAuth();
  const allowed = assignableRoles(auth.roles, auth.claims);
  const [email, setEmail] = useState(person?.email || "");
  const [roles, setRoles] = useState(defaultRoles.filter((role) => allowed.includes(role)));
  const [state, setState] = useState({ busy: false, error: null });
  const offered = personType === "guardian" ? ["parent"] : personType === "student" ? ["student"] : [...PRIMARY_ROLES.filter((role) => !["parent", "student"].includes(role)), ...ADDITIONAL_ROLES];
  async function submit(event) {
    event.preventDefault();
    setState({ busy: true, error: null });
    try {
      const { data } = await callable("provisionAccount")({ email, displayName: person.name, roles, personType, personId: person.id, reason: `Account created for ${person.name}` });
      onDone(`Hub account ready for ${person.name} (${data.email}). They sign in at ${window.location.host}/login with Google or “Email me a sign-in link” — no password to send.`);
    } catch (error) { setState({ busy: false, error: functionError(error) }); }
  }
  return <form className="hub-form hub-form-wide hub-editor" onSubmit={submit}>
    <h2>Create a hub account for {person.name}</h2>
    <label>Email address they will sign in with<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" /></label>
    <fieldset className="hub-checkset"><legend>Roles</legend><div>{offered.map((role) => <label key={role} className="hub-check" title={allowed.includes(role) ? undefined : "Only a Super Administrator can grant this role"}><input type="checkbox" disabled={!allowed.includes(role)} checked={roles.includes(role)} onChange={(event) => setRoles(event.target.checked ? [...roles, role] : roles.filter((item) => item !== role))} />{roleLabel(role)}{!allowed.includes(role) && <small> · Super Administrator only</small>}</label>)}</div></fieldset>
    {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state.busy || !roles.length}>{state.busy ? "Creating…" : "Create account"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Cancel</button></div>
  </form>;
}

function useInvite(personType, defaultRoles) {
  const [inviting, setInviting] = useState(null);
  return {
    action: (row) => (!row.uid && isActive(row) ? <button type="button" className="hub-link-button" onClick={() => setInviting(row)}>Create account</button> : null),
    banner: (ctx) => inviting && <AccountInvite person={inviting} personType={personType} defaultRoles={defaultRoles} onCancel={() => setInviting(null)} onDone={(text) => { setInviting(null); forget("staffNames"); ctx.setNotice({ tone: "good", text }); window.setTimeout(ctx.reload, 1500); }} />,
  };
}

const accountBadge = (row) => (row.uid ? <StatusBadge status="active" label="Has account" /> : <span className="hub-cell-muted">No account</span>);

// ---------- Students ----------
export function StudentsAdmin() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "students", "U") === "all";
  const invite = useInvite("student", ["student"]);
  return <RecordManager kicker="People" title="Students" noun="student" collection="students" canEdit={canEdit}
    intro="Pupil records. A pupil's class comes from their enrolment; add one here when you create the pupil, or later in Student enrolments."
    lookups={() => schoolLookups({ enrolments: () => list("enrollments", where("status", "==", "active")) })}
    fields={[
      { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
      { key: "preferredName", label: "Preferred name", type: "text", maxLength: 60 },
      { key: "studentNumber", label: "Student number", type: "text", maxLength: 30, placeholder: "2027-0001" },
      { key: "dateOfBirth", label: "Date of birth", type: "date" },
      { key: "admissionDate", label: "Admission date", type: "date" },
      { key: "status", label: "Status", type: "select", required: true, options: [["active", "Active"], ["withdrawn", "Withdrawn"], ["graduated", "Graduated"]] },
      { key: "enrolClassId", label: "Enrol in class", type: "select", options: (lookups) => classOptions(lookups), placeholder: "Not yet", show: (draft, lookups, editing) => editing.isNew, help: "Creates the enrolment for the current year at the same time." },
      ...Object.entries(COMPLETENESS_FIELDS).map(([key, label]) => ({ key: `has_${key}`, label: `${label} on file`, type: "checkbox" })),
    ]}
    defaults={() => ({ admissionDate: today(), status: "active" })}
    toDraft={(row) => Object.fromEntries(Object.keys(COMPLETENESS_FIELDS).map((key) => [`has_${key}`, Boolean(row.completeness?.[key])]))}
    validate={(values, { rows, original }) => ({ studentNumber: values.studentNumber && rows.some((row) => row.id !== original?.id && row.studentNumber === values.studentNumber) ? "Another pupil has this student number." : null })}
    prepare={(values, { isNew }) => {
      const { enrolClassId, ...rest } = values;
      const flags = Object.fromEntries(Object.keys(COMPLETENESS_FIELDS).map((key) => [key, Boolean(rest[`has_${key}`])]));
      for (const key of Object.keys(COMPLETENESS_FIELDS)) delete rest[`has_${key}`];
      return { ...rest, completeness: flags, ...(isNew ? { currentClassId: null, currentStandard: null, uid: null } : {}) };
    }}
    extraWrites={(batch, { ref, isNew, lookups, uid, stamp, payload, values }) => {
      const classId = isNew && values.enrolClassId;
      if (!classId) return;
      const cls = lookups.classes.find((item) => item.id === classId);
      batch.set(doc(collection(db, "enrollments")), { studentId: ref.id, classId, academicYearId: cls.academicYearId, standard: cls.standard, startDate: payload.admissionDate || today(), status: "active", createdAt: stamp, createdBy: uid, updatedAt: stamp, updatedBy: uid });
    }}
    columns={(lookups) => [
      { key: "name", label: "Name", render: (row) => <Link className="hub-cell-strong" to={`/hub/students/${row.id}`}>{row.name}</Link> },
      { key: "studentNumber", label: "Student no." },
      { key: "currentClassId", label: "Class", sortValue: (row) => lookups.classes.find((cls) => cls.id === row.currentClassId)?.name || "", csv: (row) => lookups.classes.find((cls) => cls.id === row.currentClassId)?.name || "", render: (row) => lookups.classes.find((cls) => cls.id === row.currentClassId)?.name || <span className="hub-cell-muted">Not enrolled</span> },
      { key: "record", label: "Record", sortValue: (row) => completeness(row).percent, csv: (row) => `${completeness(row).percent}%`, render: (row) => completeness(row).complete ? <StatusBadge status="complete" label="Complete" /> : <span title={completeness(row).missing.join(", ")}><StatusBadge status="missing" label={`${completeness(row).missing.length} missing`} /></span> },
      { key: "uid", label: "Hub", sortValue: (row) => (row.uid ? 1 : 0), csv: (row) => (row.uid ? "yes" : "no"), render: accountBadge },
    ]}
    filters={(lookups) => [{ key: "currentClassId", label: "Class", options: classOptions(lookups) }, { key: "currentStandard", label: "Standard", value: (row) => String(row.currentStandard ?? ""), options: [1, 2, 3, 4, 5, 6].map((level) => [String(level), `Standard ${level}`]) }]}
    statusOptions={[["active", "Active"], ["withdrawn", "Withdrawn"], ["graduated", "Graduated"], ["archived", "Archived"]]}
    archivable={(row, { lookups }) => (lookups.enrolments.some((item) => item.studentId === row.id) ? "End this pupil's enrolment first." : true)}
    rowActions={(row) => invite.action(row)} banner={invite.banner}
    searchKeys={["name", "preferredName", "studentNumber"]} exportName="srss-students" initialSort={{ key: "name", dir: 1 }} />;
}

// ---------- Guardians ----------
export function Guardians() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "guardians", "U") === "all";
  const invite = useInvite("guardian", ["parent"]);
  return <RecordManager kicker="People" title="Parents & guardians" noun="guardian" collection="guardians" canEdit={canEdit}
    intro="Family contacts. Link a guardian to their children in Guardian links; give them a hub account to follow their children online."
    lookups={async () => { const [links, students] = await Promise.all([list("studentGuardianLinks", where("status", "==", "active")), list("students")]); return { links, students }; }}
    fields={[
      { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
      { key: "email", label: "Email", type: "email", maxLength: 200 },
      { key: "phone", label: "Phone", type: "tel", maxLength: 30 },
      { key: "preferredLanguage", label: "Preferred language", type: "select", options: LANGUAGES },
      { key: "address", label: "Address", type: "textarea", maxLength: 300, wide: true },
    ]}
    validate={(values, { rows, original }) => ({ email: values.email && rows.some((row) => row.id !== original?.id && String(row.email || "").toLowerCase() === values.email.toLowerCase()) ? "Another guardian already uses this email." : null })}
    columns={(lookups) => [
      { key: "name", label: "Name", render: (row) => <span className="hub-cell-strong">{row.name}</span> },
      { key: "email", label: "Email" }, { key: "phone", label: "Phone" },
      { key: "children", label: "Children", sortable: false, csv: (row) => lookups.links.filter((link) => link.guardianId === row.id).map((link) => lookups.students.find((student) => student.id === link.studentId)?.name).join("; "), render: (row) => lookups.links.filter((link) => link.guardianId === row.id).map((link) => lookups.students.find((student) => student.id === link.studentId)?.name).filter(Boolean).join(", ") || <span className="hub-cell-muted">Not linked</span> },
      { key: "uid", label: "Hub", sortValue: (row) => (row.uid ? 1 : 0), csv: (row) => (row.uid ? "yes" : "no"), render: accountBadge },
    ]}
    archivable={(row, { lookups }) => (lookups.links.some((link) => link.guardianId === row.id) ? "Archive this guardian's links first." : true)}
    rowActions={(row) => invite.action(row)} banner={invite.banner}
    searchKeys={["name", "email", "phone"]} exportName="srss-guardians" initialSort={{ key: "name", dir: 1 }} />;
}

// ---------- Staff ----------
export function StaffAdmin() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "staff", "U") === "all";
  const invite = useInvite("staff", ["teacher"]);
  return <RecordManager kicker="People" title="Staff & teachers" noun="staff member" collection="staff" canEdit={canEdit}
    intro="Staff records and the school directory. Give a teacher a hub account, then assign them to classes in Teacher assignments."
    lookups={() => list("users").then((users) => ({ users })).catch(() => ({ users: [] }))}
    fields={[
      { key: "name", label: "Full name", type: "text", required: true, maxLength: 120 },
      { key: "position", label: "Position", type: "text", maxLength: 80, placeholder: "Class Teacher, Standard 4" },
      { key: "email", label: "Email", type: "email", maxLength: 200 },
      { key: "phone", label: "Phone", type: "tel", maxLength: 30 },
      { key: "directoryVisible", label: "Show name and position to families in the hub directory", type: "checkbox", wide: true },
    ]}
    defaults={() => ({ directoryVisible: true })}
    afterSave={() => forget("staffNames")}
    columns={(lookups) => [
      { key: "name", label: "Name", render: (row) => <span className="hub-cell-strong">{row.name}</span> },
      { key: "position", label: "Position" }, { key: "email", label: "Email" },
      { key: "roles", label: "Hub roles", sortable: false, csv: (row) => (lookups.users.find((user) => user.id === row.uid)?.roles || []).join("; "), render: (row) => row.uid ? <span className="hub-badges">{(lookups.users.find((user) => user.id === row.uid)?.roles || []).map((role) => <StatusBadge key={role} status="info" label={roleLabel(role)} />)}</span> : <span className="hub-cell-muted">No account</span> },
    ]}
    rowActions={(row) => invite.action(row)} banner={invite.banner}
    searchKeys={["name", "position", "email"]} exportName="srss-staff" initialSort={{ key: "name", dir: 1 }} />;
}

// ---------- Guardian–student links ----------
export function GuardianLinks() {
  const auth = useAuth();
  const canEdit = can(auth.roles, "guardians", "U") === "all";
  const label = (lookups, row) => `${lookups.guardians.find((item) => item.id === row.guardianId)?.name || "Guardian"} → ${lookups.students.find((item) => item.id === row.studentId)?.name || "pupil"}`;
  return <RecordManager kicker="Assignments" title="Guardian links" noun="link" collection="studentGuardianLinks" canEdit={canEdit}
    intro="Only the school office links a guardian to a child — parents can never link themselves. Hub access lets a guardian with an account see that child; the relationship itself is recorded either way."
    lookups={async () => { const [students, guardians, classes] = await Promise.all([list("students"), list("guardians"), list("classes")]); return { students, guardians, classes }; }}
    nameOf={(row, lookups) => (lookups ? label(lookups, row) : "")}
    fields={[
      { key: "studentId", label: "Pupil", type: "select", required: true, immutable: true, options: (lookups) => lookups.students.filter((student) => student.status === "active").sort((a, b) => a.name.localeCompare(b.name)).map((student) => [student.id, student.name]) },
      { key: "guardianId", label: "Guardian", type: "select", required: true, immutable: true, options: (lookups) => lookups.guardians.filter(isActive).sort((a, b) => a.name.localeCompare(b.name)).map((guardian) => [guardian.id, `${guardian.name}${guardian.email ? ` · ${guardian.email}` : ""}`]) },
      { key: "relationship", label: "Relationship", type: "select", required: true, options: RELATIONSHIPS },
      { key: "hasPortalAccess", label: "Can see this child in the Parents Hub", type: "checkbox" },
      { key: "isEmergencyContact", label: "Emergency contact", type: "checkbox" },
      { key: "canCollect", label: "May collect the child", type: "checkbox" },
    ]}
    defaults={() => ({ hasPortalAccess: true, isEmergencyContact: true, canCollect: true })}
    validate={(values, { rows, isNew }) => ({ _form: isNew && rows.some((row) => isActive(row) && row.studentId === values.studentId && row.guardianId === values.guardianId) ? "This guardian is already linked to this pupil." : null })}
    prepare={(values, { isNew, lookups }) => isNew ? { ...values, guardianUid: lookups.guardians.find((item) => item.id === values.guardianId)?.uid || null, classId: lookups.students.find((item) => item.id === values.studentId)?.currentClassId || null } : values}
    columns={(lookups) => [
      { key: "studentId", label: "Pupil", sortValue: (row) => lookups.students.find((item) => item.id === row.studentId)?.name || "", csv: (row) => lookups.students.find((item) => item.id === row.studentId)?.name, render: (row) => <Link to={`/hub/students/${row.studentId}`}>{lookups.students.find((item) => item.id === row.studentId)?.name || "—"}</Link> },
      { key: "guardianId", label: "Guardian", sortValue: (row) => lookups.guardians.find((item) => item.id === row.guardianId)?.name || "", csv: (row) => lookups.guardians.find((item) => item.id === row.guardianId)?.name, render: (row) => <span className="hub-cell-strong">{lookups.guardians.find((item) => item.id === row.guardianId)?.name || "—"}</span> },
      { key: "relationship", label: "Relationship", render: (row) => RELATIONSHIPS.find(([value]) => value === row.relationship)?.[1] || row.relationship },
      { key: "access", label: "Access", sortable: false, csv: (row) => [row.hasPortalAccess && "hub", row.isEmergencyContact && "emergency", row.canCollect && "collect"].filter(Boolean).join("; "), render: (row) => <span className="hub-badges">{row.hasPortalAccess && <StatusBadge status={row.guardianUid ? "active" : "pending"} label={row.guardianUid ? "Hub access" : "Hub access · no account yet"} />}{row.isEmergencyContact && <StatusBadge status="info" label="Emergency" />}{row.canCollect && <StatusBadge status="info" label="May collect" />}</span> },
    ]}
    filters={(lookups) => [{ key: "classId", label: "Class", options: lookups.classes.map((cls) => [cls.id, cls.name]) }]}
    searchKeys={[]} exportName="srss-guardian-links" createLabel="Link a guardian" />;
}

// ---------- User accounts ----------
export function Accounts() {
  const auth = useAuth();
  const allowed = assignableRoles(auth.roles, auth.claims);
  const superAdmin = isSuperAdmin(auth.roles, auth.claims);
  const [panel, setPanel] = useState(null); // { kind: "roles" | "status", user }
  const [notice, setNotice] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const [users, guardians, students, staff] = await Promise.all([list("users"), list("guardians"), list("students"), list("staff")]);
    const person = (user) => (user.personType === "guardian" ? guardians : user.personType === "student" ? students : user.personType === "staff" ? staff : []).find((item) => item.id === user.personId)
      || [...staff, ...guardians, ...students].find((item) => item.uid === user.id);
    return users.filter((user) => (user.roles || []).length || user.status === "disabled").map((user) => ({ ...user, personName: person(user)?.name || user.displayName || user.email, roleList: (user.roles || []).map(roleLabel).join(", ") }));
  }, []);

  return <>
    <PageHeader kicker="People" title="User accounts">Sign-in accounts, their roles and status. {superAdmin ? "As a Super Administrator you can grant any role." : "The school office can give family and teacher roles; staff and administrator roles need a Super Administrator."} Create an account from the Students, Parents & guardians or Staff page so it is linked to the right person.</PageHeader>
    <div aria-live="polite">{notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role="status">{notice.text}</p>}</div>
    {panel?.kind === "roles" && <RolesPanel user={panel.user} allowed={allowed} onCancel={() => setPanel(null)} onDone={(text) => { setPanel(null); setNotice({ tone: "good", text }); reload(); }} />}
    {panel?.kind === "status" && <StatusPanel user={panel.user} onCancel={() => setPanel(null)} onDone={(text) => { setPanel(null); setNotice({ tone: "good", text }); reload(); }} />}
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No accounts yet." /> : <DataTable rows={data} searchKeys={["personName", "email", "roleList"]} exportName="srss-accounts" initialFilters={{ status: "active" }}
      filters={[{ key: "status", label: "Status", value: (row) => row.status || "active", options: [["active", "Active"], ["disabled", "Disabled"]] }, { key: "role", label: "Role", value: (row) => (row.roles || [])[0] || "", options: PRIMARY_ROLES.map((role) => [role, roleLabel(role)]) }]}
      columns={[
        { key: "personName", label: "Person", render: (row) => <span><span className="hub-cell-strong">{row.personName}</span><br /><small>{row.email}</small></span> },
        { key: "roleList", label: "Roles", render: (row) => <span className="hub-badges">{(row.roles || []).map((role) => <StatusBadge key={role} status={role === "superAdmin" ? "pending" : "info"} label={roleLabel(role)} />)}</span> },
        { key: "personType", label: "Linked to", render: (row) => row.personType ? `${row.personType} record` : <span className="hub-cell-muted">—</span> },
        { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status === "disabled" ? "disabled" : "active"} label={row.status === "disabled" ? "Disabled" : "Active"} /> },
        { key: "_actions", label: "Actions", sortable: false, csv: () => "", render: (row) => row.id === auth.user.uid ? <span className="hub-cell-muted">You</span> : <span className="hub-row-actions">
          <button type="button" className="hub-link-button" onClick={() => setPanel({ kind: "roles", user: row })}>Change roles</button>
          <button type="button" className={`hub-link-button ${row.status === "disabled" ? "" : "hub-link-danger"}`} onClick={() => setPanel({ kind: "status", user: row })}>{row.status === "disabled" ? "Enable" : "Disable"}</button>
        </span> },
      ]} />}
  </>;
}

function RolesPanel({ user, allowed, onDone, onCancel }) {
  const [roles, setRoles] = useState(user.roles || []);
  const [reason, setReason] = useState("");
  const [state, setState] = useState({ busy: false, error: null });
  const groups = [["Main roles", PRIMARY_ROLES], ["Additional responsibilities", ADDITIONAL_ROLES]];
  async function save(event) {
    event.preventDefault(); setState({ busy: true, error: null });
    try { await callable("setUserRoles")({ uid: user.id, roles, reason }); onDone(`Roles updated for ${user.personName}. They see the change the next time they sign in or refresh.`); }
    catch (error) { setState({ busy: false, error: functionError(error) }); }
  }
  return <form className="hub-form hub-form-wide hub-editor" onSubmit={save}>
    <h2>Roles for {user.personName}</h2>
    {groups.map(([title, ids]) => <fieldset key={title} className="hub-checkset"><legend>{title}</legend><div>{ids.map((role) => <label key={role} className="hub-check" title={allowed.includes(role) ? undefined : "Only a Super Administrator can change this role"}><input type="checkbox" disabled={!allowed.includes(role)} checked={roles.includes(role)} onChange={(event) => setRoles(event.target.checked ? [...roles, role] : roles.filter((item) => item !== role))} />{roleLabel(role)}</label>)}</div></fieldset>)}
    <label>Reason (kept in the audit history)<input required value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Joined as Standard 3 class teacher" /></label>
    {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state.busy || !reason.trim()}>{state.busy ? "Saving…" : "Save roles"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Cancel</button></div>
  </form>;
}

function StatusPanel({ user, onDone, onCancel }) {
  const disabling = user.status !== "disabled";
  const [reason, setReason] = useState("");
  const [state, setState] = useState({ busy: false, error: null });
  async function save(event) {
    event.preventDefault(); setState({ busy: true, error: null });
    try { await callable("setAccountStatus")({ uid: user.id, disabled: disabling, reason }); onDone(disabling ? `${user.personName}'s account is disabled and signed out everywhere. Their records are kept.` : `${user.personName}'s account is enabled again.`); }
    catch (error) { setState({ busy: false, error: functionError(error) }); }
  }
  return <form className="hub-form hub-form-wide hub-editor" onSubmit={save}>
    <h2>{disabling ? "Disable" : "Enable"} {user.personName}'s account</h2>
    <p className="hub-hint">{disabling ? "They can no longer sign in, and any open session ends. Nothing they recorded is deleted." : "They can sign in again with their existing roles."}</p>
    <label>Reason (kept in the audit history)<input required value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} /></label>
    {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    <div className="hub-form-actions"><button type="submit" className={`hub-button ${disabling ? "hub-button-danger" : ""}`} disabled={state.busy || !reason.trim()}>{state.busy ? "Saving…" : disabling ? "Disable account" : "Enable account"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Cancel</button></div>
  </form>;
}

// ---------- Support groups (Remedial) ----------
// Pupils stay registered in their Standard class; the group's teachers get access to these pupils only.
const PROGRAMMES = [["remedial", "Remedial"], ["learningStudio", "Learning Studio"]];
export function SupportGroups() {
  const auth = useAuth();
  const canEdit = auth.roles.some((role) => ["schoolAdmin", "superAdmin", "academicCoordinator"].includes(role));
  const pupil = (lookups, id) => lookups.students.find((item) => item.id === id);
  return <RecordManager kicker="Assignments" title="Remedial & support groups" noun="placement" collection="studentSupportPlans" canEdit={canEdit}
    intro="Pupils in the Remedial group stay in their own Standard class for registration. Place a pupil here and choose the Remedial teacher: that teacher can then see the pupil's record and add their work, and nothing else."
    lookups={async () => { const [students, staff, classes] = await Promise.all([list("students", where("status", "==", "active")), list("staff"), list("classes")]); return { students, staff, classes }; }}
    nameOf={(row, lookups) => (lookups ? pupil(lookups, row.studentId)?.name || "" : "")}
    fields={[
      { key: "programme", label: "Group", type: "select", required: true, options: PROGRAMMES },
      { key: "studentId", label: "Pupil", type: "select", required: true, immutable: true, options: (lookups) => lookups.students.sort((a, b) => a.name.localeCompare(b.name)).map((item) => [item.id, `${item.name} · ${lookups.classes.find((cls) => cls.id === item.currentClassId)?.name || "no class"}`]) },
      { key: "assignedStaffUids", label: "Teachers", type: "checkboxes", options: (lookups) => lookups.staff.filter((person) => person.uid && isActive(person)).map((person) => [person.uid, person.name]), wide: true, emptyOptions: "No staff have hub accounts yet." },
      { key: "focus", label: "Focus", type: "text", maxLength: 120, placeholder: "e.g. Reading fluency" },
      { key: "goal", label: "Goal", type: "textarea", maxLength: 500, wide: true },
      { key: "reviewDate", label: "Review by", type: "date" },
      { key: "familyVisible", label: "Parents can see this placement in the Parents Hub", type: "checkbox", wide: true },
    ]}
    defaults={() => ({ programme: "remedial", assignedStaffUids: [], familyVisible: false })}
    validate={(values, { rows, isNew }) => ({
      assignedStaffUids: !(values.assignedStaffUids || []).length ? "Choose at least one teacher." : null,
      _form: isNew && rows.some((row) => isActive(row) && row.studentId === values.studentId && row.programme === values.programme) ? "This pupil is already in this group." : null,
    })}
    prepare={(values, { isNew, lookups }) => ({ ...values, ...(isNew ? { classId: pupil(lookups, values.studentId)?.currentClassId || null } : {}) })}
    columns={(lookups) => [
      { key: "studentId", label: "Pupil", sortValue: (row) => pupil(lookups, row.studentId)?.name || "", csv: (row) => pupil(lookups, row.studentId)?.name, render: (row) => <Link className="hub-cell-strong" to={`/hub/students/${row.studentId}`}>{pupil(lookups, row.studentId)?.name || "—"}</Link> },
      { key: "classId", label: "Class", render: (row) => lookups.classes.find((cls) => cls.id === (pupil(lookups, row.studentId)?.currentClassId || row.classId))?.name || "—" },
      { key: "programme", label: "Group", render: (row) => PROGRAMMES.find(([value]) => value === row.programme)?.[1] || "Support" },
      { key: "assignedStaffUids", label: "Teachers", sortable: false, csv: (row) => (row.assignedStaffUids || []).map((uid) => lookups.staff.find((person) => person.uid === uid)?.name).join("; "), render: (row) => (row.assignedStaffUids || []).map((uid) => lookups.staff.find((person) => person.uid === uid)?.name).filter(Boolean).join(", ") || "—" },
      { key: "focus", label: "Focus" },
    ]}
    filters={() => [{ key: "programme", label: "Group", options: PROGRAMMES }]}
    searchKeys={["focus"]} exportName="srss-support-groups" createLabel="Place a pupil" />;
}
