// School Setup Wizard: one guided page that prepares SRSS for an academic year, so a small office never
// has to hunt through separate screens. Each step's status is worked out from the school's own records;
// the year-to-year actions (copy classes, carry assignments forward, promote pupils) do most of the work.
import { useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { commitInChunks, forget, list, schoolSettings, useLoad } from "../data";
import { SETUP_STEPS, planAssignmentCopy, planClassCopy, planPromotion, previousYear, setupStatus, targetYear } from "../logic/setup";
import { saveErrorMessage, slug } from "../manage";
import { ErrorNote, Loading, PageHeader, StatusBadge, formatDate } from "../ui";
import { SchoolInformation } from "./system";

const STATE_LABEL = { complete: "Complete", partial: "In progress", pending: "Pending" };
const STATE_TONE = { complete: "complete", partial: "open", pending: "pending" };
const LINKS = { year: [["/hub/admin/academic-years", "Academic years"], ["/hub/admin/terms", "Terms"]], classes: [["/hub/admin/standards", "Standards"], ["/hub/admin/classes", "Classes"]], subjects: [["/hub/admin/subjects", "Subjects"]], staff: [["/hub/admin/staff", "Staff & teachers"], ["/hub/admin/accounts", "User accounts"]], assignments: [["/hub/admin/teacher-assignments", "Teacher assignments"], ["/hub/admin/classes", "Class teachers"]], enrolment: [["/hub/admin/students", "Students"], ["/hub/admin/enrolments", "Student enrolments"]], guardians: [["/hub/admin/guardians", "Parents & guardians"], ["/hub/admin/guardian-links", "Guardian links"]] };

async function loadEverything() {
  forget("settings");
  const names = ["academicYears", "terms", "standards", "classes", "subjects", "staff", "teacherAssignments", "students", "enrollments", "studentGuardianLinks", "guardians"];
  const [settings, ...rows] = await Promise.all([schoolSettings(), ...names.map((name) => list(name))]);
  const [years, terms, standards, classes, subjects, staff, assignments, students, enrolments, links, guardians] = rows;
  return { settings, years, terms, standards, classes, subjects, staff, assignments, students, enrolments, links, guardians };
}

const commitAll = (writes) => commitInChunks(writes);

export function SetupWizard() {
  const auth = useAuth();
  const { data, loading, error, reload } = useLoad(loadEverything, []);
  const [chosenYear, setChosenYear] = useState(null);
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const [newYear, setNewYear] = useState({});
  const [newTerm, setNewTerm] = useState({});

  if (loading) return <Loading label="Checking your school's setup…" />;
  if (error) return <ErrorNote error={error} />;
  const target = data.years.find((year) => year.id === chosenYear) || targetYear(data.years, data.settings.currentAcademicYearId);
  const previous = previousYear(data.years, target);
  const status = setupStatus(data, target?.id);
  const firstOpen = SETUP_STEPS.find(([id]) => status.steps[id].state !== "complete")?.[0];
  const current = open ?? firstOpen;
  const stamp = () => { const at = serverTimestamp(); return { createdAt: at, createdBy: auth.user.uid, updatedAt: at, updatedBy: auth.user.uid }; };

  async function run(key, work) {
    setBusy(key); setNotice(null);
    try { const text = await work(); setNotice({ tone: "good", text }); reload(); }
    catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
    setBusy(null);
  }

  const addYear = () => run("year", async () => {
    if (!/^\d{4}$/.test(newYear.name || "") || !newYear.startDate || !newYear.endDate || newYear.endDate <= newYear.startDate) throw new Error("Enter a four-digit year and a first day before the last day.");
    if (data.years.some((year) => year.name === newYear.name)) throw new Error(`${newYear.name} already exists.`);
    await setDoc(doc(db, "academicYears", `ay${newYear.name}`), { name: newYear.name, startDate: newYear.startDate, endDate: newYear.endDate, status: "active", ...stamp() });
    setChosenYear(`ay${newYear.name}`); setNewYear({});
    return `Academic year ${newYear.name} added. Add its terms next.`;
  });
  const addTerm = () => run("term", async () => {
    if (!newTerm.name?.trim() || !newTerm.startDate || !newTerm.endDate || newTerm.endDate <= newTerm.startDate) throw new Error("Give the term a name and a start before its end.");
    if (newTerm.startDate < target.startDate || newTerm.endDate > target.endDate) throw new Error(`Terms must fall within ${target.name} (${formatDate(target.startDate)} – ${formatDate(target.endDate)}).`);
    await setDoc(doc(db, "terms", `${target.id}-${slug(newTerm.name)}`), { academicYearId: target.id, name: newTerm.name.trim(), startDate: newTerm.startDate, endDate: newTerm.endDate, status: "active", ...stamp() });
    setNewTerm({});
    return `${newTerm.name.trim()} added to ${target.name}.`;
  });
  const createStandards = () => run("standards", async () => {
    const missing = [1, 2, 3, 4, 5, 6].filter((level) => !data.standards.some((item) => (item.level ?? item.order) === level));
    await commitAll(missing.map((level) => (batch) => batch.set(doc(db, "standards", `std${level}`), { level, name: `Standard ${level}`, order: level, status: "active", ...stamp() })));
    return `Standards ${missing.join(", ")} added.`;
  });
  const copyClasses = () => run("copyClasses", async () => {
    const plan = planClassCopy(data.classes.filter((cls) => cls.academicYearId === previous.id), data.classes, target.id, (cls) => `${target.id}-${slug(cls.name)}`);
    if (!plan.length) return "Every class from last year already exists this year.";
    await commitAll(plan.map(({ id, ...cls }) => (batch) => batch.set(doc(db, "classes", id), { ...cls, status: "active", ...stamp() })));
    return `${plan.length} classes copied from ${previous.name}. Choose each class teacher in the next steps.`;
  });
  const copyAssignments = () => run("copyAssignments", async () => {
    const { plan, skipped } = planAssignmentCopy({ previousAssignments: data.assignments.filter((item) => item.academicYearId === previous.id), previousClasses: data.classes.filter((cls) => cls.academicYearId === previous.id), targetClasses: status.classes, existing: data.assignments, me: auth.user.uid });
    await commitAll(plan.map((item) => (batch) => batch.set(doc(collection(db, "teacherAssignments")), { ...item, startDate: target.startDate, status: "active", ...stamp() })));
    return `${plan.length} subject assignments carried forward from ${previous.name}.${skipped.length ? ` ${skipped.length} skipped (${[...new Set(skipped.map((item) => item.reason))].join("; ")}).` : ""} Check them in Teacher assignments and archive any that have changed.`;
  });
  const promote = () => run("promote", async () => {
    const { moves, graduates, unmatched } = planPromotion({ previousEnrolments: data.enrolments.filter((item) => item.academicYearId === previous.id), previousClasses: data.classes.filter((cls) => cls.academicYearId === previous.id), targetClasses: status.classes, targetEnrolments: data.enrolments.filter((item) => item.academicYearId === target.id), students: data.students });
    const close = (enrolment) => (batch) => batch.update(doc(db, "enrollments", enrolment.id), { status: "completed", endDate: previous.endDate, endReason: "End of year", updatedAt: serverTimestamp(), updatedBy: auth.user.uid });
    await commitAll([
      ...moves.flatMap(({ enrolment, newClass }) => [close(enrolment), (batch) => batch.set(doc(collection(db, "enrollments")), { studentId: enrolment.studentId, classId: newClass.id, academicYearId: target.id, standard: newClass.standard, startDate: target.startDate, previousEnrollmentId: enrolment.id, status: "active", ...stamp() })]),
      ...graduates.flatMap(({ enrolment, student }) => [close(enrolment), (batch) => batch.update(doc(db, "students", student.id), { status: "graduated", graduatedAt: previous.endDate, updatedAt: serverTimestamp(), updatedBy: auth.user.uid })]),
    ]);
    return `${moves.length} pupils moved up a Standard for ${target.name}; ${graduates.length} Standard 6 pupils marked as graduated.${unmatched.length ? ` ${unmatched.length} could not be placed — enrol them in Student enrolments.` : ""} Last year's enrolments are kept as history.`;
  });
  const activate = () => run("activate", async () => {
    await setDoc(doc(db, "settings", "school"), { currentAcademicYearId: target.id, currentTermId: data.terms.filter((term) => term.academicYearId === target.id && (term.status ?? "active") === "active").sort((a, b) => a.startDate.localeCompare(b.startDate))[0]?.id || null, updatedAt: serverTimestamp(), updatedBy: auth.user.uid }, { merge: true });
    forget("settings");
    return `${target.name} is now the current academic year. Teachers, families and pupils move to their ${target.name} classes within a minute.`;
  });

  const previousClasses = previous ? data.classes.filter((cls) => cls.academicYearId === previous.id && (cls.status ?? "active") === "active") : [];
  const previousAssignments = previous ? data.assignments.filter((item) => item.academicYearId === previous.id && (item.status ?? "active") === "active") : [];
  const previousEnrolments = previous ? data.enrolments.filter((item) => item.academicYearId === previous.id && item.status === "active") : [];
  const done = SETUP_STEPS.filter(([id]) => status.steps[id].state === "complete").length;

  const body = {
    school: <SchoolInformation onSaved={reload} />,
    year: <>
      {target ? <p>Preparing <strong>{target.name}</strong>: {formatDate(target.startDate, { day: "numeric", month: "long", year: "numeric" })} – {formatDate(target.endDate, { day: "numeric", month: "long", year: "numeric" })}.</p> : <p>Start by adding the academic year you are preparing.</p>}
      {target && <ul className="hub-list hub-list-compact">{data.terms.filter((term) => term.academicYearId === target.id && (term.status ?? "active") === "active").sort((a, b) => a.startDate.localeCompare(b.startDate)).map((term) => <li key={term.id}><span>{term.name}</span><small>{formatDate(term.startDate)} – {formatDate(term.endDate)}</small></li>)}</ul>}
      {target && <form className="hub-inline-form" onSubmit={(event) => { event.preventDefault(); addTerm(); }}><strong>Add a term</strong><input aria-label="Term name" placeholder="Term 1" value={newTerm.name || ""} onChange={(event) => setNewTerm({ ...newTerm, name: event.target.value })} /><input aria-label="Starts" type="date" value={newTerm.startDate || ""} onChange={(event) => setNewTerm({ ...newTerm, startDate: event.target.value })} /><input aria-label="Ends" type="date" value={newTerm.endDate || ""} onChange={(event) => setNewTerm({ ...newTerm, endDate: event.target.value })} /><button type="submit" className="hub-button hub-button-small" disabled={busy === "term"}>Add term</button></form>}
      <form className="hub-inline-form" onSubmit={(event) => { event.preventDefault(); addYear(); }}><strong>{target ? "Prepare another year" : "Add the academic year"}</strong><input aria-label="Year" placeholder={String(Number(target?.name || new Date().getFullYear()) + (target ? 1 : 0))} inputMode="numeric" maxLength={4} value={newYear.name || ""} onChange={(event) => setNewYear({ ...newYear, name: event.target.value })} /><input aria-label="First day" type="date" value={newYear.startDate || ""} onChange={(event) => setNewYear({ ...newYear, startDate: event.target.value })} /><input aria-label="Last day" type="date" value={newYear.endDate || ""} onChange={(event) => setNewYear({ ...newYear, endDate: event.target.value })} /><button type="submit" className="hub-button hub-button-small hub-button-quiet" disabled={busy === "year"}>Add year</button></form>
    </>,
    classes: <>
      {data.standards.length < 6 && <p><button type="button" className="hub-button hub-button-small" disabled={busy} onClick={createStandards}>Create Standards 1–6</button></p>}
      <ul className="hub-standard-grid">{[1, 2, 3, 4, 5, 6].map((level) => <li key={level}><strong>Standard {level}</strong>{status.classes.filter((cls) => cls.standard === level).map((cls) => <span key={cls.id}>{cls.name}</span>)}{!status.classes.some((cls) => cls.standard === level) && <em>No class yet</em>}</li>)}</ul>
      {previous && previousClasses.length > 0 && <p><button type="button" className="hub-button hub-button-small" disabled={busy || !target} onClick={copyClasses}>{busy === "copyClasses" ? "Copying…" : `Copy ${previousClasses.length} classes from ${previous.name}`}</button> <span className="hub-hint">Copies names, Standards and rooms. Teachers are chosen in step 6.</span></p>}
    </>,
    subjects: <p>{data.subjects.filter((subject) => (subject.status ?? "active") === "active").map((subject) => subject.name).join(", ") || "No subjects yet."} Subjects carry over from year to year.</p>,
    staff: <p>Add each teacher in Staff & teachers, then use “Create account” so they can sign in. The office can give teacher roles; administrator roles need a Super Administrator.</p>,
    assignments: <>
      <table className="hub-table hub-table-compact"><thead><tr><th scope="col">Class</th><th scope="col">Class teacher</th><th scope="col">Subject assignments</th></tr></thead><tbody>{status.classes.map((cls) => <tr key={cls.id}><td>{cls.name}</td><td>{data.staff.find((person) => person.uid && person.uid === cls.classTeacherUid)?.name || <span className="hub-cell-muted">Not chosen</span>}</td><td>{status.assignments.filter((item) => item.classId === cls.id).length}</td></tr>)}</tbody></table>
      {previous && previousAssignments.length > 0 && <p><button type="button" className="hub-button hub-button-small" disabled={busy || !status.classes.length} onClick={copyAssignments}>{busy === "copyAssignments" ? "Copying…" : `Carry forward ${previousAssignments.length} assignments from ${previous.name}`}</button> <span className="hub-hint">Each teacher keeps the same subjects with the same Standard. Your own assignments are skipped — nobody assigns themselves.</span></p>}
    </>,
    enrolment: <>
      {status.unenrolled.length > 0 && <p>Not yet in a {target?.name} class: {status.unenrolled.slice(0, 12).map((student) => student.name).join(", ")}{status.unenrolled.length > 12 ? ` and ${status.unenrolled.length - 12} more` : ""}.</p>}
      {previous && previousEnrolments.length > 0 && target?.id !== previous.id && <p><button type="button" className="hub-button hub-button-small" disabled={busy || !status.classes.length} onClick={promote}>{busy === "promote" ? "Promoting…" : `Promote ${previousEnrolments.length} pupils from ${previous.name}`}</button> <span className="hub-hint">Each pupil moves up one Standard to the matching class; Standard 6 pupils graduate. {previous.name}'s enrolments are kept as history.</span></p>}
    </>,
    guardians: <>{status.unlinked.length > 0 ? <p>No guardian linked yet: {status.unlinked.slice(0, 12).map((student) => student.name).join(", ")}{status.unlinked.length > 12 ? ` and ${status.unlinked.length - 12} more` : ""}.</p> : <p>Every enrolled pupil has a guardian linked.</p>}<p className="hub-hint">Give each family a hub account from Parents & guardians → Create account. Links you made last year carry over.</p></>,
    activate: <>
      <dl className="hub-facts"><div><dt>Classes</dt><dd>{status.classes.length}</dd></div><div><dt>Teachers assigned</dt><dd>{new Set(status.assignments.map((item) => item.teacherUid)).size}</dd></div><div><dt>Pupils enrolled</dt><dd>{data.enrolments.filter((item) => item.academicYearId === target?.id && item.status === "active").length}</dd></div><div><dt>Current year</dt><dd>{data.years.find((year) => year.id === data.settings.currentAcademicYearId)?.name || "Not set"}</dd></div></dl>
      {target && data.settings.currentAcademicYearId !== target.id && <p><button type="button" className="hub-button" disabled={busy} onClick={activate}>{busy === "activate" ? "Activating…" : `Make ${target.name} the current year`}</button> <span className="hub-hint">{status.steps.activate.state === "partial" ? "Everything is ready." : "You can activate now, but some steps above still need attention."} Last year's records stay exactly as they are.</span></p>}
    </>,
  };

  return <>
    <PageHeader kicker="School setup" title="Welcome to SRSS Digital Hub" actions={data.years.length > 1 && <label className="hub-inline-field">Preparing<select value={target?.id || ""} onChange={(event) => setChosenYear(event.target.value)}>{data.years.filter((year) => (year.status ?? "active") === "active").map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label>}>
      Let’s prepare your school for the new academic year. {done} of {SETUP_STEPS.length} steps complete.
    </PageHeader>
    <div className="hub-progress" role="progressbar" aria-valuemin={0} aria-valuemax={SETUP_STEPS.length} aria-valuenow={done} aria-label="Setup progress"><span style={{ transform: `scaleX(${done / SETUP_STEPS.length})` }} /></div>
    <div aria-live="polite">{notice && <p className={notice.tone === "bad" ? "hub-error" : "hub-status"} role="status">{notice.text}</p>}</div>
    <ol className="hub-wizard">{SETUP_STEPS.map(([id, title], index) => {
      const step = status.steps[id];
      const expanded = current === id;
      return <li key={id} className={`hub-wizard-step is-${step.state} ${expanded ? "is-open" : ""}`}>
        <button type="button" className="hub-wizard-head" aria-expanded={expanded} aria-controls={`step-${id}`} onClick={() => setOpen(expanded ? "" : id)}>
          <span className="hub-wizard-number" aria-hidden="true">{step.state === "complete" ? "✓" : index + 1}</span>
          <span className="hub-wizard-title"><strong>{title}</strong><small>{step.summary}</small></span>
          <StatusBadge status={STATE_TONE[step.state]} label={STATE_LABEL[step.state]} />
        </button>
        {expanded && <div className="hub-wizard-body" id={`step-${id}`}>{body[id]}{LINKS[id] && <p className="hub-wizard-links">Open: {LINKS[id].map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</p>}</div>}
      </li>;
    })}</ol>
    <p className="hub-hint">Each year: add the year and its terms, copy last year’s classes, carry assignments forward, promote pupils, then activate. Nothing from earlier years is changed or lost.</p>
  </>;
}
