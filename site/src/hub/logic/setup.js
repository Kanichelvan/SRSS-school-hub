// School Setup Wizard logic (plain JS, unit-tested): step status from the school's own records, and the
// annual roll-over plans (copy classes, carry assignments forward, promote pupils).

const active = (row) => (row.status ?? "active") === "active";
const byName = (a, b) => String(a.name).localeCompare(String(b.name));

export const SETUP_STEPS = [
  ["school", "School information"], ["year", "Academic year & terms"], ["classes", "Standards & classes"], ["subjects", "Subjects"],
  ["staff", "Staff & teachers"], ["assignments", "Teacher assignments"], ["enrolment", "Student enrolment"], ["guardians", "Parent/guardian linking"], ["activate", "Review & activate"],
];

// The year being prepared: the newest active year that isn't before the current one.
export function targetYear(years, currentYearId) {
  const current = years.find((year) => year.id === currentYearId);
  const later = years.filter((year) => active(year) && (!current || String(year.name) >= String(current.name))).sort((a, b) => String(b.name).localeCompare(String(a.name)));
  return later[0] || current || null;
}
export function previousYear(years, target) {
  return years.filter((year) => target && String(year.name) < String(target.name)).sort((a, b) => String(b.name).localeCompare(String(a.name)))[0] || null;
}

// Each step: { state: "complete" | "partial" | "pending", summary }.
export function setupStatus(data, yearId) {
  const s = data.settings || {};
  const year = data.years.find((item) => item.id === yearId);
  const terms = data.terms.filter((term) => term.academicYearId === yearId && active(term));
  const classes = data.classes.filter((cls) => cls.academicYearId === yearId && active(cls));
  const levels = [1, 2, 3, 4, 5, 6];
  const standards = levels.filter((level) => data.standards.some((item) => (item.level ?? item.order) === level && active(item)));
  const coveredLevels = levels.filter((level) => classes.some((cls) => cls.standard === level));
  const subjects = data.subjects.filter(active);
  const staff = data.staff.filter(active);
  const withAccounts = staff.filter((person) => person.uid);
  const assignments = data.assignments.filter((item) => item.academicYearId === yearId && active(item));
  const staffedClasses = classes.filter((cls) => cls.classTeacherUid || assignments.some((item) => item.classId === cls.id));
  const pupils = data.students.filter((student) => student.status === "active");
  const enrolled = new Set(data.enrolments.filter((item) => item.academicYearId === yearId && item.status === "active").map((item) => item.studentId));
  const unenrolled = pupils.filter((student) => !enrolled.has(student.id));
  const linked = new Set(data.links.filter(active).map((link) => link.studentId));
  const unlinked = pupils.filter((student) => enrolled.has(student.id) && !linked.has(student.id));
  const familiesWithoutAccount = data.guardians.filter((guardian) => active(guardian) && !guardian.uid && data.links.some((link) => active(link) && link.guardianId === guardian.id && link.hasPortalAccess)).length;

  const step = (complete, partial, summary) => ({ state: complete ? "complete" : partial ? "partial" : "pending", summary });
  const result = {
    school: step(Boolean(s.name && (s.phone || s.email)), Boolean(s.name), s.name ? `${s.name}${s.phone ? ` · ${s.phone}` : ""}` : "Not entered yet"),
    year: step(Boolean(year && terms.length), Boolean(year), year ? `${year.name}: ${terms.length} ${terms.length === 1 ? "term" : "terms"}` : "No academic year yet"),
    classes: step(standards.length === 6 && coveredLevels.length === 6, classes.length > 0 || standards.length > 0, `${standards.length} of 6 Standards · ${classes.length} ${classes.length === 1 ? "class" : "classes"}${coveredLevels.length < 6 && classes.length ? ` · no class yet for Standard ${levels.filter((level) => !coveredLevels.includes(level)).join(", ")}` : ""}`),
    subjects: step(subjects.length > 0, false, `${subjects.length} ${subjects.length === 1 ? "subject" : "subjects"}`),
    staff: step(withAccounts.length > 0, staff.length > 0, `${staff.length} staff · ${withAccounts.length} with a hub account`),
    assignments: step(classes.length > 0 && staffedClasses.length === classes.length, assignments.length > 0, `${staffedClasses.length} of ${classes.length} classes have a teacher · ${assignments.length} subject assignments`),
    enrolment: step(pupils.length > 0 && unenrolled.length === 0, enrolled.size > 0, `${enrolled.size} enrolled · ${unenrolled.length} active ${unenrolled.length === 1 ? "pupil" : "pupils"} not yet in a ${year?.name || ""} class`),
    guardians: step(enrolled.size > 0 && unlinked.length === 0, linked.size > 0, `${unlinked.length} enrolled ${unlinked.length === 1 ? "pupil has" : "pupils have"} no guardian linked · ${familiesWithoutAccount} ${familiesWithoutAccount === 1 ? "family" : "families"} without a hub account`),
  };
  const ready = Object.values(result).every((item) => item.state === "complete");
  result.activate = step(s.currentAcademicYearId === yearId, ready, s.currentAcademicYearId === yearId ? `${year?.name || "This year"} is the current year` : ready ? `Ready to make ${year?.name} the current year` : "Finish the steps above first");
  return { steps: result, unenrolled, unlinked, classes, assignments };
}

