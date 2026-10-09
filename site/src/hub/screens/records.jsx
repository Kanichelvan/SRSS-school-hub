// SIS screens: student register (PRD §16), Student 360° profile (§17, SIS-002), staff directory, academics.
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderBy, where, limit } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { can, canOpen } from "../../auth/permissions";
import { getMany, list, listIn, one, useLoad } from "../data";
import { ATTENDANCE_LABELS, COMPLETENESS_FIELDS, HUMAN_VALUES, STUDENT_360_TABS, attendanceSummary, completeness } from "../logic/dashboard";
import { DataTable, EmptyState, ErrorNote, LastUpdated, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const RELATIONSHIPS = { mother: "Mother", father: "Father", legalGuardian: "Legal guardian", caregiver: "Authorised caregiver", emergencyContact: "Emergency contact", collectionPerson: "Authorised collection person" };

// Loads the students a viewer may list: everyone for school-wide roles, otherwise their classes/assigned pupils.
async function visibleStudents(auth) {
  if (can(auth.roles, "students", "V") === "all") return list("students");
  const scope = auth.scope || {};
  const [byClass, assigned] = await Promise.all([listIn("students", "currentClassId", scope.classIds || []), getMany("students", scope.assignedStudentIds || [])]);
  return [...new Map([...byClass, ...assigned].map((student) => [student.id, student])).values()];
}

export function StudentRegister() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(async () => {
    const [students, classes] = await Promise.all([visibleStudents(auth), list("classes")]);
    return { students: students.map((student) => ({ ...student, className: classes.find((cls) => cls.id === student.currentClassId)?.name || "—", record: completeness(student) })), classes };
  }, [auth.user.uid]);
  const columns = [
    { key: "name", label: "Name", render: (row) => <span className="hub-cell-strong">{row.name}</span> },
    { key: "studentNumber", label: "Student ID" },
    { key: "currentStandard", label: "Standard", render: (row) => (row.currentStandard ? `Std ${row.currentStandard}` : "—") },
    { key: "className", label: "Class" },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "record", label: "Record", sortValue: (row) => row.record.percent, csv: (row) => `${row.record.percent}%`, render: (row) => row.record.complete ? <StatusBadge status="complete" label="Complete" /> : <span title={row.record.missing.join(", ")}><StatusBadge status="missing" label={`${row.record.missing.length} missing`} /></span> },
  ];
  return <>
    <PageHeader kicker="Student information system" title="Students">Search, filter and open a Student 360° profile.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <DataTable rows={data.students} columns={columns} searchKeys={["name", "studentNumber", "preferredName"]} exportName="srss-students" rowHref={(row) => `/hub/students/${row.id}`}
      filters={[
        { key: "currentStandard", label: "Standard", options: [1, 2, 3, 4, 5, 6].map((s) => [String(s), `Standard ${s}`]) },
        { key: "currentClassId", label: "Class", options: data.classes.filter((cls) => cls.academicYearId === "ay2026").map((cls) => [cls.id, cls.name]) },
        { key: "status", label: "Status", options: [["active", "Active"], ["withdrawn", "Withdrawn"], ["graduated", "Graduated"]] },
        { key: "recordState", label: "Record", value: (row) => (row.record.complete ? "complete" : "incomplete"), options: [["complete", "Complete"], ["incomplete", "Incomplete"]] },
      ]} />}
  </>;
}

