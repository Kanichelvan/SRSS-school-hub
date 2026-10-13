// Attendance (ATT-001, ATT-002): teacher quick roster, admin daily overview, parent view.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { daysAgo, getMany, list, listIn, one, today, useLoad } from "../data";
import { ATTENDANCE_LABELS, attendanceByClass, attendanceSummary } from "../logic/dashboard";
import { chunk } from "../logic/academics";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const EXCEPTIONS = ["absent", "late", "excused", "schoolActivity", "medical", "other"];

export function AttendanceHome() {
  const { classId } = useParams();
  return classId ? <TakeAttendance classId={classId} /> : <MyAttendanceClasses />;
}

function MyAttendanceClasses() {
  const auth = useAuth();
  const classIds = auth.scope?.classIds || [];
  const { data, loading, error } = useLoad(async () => {
    const [classes, sessions] = await Promise.all([getMany("classes", classIds), listIn("attendanceSessions", "classId", classIds, where("date", "==", today()))]);
    return attendanceByClass(classes.sort((a, b) => a.standard - b.standard), sessions, today());
  }, [classIds.join("|")]);
  return <>
    <PageHeader kicker="Attendance" title="Take attendance">{formatDate(today(), { weekday: "long", day: "numeric", month: "long" })}</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No classes assigned to you." /> : <ul className="hub-cards">{data.map((row) => <li key={row.classId} className="hub-card"><div className="hub-card-top"><strong>{row.className}</strong><StatusBadge status={row.state} /></div><Link className="hub-button" to={`/hub/teacher/attendance/${row.classId}`}>{row.state === "submitted" ? "Review attendance" : "Take attendance"}</Link></li>)}</ul>}
  </>;
}

function TakeAttendance({ classId }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const date = today();
  const sessionId = `${classId}_${date}_am`;
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data, loading, error } = useLoad(async () => {
    const [cls, students, session, existing] = await Promise.all([
      one(`classes/${classId}`),
      list("students", where("currentClassId", "==", classId), where("status", "==", "active")),
      one(`attendanceSessions/${sessionId}`).catch(() => null),
      list("attendanceRecords", where("classId", "==", classId), where("date", "==", date)),
    ]);
    return { cls, students: students.sort((a, b) => a.name.localeCompare(b.name)), session, existing };
  }, [classId]);

  // Everyone defaults to Present; the teacher records exceptions only (ATT-001 AC3).
  useEffect(() => {
    if (!data) return;
    setMarks(Object.fromEntries(data.students.map((student) => {
      const record = data.existing.find((item) => item.studentId === student.id);
      return [student.id, { status: record?.status || "present", reason: record?.reason || "", note: record?.note || "" }];
    })));
  }, [data]);

  const summary = useMemo(() => attendanceSummary(Object.values(marks)), [marks]);
  const setMark = (studentId, patch) => { setSaved(false); setMarks((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } })); };

  async function submit() {
    setSaving(true); setSaveError(null);
    try {
      const stamp = serverTimestamp();
      const meta = { updatedAt: stamp, updatedBy: auth.user.uid, academicYearId: data.cls.academicYearId };
      // Rules check each new record's pupil against the class, and a batch may make only ~20 such lookups,
      // so records go in small batches; the session is marked submitted last, once every record is saved.
      for (const part of chunk(data.students)) {
        const batch = writeBatch(db);
        for (const student of part) {
          const mark = marks[student.id];
          batch.set(doc(db, "attendanceRecords", `${sessionId}_${student.id}`), { sessionId, classId, date, studentId: student.id, status: mark.status, reason: mark.status === "present" ? null : mark.reason || null, note: mark.note || null, markedBy: auth.user.uid, markedAt: stamp, ...meta });
        }
        await batch.commit();
      }
      await setDoc(doc(db, "attendanceSessions", sessionId), { classId, date, sessionType: "am", status: "submitted", openedBy: data.session?.openedBy || auth.user.uid, submittedBy: auth.user.uid, submittedAt: stamp, studentCount: data.students.length, createdAt: data.session?.createdAt || stamp, createdBy: data.session?.createdBy || auth.user.uid, ...meta }, { merge: true });
      setSaved(true);
    } catch (reason) { setSaveError(reason); } finally { setSaving(false); }
  }

  if (loading) return <Loading />;
  if (error?.code === "permission-denied" || (data && !data.cls)) return <div className="hub-message"><h1>This class isn't assigned to you</h1><p>You can take attendance for your assigned classes only.</p><Link className="hub-button" to="/hub/teacher/attendance">My classes</Link></div>;
  return <>
    <PageHeader kicker={`Attendance · ${formatDate(date, { weekday: "long", day: "numeric", month: "long" })}`} title={data.cls.name} actions={<StatusBadge status={data.session?.status === "submitted" || saved ? "submitted" : "missing"} />}>
      Everyone starts as Present. Tap a pupil's status only if they are absent, late or excused.
    </PageHeader>
    <div className="hub-roster-summary" aria-live="polite"><span><strong>{summary.counts.present}</strong> present</span><span><strong>{summary.counts.absent}</strong> absent</span><span><strong>{summary.counts.late}</strong> late</span><span><strong>{summary.total - summary.counts.present - summary.counts.absent - summary.counts.late}</strong> other</span></div>
    <ol className="hub-roster">
      {data.students.map((student) => {
        const mark = marks[student.id] || { status: "present" };
        return <li key={student.id} className={mark.status !== "present" ? "exception" : ""}>
          <div className="hub-roster-name"><strong>{student.preferredName || student.name}</strong><small>{student.name}</small></div>
          <fieldset className="hub-roster-choices"><legend className="hub-visually-hidden">Attendance for {student.name}</legend>
            {["present", "absent", "late", "excused"].map((status) => <label key={status} className={mark.status === status ? "active" : ""}><input type="radio" name={`att-${student.id}`} value={status} checked={mark.status === status} onChange={() => setMark(student.id, { status })} />{ATTENDANCE_LABELS[status]}</label>)}
            <select aria-label={`More options for ${student.name}`} value={["schoolActivity", "medical", "other"].includes(mark.status) ? mark.status : ""} onChange={(event) => event.target.value && setMark(student.id, { status: event.target.value })}><option value="">More…</option>{["schoolActivity", "medical", "other"].map((status) => <option key={status} value={status}>{ATTENDANCE_LABELS[status]}</option>)}</select>
          </fieldset>
          {EXCEPTIONS.includes(mark.status) && <div className="hub-roster-extra"><label>Reason<input value={mark.reason} onChange={(event) => setMark(student.id, { reason: event.target.value })} placeholder="e.g. Unwell" /></label><label>Note<input value={mark.note} onChange={(event) => setMark(student.id, { note: event.target.value })} placeholder="Optional" /></label></div>}
        </li>;
      })}
    </ol>
    <div className="hub-sticky-actions">
      {saveError && <ErrorNote error={saveError} />}
      {saved && <p className="hub-status" role="status">Attendance submitted for {data.cls.name}. Families see it on their dashboards.</p>}
      <button type="button" className="hub-button" disabled={saving || !data.students.length} onClick={submit}>{saving ? "Submitting…" : data.session?.status === "submitted" || saved ? "Update attendance" : `Submit attendance (${data.students.length})`}</button>
      <button type="button" className="hub-button hub-button-quiet" onClick={() => navigate("/hub/teacher/attendance")}>Back to my classes</button>
    </div>
  </>;
}

