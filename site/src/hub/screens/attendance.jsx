// Attendance (ATT-001, ATT-002): teacher quick roster, admin daily overview, parent view.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { doc, increment, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { commitInChunks, currentYearId, daysAgo, getMany, list, listIn, one, staffNames, today, useLoad } from "../data";
import { ATTENDANCE_LABELS, attendanceByClass, attendanceSummary } from "../logic/dashboard";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";


export function AttendanceHome() {
  const { classId } = useParams();
  return classId ? <TakeAttendance classId={classId} /> : <MyAttendanceClasses />;
}

const MARKS = ["present", "absent", "late", "excused"];
const useDateParam = () => { const [params, setParams] = useSearchParams(); const date = params.get("date") || today(); return [date > today() ? today() : date, (value) => setParams(value && value !== today() ? { date: value } : {})]; };

// Step 1 and 2: choose the date and the class.
function MyAttendanceClasses() {
  const auth = useAuth();
  const classIds = auth.scope?.classIds || [];
  const [date, setDate] = useDateParam();
  const { data, loading, error } = useLoad(async () => {
    const [classes, sessions] = await Promise.all([getMany("classes", classIds), listIn("attendanceSessions", "classId", classIds, where("date", "==", date))]);
    return attendanceByClass(classes.sort((a, b) => a.standard - b.standard), sessions, date);
  }, [classIds.join("|"), date]);
  return <>
    <PageHeader kicker="Attendance" title="Take attendance" actions={<label className="hub-inline-field">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label>}>
      Choose a class for {formatDate(date, { weekday: "long", day: "numeric", month: "long" })}. A register counts only once it is submitted.
    </PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.length ? <EmptyState title="No classes assigned to you.">The school office assigns classes. Once they do, they appear here.</EmptyState> : <ul className="hub-cards">{data.map((row) => <li key={row.classId} className="hub-card"><div className="hub-card-top"><strong>{row.className}</strong><StatusBadge status={row.state} label={row.state === "missing" ? "Not taken" : row.state === "open" ? "Not submitted" : undefined} /></div><Link className="hub-button" to={`${row.classId}${date !== today() ? `?date=${date}` : ""}`} relative="path">{row.state === "submitted" ? "Review or correct" : "Take attendance"}</Link></li>)}</ul>}
  </>;
}

