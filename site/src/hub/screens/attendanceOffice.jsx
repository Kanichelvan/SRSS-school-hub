// Attendance office (Attendance Policy §6.3, §8–§11, §15): for the School Attendance Manager (clerk) and
// the school office. Registers today, first-day response, late sign-ins and early departures, monthly
// follow-up, the weekly report for the Board, and the printable evacuation absence sheet.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase-firestore";
import { functions } from "../../lib/firebase-functions";
import { useAuth } from "../../auth/AuthProvider";
import { currentYearId, daysAgo, getMany, list, listIn, one, schoolSettings, staffNames, today, useLoad } from "../data";
import { CODE, CODES, KIND_LABELS, LATE_AFTER_MINUTES, SCHOOL_START, codeOf, followUps, kindOf, minutesAfter, rating, schoolDays, summarise } from "../logic/attendance";
import { attendanceByClass } from "../logic/dashboard";
import { saveErrorMessage } from "../manage";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const TABS = [["today", "Registers"], ["firstDay", "First-day response"], ["movements", "Late & early"], ["followUp", "Follow-up"], ["report", "Weekly report"], ["evacuation", "Evacuation sheet"]];
const REPORT_REASONS = { illness: "Illness", medical: "Medical appointment", familyEmergency: "Family emergency", religious: "Religious observance", other: "Other" };
const nowTime = () => new Date().toTimeString().slice(0, 5);
const byStandard = (a, b) => (a.standard || 0) - (b.standard || 0) || String(a.name).localeCompare(String(b.name));
const markBadge = (record) => { const item = CODE[codeOf(record)]; return <StatusBadge status={{ present: "present", authorised: "pending", unauthorised: "absent", notCounted: "neutral" }[item.kind]} label={`${item.code} · ${item.label}${record.minutesLate ? ` (${record.minutesLate} min)` : ""}`} />; };

async function schoolDay(date) {
  const yearId = await currentYearId();
  const [classes, students, sessions, records, settings] = await Promise.all([
    list("classes", where("academicYearId", "==", yearId || "")), list("students", where("status", "==", "active")),
    list("attendanceSessions", where("date", "==", date)), list("attendanceRecords", where("date", "==", date)), schoolSettings(),
  ]);
  return { yearId, settings, classes: classes.filter((cls) => (cls.status ?? "active") === "active").sort(byStandard), students, sessions, records };
}

