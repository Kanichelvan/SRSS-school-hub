// SRSS Manage / Govern screens: admissions pipeline, consent overview, showcase moderation, audit log.
// Website content and the website inbox live in content.jsx.
import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, limit, orderBy, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../lib/firebase";
import { useAuth } from "../../auth/AuthProvider";
import { can } from "../../auth/permissions";
import { getMany, list, useLoad } from "../data";
import { HUMAN_VALUES } from "../logic/dashboard";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const PIPELINE = [["new", "Enquiry"], ["visitBooked", "Visit / tour"], ["started", "Application started"], ["submitted", "Submitted"], ["documentsPending", "Documents pending"], ["underReview", "Under review"], ["interview", "Interview / assessment"], ["offer", "Offer"], ["accepted", "Accepted"], ["enrolled", "Enrolled"]];

export function Admissions() {
  const auth = useAuth();
  const canEnrol = can(auth.roles, "admissions", "U") === "all";
  const [message, setMessage] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const [enquiries, applications, classes] = await Promise.all([list("admissionEnquiries"), list("applications"), list("classes", where("academicYearId", "==", "ay2026"))]);
    return { enquiries, applications, classes: classes.sort((a, b) => a.standard - b.standard) };
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
          columns={[{ key: "childName", label: "Child" }, { key: "enteringStandard", label: "Entering", render: (row) => `Std ${row.enteringStandard}` }, { key: "guardianName", label: "Guardian" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} label={PIPELINE.find(([status]) => status === row.status)?.[1]} /> },
            { key: "action", label: "Action", sortable: false, render: (row) => row.status === "accepted" && canEnrol ? <EnrolControl application={row} classes={data.classes} onEnrol={enrol} /> : row.status === "enrolled" ? <Link to={`/hub/students/${row.studentId}`}>View student</Link> : "—" }]} />
      </Section>
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
  const { data, loading, error } = useLoad(async () => {
    const [definitions, statuses, students] = await Promise.all([list("consentDefinitions", where("status", "==", "active")), list("studentConsentStatus"), list("students", where("status", "==", "active"))]);
    return { definitions, statuses, students };
  }, []);
  return <>
    <PageHeader kicker="SRSS Govern" title="Consent centre">Granular, versioned consent. Records are append-only; withdrawals never overwrite history.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-consent-grid">{data.definitions.map((definition) => {
        const responses = data.students.map((student) => data.statuses.find((status) => status.id === student.id)?.types?.[definition.type]?.response);
        return <article key={definition.id} className="hub-card"><strong>{definition.title}</strong><small>Version {definition.version} · review {formatDate(definition.reviewDate, { day: "numeric", month: "short", year: "numeric" })}</small>
          <div className="hub-consent-bars"><span className="granted" style={{ flexGrow: responses.filter((r) => r === "granted").length }} /><span className="declined" style={{ flexGrow: responses.filter((r) => r === "declined" || r === "withdrawn").length }} /><span className="missing" style={{ flexGrow: responses.filter((r) => !r).length }} /></div>
          <p>{responses.filter((r) => r === "granted").length} granted · {responses.filter((r) => r === "declined" || r === "withdrawn").length} declined · {responses.filter((r) => !r).length} awaiting</p></article>;
      })}</div>
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
    <PageHeader kicker="SRSS Grow" title="Showcase moderation">Teacher-nominated work. Public visibility needs moderation and recorded consent.</PageHeader>
    <ErrorNote error={error} />
    {message && <p className="hub-status" role="status">{message}</p>}
    {loading ? <Loading /> : !data.entries.length ? <EmptyState title="No showcase candidates." /> : <ul className="hub-cards">{data.entries.map((entry) => {
      const student = data.students.find((item) => item.id === entry.studentId);
      const consent = data.statuses.find((item) => item.id === entry.studentId)?.types?.publicShowcase?.response;
      return <li key={entry.id} className="hub-card"><div className="hub-card-top"><strong>{entry.title}</strong><StatusBadge status={entry.visibility} /></div><p>{entry.description}</p><small>{student?.name} · {HUMAN_VALUES[entry.humanValue] || ""}</small>
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