// Steps 3–6: load the roster, mark, submit, confirm. After submission, changes are corrections with a reason.
function TakeAttendance({ classId }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const back = location.pathname.replace(/\/[^/]+$/, "");
  const [date, setDate] = useDateParam();
  const sessionId = `${classId}_${date}_am`;
  const [marks, setMarks] = useState({});
  const [step, setStep] = useState("mark"); // mark → confirm → saved
  const [correction, setCorrection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedText, setSavedText] = useState("");

  const { data, loading, error, reload } = useLoad(async () => {
    const [cls, students, session, existing, people] = await Promise.all([
      one(`classes/${classId}`),
      list("students", where("currentClassId", "==", classId), where("status", "==", "active")),
      one(`attendanceSessions/${sessionId}`).catch(() => null),
      list("attendanceRecords", where("classId", "==", classId), where("date", "==", date)),
      staffNames().catch(() => ({})),
    ]);
    // Pupils who have since moved class still appear on the day they were marked.
    const moved = await getMany("students", existing.map((record) => record.studentId).filter((id) => !students.some((student) => student.id === id)));
    return { cls, students: [...students, ...moved].sort((a, b) => a.name.localeCompare(b.name)), session, existing, people };
  }, [classId, date]);

  const submitted = data?.session?.status === "submitted";
  // Unsaved marks start as Present; the teacher records the exceptions (ATT-001 AC3).
  const initial = useMemo(() => Object.fromEntries((data?.students || []).map((student) => {
    const record = data.existing.find((item) => item.studentId === student.id);
    return [student.id, { status: record?.status || "present", reason: record?.reason || "", note: record?.note || "" }];
  })), [data]);
  useEffect(() => { setMarks(initial); }, [initial]);
  // A new class or date starts afresh; reloading after a save keeps the confirmation on screen.
  useEffect(() => { setStep("mark"); setCorrection(""); setSaveError(null); }, [classId, date]);

  const summary = useMemo(() => attendanceSummary(Object.values(marks)), [marks]);
  const changed = (data?.students || []).filter((student) => { const record = data.existing.find((item) => item.studentId === student.id); const mark = marks[student.id]; return mark && (!record || record.status !== mark.status || (record.reason || "") !== mark.reason || (record.note || "") !== mark.note); });
  const setMark = (studentId, patch) => { setSaveError(null); setStep((current) => (current === "confirm" || current === "saved" ? "mark" : current)); setMarks((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } })); };

  async function save() {
    setSaving(true); setSaveError(null);
    try {
      const stamp = serverTimestamp();
      const meta = { updatedAt: stamp, updatedBy: auth.user.uid, academicYearId: data.cls.academicYearId };
      // Pupils' marks first, in small batches; the register is marked submitted (or corrected) only in the
      // final step, so an interrupted save never counts as completed attendance.
      const writes = (submitted ? changed : data.students).map((student) => (batch) => {
        const mark = marks[student.id];
        const record = data.existing.find((item) => item.studentId === student.id);
        const base = { status: mark.status, reason: mark.status === "present" ? null : mark.reason.trim() || null, note: mark.note.trim() || null, markedBy: auth.user.uid, markedAt: stamp, ...meta };
        if (record) batch.update(doc(db, "attendanceRecords", record.id), { ...base, ...(record.status !== mark.status ? { previousStatus: record.status, correctionReason: correction.trim(), correctedBy: auth.user.uid, correctedAt: stamp } : {}) });
        else batch.set(doc(db, "attendanceRecords", `${sessionId}_${student.id}`), { sessionId, classId, date, studentId: student.id, ...base });
      });
      writes.push((batch) => {
        if (!submitted) batch.set(doc(db, "attendanceSessions", sessionId), { classId, date, sessionType: "am", status: "submitted", openedBy: data.session?.openedBy || auth.user.uid, submittedBy: auth.user.uid, submittedAt: stamp, studentCount: data.students.length, createdAt: data.session?.createdAt || stamp, createdBy: data.session?.createdBy || auth.user.uid, ...meta }, { merge: true });
        else batch.update(doc(db, "attendanceSessions", sessionId), { correctedAt: stamp, correctedBy: auth.user.uid, correctionCount: increment(1), ...meta });
      });
      await commitInChunks(writes.slice(0, -1));
      await commitInChunks(writes.slice(-1));
      setSavedText(submitted ? `${changed.length} ${changed.length === 1 ? "correction" : "corrections"} saved and recorded.` : `Attendance submitted for ${data.cls.name}.`);
      setStep("saved"); setCorrection(""); reload();
    } catch (reason) { setSaveError(reason); setStep("mark"); }
    setSaving(false);
  }

  if (loading) return <Loading />;
  if (error?.code === "permission-denied" || (data && !data.cls)) return <div className="hub-message"><h1>This class isn't assigned to you</h1><p>You can take attendance only for your assigned classes.</p><Link className="hub-button" to={back}>My classes</Link></div>;
  const exceptions = data.students.filter((student) => marks[student.id]?.status && marks[student.id].status !== "present");
  const needsReason = submitted && changed.some((student) => data.existing.find((item) => item.studentId === student.id)?.status !== marks[student.id]?.status);
  return <>
    <PageHeader kicker={<Link to={back}>← Attendance</Link>} title={data.cls.name}
      actions={<><label className="hub-inline-field">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label><StatusBadge status={submitted ? "submitted" : data.session ? "open" : "missing"} label={submitted ? "Submitted" : "Not submitted"} /></>}>
      {submitted
        ? <>Submitted {formatDate(data.session.submittedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} by {data.people[data.session.submittedBy] || "a teacher"}{data.session.correctionCount ? ` · corrected ${data.session.correctionCount} ${data.session.correctionCount === 1 ? "time" : "times"}` : ""}. To correct it, change a mark, give a reason and save; every correction is recorded.</>
        : <>{formatDate(date, { weekday: "long", day: "numeric", month: "long" })}. Everyone starts as Present — tap a pupil's status only if they are absent, late or excused. Nothing counts until you submit.</>}
    </PageHeader>
    <div className="hub-roster-summary" aria-live="polite"><span><strong>{summary.counts.present}</strong> present</span><span><strong>{summary.counts.absent}</strong> absent</span><span><strong>{summary.counts.late}</strong> late</span><span><strong>{summary.counts.excused}</strong> excused</span></div>
    {!data.students.length ? <EmptyState title="No pupils are enrolled in this class." /> : <ol className="hub-roster">
      {data.students.map((student) => {
        const mark = marks[student.id] || { status: "present", reason: "", note: "" };
        const record = data.existing.find((item) => item.studentId === student.id);
        const isChanged = submitted && changed.includes(student);
        return <li key={student.id} className={`${mark.status !== "present" ? "exception" : ""} ${isChanged ? "changed" : ""}`}>
          <div className="hub-roster-name"><strong>{student.preferredName || student.name}</strong><small>{student.name}{student.currentClassId !== classId ? " · has since moved class" : ""}</small>
            {record?.previousStatus && <small className="hub-correction">Corrected from {ATTENDANCE_LABELS[record.previousStatus]} by {data.people[record.correctedBy] || "staff"}{record.correctionReason ? ` — “${record.correctionReason}”` : ""}</small>}</div>
          <fieldset className="hub-roster-choices"><legend className="hub-visually-hidden">Attendance for {student.name}</legend>
            {MARKS.map((status) => <label key={status} className={mark.status === status ? `active is-${status}` : ""}><input type="radio" name={`att-${student.id}`} value={status} checked={mark.status === status} onChange={() => setMark(student.id, { status })} />{ATTENDANCE_LABELS[status]}</label>)}
            {!MARKS.includes(mark.status) && <span className="hub-badge hub-tone-info">{ATTENDANCE_LABELS[mark.status]}</span>}
          </fieldset>
          {mark.status !== "present" && <div className="hub-roster-extra"><label>Reason<input value={mark.reason} onChange={(event) => setMark(student.id, { reason: event.target.value })} placeholder="e.g. Unwell" maxLength={200} /></label><label>Note<input value={mark.note} onChange={(event) => setMark(student.id, { note: event.target.value })} placeholder="Optional" maxLength={300} /></label></div>}
        </li>;
      })}
    </ol>}
    <div className="hub-sticky-actions">
      {saveError && <ErrorNote error={saveError} />}
      {step === "saved" && <p className="hub-status hub-saved" role="status">✓ {savedText} Families see it on their dashboards.</p>}
      {submitted && changed.length > 0 && step !== "saved" && <label className="hub-correction-reason">Reason for the correction{needsReason && <span className="hub-required" aria-hidden="true"> *</span>}<input value={correction} maxLength={300} onChange={(event) => setCorrection(event.target.value)} placeholder="e.g. Pupil arrived after the register was taken" /></label>}
      {step === "confirm" ? <div className="hub-confirm-box" role="alertdialog" aria-labelledby="att-confirm">
        <p id="att-confirm"><strong>Submit attendance for {data.cls.name}?</strong> {summary.counts.present} present{exceptions.length ? `, ${exceptions.map((student) => `${student.preferredName || student.name} ${ATTENDANCE_LABELS[marks[student.id].status].toLowerCase()}`).join(", ")}` : " — everyone is here"}.</p>
        <div className="hub-form-actions"><button type="button" className="hub-button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Confirm and save"}</button><button type="button" className="hub-button hub-button-quiet" disabled={saving} onClick={() => setStep("mark")}>Go back</button></div>
      </div> : submitted ? <button type="button" className="hub-button" disabled={saving || !changed.length || (needsReason && !correction.trim())} onClick={save}>{saving ? "Saving…" : changed.length ? `Save ${changed.length} ${changed.length === 1 ? "correction" : "corrections"}` : "No changes to save"}</button>
        : step !== "saved" && <button type="button" className="hub-button" disabled={!data.students.length} onClick={() => setStep("confirm")}>Submit attendance ({data.students.length})</button>}
      <button type="button" className="hub-button hub-button-quiet" onClick={() => navigate(back)}>Back to classes</button>
    </div>
  </>;
}

// Admin: which classes have submitted today (ATT-002 AC1/AC3) and the day's exceptions.
export function AttendanceOverview() {
  const [date, setDate] = useState(today());
  const { data, loading, error } = useLoad(async () => {
    const [classes, sessions, records, settings] = await Promise.all([list("classes", where("academicYearId", "==", (await currentYearId()) || "")), list("attendanceSessions", where("date", "==", date)), list("attendanceRecords", where("date", "==", date)), one("settings/school")]);
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
        <Section title="By class"><ul className="hub-list hub-list-compact">{data.rows.map((row) => <li key={row.classId}><Link to={`/hub/admin/attendance/${row.classId}${date !== today() ? `?date=${date}` : ""}`}>{row.className}</Link><StatusBadge status={row.state === "missing" && late ? "overdue" : row.state} label={row.state === "missing" ? (late ? "Missing" : "Not yet taken") : undefined} /></li>)}</ul></Section>
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