export function AttendanceOffice() {
  const [tab, setTab] = useState("today");
  return <>
    <PageHeader kicker="School operations" title="Attendance">Registers, first-day response, late and early sign-ins, follow-up and reports — as set out in the Attendance Policy.</PageHeader>
    <nav className="hub-tabs" aria-label="Attendance sections">{TABS.map(([id, label]) => <button key={id} type="button" className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <div className="hub-tab-panel">{{ today: <Registers />, firstDay: <FirstDay />, movements: <Movements />, followUp: <FollowUp />, report: <WeeklyReport />, evacuation: <Evacuation /> }[tab]}</div>
  </>;
}

// ---------- Registers today (§6.3 “review registers daily and prompt teachers”) ----------
function Registers() {
  const [date, setDate] = useState(today());
  const [notice, setNotice] = useState(null);
  const { data, loading, error } = useLoad(() => schoolDay(date), [date]);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const rows = attendanceByClass(data.classes, data.sessions, date);
  const submitted = new Set(data.sessions.filter((session) => session.status === "submitted").map((session) => session.id));
  const counted = data.records.filter((record) => submitted.has(record.sessionId));
  const summary = summarise(counted);
  const due = data.settings.attendanceDueTime || "08:00";
  const late = date === today() && nowTime() > due;
  const missing = rows.filter((row) => row.state !== "submitted");
  async function remind() {
    setNotice(null);
    try { const { data: result } = await httpsCallable(functions, "remindRegisters")({ date, classIds: missing.map((row) => row.classId) }); setNotice({ tone: "good", text: `Reminder sent to ${result.notified} ${result.notified === 1 ? "teacher" : "teachers"}.` }); }
    catch (reason) { setNotice({ tone: "bad", text: reason.message }); }
  }
  return <>
    <div className="hub-filterbar"><label className="hub-inline-field">Date<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label>{missing.length > 0 && <button type="button" className="hub-button hub-button-small" onClick={remind}>Remind {missing.length === 1 ? "the teacher" : `teachers of ${missing.length} classes`}</button>}</div>
    {notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role="status">{notice.text}</p>}
    <div className="hub-stats">
      <StatCard label="Attendance" value={summary.rate != null ? `${summary.rate}%` : "—"} detail="submitted registers only" tone={rating(summary.rate)?.tone || "neutral"} />
      <StatCard label="Registers submitted" value={`${rows.length - missing.length}/${rows.length}`} tone={!missing.length ? "good" : late ? "bad" : "warn"} detail={late && missing.length ? `Due by ${due}` : null} />
      <StatCard label="Absent" value={summary.absences} detail={`${summary.authorised} authorised · ${summary.unauthorised} unauthorised`} />
      <StatCard label="Late" value={summary.late} />
    </div>
    <div className="hub-grid-2">
      <Section title="By class"><ul className="hub-list hub-list-compact">{rows.map((row) => <li key={row.classId}><Link to={`/hub/admin/attendance/${row.classId}${date !== today() ? `?date=${date}` : ""}`}>{row.className}</Link><StatusBadge status={row.state === "missing" && late ? "overdue" : row.state} label={row.state === "missing" ? (late ? "Missing" : "Not taken") : row.state === "open" ? "Not submitted" : undefined} /></li>)}</ul>
        <p className="hub-hint">Open a class to enter a paper register after a system failure, or to correct a mark.</p></Section>
      <Section title="Not present">{counted.filter((record) => codeOf(record) !== "/").length ? <ul className="hub-list">{counted.filter((record) => codeOf(record) !== "/").sort((a, b) => codeOf(a).localeCompare(codeOf(b))).map((record) => { const student = data.students.find((item) => item.id === record.studentId); return <li key={record.id}><Link to={`/hub/students/${record.studentId}`}><strong>{student?.name || "Pupil"}</strong></Link> {markBadge(record)}{record.note ? <small> · {record.note}</small> : null}</li>; })}</ul> : <EmptyState title="Everyone recorded so far is present." />}</Section>
    </div>
  </>;
}

// ---------- First-day response (§8): unknown absences and parents' reports ----------
function FirstDay() {
  const auth = useAuth();
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({});
  const [notice, setNotice] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => {
    const day = await schoolDay(today());
    const unknown = day.records.filter((record) => codeOf(record) === "O");
    const [reports, links, followUpsToday] = await Promise.all([
      list("absenceReports", where("to", ">=", today())).catch(() => []),
      listIn("studentGuardianLinks", "studentId", unknown.map((record) => record.studentId)),
      list("attendanceFollowUps", where("date", "==", today())).catch(() => []),
    ]);
    const guardians = await getMany("guardians", links.map((link) => link.guardianId));
    return { ...day, unknown, reports: reports.filter((report) => report.from <= today()), links, guardians, followUpsToday };
  }, []);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const name = (id) => data.students.find((student) => student.id === id)?.name || "Pupil";
  const className = (id) => data.classes.find((cls) => cls.id === id)?.name || "";

  async function resolve(record) {
    if (!form.outcome?.trim()) return setNotice({ tone: "bad", text: "Note what you found out (e.g. “Mother phoned: fever”)." });
    try {
      const stamp = serverTimestamp();
      if (form.code && form.code !== "O") await updateDoc(doc(db, "attendanceRecords", record.id), { code: form.code, status: CODE[form.code].status, minutesLate: null, note: form.outcome.trim(), previousStatus: record.status, previousCode: "O", correctionReason: `First-day response: ${form.outcome.trim()}`, correctedBy: auth.user.uid, correctedAt: stamp, markedBy: auth.user.uid, markedAt: stamp, updatedAt: stamp, updatedBy: auth.user.uid });
      await addDoc(collection(db, "attendanceFollowUps"), { kind: "firstDay", studentId: record.studentId, classId: record.classId, date: today(), outcome: form.outcome.trim(), contact: form.contact || "phone", evidence: form.evidence || "none", codeAfter: form.code || "O", status: "active", createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid });
      setNotice({ tone: "good", text: `Recorded for ${name(record.studentId)}.` }); setOpen(null); setForm({}); reload();
    } catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
  }
  async function acknowledge(report) {
    try { await updateDoc(doc(db, "absenceReports", report.id), { status: "acknowledged", acknowledgedBy: auth.user.uid, acknowledgedAt: serverTimestamp() }); reload(); }
    catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
  }
  const pending = data.unknown.filter((record) => !data.followUpsToday.some((item) => item.studentId === record.studentId && item.codeAfter !== "O"));
  return <>
    <p className="hub-lede">Pupils marked <strong>O · Unknown absence</strong> today with no word from home. Contact the family to establish where the child is, then record the reason; keep trying until you have confirmation.</p>
    {notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role="status">{notice.text}</p>}
    <Section title={`Unknown absences today (${pending.length})`}>{!pending.length ? <EmptyState title="No unexplained absences right now.">Registers still to come in may add more.</EmptyState> : <ul className="hub-waiting">{pending.map((record) => {
      const family = data.links.filter((link) => link.studentId === record.studentId && (link.status ?? "active") === "active").map((link) => ({ link, guardian: data.guardians.find((item) => item.id === link.guardianId) })).filter((item) => item.guardian);
      const tries = data.followUpsToday.filter((item) => item.studentId === record.studentId);
      return <li key={record.id}>
        <div><strong>{name(record.studentId)}</strong><span>{className(record.classId)}{tries.length ? ` · ${tries.length} ${tries.length === 1 ? "attempt" : "attempts"} so far` : ""}</span>
          <span>{family.length ? family.map(({ guardian, link }) => <span key={link.id} className="hub-contact">{guardian.name}{guardian.phone ? <> · <a href={`tel:${guardian.phone.replace(/\s/g, "")}`}>{guardian.phone}</a></> : null}{guardian.email ? <> · <a href={`mailto:${guardian.email}`}>{guardian.email}</a></> : null}</span>) : "No guardian linked — check the office file."}</span></div>
        <div className="hub-waiting-actions"><button type="button" className="hub-button hub-button-small hub-button-quiet" onClick={() => { setOpen(open === record.id ? null : record.id); setForm({ code: "M", contact: "phone", evidence: "none" }); }}>Record outcome</button></div>
        {open === record.id && <div className="hub-paper-panel"><div className="hub-form-row">
          <label>Outcome<input value={form.outcome || ""} maxLength={300} onChange={(event) => setForm({ ...form, outcome: event.target.value })} placeholder="e.g. Mother phoned: fever" /></label>
          <label>Change the mark to<select value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })}><option value="O">Keep O — no answer yet</option>{CODES.filter((item) => !["/", "L", "O", "X"].includes(item.code)).map((item) => <option key={item.code} value={item.code}>{item.code} · {item.label}</option>)}</select></label>
          <label>How<select value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })}><option value="phone">Phone call</option><option value="email">Email</option><option value="parentCalled">Parent contacted us</option><option value="noAnswer">No answer</option></select></label>
          <label>Evidence<select value={form.evidence} onChange={(event) => setForm({ ...form, evidence: event.target.value })}><option value="none">None yet</option><option value="letter">Letter / planner note</option><option value="email">Email</option><option value="mc">Medical certificate</option></select></label>
        </div><div className="hub-form-actions"><button type="button" className="hub-button hub-button-small" onClick={() => resolve(record)}>Save</button></div></div>}
      </li>;
    })}</ul>}</Section>
    <Section title="Absences reported by parents">{!data.reports.length ? <EmptyState title="No current reports." /> : <ul className="hub-list">{data.reports.sort((a, b) => a.from.localeCompare(b.from)).map((report) => <li key={report.id}><div className="hub-card-top"><strong>{name(report.studentId)}</strong>{report.status === "acknowledged" ? <StatusBadge status="complete" label="Acknowledged" /> : <button type="button" className="hub-link-button" onClick={() => acknowledge(report)}>Acknowledge</button>}</div><small>{className(report.classId)} · {REPORT_REASONS[report.reason]} · {formatDate(report.from)}{report.to !== report.from ? ` – ${formatDate(report.to)}` : ""}</small>{report.note && <p>{report.note}</p>}{report.evidenceUrl && <a href={report.evidenceUrl} target="_blank" rel="noreferrer">Open the letter or certificate</a>}</li>)}</ul>}</Section>
  </>;
}

