// School setup and assignments (Admin hub): academic years, terms, Standards, classes, subjects,
// teacher–class–subject assignments and student enrolments. All built on RecordManager (../manage.jsx).
// History is kept: assignments and enrolments are ended or archived, never rewritten or deleted.
import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, serverTimestamp, setDoc, where, writeBatch, collection } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { can } from "../../auth/permissions";
import { forget, list, schoolSettings, today } from "../data";
import { RecordManager, isActive, saveErrorMessage, slug } from "../manage";
import { StatusBadge, formatDate } from "../ui";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const yearName = (lookups, id) => lookups.years?.find((year) => year.id === id)?.name || String(id || "").replace(/^ay/, "") || "—";
const className = (lookups, id) => lookups.classes?.find((cls) => cls.id === id)?.name || "—";
const subjectName = (lookups, id) => lookups.subjects?.find((subject) => subject.id === id)?.name || id || "—";
const teacherName = (lookups, uid) => lookups.staff?.find((person) => person.uid === uid)?.name || (uid ? "Unknown teacher" : "—");
const byStandard = (a, b) => (a.standard || 0) - (b.standard || 0) || String(a.name).localeCompare(String(b.name));

// Reference data most setup screens need. Classes are sorted Standard 1 → 6.
export async function schoolLookups(extra = {}) {
  const [settings, years, classes, subjects, staff, standards] = await Promise.all([schoolSettings(), list("academicYears"), list("classes"), list("subjects"), list("staff"), list("standards")]);
  const loaded = { settings, currentYearId: settings.currentAcademicYearId || null, years: years.sort((a, b) => String(b.name).localeCompare(String(a.name))), classes: classes.sort(byStandard), subjects: subjects.sort((a, b) => String(a.name).localeCompare(String(b.name))), staff: staff.sort((a, b) => String(a.name).localeCompare(String(b.name))), standards };
  const more = await Promise.all(Object.entries(extra).map(async ([key, load]) => [key, await load()]));
  return { ...loaded, ...Object.fromEntries(more) };
}

export const yearOptions = (lookups) => lookups.years.filter(isActive).map((year) => [year.id, `${year.name}${year.id === lookups.currentYearId ? " (current)" : ""}`]);
export const classOptions = (lookups, yearId = lookups.currentYearId) => lookups.classes.filter((cls) => isActive(cls) && (!yearId || cls.academicYearId === yearId)).map((cls) => [cls.id, `${cls.name} · Standard ${cls.standard}`]);
// Staff with a sign-in account. Your own name is shown but can't be chosen: nobody assigns themselves.
export const teacherOptions = (lookups, me) => lookups.staff.filter((person) => person.uid && isActive(person)).map((person) => [person.uid, person.uid === me ? `${person.name} (you — ask another administrator)` : `${person.name}${person.position ? ` · ${person.position}` : ""}`, { disabled: person.uid === me }]);

function useEditRights(module = "academics") {
  const auth = useAuth();
  return { auth, canEdit: can(auth.roles, module, "U") === "all" };
}

const dateOrder = (draft) => (draft.startDate && draft.endDate && draft.endDate <= draft.startDate ? { endDate: "The end date must be after the start date." } : {});

