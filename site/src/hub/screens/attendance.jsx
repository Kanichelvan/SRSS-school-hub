// Attendance (ATT-001, ATT-002): teacher quick roster, admin daily overview, parent view.
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addDoc, collection, doc, increment, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { commitOrQueue, daysAgo, getMany, list, listIn, one, staffNames, today, useLoad } from "../data";
import { CODE, CODES, KIND_LABELS, LATE_AFTER_MINUTES, codeOf, rating, summarise } from "../logic/attendance";
import { attendanceByClass } from "../logic/dashboard";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";


export function AttendanceHome() {
  const { classId } = useParams();
  return classId ? <TakeAttendance classId={classId} /> : <MyAttendanceClasses />;
}

const useDateParam = () => { const [params, setParams] = useSearchParams(); const date = params.get("date") || today(); return [date > today() ? today() : date, (value) => setParams(value && value !== today() ? { date: value } : {})]; };
const QUICK = ["/", "O", "L"];
const OTHER = CODES.filter((item) => !QUICK.includes(item.code));
const REPORT_REASONS = { illness: "Illness", medical: "Medical appointment", familyEmergency: "Family emergency", religious: "Religious observance", other: "Other" };
const SUGGESTED = { illness: "M", medical: "M", familyEmergency: "P", religious: "P", other: "P" };
const draftKey = (sessionId) => `srss.register.${sessionId}`;
const storage = { get: (key) => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } }, set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } }, remove: (key) => { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } } };

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