export function Student360() {
  const { studentId } = useParams();
  const auth = useAuth();
  const tabs = STUDENT_360_TABS.filter(([, , module]) => canOpen(auth.roles, module));
  const [tab, setTab] = useState(tabs[0]?.[0]);
  const { data, loading, error } = useLoad(async () => {
    const student = await one(`students/${studentId}`);
    const cls = student?.currentClassId ? await one(`classes/${student.currentClassId}`) : null;
    return { student, cls };
  }, [studentId]);

  if (loading) return <Loading />;
  // AUTH-002 AC3: an unlinked or out-of-scope record shows an access-denied state, never data.
  if (error?.code === "permission-denied" || !data?.student) return <div className="hub-message"><h1>You don't have access to this student</h1><p>Records are visible only to the child's family and the staff responsible for them.</p><Link className="hub-button" to="/hub">Go to my dashboard</Link></div>;
  const { student, cls } = data;
  const record = completeness(student);
  return <>
    <header className="hub-360-head">
      <div className="hub-avatar" aria-hidden="true">{(student.preferredName || student.name).slice(0, 1)}</div>
      <div><p className="hub-kicker">Student 360°</p><h1>{student.name}</h1><p className="hub-lede">{[student.studentNumber, cls?.name ? `Class ${cls.name}` : null, student.currentStandard ? `Standard ${student.currentStandard}` : null].filter(Boolean).join(" · ")}</p></div>
      <div className="hub-360-badges"><StatusBadge status={student.status} />{can(auth.roles, "students", "U") && <StatusBadge status={record.complete ? "complete" : "missing"} label={record.complete ? "Record complete" : `${record.missing.length} items missing`} />}</div>
    </header>
    <LastUpdated record={student} />
    {/* SIS-002 AC4: tabs the viewer cannot read are not rendered at all. */}
    <nav className="hub-tabs" aria-label="Profile sections">{tabs.map(([id, label]) => <button key={id} type="button" className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <div className="hub-tab-panel"><Student360Tab tab={tab} student={student} cls={cls} /></div>
  </>;
}

function Student360Tab({ tab, student, cls }) {
  const auth = useAuth();
  const studentId = student.id;
  const scope = scopedTo(auth, student);
  const loader = {
    overview: async () => ({ records: await list("attendanceRecords", where("studentId", "==", studentId), ...scope), entries: await portfolioFor(auth, student) }),
    personal: async () => ({ restricted: can(auth.roles, "students", "U") || auth.roles.some((role) => ["safeguardingLead", "leadership"].includes(role)) ? await one(`students/${studentId}/restricted/medical`).catch(() => null) : null, enrollments: await list("enrollments", where("studentId", "==", studentId), ...scope) }),
    family: async () => { const links = await list("studentGuardianLinks", where("studentId", "==", studentId), ...scope); return { links, guardians: await getMany("guardians", links.map((link) => link.guardianId)) }; },
    attendance: async () => ({ records: (await list("attendanceRecords", where("studentId", "==", studentId), ...scope)).sort((a, b) => b.date.localeCompare(a.date)) }),
    portfolio: async () => ({ entries: await portfolioFor(auth, student) }),
    humanExcellence: async () => ({ observations: await list("humanValuesObservations", where("studentId", "==", studentId), ...scope, ...(isFamily(auth) ? [where("familyVisible", "==", true)] : [])) }),
    achievements: async () => ({ items: await list("studentAchievements", where("studentId", "==", studentId), ...scope, ...(isFamily(auth) ? [where("visibility", "in", ["family", "public"])] : [])) }),
    fees: async () => ({ fees: await list("studentFeeAssignments", where("studentId", "==", studentId)) }),
    history: async () => ({ logs: await list("auditLogs", where("path", ">=", `students/${studentId}`), where("path", "<=", `students/${studentId}`), limit(20)) }),
  }[tab];
  const { data, loading, error } = useLoad(loader || (async () => null), [tab, studentId]);
  if (!loader) return <EmptyState title="This section arrives in a later phase.">{tab === "academic" ? "Published results and report cards (Phase 2)." : tab === "support" ? "Learning Studio support plans (Phase 2)." : tab === "incidents" ? "Restorative incident records (Phase 2)." : "Linked documents in the school's Shared Drive."}</EmptyState>;
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;

  if (tab === "overview") {
    const summary = attendanceSummary(data.records);
    return <div className="hub-stats">
      <StatCard label="Attendance this year" value={summary.rate != null ? `${summary.rate}%` : "—"} detail={`${summary.counts.absent} absent · ${summary.counts.late} late`} />
      <StatCard label="Class" value={cls?.name || "—"} detail={student.currentStandard ? `Standard ${student.currentStandard}` : null} />
      <StatCard label="Portfolio entries" value={data.entries.length} />
      <StatCard label="Admission date" value={formatDate(student.admissionDate, { day: "numeric", month: "short", year: "numeric" })} />
    </div>;
  }
  if (tab === "personal") return <div className="hub-grid-2">
    <Section title="Identity"><dl className="hub-facts"><div><dt>Full name</dt><dd>{student.name}</dd></div><div><dt>Preferred name</dt><dd>{student.preferredName || "—"}</dd></div><div><dt>Date of birth</dt><dd>{formatDate(student.dateOfBirth, { day: "numeric", month: "long", year: "numeric" })}</dd></div><div><dt>Student ID</dt><dd>{student.studentNumber}</dd></div></dl>
      {data.restricted && <div className="hub-restricted"><StatusBadge status="pending" label="Restricted" /><p><strong>Medical:</strong> {data.restricted.allergies || "None recorded"}</p></div>}</Section>
    <Section title="Enrolment history">{data.enrollments.length ? <ul className="hub-list hub-list-compact">{data.enrollments.sort((a, b) => b.academicYearId.localeCompare(a.academicYearId)).map((item) => <li key={item.id}><span>{item.academicYearId.replace("ay", "")} · Standard {item.standard}</span><StatusBadge status={item.status} /></li>)}</ul> : <EmptyState title="No enrolment records." />}
      {can(auth.roles, "students", "U") && <div className="hub-checklist">{Object.entries(COMPLETENESS_FIELDS).map(([key, label]) => <span key={key} className={student.completeness?.[key] ? "done" : ""}>{student.completeness?.[key] ? "✓" : "○"} {label}</span>)}</div>}</Section>
  </div>;
  if (tab === "family") return data.links.length ? <ul className="hub-cards">{data.links.map((link) => <li key={link.id} className="hub-card"><strong>{data.guardians.find((guardian) => guardian.id === link.guardianId)?.name || "Guardian"}</strong><span>{RELATIONSHIPS[link.relationship] || link.relationship}</span><div className="hub-badges">{link.hasPortalAccess && <StatusBadge status="active" label="Hub access" />}{link.isEmergencyContact && <StatusBadge status="info" label="Emergency contact" />}{link.canCollect && <StatusBadge status="info" label="May collect" />}</div></li>)}</ul> : <EmptyState title="No guardians linked." />;
  if (tab === "attendance") {
    const summary = attendanceSummary(data.records);
    return <><div className="hub-stats"><StatCard label="Attendance rate" value={summary.rate != null ? `${summary.rate}%` : "—"} /><StatCard label="Absent" value={summary.counts.absent} /><StatCard label="Late" value={summary.counts.late} /></div>
      <DataTable rows={data.records} initialSort={{ key: "date", dir: -1 }} columns={[{ key: "date", label: "Date", render: (row) => formatDate(row.date, { weekday: "short", day: "numeric", month: "short" }) }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} label={ATTENDANCE_LABELS[row.status]} /> }, { key: "reason", label: "Reason", render: (row) => row.reason || "—" }]} pageSize={10} /></>;
  }
  if (tab === "portfolio") return <PortfolioList entries={data.entries} />;
  if (tab === "humanExcellence") return data.observations.length ? <ul className="hub-cards">{data.observations.map((item) => <li key={item.id} className="hub-card"><StatusBadge status="good" label={HUMAN_VALUES[item.value]} /><p>{item.observation}</p><small>{item.context}</small></li>)}</ul> : <EmptyState title="No observations recorded yet.">Teachers record specific observations, never scores.</EmptyState>;
  if (tab === "achievements") return data.items.length ? <ul className="hub-list">{data.items.map((item) => <li key={item.id}><strong>{item.title}</strong><small>{formatDate(item.date, { day: "numeric", month: "short", year: "numeric" })}</small></li>)}</ul> : <EmptyState title="No achievements recorded yet." />;
  if (tab === "fees") return data.fees.length ? <ul className="hub-list">{data.fees.map((fee) => <li key={fee.id}><strong>RM {fee.amountDue?.toLocaleString("en-MY")} due · RM {fee.amountPaid?.toLocaleString("en-MY")} paid</strong><StatusBadge status={fee.outstanding > 0 ? "pending" : "complete"} label={fee.outstanding > 0 ? `RM ${fee.outstanding.toLocaleString("en-MY")} outstanding` : "Paid"} /></li>)}</ul> : <EmptyState title="No fee records." />;
  if (tab === "history") return data.logs.length ? <ul className="hub-list">{data.logs.map((log) => <li key={log.id}><strong>{log.type}</strong><small>{formatDate(log.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {log.fields?.join(", ") || "—"}</small></li>)}</ul> : <EmptyState title="No changes recorded yet." />;
  return null;
}

const isFamily = (auth) => auth.roles.every((role) => ["parent", "student"].includes(role));
// Rules are not filters: class-scoped staff must constrain queries to the child's current class so every
// returned record is provably readable. Families and school-wide roles query by studentId alone.
function scopedTo(auth, student) {
  if (isFamily(auth) || can(auth.roles, "students", "V") === "all" || (auth.scope?.assignedStudentIds || []).includes(student.id)) return [];
  return [where("classId", "==", student.currentClassId || "")];
}
async function portfolioFor(auth, student) {
  const constraints = [where("studentId", "==", student.id), ...scopedTo(auth, student)];
  if (isFamily(auth)) constraints.push(where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"]));
  return (await list("portfolioEntries", ...constraints)).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function PortfolioList({ entries }) {
  return entries.length ? <ul className="hub-cards">{entries.map((entry) => <li key={entry.id} className="hub-card"><div className="hub-card-top"><strong>{entry.title}</strong><StatusBadge status={entry.visibility} /></div><p>{entry.description}</p>{entry.teacherObservation && <p className="hub-quote">“{entry.teacherObservation}”</p>}<small>{formatDate(entry.date, { day: "numeric", month: "short", year: "numeric" })}{entry.humanValue ? ` · ${HUMAN_VALUES[entry.humanValue]}` : ""}</small></li>)}</ul> : <EmptyState title="No portfolio entries yet." />;
}

export function StaffDirectory() {
  const { data, loading, error } = useLoad(() => list("staff", where("status", "==", "active")), []);
  return <>
    <PageHeader kicker="People" title="Staff directory">Directory details only; employment records are held separately with narrower access.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <DataTable rows={data} columns={[{ key: "name", label: "Name" }, { key: "position", label: "Position" }, { key: "email", label: "Email" }]} searchKeys={["name", "position", "email"]} exportName="srss-staff" />}
  </>;
}

export function Academics() {
  const { data, loading, error } = useLoad(async () => {
    const [years, terms, classes, subjects, assignments] = await Promise.all([list("academicYears"), list("terms"), list("classes"), list("subjects"), list("teacherAssignments")]);
    return { years, terms, classes: classes.sort((a, b) => a.standard - b.standard), subjects, assignments };
  }, []);
  return <>
    <PageHeader kicker="SRSS Students" title="Academic structure">Academic year → term → Standard → class → subject → teacher assignment → enrolment.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-grid-2">
        <Section title="Academic years & terms"><ul className="hub-list hub-list-compact">{data.years.map((year) => <li key={year.id}><strong>{year.name}</strong>{year.current && <StatusBadge status="active" label="Current" />}</li>)}{data.terms.map((term) => <li key={term.id}><span>{term.name}</span><small>{formatDate(term.startDate)} – {formatDate(term.endDate)}</small></li>)}</ul></Section>
        <Section title="Subjects"><ul className="hub-tags">{data.subjects.map((subject) => <li key={subject.id}>{subject.name}</li>)}</ul></Section>
      </div>
      <Section title="Classes">
        <DataTable rows={data.classes.map((cls) => ({ ...cls, teachers: data.assignments.filter((item) => item.classId === cls.id).length }))} columns={[{ key: "name", label: "Class" }, { key: "standard", label: "Standard" }, { key: "room", label: "Room" }, { key: "teachers", label: "Subject assignments" }]} pageSize={10} />
      </Section>
    </>}
  </>;
}