// ---------- Late sign-ins and early departures at the office (§6.4, §9) ----------
function Movements() {
  const auth = useAuth();
  const [form, setForm] = useState({ type: "lateArrival", time: nowTime(), reason: "", collectedBy: "", pass: true });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useLoad(async () => { const day = await schoolDay(today()); return { ...day, movements: await list("attendanceMovements", where("date", "==", today())) }; }, []);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const student = data.students.find((item) => item.id === form.studentId);
  const minutes = form.type === "lateArrival" && form.time ? Math.max(0, minutesAfter(form.time, SCHOOL_START)) : 0;

  async function save(event) {
    event.preventDefault();
    if (!student) return setNotice({ tone: "bad", text: "Choose the pupil." });
    if (form.type === "lateArrival" && (!Number.isInteger(minutes) || minutes < LATE_AFTER_MINUTES || minutes > 300))
      return setNotice({ tone: "bad", text: `Late sign-ins must be ${LATE_AFTER_MINUTES}–300 minutes after the school start time. Check the arrival time before saving.` });
    setBusy(true); setNotice(null);
    try {
      const stamp = serverTimestamp(); const date = today();
      await addDoc(collection(db, "attendanceMovements"), { type: form.type, studentId: student.id, classId: student.currentClassId || null, date, time: form.time, minutesLate: form.type === "lateArrival" ? minutes : null, reason: form.reason.trim() || null, collectedBy: form.type === "earlyDeparture" ? form.collectedBy.trim() || null : null, latePass: form.type === "lateArrival" ? Boolean(form.pass) : null, exeat: form.type === "earlyDeparture", status: "active", createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid });
      // A late sign-in also updates the morning register (as a recorded correction once it's submitted).
      if (form.type === "lateArrival" && student.currentClassId) {
        const sessionId = `${student.currentClassId}_${date}_am`;
        const record = await one(`attendanceRecords/${sessionId}_${student.id}`).catch(() => null);
        const base = { code: "L", status: "late", minutesLate: minutes, note: `Signed in at the office at ${form.time}${form.reason.trim() ? ` — ${form.reason.trim()}` : ""}`, markedBy: auth.user.uid, markedAt: stamp, updatedAt: stamp, updatedBy: auth.user.uid };
        if (record) await updateDoc(doc(db, "attendanceRecords", record.id), { ...base, ...(codeOf(record) !== "L" ? { previousStatus: record.status, previousCode: codeOf(record), correctionReason: `Signed in late at the office at ${form.time}`, correctedBy: auth.user.uid, correctedAt: stamp } : {}) });
        else await setDoc(doc(db, "attendanceRecords", `${sessionId}_${student.id}`), { sessionId, classId: student.currentClassId, date, studentId: student.id, ...base });
      }
      setNotice({ tone: "good", text: form.type === "lateArrival" ? `${student.name} signed in ${minutes} minutes late${form.pass ? "; late sticker given" : ""}. The register shows L.` : `${student.name} signed out at ${form.time}. Exeat recorded; they appear on today's evacuation sheet.` });
      setForm({ ...form, studentId: "", reason: "", collectedBy: "", time: nowTime() }); reload();
    } catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
    setBusy(false);
  }
  return <>
    <form className="hub-form hub-form-wide" onSubmit={save}>
      <div className="hub-form-row">
        <label>What happened<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="lateArrival">Late arrival — signed in at the office</option><option value="earlyDeparture">Early departure — signed out</option></select></label>
        <label>Pupil<select required value={form.studentId || ""} onChange={(event) => setForm({ ...form, studentId: event.target.value })}><option value="">Choose…</option>{data.students.sort((a, b) => a.name.localeCompare(b.name)).map((item) => <option key={item.id} value={item.id}>{item.name} · {data.classes.find((cls) => cls.id === item.currentClassId)?.name || "no class"}</option>)}</select></label>
        <label>Time<input type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label>
      </div>
      <div className="hub-form-row">
        <label>Reason<input value={form.reason} maxLength={200} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder={form.type === "lateArrival" ? "e.g. Traffic" : "e.g. Dental appointment"} /></label>
        {form.type === "earlyDeparture" ? <label>Collected by<input value={form.collectedBy} maxLength={120} onChange={(event) => setForm({ ...form, collectedBy: event.target.value })} placeholder="Name of the adult" /></label>
          : <label className="hub-check"><input type="checkbox" checked={form.pass} onChange={(event) => setForm({ ...form, pass: event.target.checked })} />Late sticker given</label>}
      </div>
      {form.type === "lateArrival" && form.time && <p className="hub-hint">{minutes} minutes after registration ({SCHOOL_START}).</p>}
      {notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role="status">{notice.text}</p>}
      <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={busy}>{busy ? "Saving…" : form.type === "lateArrival" ? "Sign in" : "Sign out"}</button></div>
    </form>
    <Section title="Today">{!data.movements.length ? <EmptyState title="No late arrivals or early departures yet today." /> : <ul className="hub-list hub-list-compact">{data.movements.sort((a, b) => a.time.localeCompare(b.time)).map((item) => <li key={item.id}><span><strong>{item.time}</strong> · {data.students.find((s) => s.id === item.studentId)?.name || "Pupil"} — {item.type === "lateArrival" ? `late (${item.minutesLate} min)` : `left${item.collectedBy ? ` with ${item.collectedBy}` : ""}`}{item.reason ? ` · ${item.reason}` : ""}</span><StatusBadge status={item.type === "lateArrival" ? "late" : "info"} label={item.type === "lateArrival" ? "Signed in" : "Signed out"} /></li>)}</ul>}</Section>
  </>;
}