// ---------- Academic years ----------
export function AcademicYears() {
  const { auth, canEdit } = useEditRights();
  async function makeCurrent(year, { reload, setNotice }) {
    try {
      await setDoc(doc(db, "settings", "school"), { currentAcademicYearId: year.id, updatedAt: serverTimestamp(), updatedBy: auth.user.uid }, { merge: true });
      forget("settings");
      setNotice({ tone: "good", text: `${year.name} is now the current academic year. Teachers' classes and families' notices update within a minute.` });
      reload();
    } catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
  }
  return <RecordManager kicker="School setup" title="Academic years" noun="academic year" collection="academicYears" canEdit={canEdit}
    intro="Each year holds its own classes, assignments and enrolments. Setting a new current year doesn't change last year's records."
    lookups={() => schoolSettings().then((settings) => ({ currentYearId: settings.currentAcademicYearId }))}
    fields={[
      { key: "name", label: "Year", type: "text", required: true, immutable: true, placeholder: "2027", pattern: /^\d{4}$/, patternMessage: "Enter a four-digit year, e.g. 2027." },
      { key: "startDate", label: "First day", type: "date", required: true },
      { key: "endDate", label: "Last day", type: "date", required: true },
    ]}
    makeId={(values) => `ay${values.name}`}
    validate={dateOrder}
    columns={(lookups) => [
      { key: "name", label: "Year", render: (row) => <span className="hub-cell-strong">{row.name} {row.id === lookups.currentYearId && <StatusBadge status="active" label="Current" />}</span> },
      { key: "startDate", label: "Runs", render: (row) => `${formatDate(row.startDate, { day: "numeric", month: "short", year: "numeric" })} – ${formatDate(row.endDate, { day: "numeric", month: "short", year: "numeric" })}` },
    ]}
    archivable={(row, { lookups }) => (row.id === lookups.currentYearId ? "This is the current year. Make another year current first." : true)}
    rowActions={(row, ctx) => canEdit && isActive(row) && row.id !== ctx.lookups.currentYearId ? <button type="button" className="hub-link-button" onClick={() => makeCurrent(row, ctx)}>Make current</button> : null}
    initialSort={{ key: "name", dir: -1 }} searchKeys={["name"]} />;
}

// ---------- Terms ----------
export function Terms() {
  const { canEdit } = useEditRights();
  return <RecordManager kicker="School setup" title="Terms" noun="term" collection="terms" canEdit={canEdit}
    intro="Terms sit inside an academic year and mustn't overlap."
    lookups={() => schoolLookups()}
    fields={[
      { key: "academicYearId", label: "Academic year", type: "select", required: true, immutable: true, options: yearOptions },
      { key: "name", label: "Name", type: "text", required: true, maxLength: 60, placeholder: "Term 1" },
      { key: "startDate", label: "Starts", type: "date", required: true },
      { key: "endDate", label: "Ends", type: "date", required: true },
    ]}
    defaults={(lookups) => ({ academicYearId: lookups.currentYearId })}
    makeId={(values) => `${values.academicYearId}-${slug(values.name)}`}
    validate={(values, { rows, lookups, original }) => {
      const errors = dateOrder(values);
      const year = lookups.years.find((item) => item.id === values.academicYearId);
      if (year && values.startDate && (values.startDate < year.startDate || values.endDate > year.endDate)) errors.startDate = `Terms must fall within ${year.name} (${formatDate(year.startDate)} – ${formatDate(year.endDate)}).`;
      const clash = rows.find((row) => isActive(row) && row.id !== original?.id && row.academicYearId === values.academicYearId && values.startDate <= row.endDate && values.endDate >= row.startDate);
      if (clash) errors.startDate = `These dates overlap ${clash.name}.`;
      return errors;
    }}
    columns={(lookups) => [
      { key: "name", label: "Term", render: (row) => <span className="hub-cell-strong">{row.name} {row.id === lookups.settings?.currentTermId && <StatusBadge status="active" label="Current" />}</span> },
      { key: "academicYearId", label: "Year", render: (row) => yearName(lookups, row.academicYearId) },
      { key: "startDate", label: "Dates", render: (row) => `${formatDate(row.startDate, { day: "numeric", month: "short" })} – ${formatDate(row.endDate, { day: "numeric", month: "short", year: "numeric" })}` },
    ]}
    filters={(lookups) => [{ key: "academicYearId", label: "Year", options: yearOptions(lookups) }]}
    initialFilters={(lookups) => (lookups.currentYearId ? { academicYearId: lookups.currentYearId } : {})}
    initialSort={{ key: "startDate", dir: 1 }} />;
}

