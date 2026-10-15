// SRSS Manage / Govern screens: admissions pipeline, consent overview, showcase moderation, audit log.
// Website content and the website inbox live in content.jsx.
import { ApplicationReview } from "./applications";
import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, limit, orderBy, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { can } from "../../auth/permissions";
import { consentItems, currentYearId, getMany, list, useLoad } from "../data";
import { humanValuesOf } from "../portfolio";
import { HUMAN_VALUES } from "../logic/dashboard";
import { isCurrent, missingItems } from "../consentForm";
import { ChildConsent } from "./consent";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const PIPELINE = [["new", "Enquiry"], ["visitBooked", "Visit / tour"], ["started", "Application started"], ["submitted", "Submitted"], ["documentsPending", "Documents pending"], ["underReview", "Under review"], ["interview", "Interview / assessment"], ["offer", "Offer"], ["accepted", "Accepted"], ["enrolled", "Enrolled"]];

export function Admissions() {
  const auth = useAuth();
  const canEnrol = can(auth.roles, "admissions", "U") === "all";
  const [message, setMessage] = useState(null);
  const [reviewing,setReviewing]=useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const yearId = await currentYearId();
    const [enquiries, applications, classes, reviews] = await Promise.all([list("admissionEnquiries"), list("applications"), list("classes", where("academicYearId", "==", yearId || "")), list("applicationReviews")]);
    return { enquiries, applications: applications.map(a=>({...a,meritRank:reviews.find(r=>r.id===a.id)?.meritRank})), classes: classes.sort((a, b) => a.standard - b.standard) };
  }, []);
  async function enrol(application, classId) {
    setMessage(null);
    try { const result = await httpsCallable(functions, "enrolApplication")({ applicationId: application.id, classId }); setMessage(`Enrolled ${application.child.name}. Student record ${result.data.studentId} created — no re-keying needed.`); reload(); }
    catch (reason) { setMessage(reason.message); }
  }
  const counts = (status) => [...(data?.enquiries || []), ...(data?.applications || [])].filter((item) => item.status === status).length;
  return <>
    <PageHeader kicker="SRSS Manage" title="Admissions">Enquiry → visit → application → review → offer → enrolment.</PageHeader>
    <ErrorNote error={error} />
    {message && <p className="hub-status" role="status">{message}</p>}
    {loading ? <Loading /> : <>
      <ol className="hub-pipeline">{PIPELINE.map(([status, label]) => <li key={status}><strong>{counts(status)}</strong><span>{label}</span></li>)}</ol>
      <Section title="Applications">
        <DataTable rows={data.applications.map((app) => ({ ...app, childName: app.child?.name, guardianName: app.guardians?.[0]?.name }))} searchKeys={["childName", "guardianName"]} exportName="srss-applications"
          columns={[{ key: "childName", label: "Child" }, { key: "enteringStandard", label: "Entering", render: (row) => `Std ${row.enteringStandard}` }, { key: "guardianName", label: "Guardian" }, {key:"meritRank",label:"Reviewed merit position"}, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} label={PIPELINE.find(([status]) => status === row.status)?.[1]} /> },
            { key: "action", label: "Action", sortable: false, render: (row) => row.status === "accepted" && canEnrol ? <EnrolControl application={row} classes={data.classes} onEnrol={enrol} /> : row.status === "enrolled" ? <Link to={`/hub/students/${row.studentId}`}>View student</Link> : canEnrol ? <button className="hub-link-button" onClick={()=>setReviewing(row)}>Review application</button> : "—" }]} />
      </Section>
      {reviewing&&<ApplicationReview key={reviewing.id} application={reviewing} onSaved={()=>{setReviewing(null);reload();}}/>}
      <Section title="Enquiries">
        <DataTable rows={data.enquiries} searchKeys={["parentName", "childName", "email"]} exportName="srss-enquiries"
          columns={[{ key: "parentName", label: "Parent" }, { key: "childName", label: "Child" }, { key: "enteringStandard", label: "Standard", render: (row) => (row.enteringStandard ? `Std ${row.enteringStandard}` : "—") }, { key: "createdAt", label: "Received", sortValue: (row) => row.createdAt?.seconds || 0, render: (row) => formatDate(row.createdAt) }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }]} />
      </Section>
    </>}
  </>;
}