// ---------- Monthly follow-up (§6.3, §10, §11) ----------
function FollowUp() {
  const auth = useAuth();
  const [logging, setLogging] = useState(null);
  const [outcome, setOutcome] = useState("");
  const [notice, setNotice] = useState(null);
  const month = today().slice(0, 7);
  const { data, loading, error, reload } = useLoad(async () => {
    const yearId = await currentYearId();
    const year = yearId ? await one(`academicYears/${yearId}`) : null;
    const [records, students, classes, logs] = await Promise.all([list("attendanceRecords", where("date", ">=", year?.startDate || daysAgo(120))), list("students", where("status", "==", "active")), list("classes"), list("attendanceFollowUps", where("date", ">=", `${month}-01`)).catch(() => [])]);
    const byStudent = {};
    for (const record of records) (byStudent[record.studentId] ||= []).push(record);
    return { prompts: followUps(byStudent, { month }), students, classes, logs, byStudent };
  }, []);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  async function save(prompt) {
    if (!outcome.trim()) return;
    try { const stamp = serverTimestamp(); const student = data.students.find((item) => item.id === prompt.studentId); await addDoc(collection(db, "attendanceFollowUps"), { kind: prompt.kind, studentId: prompt.studentId, classId: student?.currentClassId || null, date: today(), outcome: outcome.trim(), status: "active", createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid }); setLogging(null); setOutcome(""); setNotice("Contact recorded."); reload(); }
    catch (reason) { setNotice(saveErrorMessage(reason)); }
  }
  return <>
    <p className="hub-lede">Pupils the policy asks you to follow up this month: late 5 times, 3 unauthorised absences, near the 95% minimum, or persistently absent (missing 10% or more). These are prompts for a conversation, never labels.</p>
    {notice && <p className="hub-status" role="status">{notice}</p>}
    {!data.prompts.length ? <EmptyState title="No one needs follow-up this month." /> : <ul className="hub-waiting">{data.prompts.map((prompt) => {
      const student = data.students.find((item) => item.id === prompt.studentId);
      const contacted = data.logs.filter((log) => log.studentId === prompt.studentId && log.kind === prompt.kind);
      return <li key={`${prompt.studentId}-${prompt.kind}`}>
        <div><Link to={`/hub/students/${prompt.studentId}`}><strong>{student?.name || "Pupil"}</strong></Link><span>{data.classes.find((cls) => cls.id === student?.currentClassId)?.name || ""} · {prompt.message}</span>{contacted.length ? <span>Contacted: {contacted.map((log) => `${formatDate(log.date)} — ${log.outcome}`).join("; ")}</span> : null}</div>
        <div className="hub-waiting-actions"><StatusBadge status={prompt.severity === "bad" ? "overdue" : "pending"} label={contacted.length ? "Contacted" : "To contact"} /><button type="button" className="hub-button hub-button-small hub-button-quiet" onClick={() => { setLogging(logging === prompt ? null : prompt); setOutcome(""); }}>Record contact</button></div>
        {logging === prompt && <div className="hub-paper-panel"><label>What was agreed<input value={outcome} maxLength={500} onChange={(event) => setOutcome(event.target.value)} placeholder="e.g. Spoke to father; meeting with class teacher on Friday" /></label><div className="hub-form-actions"><button type="button" className="hub-button hub-button-small" onClick={() => save(prompt)}>Save</button></div></div>}
      </li>;
    })}</ul>}
  </>;
}