// ---------- Standards ----------
export function Standards() {
  const { auth, canEdit } = useEditRights();
  async function createAll(rows, { reload, setNotice }) {
    const missing = [1, 2, 3, 4, 5, 6].filter((level) => !rows.some((row) => row.level === level || row.id === `std${level}`));
    try {
      const batch = writeBatch(db); const stamp = serverTimestamp();
      for (const level of missing) batch.set(doc(db, "standards", `std${level}`), { level, name: `Standard ${level}`, order: level, status: "active", createdAt: stamp, createdBy: auth.user.uid, updatedAt: stamp, updatedBy: auth.user.uid });
      await batch.commit();
      setNotice({ tone: "good", text: `Added ${missing.map((level) => `Standard ${level}`).join(", ")}.` }); reload();
    } catch (reason) { setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
  }
  return <RecordManager kicker="School setup" title="Standards" noun="Standard" collection="standards" canEdit={canEdit}
    intro="SRSS teaches Standards 1 to 6. Classes belong to a Standard."
    fields={[
      { key: "level", label: "Level", type: "number", required: true, immutable: true, min: 1, max: 6 },
      { key: "name", label: "Name", type: "text", required: true, maxLength: 60, placeholder: "Standard 1" },
    ]}
    makeId={(values) => `std${values.level}`}
    prepare={(values) => ({ ...values, order: values.level })}
    toDraft={(row) => ({ level: row.level ?? row.order })}
    columns={() => [{ key: "level", label: "Level", sortValue: (row) => row.level ?? row.order, render: (row) => row.level ?? row.order }, { key: "name", label: "Name" }]}
    headerActions={(ctx) => canEdit && [1, 2, 3, 4, 5, 6].some((level) => !ctx.rows.some((row) => (row.level ?? row.order) === level)) ? <button type="button" className="hub-button hub-button-quiet" onClick={() => createAll(ctx.rows, ctx)}>Create Standards 1–6</button> : null}
    initialSort={{ key: "level", dir: 1 }} statusOptions={[["active", "Active"], ["archived", "Archived"]]} />;
}

// ---------- Classes ----------
export function Classes() {
  const { auth, canEdit } = useEditRights();
  return <RecordManager kicker="School setup" title="Classes" noun="class" collection="classes" canEdit={canEdit}
    intro="A class belongs to one academic year and one Standard. The class teacher sees the class roster, family contacts and attendance."
    lookups={() => schoolLookups({ enrolments: () => list("enrollments", where("status", "==", "active")) })}
    fields={[
      { key: "academicYearId", label: "Academic year", type: "select", required: true, immutable: true, options: yearOptions },
      { key: "standard", label: "Standard", type: "select", required: true, immutable: true, options: () => [1, 2, 3, 4, 5, 6].map((level) => [String(level), `Standard ${level}`]) },
      { key: "name", label: "Class name", type: "text", required: true, maxLength: 60, placeholder: "4 Amanah" },
      { key: "room", label: "Room", type: "text", maxLength: 60 },
      { key: "capacity", label: "Places", type: "number", min: 1, max: 60 },
      { key: "classTeacherUid", label: "Class teacher", type: "select", options: (lookups) => teacherOptions(lookups, auth.user.uid), placeholder: "Not yet chosen", help: "Only staff with a hub account appear here." },
    ]}
    defaults={(lookups) => ({ academicYearId: lookups.currentYearId })}
    toDraft={(row) => ({ standard: String(row.standard) })}
    makeId={(values) => `${values.academicYearId}-${slug(values.name)}`}
    prepare={(values) => ({ ...values, standard: Number(values.standard) })}
    validate={(values, { rows, original, uid }) => ({
      name: rows.some((row) => row.id !== original?.id && row.academicYearId === values.academicYearId && String(row.name).toLowerCase() === String(values.name).toLowerCase()) ? "Another class this year already has this name." : null,
      classTeacherUid: values.classTeacherUid && values.classTeacherUid === uid && values.classTeacherUid !== original?.classTeacherUid ? "You can't make yourself a class teacher. Ask another administrator." : null,
    })}
    columns={(lookups) => [
      { key: "name", label: "Class", render: (row) => <span className="hub-cell-strong">{row.name}</span> },
      { key: "standard", label: "Standard", render: (row) => `Std ${row.standard}` },
      { key: "academicYearId", label: "Year", render: (row) => yearName(lookups, row.academicYearId) },
      { key: "classTeacherUid", label: "Class teacher", sortValue: (row) => teacherName(lookups, row.classTeacherUid), csv: (row) => teacherName(lookups, row.classTeacherUid), render: (row) => row.classTeacherUid ? teacherName(lookups, row.classTeacherUid) : <span className="hub-cell-muted">Not chosen</span> },
      { key: "pupils", label: "Pupils", sortValue: (row) => lookups.enrolments.filter((item) => item.classId === row.id).length, csv: (row) => lookups.enrolments.filter((item) => item.classId === row.id).length, render: (row) => lookups.enrolments.filter((item) => item.classId === row.id).length },
      { key: "room", label: "Room" },
    ]}
    archivable={(row, { lookups }) => (lookups.enrolments.some((item) => item.classId === row.id) ? "Move or end this class's enrolments first." : true)}
    filters={(lookups) => [{ key: "academicYearId", label: "Year", options: yearOptions(lookups) }, { key: "standard", label: "Standard", value: (row) => String(row.standard), options: [1, 2, 3, 4, 5, 6].map((level) => [String(level), `Standard ${level}`]) }]}
    initialFilters={(lookups) => (lookups.currentYearId ? { academicYearId: lookups.currentYearId } : {})}
    searchKeys={["name", "room"]} exportName="srss-classes" initialSort={{ key: "standard", dir: 1 }} />;
}

// ---------- Subjects ----------
const SUBJECT_CATEGORIES = [["core", "Core subject"], ["nonCore", "Non-core subject"], ["srss", "SRSS subject"]];
export function Subjects() {
  const { canEdit } = useEditRights();
  return <RecordManager kicker="School setup" title="Subjects" noun="subject" collection="subjects" canEdit={canEdit}
    intro="Teachers are assigned to teach a subject in a class; portfolio entries can name the subject."
    fields={[
      { key: "code", label: "Short code", type: "text", required: true, immutable: true, maxLength: 30, pattern: /^[a-z0-9-]{1,30}$/, patternMessage: "Lower-case letters, numbers and hyphens, e.g. math or bm.", help: "Used as the subject's permanent ID." },
      { key: "name", label: "Subject name", type: "text", required: true, maxLength: 80 },
      { key: "category", label: "Type", type: "select", options: SUBJECT_CATEGORIES, placeholder: "Not set" },
      { key: "medium", label: "Taught in (language)", type: "text", maxLength: 80, placeholder: "e.g. English" },
      { key: "standards", label: "Standards", type: "checkboxes", options: () => [1, 2, 3, 4, 5, 6].map((level) => [String(level), `Standard ${level}`]), wide: true, help: "Leave empty if taught in every Standard." },
      { key: "description", label: "Description", type: "textarea", maxLength: 600, wide: true },
    ]}
    toDraft={(row) => ({ code: row.id })}
    makeId={(values) => values.code}
    columns={() => [{ key: "name", label: "Subject", render: (row) => <span className="hub-cell-strong">{row.name}</span> }, { key: "id", label: "Code" }, { key: "category", label: "Type", render: (row) => SUBJECT_CATEGORIES.find(([value]) => value === row.category)?.[1] || "—" }, { key: "standards", label: "Standards", render: (row) => (row.standards?.length ? row.standards.map((level) => `Std ${level}`).join(", ") : "All Standards") }, { key: "medium", label: "Language" }]}
    filters={() => [{ key: "category", label: "Type", options: SUBJECT_CATEGORIES }]}
    searchKeys={["name", "id"]} initialSort={{ key: "name", dir: 1 }} />;
}

// ---------- Teacher–class–subject assignments ----------
const parseSlots = (text) => String(text || "").split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
  const match = part.match(/^(mon|tue|wed|thu|fri)\w*\s+(\d{1,2}):(\d{2})$/i);
  return match ? { day: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(match[1].toLowerCase()), time: `${match[2].padStart(2, "0")}:${match[3]}` } : null;
});
export const slotsText = (slots = []) => slots.map((slot) => `${WEEKDAYS[slot.day]} ${slot.time}`).join(", ");