// AM registration (Attendance Policy §7): load the roster → mark with the policy codes (everyone starts
// as / Present) → submit → confirm. After submission every change is a recorded correction with a reason.
// Unsaved marks are kept on the device, and a save made without a connection is queued and sent later.
function TakeAttendance({ classId }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const back = location.pathname.replace(/\/[^/]+$/, "");
  const [date, setDate] = useDateParam();
  const sessionId = `${classId}_${date}_am`;
  const [marks, setMarks] = useState({});
  const [restored, setRestored] = useState(false);
  const [step, setStep] = useState("mark"); // mark → confirm → saved
  const [correction, setCorrection] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedText, setSavedText] = useState("");

  const { data, loading, error, reload } = useLoad(async () => {
    // Without a connection the register opens from the class list kept on this device.
    const rosterKey = `srss.roster.${classId}`;
    const cached = storage.get(rosterKey);
    if (navigator.onLine === false && cached) return { ...cached, session: null, existing: [], people: {}, reports: [], offline: true };
    const [cls, students, session, existing, people, reports] = await Promise.all([
      one(`classes/${classId}`),
      list("students", where("currentClassId", "==", classId), where("status", "==", "active")),
      one(`attendanceSessions/${sessionId}`).catch(() => null),
      list("attendanceRecords", where("classId", "==", classId), where("date", "==", date)),
      staffNames().catch(() => ({})),
      list("absenceReports", where("classId", "==", classId)).catch(() => []),
    ]);
    // Pupils who have since moved class still appear on the day they were marked.
    const moved = await getMany("students", existing.map((record) => record.studentId).filter((id) => !students.some((student) => student.id === id)));
    if (cls) storage.set(rosterKey, { cls: { id: cls.id, name: cls.name, standard: cls.standard, academicYearId: cls.academicYearId }, students: students.map(({ id, name, preferredName, currentClassId }) => ({ id, name, preferredName: preferredName || null, currentClassId })) });
    return { cls, students: [...students, ...moved].sort((a, b) => a.name.localeCompare(b.name)), session, existing, people, reports: reports.filter((report) => report.from <= date && report.to >= date) };
  }, [classId, date]);

  const submitted = data?.session?.status === "submitted";
  const markFrom = (record) => ({ code: codeOf(record), minutesLate: record?.minutesLate ?? "", note: record?.note || record?.reason || "" });
  const initial = useMemo(() => Object.fromEntries((data?.students || []).map((student) => {
    const record = data.existing.find((item) => item.studentId === student.id);
    const report = data.reports.find((item) => item.studentId === student.id);
    return [student.id, record ? markFrom(record) : { code: report ? SUGGESTED[report.reason] : "/", minutesLate: "", note: report ? `Parent reported: ${REPORT_REASONS[report.reason]}${report.note ? ` — ${report.note}` : ""}` : "" }];
  })), [data]);
  useEffect(() => {
    const { __pending, ...draft } = (!submitted && storage.get(draftKey(sessionId))) || {};
    setMarks(Object.keys(draft).length ? { ...initial, ...draft } : initial);
    setRestored(Object.keys(draft).length ? (__pending ? "pending" : "draft") : false);
  }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setStep("mark"); setCorrection(""); setSaveError(null); }, [classId, date]);

  const summary = useMemo(() => summarise(Object.values(marks)), [marks]);
  const isChanged = (student) => { const record = data.existing.find((item) => item.studentId === student.id); const mark = marks[student.id]; if (!mark) return false; if (!record) return true; const before = markFrom(record); return before.code !== mark.code || String(before.minutesLate) !== String(mark.minutesLate) || before.note !== mark.note; };
  const changed = (data?.students || []).filter(isChanged);
  const codeChanged = submitted && changed.some((student) => data.existing.find((item) => item.studentId === student.id) && codeOf(data.existing.find((item) => item.studentId === student.id)) !== marks[student.id]?.code);
  const missingMinutes = (data?.students || []).filter((student) => marks[student.id]?.code === "L" && !(Number(marks[student.id].minutesLate) >= LATE_AFTER_MINUTES));
  const setMark = (studentId, patch) => {
    setSaveError(null);
    setStep((current) => (current === "confirm" || current === "saved" ? "mark" : current));
    setMarks((current) => { const next = { ...current, [studentId]: { ...current[studentId], ...patch } }; if (!submitted) storage.set(draftKey(sessionId), next); return next; });
  };

  async function save() {
    setSaving(true); setSaveError(null);
    try {
      const stamp = serverTimestamp();
      const meta = { updatedAt: stamp, updatedBy: auth.user.uid, academicYearId: data.cls.academicYearId };
      // Pupils' marks first, in small batches; the register is marked submitted (or corrected) last,
      // so an interrupted save never counts as a completed register.
      const writes = (submitted ? changed : data.students).map((student) => (batch) => {
        const mark = marks[student.id];
        const record = data.existing.find((item) => item.studentId === student.id);
        const base = { code: mark.code, status: CODE[mark.code].status, minutesLate: mark.code === "L" ? Number(mark.minutesLate) : null, note: mark.note.trim() || null, reason: null, markedBy: auth.user.uid, markedAt: stamp, ...meta };
        if (record) batch.update(doc(db, "attendanceRecords", record.id), { ...base, ...(codeOf(record) !== mark.code ? { previousStatus: record.status, previousCode: codeOf(record), correctionReason: correction.trim(), correctedBy: auth.user.uid, correctedAt: stamp } : {}) });
        else batch.set(doc(db, "attendanceRecords", `${sessionId}_${student.id}`), { sessionId, classId, date, studentId: student.id, ...base });
      });
      writes.push((batch) => {
        if (!submitted) batch.set(doc(db, "attendanceSessions", sessionId), { classId, date, sessionType: "am", status: "submitted", openedBy: data.session?.openedBy || auth.user.uid, submittedBy: auth.user.uid, submittedAt: stamp, studentCount: data.students.length, createdAt: data.session?.createdAt || stamp, createdBy: data.session?.createdBy || auth.user.uid, ...meta }, { merge: true });
        else batch.update(doc(db, "attendanceSessions", sessionId), { correctedAt: stamp, correctedBy: auth.user.uid, correctionCount: increment(1), ...meta });
      });
      const what = submitted ? `${changed.length} ${changed.length === 1 ? "correction" : "corrections"}` : `the register for ${data.cls.name}`;
      const { queued, sent } = await commitOrQueue(writes);
      if (queued) {
        // Keep the marks on the device until the server has them, so a reload can't lose them.
        storage.set(draftKey(sessionId), { ...marks, __pending: true });
        setSavedText(`No connection: ${what} is saved on this device and will be sent automatically when the connection returns. Keep this page open; if it closes, open the register again and submit once you're back online.`);
        sent.then(() => { storage.remove(draftKey(sessionId)); setSavedText(`${submitted ? "Corrections" : "Register"} sent to the school system.`); reload(); }, (reason) => setSaveError(reason));
      } else {
        storage.remove(draftKey(sessionId));
        setSavedText(submitted ? `${what} saved and recorded.` : `Attendance submitted for ${data.cls.name}.`);
        reload();
      }
      setStep("saved"); setCorrection("");
    } catch (reason) { setSaveError(reason); setStep("mark"); }
    setSaving(false);
  }

  if (loading) return <Loading />;
  if (error?.code === "permission-denied" || (data && !data.cls)) return <div className="hub-message"><h1>This class isn't assigned to you</h1><p>You can take attendance only for your assigned classes.</p><Link className="hub-button" to={back}>My classes</Link></div>;
  if (error || !data) return <ErrorNote error={error || new Error("The register could not be loaded.")} />;
  const exceptions = data.students.filter((student) => marks[student.id]?.code && marks[student.id].code !== "/");
  return <>
    <PageHeader kicker={<Link to={back}>← Attendance</Link>} title={data.cls.name}
      actions={<><label className="hub-inline-field">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label><StatusBadge status={submitted ? "submitted" : data.session ? "open" : "missing"} label={submitted ? "Submitted" : "Not submitted"} /></>}>
      {submitted
        ? <>AM register submitted {formatDate(data.session.submittedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} by {data.people[data.session.submittedBy] || "a teacher"}{data.session.correctionCount ? ` · corrected ${data.session.correctionCount} ${data.session.correctionCount === 1 ? "time" : "times"}` : ""}. To correct it, change a mark, give a reason and save; every correction is recorded.</>
        : <>AM register for {formatDate(date, { weekday: "long", day: "numeric", month: "long" })}. Everyone starts as <strong>/ Present</strong>. Use <strong>O</strong> for an absence unless a specific code is known (e.g. <strong>M</strong> for sickness) and <strong>L</strong> with the minutes late. Nothing counts until you submit.</>}
    </PageHeader>
    {data.offline && <p className="hub-status" role="status">No connection — this register opened from the class list kept on this device. Mark as usual; your marks are saved here and sent when the connection returns. If it had already been submitted, check it again once you're back online.</p>}
    {restored && !submitted && <p className="hub-status" role="status">{restored === "pending" ? "This register was saved without a connection and hasn't reached the school system yet. Check the marks and submit again." : "Your unsaved marks for this register were restored from this device."}</p>}
    <div className="hub-roster-summary" aria-live="polite"><span><strong>{summary.attended - summary.late}</strong> present</span><span><strong>{summary.late}</strong> late</span><span><strong>{summary.authorised}</strong> authorised</span><span><strong>{summary.unauthorised}</strong> unauthorised</span>{summary.total - summary.counted > 0 && <span><strong>{summary.total - summary.counted}</strong> not required</span>}</div>
    {!data.students.length ? <EmptyState title="No pupils are enrolled in this class." /> : <ol className="hub-roster">
      {data.students.map((student) => {
        const mark = marks[student.id] || { code: "/", minutesLate: "", note: "" };
        const record = data.existing.find((item) => item.studentId === student.id);
        const report = data.reports.find((item) => item.studentId === student.id);
        const kind = CODE[mark.code]?.kind;
        return <li key={student.id} className={`${mark.code !== "/" ? `exception is-${kind}` : ""} ${submitted && isChanged(student) ? "changed" : ""}`}>
          <div className="hub-roster-name"><strong>{student.preferredName || student.name}</strong><small>{student.name}{student.currentClassId !== classId ? " · has since moved class" : ""}</small>
            {report && <small className="hub-parent-report">Parent reported: {REPORT_REASONS[report.reason]}{report.from !== report.to ? ` (${formatDate(report.from)}–${formatDate(report.to)})` : ""}</small>}
            {record?.correctedBy && <small className="hub-correction">Corrected from {record.previousCode || codeOf({ status: record.previousStatus })} by {data.people[record.correctedBy] || "staff"}{record.correctionReason ? ` — “${record.correctionReason}”` : ""}</small>}</div>
          <fieldset className="hub-roster-choices"><legend className="hub-visually-hidden">Attendance code for {student.name}</legend>
            {QUICK.map((code) => <label key={code} className={mark.code === code ? `active is-${CODE[code].kind}${code === "L" ? " is-late" : ""}` : ""} title={CODE[code].label}><input type="radio" name={`att-${student.id}`} value={code} checked={mark.code === code} onChange={() => setMark(student.id, { code })} /><span className="hub-code">{code}</span>{code === "/" ? "Present" : code === "O" ? "Absent" : "Late"}</label>)}
            <select aria-label={`Other code for ${student.name}`} className={OTHER.some((item) => item.code === mark.code) ? "active" : ""} value={OTHER.some((item) => item.code === mark.code) ? mark.code : ""} onChange={(event) => event.target.value && setMark(student.id, { code: event.target.value })}><option value="">Other code…</option>{OTHER.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</select>
          </fieldset>
          {(mark.code !== "/" || mark.note) && <div className="hub-roster-extra">
            {mark.code === "L" && <label>Minutes late<input type="number" inputMode="numeric" min={LATE_AFTER_MINUTES} max={300} required value={mark.minutesLate} onChange={(event) => setMark(student.id, { minutesLate: event.target.value })} aria-invalid={!(Number(mark.minutesLate) >= LATE_AFTER_MINUTES) || undefined} /></label>}
            <label className={mark.code === "L" ? "" : "hub-field-wide"}>Comment (optional)<input value={mark.note} onChange={(event) => setMark(student.id, { note: event.target.value })} placeholder={mark.code === "M" ? "e.g. Fever — parent phoned" : "Optional"} maxLength={300} /></label>
          </div>}
        </li>;
      })}
    </ol>}
    <details className="hub-code-key"><summary>Attendance codes</summary><dl>{CODES.map((item) => <div key={item.code}><dt>{item.code}</dt><dd>{item.label} <small>· {KIND_LABELS[item.kind]}</small></dd></div>)}</dl></details>
    <div className="hub-sticky-actions">
      {saveError && <ErrorNote error={saveError} />}
      {step === "saved" && <p className="hub-status hub-saved" role="status">✓ {savedText}</p>}
      {missingMinutes.length > 0 && step !== "saved" && <p className="hub-hint">Add the minutes late for {missingMinutes.map((student) => student.preferredName || student.name).join(", ")} (5 or more).</p>}
      {submitted && changed.length > 0 && step !== "saved" && <label className="hub-correction-reason">Reason for the correction{codeChanged && <span className="hub-required" aria-hidden="true"> *</span>}<input value={correction} maxLength={300} onChange={(event) => setCorrection(event.target.value)} placeholder="e.g. Signed in late at the office at 07:58" /></label>}
      {step === "confirm" ? <div className="hub-confirm-box" role="alertdialog" aria-labelledby="att-confirm">
        <p id="att-confirm"><strong>Submit the AM register for {data.cls.name}?</strong> {summary.attended - summary.late} present{exceptions.length ? `; ${exceptions.map((student) => `${student.preferredName || student.name} ${marks[student.id].code}${marks[student.id].code === "L" ? ` (${marks[student.id].minutesLate} min)` : ""}`).join(", ")}` : " — everyone is here"}.</p>
        <div className="hub-form-actions"><button type="button" className="hub-button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Confirm and save"}</button><button type="button" className="hub-button hub-button-quiet" disabled={saving} onClick={() => setStep("mark")}>Go back</button></div>
      </div> : submitted ? <button type="button" className="hub-button" disabled={saving || !changed.length || (codeChanged && !correction.trim()) || missingMinutes.length > 0} onClick={save}>{saving ? "Saving…" : changed.length ? `Save ${changed.length} ${changed.length === 1 ? "correction" : "corrections"}` : "No changes to save"}</button>
        : step !== "saved" && <button type="button" className="hub-button" disabled={!data.students.length || missingMinutes.length > 0} onClick={() => setStep("confirm")}>Submit attendance ({data.students.length})</button>}
      <button type="button" className="hub-button hub-button-quiet" onClick={() => navigate(back)}>Back to classes</button>
    </div>
  </>;
}

// Parents and carers: each child's attendance with the policy rating, absence reporting and the
// short parent guide (Attendance Policy §6.5, §8, Appendix C).
export function ChildAttendance() {
  const auth = useAuth();
  const childIds = auth.scope?.childIds || [];
  const [reporting, setReporting] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const children = await getMany("students", childIds);
    const [records, reports] = await Promise.all([listIn("attendanceRecords", "studentId", childIds, where("date", ">=", daysAgo(120))), list("absenceReports", where("reporterUid", "==", auth.user.uid)).catch(() => [])]);
    return { children, records, reports };
  }, [childIds.join("|")]);
  return <>
    <PageHeader kicker="My family" title="Attendance">The last four months, as recorded in the morning register. Please report an absence by 8.00 am on the first day.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.children.length ? <EmptyState title="No children are linked to this account yet." /> : data.children.map((child) => {
      const records = data.records.filter((record) => record.studentId === child.id).sort((a, b) => b.date.localeCompare(a.date));
      const summary = summarise(records); const grade = rating(summary.rate);
      const reports = data.reports.filter((report) => report.studentId === child.id).sort((a, b) => b.from.localeCompare(a.from)).slice(0, 3);
      return <Section key={child.id} title={child.name} action={<button type="button" className="hub-button hub-button-small" onClick={() => setReporting(reporting === child.id ? null : child.id)}>Report an absence</button>}>
        {reporting === child.id && <ReportAbsence child={child} onDone={() => { setReporting(null); reload(); }} onCancel={() => setReporting(null)} />}
        <div className="hub-stats">
          <StatCard label="Attendance" value={summary.rate != null ? `${summary.rate}%` : "—"} detail={grade ? `${grade.label} · the school minimum is 95%` : null} tone={grade?.tone || "neutral"} />
          <StatCard label="Absences" value={summary.absences} detail={`${summary.authorised} authorised · ${summary.unauthorised} unauthorised`} />
          <StatCard label="Late" value={summary.late} />
        </div>
        {reports.length > 0 && <ul className="hub-list hub-list-compact">{reports.map((report) => <li key={report.id}><span>You reported {REPORT_REASONS[report.reason].toLowerCase()} · {formatDate(report.from)}{report.to !== report.from ? ` – ${formatDate(report.to)}` : ""}</span><StatusBadge status={report.status === "acknowledged" ? "complete" : "pending"} label={report.status === "acknowledged" ? "Received by the school" : "Sent"} /></li>)}</ul>}
        <DataTable rows={records} pageSize={10} initialSort={{ key: "date", dir: -1 }} columns={[
          { key: "date", label: "Date", render: (row) => formatDate(row.date, { weekday: "short", day: "numeric", month: "short" }) },
          { key: "code", label: "Mark", sortValue: (row) => codeOf(row), render: (row) => <StatusBadge status={{ present: "present", authorised: "pending", unauthorised: "absent", notCounted: "neutral" }[CODE[codeOf(row)].kind]} label={`${codeOf(row)} · ${CODE[codeOf(row)].label}${row.minutesLate ? ` (${row.minutesLate} min)` : ""}`} /> },
          { key: "note", label: "Comment", render: (row) => row.note || row.reason || "—" },
        ]} />
      </Section>;
    })}
    <details className="hub-code-key"><summary>Parent guide and attendance codes</summary>
      <ul className="hub-guide"><li>Report an absence by 8.00 am on the first day (here, or by phone or email), and each day it continues.</li><li>Send a note or email when your child returns. Illness of more than two days needs a medical certificate.</li><li>Please arrange holidays during school holidays — term-time holidays are not authorised.</li><li>Children should arrive by 7.35 am. After 8.00 am, sign in at the office; sign out there when leaving early.</li><li>The minimum acceptable attendance is 95%. Excellent 100% · Good 95% and above · Poor 90–94% · Unsatisfactory 89% or below.</li></ul>
      <dl>{CODES.map((item) => <div key={item.code}><dt>{item.code}</dt><dd>{item.label} <small>· {KIND_LABELS[item.kind]}</small></dd></div>)}</dl>
    </details>
  </>;
}