// Classes for a new year, copied from the previous year's (names, Standards, rooms; not teachers).
export function planClassCopy(previousClasses, existingClasses, targetYearId, idFor) {
  const taken = new Set(existingClasses.filter((cls) => cls.academicYearId === targetYearId).map((cls) => String(cls.name).toLowerCase()));
  return previousClasses.filter((cls) => active(cls) && !taken.has(String(cls.name).toLowerCase())).sort((a, b) => a.standard - b.standard || byName(a, b))
    .map((cls) => ({ id: idFor(cls), name: cls.name, standard: cls.standard, room: cls.room || null, capacity: cls.capacity ?? null, academicYearId: targetYearId, classTeacherUid: null, copiedFromClassId: cls.id }));
}

// The class in the new year that matches an old one: same Standard and same position among that Standard's classes.
export function matchClass(oldClass, oldClasses, newClasses, standardShift = 0) {
  const sameLevel = (list, level) => list.filter((cls) => active(cls) && cls.standard === level).sort(byName);
  const position = Math.max(0, sameLevel(oldClasses, oldClass.standard).findIndex((cls) => cls.id === oldClass.id));
  const candidates = sameLevel(newClasses, oldClass.standard + standardShift);
  return candidates[Math.min(position, candidates.length - 1)] || null;
}

// Teachers keep teaching the same subjects to the same Standard; you can't copy an assignment to yourself.
export function planAssignmentCopy({ previousAssignments, previousClasses, targetClasses, existing, me }) {
  const plan = []; const skipped = [];
  for (const item of previousAssignments.filter(active)) {
    const oldClass = previousClasses.find((cls) => cls.id === item.classId);
    const newClass = oldClass && matchClass(oldClass, previousClasses, targetClasses);
    if (!newClass) { skipped.push({ item, reason: "no matching class" }); continue; }
    if (item.teacherUid === me) { skipped.push({ item, reason: "your own assignment — another administrator must add it" }); continue; }
    if (existing.some((row) => active(row) && row.classId === newClass.id && row.subjectId === item.subjectId && row.teacherUid === item.teacherUid)) continue;
    plan.push({ teacherUid: item.teacherUid, staffId: item.staffId || null, subjectId: item.subjectId, classId: newClass.id, academicYearId: newClass.academicYearId, slots: item.slots || [] });
  }
  return { plan, skipped };
}

// Promotion: each pupil active in the previous year moves up one Standard; Standard 6 pupils graduate.
export function planPromotion({ previousEnrolments, previousClasses, targetClasses, targetEnrolments, students }) {
  const moves = []; const graduates = []; const unmatched = [];
  const already = new Set(targetEnrolments.filter((item) => item.status === "active").map((item) => item.studentId));
  for (const enrolment of previousEnrolments.filter((item) => item.status === "active")) {
    const student = students.find((item) => item.id === enrolment.studentId);
    if (!student || student.status !== "active" || already.has(enrolment.studentId)) continue;
    const oldClass = previousClasses.find((cls) => cls.id === enrolment.classId);
    if (!oldClass) { unmatched.push(enrolment); continue; }
    if (oldClass.standard >= 6) { graduates.push({ enrolment, student }); continue; }
    const newClass = matchClass(oldClass, previousClasses, targetClasses, 1);
    if (!newClass) unmatched.push(enrolment); else moves.push({ enrolment, student, newClass });
  }
  return { moves, graduates, unmatched };
}