function EnrolControl({ application, classes, onEnrol }) {
  const suggested = classes.find((cls) => cls.standard === application.enteringStandard)?.id || "";
  const [classId, setClassId] = useState(suggested);
  return <span className="hub-inline-field"><select aria-label="Class" value={classId} onChange={(event) => setClassId(event.target.value)}>{classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}</select><button type="button" className="hub-button hub-button-small" onClick={() => onEnrol(application, classId)}>Enrol</button></span>;
}

export function ConsentOverview() {
  const auth = useAuth();
  const canRemind = auth.roles.some((role) => ["schoolAdmin", "privacySteward"].includes(role));
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [paperFor, setPaperFor] = useState(null);
  const [entered, setEntered] = useState([]); // paper answers saved this visit; the server updates the totals moments later
  const { data, loading, error, reload } = useLoad(async () => {
    const [statuses, students, reminders, items] = await Promise.all([list("studentConsentStatus"), list("students", where("status", "==", "active")), list("consentReminders"), consentItems()]);
    return { items, statuses: Object.fromEntries(statuses.map((status) => [status.id, status.types || {}])), students, reminders: Object.fromEntries(reminders.map((item) => [item.id, item])) };
  }, []);
  const waiting = (data?.students || []).map((student) => ({ ...student, missing: missingItems(data.statuses[student.id], data.items) })).filter((student) => student.missing.length && !entered.includes(student.id))
    .sort((a, b) => (a.currentStandard || 0) - (b.currentStandard || 0) || String(a.name).localeCompare(String(b.name)));

  async function remind(studentIds) {
    setBusy(studentIds.length === 1 ? studentIds[0] : "all"); setMessage(null);
    try {
      const { data: result } = await httpsCallable(functions, "sendConsentReminders")({ studentIds });
      const noAccount = result.withoutAccount.length ? `${result.withoutAccount.length} ${result.withoutAccount.length === 1 ? "pupil has" : "pupils have"} no parent account yet. Use “Paper form” to print a copy, then enter the signed answers.` : "";
      setMessage(result.notified ? `Reminder sent to ${result.notified} ${result.notified === 1 ? "family account" : "family accounts"}. ${noAccount}`.trim() : `No reminder sent. ${noAccount}`);
      reload();
    } catch (reason) { setMessage(reason.message); }
    setBusy(null);
  }

  return <>
    <PageHeader kicker="SRSS Govern" title="Consent">Families answer a few yes or no questions for each child in the Parents Hub. Their answers apply straight away; nothing here needs approval.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-consent-grid">{data.items.map((item) => {
        const responses = data.students.map((student) => { const entry = data.statuses[student.id]?.[item.type]; return isCurrent(entry, item) ? entry.response : null; });
        const granted = responses.filter((r) => r === "granted").length; const declined = responses.filter((r) => r === "declined" || r === "withdrawn").length; const awaiting = responses.filter((r) => !r).length;
        return <article key={item.type} className="hub-card"><strong>{item.title}</strong>
          <div className="hub-consent-bars"><span className="granted" style={{ flexGrow: granted }} /><span className="declined" style={{ flexGrow: declined }} /><span className="missing" style={{ flexGrow: awaiting }} /></div>
          <p>{granted} yes · {declined} no · {awaiting} waiting</p></article>;
      })}</div>
      <Section title={`Waiting for families (${waiting.length})`} action={canRemind && waiting.length > 0 ? <button type="button" className="hub-button hub-button-small" disabled={busy !== null} onClick={() => remind(waiting.map((student) => student.id))}>{busy === "all" ? "Sending…" : "Remind all"}</button> : null}>
        {message && <p className="hub-status" role="status">{message}</p>}
        {!waiting.length ? <EmptyState title="Every family has answered.">New pupils appear here until their parents answer.</EmptyState> : <ul className="hub-waiting">{waiting.map((student) => {
          const reminder = data.reminders[student.id];
          return <li key={student.id}>
            <div><strong>{student.name}</strong><span>{student.currentStandard ? `Standard ${student.currentStandard}` : "—"} · {student.missing.length === data.items.length ? "Not started" : `${student.missing.length} of ${data.items.length} left`}{reminder?.lastSentAt ? ` · reminded ${formatDate(reminder.lastSentAt)}` : ""}</span></div>
            {canRemind && <div className="hub-waiting-actions"><button type="button" className="hub-button hub-button-small hub-button-quiet" disabled={busy !== null} onClick={() => remind([student.id])}>{busy === student.id ? "Sending…" : "Send reminder"}</button><button type="button" className="hub-button hub-button-small hub-button-quiet" aria-expanded={paperFor === student.id} onClick={() => setPaperFor(paperFor === student.id ? null : student.id)}>Paper form</button></div>}
            {paperFor === student.id && <div className="hub-paper-panel"><p className="hub-hint"><Link to={`/hub/consent/print/${student.id}`}>Print {student.preferredName || student.name}’s form</Link> for the family to sign, then enter their answers here.</p><ChildConsent office child={student} items={data.items} status={data.statuses[student.id]} onSaved={() => { setPaperFor(null); setEntered((ids) => [...ids, student.id]); setMessage(`Paper answers saved for ${student.name}.`); window.setTimeout(reload, 4000); }} /></div>}
          </li>;
        })}</ul>}
      </Section>
      <p className="hub-hint"><Link to="/hub/consent/print">Print a blank consent form</Link> for new families. Answers are kept as a permanent history: a change is added as a new record and never overwrites the old one. Reminders appear in the family’s hub notifications.</p>
    </>}
  </>;
}