function ReportAbsence({ child, onDone, onCancel }) {
  const auth = useAuth();
  const [form, setForm] = useState({ from: today(), to: today(), reason: "illness", note: "", evidenceUrl: "" });
  const [state, setState] = useState({ busy: false, error: null });
  async function submit(event) {
    event.preventDefault();
    if (form.to < form.from) return setState({ error: "The last day can't be before the first day." });
    if (form.evidenceUrl && !/^https:\/\/\S+$/.test(form.evidenceUrl)) return setState({ error: "A link to a letter or medical certificate must start with https://" });
    setState({ busy: true });
    try {
      await addDoc(collection(db, "absenceReports"), { studentId: child.id, classId: child.currentClassId || null, reporterUid: auth.user.uid, from: form.from, to: form.to, reason: form.reason, note: form.note.trim() || null, evidenceUrl: form.evidenceUrl.trim() || null, status: "reported", createdAt: serverTimestamp() });
      onDone();
    } catch (reason) { setState({ error: reason.code === "permission-denied" ? "This child isn't linked to your account. Please contact the school office." : "That didn't send. Please try again, or phone the office." }); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={submit}>
    <h3>Report {child.preferredName || child.name}'s absence</h3>
    <div className="hub-form-row">
      <label>First day<input type="date" required value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} /></label>
      <label>Last day<input type="date" required value={form.to} min={form.from} onChange={(event) => setForm({ ...form, to: event.target.value })} /></label>
      <label>Reason<select value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}>{Object.entries(REPORT_REASONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <label>Details (optional)<textarea rows={2} maxLength={1000} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
    <label>Link to a letter or medical certificate (optional)<input type="url" value={form.evidenceUrl} placeholder="https://…" onChange={(event) => setForm({ ...form, evidenceUrl: event.target.value })} /></label>
    <p className="hub-hint">The school decides whether an absence is authorised. Illness of more than two days needs a medical certificate.</p>
    {state.error && <p className="hub-error" role="alert">{state.error}</p>}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state.busy}>{state.busy ? "Sending…" : "Send to the school"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onCancel}>Cancel</button></div>
  </form>;
}