export function TeacherAssignments() {
  const { auth, canEdit } = useEditRights();
  return <RecordManager kicker="Assignments" title="Teacher assignments" noun="assignment" collection="teacherAssignments" canEdit={canEdit}
    intro="Who teaches which subject in which class this year. A teacher sees a class only through an active assignment (or as its class teacher). To change teacher, archive the assignment and add a new one; the old one stays in the record."
    lookups={() => schoolLookups()}
    nameOf={(row, lookups) => (lookups ? `${subjectName(lookups, row.subjectId)} · ${className(lookups, row.classId)} · ${teacherName(lookups, row.teacherUid)}` : "")}
    fields={[
      { key: "classId", label: "Class", type: "select", required: true, immutable: true, options: (lookups) => classOptions(lookups) },
      { key: "subjectId", label: "Subject", type: "select", required: true, immutable: true, options: (lookups) => lookups.subjects.filter(isActive).map((subject) => [subject.id, subject.name]) },
      { key: "teacherUid", label: "Teacher", type: "select", required: true, immutable: true, options: (lookups) => teacherOptions(lookups, auth.user.uid), help: "Only staff with a hub account appear here." },
      { key: "slotsText", label: "Weekly lessons", type: "text", placeholder: "Mon 08:30, Wed 10:30", help: "Optional, until the timetable module: day and start time, separated by commas." },
      { key: "startDate", label: "From", type: "date", required: true },
    ]}
    defaults={() => ({ startDate: today() })}
    toDraft={(row) => ({ slotsText: slotsText(row.slots) })}
    validate={(values, { rows, isNew, uid }) => ({
      teacherUid: isNew && values.teacherUid === uid ? "You can't assign yourself. Ask another administrator." : null,
      slotsText: parseSlots(values.slotsText).some((slot) => !slot) ? "Write each lesson as a weekday and time, e.g. Mon 08:30." : null,
      _form: isNew && rows.some((row) => isActive(row) && row.classId === values.classId && row.subjectId === values.subjectId && row.teacherUid === values.teacherUid) ? "This teacher already has this subject in this class." : null,
    })}
    prepare={(values, { lookups, isNew, original }) => {
      const { slotsText: text, ...rest } = values;
      const cls = lookups.classes.find((item) => item.id === (rest.classId || original?.classId));
      return { ...rest, slots: parseSlots(text), ...(isNew ? { academicYearId: cls.academicYearId, staffId: lookups.staff.find((person) => person.uid === rest.teacherUid)?.id || null } : {}) };
    }}
    columns={(lookups) => [
      { key: "teacherUid", label: "Teacher", sortValue: (row) => teacherName(lookups, row.teacherUid), csv: (row) => teacherName(lookups, row.teacherUid), render: (row) => <span className="hub-cell-strong">{teacherName(lookups, row.teacherUid)}</span> },
      { key: "classId", label: "Class", sortValue: (row) => className(lookups, row.classId), csv: (row) => className(lookups, row.classId), render: (row) => className(lookups, row.classId) },
      { key: "subjectId", label: "Subject", csv: (row) => subjectName(lookups, row.subjectId), render: (row) => subjectName(lookups, row.subjectId) },
      { key: "slots", label: "Lessons", sortable: false, csv: (row) => slotsText(row.slots), render: (row) => slotsText(row.slots) || "—" },
      { key: "academicYearId", label: "Year", render: (row) => yearName(lookups, row.academicYearId) },
    ]}
    filters={(lookups) => [
      { key: "academicYearId", label: "Year", options: yearOptions(lookups) },
      { key: "classId", label: "Class", options: classOptions(lookups, null) },
      { key: "teacherUid", label: "Teacher", options: lookups.staff.filter((person) => person.uid).map((person) => [person.uid, person.name]) },
      { key: "subjectId", label: "Subject", options: lookups.subjects.map((subject) => [subject.id, subject.name]) },
    ]}
    initialFilters={(lookups) => (lookups.currentYearId ? { academicYearId: lookups.currentYearId } : {})}
    statusOptions={[["active", "Active"], ["archived", "Ended / archived"]]} searchKeys={[]} exportName="srss-teacher-assignments" />;
}