// ---------- Weekly report for the Board (§6.3, Appendix B “incomplete registers reported weekly”) ----------
function WeeklyReport() {
  const monday = (() => { const d = new Date(`${today()}T12:00:00`); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); })();
  const [range, setRange] = useState({ from: monday, to: today() });
  const { data, loading, error } = useLoad(async () => {
    const yearId = await currentYearId();
    const [classes, sessions, records, students, events, people] = await Promise.all([
      list("classes", where("academicYearId", "==", yearId || "")), list("attendanceSessions", where("date", ">=", range.from)), list("attendanceRecords", where("date", ">=", range.from)),
      list("students", where("status", "==", "active")), list("events", where("status", "==", "published"), where("audienceKeys", "array-contains-any", ["school"])).catch(() => []), staffNames().catch(() => ({})),
    ]);
    const closed = events.filter((event) => event.category === "holiday").flatMap((event) => schoolDays(event.date, event.endDate || event.date, { openSaturdays: [] }).concat(event.date));
    const days = schoolDays(range.from, range.to, { closed });
    const inRange = (item) => item.date <= range.to;
    return { classes: classes.filter((cls) => (cls.status ?? "active") === "active").sort(byStandard), sessions: sessions.filter(inRange), records: records.filter(inRange), students, days, people };
  }, [range.from, range.to]);
  const view = useMemo(() => {
    if (!data) return null;
    const submitted = new Set(data.sessions.filter((session) => session.status === "submitted").map((session) => session.id));
    const counted = data.records.filter((record) => submitted.has(record.sessionId));
    const perClass = data.classes.map((cls) => {
      const expected = data.days.length; const done = data.days.filter((day) => submitted.has(`${cls.id}_${day}_am`)).length;
      const summary = summarise(counted.filter((record) => record.classId === cls.id));
      return { id: cls.id, name: cls.name, expected, done, missingDays: data.days.filter((day) => !submitted.has(`${cls.id}_${day}_am`)), ...summary, ratingLabel: rating(summary.rate)?.label || "—" };
    });
    return { perClass, overall: summarise(counted), incomplete: perClass.flatMap((row) => row.missingDays.map((day) => ({ id: `${row.id}-${day}`, className: row.name, day }))) };
  }, [data]);
  return <>
    <div className="hub-filterbar hub-print-hide"><label className="hub-inline-field">From<input type="date" value={range.from} max={range.to} onChange={(event) => setRange({ ...range, from: event.target.value })} /></label><label className="hub-inline-field">To<input type="date" value={range.to} max={today()} onChange={(event) => setRange({ ...range, to: event.target.value })} /></label><button type="button" className="hub-button hub-button-small hub-button-quiet" onClick={() => window.print()}>Print</button></div>
    {loading ? <Loading /> : error ? <ErrorNote error={error} /> : <div className="hub-report">
      <h2 className="hub-print-only">Weekly attendance report · {formatDate(range.from, { day: "numeric", month: "short" })} – {formatDate(range.to, { day: "numeric", month: "short", year: "numeric" })}</h2>
      <div className="hub-stats">
        <StatCard label="Attendance" value={view.overall.rate != null ? `${view.overall.rate}%` : "—"} detail={rating(view.overall.rate)?.label} tone={rating(view.overall.rate)?.tone || "neutral"} />
        <StatCard label="School days" value={data.days.length} detail="holidays excluded" />
        <StatCard label="Incomplete registers" value={view.incomplete.length} tone={view.incomplete.length ? "warn" : "good"} />
        <StatCard label="Absences" value={view.overall.absences} detail={`${view.overall.authorised} authorised · ${view.overall.unauthorised} unauthorised · ${view.overall.late} late`} />
      </div>
      <Section title="By class"><DataTable rows={view.perClass} exportName={`attendance-${range.from}-to-${range.to}`} pageSize={20} initialSort={{ key: "name", dir: 1 }} columns={[
        { key: "name", label: "Class" }, { key: "done", label: "Registers", sortValue: (row) => row.done - row.expected, csv: (row) => `${row.done}/${row.expected}`, render: (row) => `${row.done}/${row.expected}` },
        { key: "rate", label: "Attendance", csv: (row) => row.rate ?? "", render: (row) => (row.rate != null ? `${row.rate}%` : "—") }, { key: "ratingLabel", label: "Rating" },
        { key: "authorised", label: "Authorised" }, { key: "unauthorised", label: "Unauthorised" }, { key: "late", label: "Late" },
      ]} /></Section>
      <Section title="Incomplete registers">{!view.incomplete.length ? <EmptyState title="Every register was completed." /> : <ul className="hub-list hub-list-compact">{view.incomplete.map((row) => <li key={row.id}><span>{row.className}</span><span>{formatDate(row.day, { weekday: "short", day: "numeric", month: "short" })}</span></li>)}</ul>}</Section>
      <Section title="By code"><dl className="hub-facts">{CODES.map((item) => <div key={item.code}><dt>{item.code} · {item.label}</dt><dd>{view.overall.byCode[item.code]} <small>({KIND_LABELS[item.kind]})</small></dd></div>)}</dl></Section>
    </div>}
  </>;
}