// Admin: which classes have submitted today (ATT-002 AC1/AC3) and the day's exceptions.
export function AttendanceOverview() {
  const [date, setDate] = useState(today());
  const { data, loading, error } = useLoad(async () => {
    const [classes, sessions, records, settings] = await Promise.all([list("classes", where("academicYearId", "==", "ay2026")), list("attendanceSessions", where("date", "==", date)), list("attendanceRecords", where("date", "==", date)), one("settings/school")]);
    const students = await getMany("students", records.filter((record) => record.status !== "present").map((record) => record.studentId));
    return { rows: attendanceByClass(classes.sort((a, b) => a.standard - b.standard), sessions, date), records, students, settings };
  }, [date]);
  const late = date === today() && new Date().toTimeString().slice(0, 5) > (data?.settings?.attendanceDueTime || "09:00");
  return <>
    <PageHeader kicker="Attendance" title="Daily attendance" actions={<label className="hub-inline-field">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label>}>Submitted, in progress or not yet taken — by class.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-stats">
        <StatCard label="Attendance rate" value={attendanceSummary(data.records).rate != null ? `${attendanceSummary(data.records).rate}%` : "—"} />
        <StatCard label="Classes submitted" value={`${data.rows.filter((row) => row.state === "submitted").length}/${data.rows.length}`} tone={data.rows.every((row) => row.state === "submitted") ? "good" : late ? "bad" : "warn"} detail={late ? `Due by ${data.settings?.attendanceDueTime || "09:00"}` : null} />
        <StatCard label="Absent" value={attendanceSummary(data.records).counts.absent} />
        <StatCard label="Late" value={attendanceSummary(data.records).counts.late} />
      </div>
      <div className="hub-grid-2">
        <Section title="By class"><ul className="hub-list hub-list-compact">{data.rows.map((row) => <li key={row.classId}><span>{row.className}</span><StatusBadge status={row.state === "missing" && late ? "overdue" : row.state} label={row.state === "missing" ? (late ? "Missing" : "Not yet taken") : undefined} /></li>)}</ul></Section>
        <Section title="Exceptions">{data.records.filter((record) => record.status !== "present").length ? <ul className="hub-list">{data.records.filter((record) => record.status !== "present").map((record) => { const student = data.students.find((item) => item.id === record.studentId); return <li key={record.id}><Link to={`/hub/students/${record.studentId}`}><strong>{student?.name || record.studentId}</strong></Link><span><StatusBadge status={record.status} label={ATTENDANCE_LABELS[record.status]} /> {record.reason || ""}</span></li>; })}</ul> : <EmptyState title="No absences or late arrivals recorded." />}</Section>
      </div>
    </>}
  </>;
}

// Parent: per-child attendance history.
export function ChildAttendance() {
  const auth = useAuth();
  const childIds = auth.scope?.childIds || [];
  const { data, loading, error } = useLoad(async () => {
    const children = await getMany("students", childIds);
    const records = await listIn("attendanceRecords", "studentId", childIds, where("date", ">=", daysAgo(90)));
    return { children, records };
  }, [childIds.join("|")]);
  return <>
    <PageHeader kicker="My family" title="Attendance">The last 90 days, as recorded by teachers.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : data.children.map((child) => { const records = data.records.filter((record) => record.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date)); const summary = attendanceSummary(records); return <Section key={child.id} title={child.name}>
      <div className="hub-stats"><StatCard label="Attendance rate" value={summary.rate != null ? `${summary.rate}%` : "—"} /><StatCard label="Absent" value={summary.counts.absent} /><StatCard label="Late" value={summary.counts.late} /></div>
      <DataTable rows={records} pageSize={10} initialSort={{ key: "date", dir: -1 }} columns={[{ key: "date", label: "Date", render: (row) => formatDate(row.date, { weekday: "short", day: "numeric", month: "short" }) }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} label={ATTENDANCE_LABELS[row.status]} /> }, { key: "reason", label: "Reason", render: (row) => row.reason || "—" }]} />
    </Section>; })}
  </>;
}