// ---------- Student enrolments ----------
const ENROLMENT_STATUSES = [["active", "Active"], ["transferred", "Moved class"], ["completed", "Completed year"], ["withdrawn", "Withdrawn"]];
const studentName = (lookups, id) => lookups.students?.find((student) => student.id === id)?.name || "—";

export function Enrolments() {
  const { auth, canEdit } = useEditRights("students");
  const [action, setAction] = useState(null); // { kind: "move" | "end", row }
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  async function apply(ctx) {
    const { row, kind } = action;
    if (!form.date) return ctx.setNotice({ tone: "bad", text: "Choose the date this takes effect." });
    if (kind === "move" && !form.classId) return ctx.setNotice({ tone: "bad", text: "Choose the new class." });
    setBusy(true);
    try {
      const stamp = serverTimestamp(); const batch = writeBatch(db); const by = { updatedAt: stamp, updatedBy: auth.user.uid };
      batch.update(doc(db, "enrollments", row.id), { status: kind === "move" ? "transferred" : form.status || "withdrawn", endDate: form.date, endReason: form.reason?.trim() || null, ...by });
      if (kind === "move") {
        const cls = ctx.lookups.classes.find((item) => item.id === form.classId);
        batch.set(doc(collection(db, "enrollments")), { studentId: row.studentId, classId: cls.id, academicYearId: cls.academicYearId, standard: cls.standard, startDate: form.date, previousEnrollmentId: row.id, status: "active", createdAt: stamp, createdBy: auth.user.uid, ...by });
      }
      await batch.commit();
      ctx.setNotice({ tone: "good", text: kind === "move" ? `${studentName(ctx.lookups, row.studentId)} moved to ${className(ctx.lookups, form.classId)}. The earlier enrolment is kept as history.` : `Enrolment ended for ${studentName(ctx.lookups, row.studentId)}.` });
      setAction(null); setForm({}); ctx.reload();
    } catch (reason) { ctx.setNotice({ tone: "bad", text: saveErrorMessage(reason) }); }
    setBusy(false);
  }

  return <RecordManager kicker="Assignments" title="Student enrolments" noun="enrolment" collection="enrollments" canEdit={canEdit}
    intro="Enrolment places a pupil in a class for a year. Moving class ends the current enrolment and starts a new one, so the pupil's history is never lost. A pupil's current class updates automatically."
    lookups={() => schoolLookups({ students: () => list("students") })}
    nameOf={(row, lookups) => (lookups ? `${studentName(lookups, row.studentId)} → ${className(lookups, row.classId)}` : "")}
    editable={() => false} archivable={() => false}
    fields={[
      { key: "studentId", label: "Pupil", type: "select", required: true, options: (lookups) => lookups.students.filter((student) => student.status === "active").sort((a, b) => a.name.localeCompare(b.name)).map((student) => [student.id, `${student.name}${student.studentNumber ? ` · ${student.studentNumber}` : ""}`]) },
      { key: "classId", label: "Class", type: "select", required: true, options: (lookups) => classOptions(lookups) },
      { key: "startDate", label: "Start date", type: "date", required: true },
    ]}
    defaults={() => ({ startDate: today() })}
    validate={(values, { rows, lookups }) => {
      const cls = lookups.classes.find((item) => item.id === values.classId);
      const existing = cls && rows.find((row) => row.status === "active" && row.studentId === values.studentId && row.academicYearId === cls.academicYearId);
      return { studentId: existing ? `Already enrolled in ${className(lookups, existing.classId)} this year — use Move class.` : null };
    }}
    prepare={(values, { lookups }) => { const cls = lookups.classes.find((item) => item.id === values.classId); return { ...values, academicYearId: cls.academicYearId, standard: cls.standard }; }}
    columns={(lookups) => [
      { key: "studentId", label: "Pupil", sortValue: (row) => studentName(lookups, row.studentId), csv: (row) => studentName(lookups, row.studentId), render: (row) => <Link to={`/hub/students/${row.studentId}`}>{studentName(lookups, row.studentId)}</Link> },
      { key: "classId", label: "Class", sortValue: (row) => className(lookups, row.classId), csv: (row) => className(lookups, row.classId), render: (row) => className(lookups, row.classId) },
      { key: "academicYearId", label: "Year", render: (row) => yearName(lookups, row.academicYearId) },
      { key: "startDate", label: "From – to", render: (row) => `${formatDate(row.startDate, { day: "numeric", month: "short", year: "numeric" })}${row.endDate ? ` – ${formatDate(row.endDate, { day: "numeric", month: "short", year: "numeric" })}` : ""}` },
      { key: "statusBadge", label: "Status", sortValue: (row) => row.status, csv: (row) => row.status, render: (row) => <StatusBadge status={row.status} label={ENROLMENT_STATUSES.find(([value]) => value === row.status)?.[1]} /> },
    ]}
    rowActions={(row) => canEdit && row.status === "active" ? <>
      <button type="button" className="hub-link-button" onClick={() => { setAction({ kind: "move", row }); setForm({ date: today() }); }}>Move class</button>
      <button type="button" className="hub-link-button" onClick={() => { setAction({ kind: "end", row }); setForm({ date: today(), status: "withdrawn" }); }}>End enrolment</button>
    </> : null}
    banner={(ctx) => action && <form className="hub-form hub-form-wide hub-editor" onSubmit={(event) => { event.preventDefault(); apply(ctx); }}>
      <h2>{action.kind === "move" ? `Move ${studentName(ctx.lookups, action.row.studentId)} to another class` : `End ${studentName(ctx.lookups, action.row.studentId)}'s enrolment`}</h2>
      <p className="hub-hint">Currently in {className(ctx.lookups, action.row.classId)} since {formatDate(action.row.startDate, { day: "numeric", month: "short", year: "numeric" })}.</p>
      <div className="hub-form-row">
        {action.kind === "move" && <label>New class<select required value={form.classId || ""} onChange={(event) => setForm({ ...form, classId: event.target.value })}><option value="">Choose…</option>{classOptions(ctx.lookups, action.row.academicYearId).filter(([id]) => id !== action.row.classId).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>}
        {action.kind === "end" && <label>Reason<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="withdrawn">Left the school</option><option value="completed">Completed the year</option></select></label>}
        <label>Takes effect<input type="date" required value={form.date || ""} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
        <label>Note<input value={form.reason || ""} maxLength={200} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Optional" /></label>
      </div>
      <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={busy}>{busy ? "Saving…" : action.kind === "move" ? "Move pupil" : "End enrolment"}</button><button type="button" className="hub-button hub-button-quiet" onClick={() => setAction(null)}>Cancel</button></div>
    </form>}
    filters={(lookups) => [{ key: "academicYearId", label: "Year", options: yearOptions(lookups) }, { key: "classId", label: "Class", options: classOptions(lookups, null) }]}
    initialFilters={(lookups) => (lookups.currentYearId ? { academicYearId: lookups.currentYearId } : {})}
    statusOptions={ENROLMENT_STATUSES} searchKeys={[]} exportName="srss-enrolments" createLabel="Enrol a pupil" />;
}