// ---------- Emergency evacuation absence sheet (§15) ----------
function Evacuation() {
  const { data, loading, error } = useLoad(async () => { const day = await schoolDay(today()); return { ...day, movements: await list("attendanceMovements", where("date", "==", today())) }; }, []);
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const away = data.records.filter((record) => ["authorised", "unauthorised", "notCounted"].includes(kindOf(record)));
  const left = data.movements.filter((item) => item.type === "earlyDeparture");
  const levels = [...new Set(data.classes.map((cls) => cls.standard))];
  const name = (id) => data.students.find((student) => student.id === id)?.name || "Pupil";
  return <div className="hub-evacuation">
    <p className="hub-print-hide"><button type="button" className="hub-button" onClick={() => window.print()}>Print the absence sheet</button> <span className="hub-hint">Print at 8.00 am and keep it with the signing-out book; sign-outs are added automatically. Registers not yet submitted aren't included.</span></p>
    <h2>Absence sheet · {formatDate(today(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · printed {nowTime()}</h2>
    {levels.map((level) => {
      const classIds = data.classes.filter((cls) => cls.standard === level).map((cls) => cls.id);
      const rows = [...away.filter((record) => classIds.includes(record.classId)).map((record) => ({ id: record.id, classId: record.classId, name: name(record.studentId), detail: `${codeOf(record)} · ${CODE[codeOf(record)].label}` })), ...left.filter((item) => classIds.includes(item.classId)).map((item) => ({ id: item.id, classId: item.classId, name: name(item.studentId), detail: `Signed out ${item.time}${item.collectedBy ? ` with ${item.collectedBy}` : ""}` }))];
      return <section key={level} className="hub-evacuation-page"><h3>Standard {level}</h3>{rows.length ? <table className="hub-table hub-table-compact"><thead><tr><th scope="col">Pupil</th><th scope="col">Reason</th><th scope="col">Class</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.detail}</td><td>{data.classes.find((cls) => cls.id === row.classId)?.name}</td></tr>)}</tbody></table> : <p>No absences recorded.</p>}</section>;
    })}
  </div>;
}