// CON-002: a moderator approves public showcase only when public-showcase consent is granted.
export function Showcase() {
  const [message, setMessage] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const entries = await list("portfolioEntries", where("visibility", "in", ["showcaseCandidate", "publicShowcase"]));
    const [students, statuses] = await Promise.all([getMany("students", entries.map((entry) => entry.studentId)), getMany("studentConsentStatus", entries.map((entry) => entry.studentId))]);
    return { entries, students, statuses };
  }, []);
  async function decide(entry, approve) {
    setMessage(null);
    try {
      await updateDoc(doc(db, "portfolioEntries", entry.id), approve ? { visibility: "publicShowcase", moderationStatus: "approved", moderatedAt: serverTimestamp() } : { visibility: "family", moderationStatus: "returned", moderatedAt: serverTimestamp() });
      setMessage(approve ? `"${entry.title}" is now in the public showcase.` : `"${entry.title}" was returned to family visibility.`); reload();
    } catch (reason) { setMessage(reason.code === "permission-denied" ? "Blocked: public-showcase consent has not been granted for this pupil." : reason.message); }
  }
  return <>
    <PageHeader kicker="Content & communication" title="Portfolio moderation">Work teachers have nominated for the public showcase. Approving needs the family's public-showcase consent; the public website then shows a copy with the pupil's first name, the title and description only — never their media or surname.</PageHeader>
    <ErrorNote error={error} />
    {message && <p className="hub-status" role="status">{message}</p>}
    {loading ? <Loading /> : !data.entries.length ? <EmptyState title="No showcase candidates." /> : <ul className="hub-cards">{data.entries.map((entry) => {
      const student = data.students.find((item) => item.id === entry.studentId);
      const consent = data.statuses.find((item) => item.id === entry.studentId)?.types?.publicShowcase?.response;
      return <li key={entry.id} className="hub-card"><div className="hub-card-top"><strong>{entry.title}</strong><StatusBadge status={entry.visibility} /></div><p>{entry.description}</p><small>{student?.name} · {humanValuesOf(entry).map((value) => HUMAN_VALUES[value]).join(" · ")}</small>
        <p>{consent === "granted" ? <StatusBadge status="granted" label="Public-showcase consent granted" /> : <StatusBadge status="declined" label={consent ? `Consent ${consent}` : "No public-showcase consent"} />}</p>
        {entry.visibility === "showcaseCandidate" && <div className="hub-form-actions"><button type="button" className="hub-button hub-button-small" disabled={consent !== "granted"} onClick={() => decide(entry, true)}>Approve for public showcase</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => decide(entry, false)}>Return</button></div>}
        {consent !== "granted" && entry.visibility === "showcaseCandidate" && <p className="hub-error">Publishing is blocked until a guardian grants public-showcase consent.</p>}
      </li>;
    })}</ul>}
  </>;
}

export function Audit() {
  const { data, loading, error } = useLoad(() => list("auditLogs", orderBy("at", "desc"), limit(200)), []);
  return <>
    <PageHeader kicker="SRSS Govern" title="Audit trail">Role changes, record edits, consent and publication events. Written by the server; no one can edit it.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <DataTable rows={data} searchKeys={["type", "path"]} exportName="srss-audit" columns={[{ key: "at", label: "When", sortValue: (row) => row.at?.seconds || 0, render: (row) => formatDate(row.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }, { key: "type", label: "Event" }, { key: "path", label: "Record", render: (row) => row.path || row.targetUid || "—" }, { key: "fields", label: "Fields", render: (row) => row.fields?.join(", ") || "—" }]} empty="No audit events yet." />}
  </>;
}
