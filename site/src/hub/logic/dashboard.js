// Pure dashboard derivations, kept free of Firebase so they can be unit-tested (npm test).
// Flags prompt human review; nothing here labels a child (PRD §4.8).

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused", "schoolActivity", "medical", "other"];
export const ATTENDANCE_LABELS = { present: "Present", absent: "Absent", late: "Late", excused: "Excused", schoolActivity: "School activity", medical: "Medical", other: "Other" };
export const HUMAN_VALUES = { truth: "Truth", rightConduct: "Right Conduct", peace: "Peace", love: "Love", nonViolence: "Non-violence" };

// Attendance rate counts late and authorised absences as attended; only "absent" counts against it.
export function attendanceSummary(records) {
  const counts = Object.fromEntries(ATTENDANCE_STATUSES.map((status) => [status, 0]));
  for (const record of records) counts[record.status] = (counts[record.status] || 0) + 1;
  const total = records.length;
  const attended = total - counts.absent;
  return { total, counts, rate: total ? Math.round((attended / total) * 1000) / 10 : null };
}

// ATT-002: distinguish "not submitted" from "submitted, everyone present".
export function attendanceByClass(classes, sessions, date) {
  return classes.map((cls) => {
    const session = sessions.find((item) => item.classId === cls.id && item.date === date);
    return { classId: cls.id, className: cls.name, state: session?.status === "submitted" ? "submitted" : session ? "open" : "missing", session: session || null };
  });
}

// Repeated-absence prompt for human follow-up (srss §41: e.g. 3 unexplained absences within 30 days).
export function followUpPrompts(records, { threshold = 3, withinDays = 30, today = new Date() } = {}) {
  const since = new Date(today); since.setDate(since.getDate() - withinDays);
  const byStudent = new Map();
  for (const record of records) {
    if (record.status !== "absent" || new Date(record.date) < since) continue;
    byStudent.set(record.studentId, (byStudent.get(record.studentId) || 0) + 1);
  }
  return [...byStudent].filter(([, count]) => count >= threshold).map(([studentId, count]) => ({ studentId, count, message: `${count} absences in the last ${withinDays} days — review suggested` }));
}

// DASH-001: everything a family needs to act on, isolated from announcements, most urgent first.
export function parentActions({ children, consentDefinitions, consentStatus, formRequests, fees, today = new Date() }) {
  const actions = [];
  for (const child of children) {
    // Missing consents are grouped into one action per child so the list stays short and scannable.
    const status = consentStatus[child.id]?.types || {};
    const missing = consentDefinitions.filter((definition) => !status[definition.type]);
    if (missing.length === 1) actions.push({ kind: "consent", studentId: child.id, title: `${missing[0].title} consent awaiting your response`, childName: child.preferredName || child.name, to: `/hub/forms?consent=${missing[0].type}&student=${child.id}`, dueDate: null });
    if (missing.length > 1) actions.push({ kind: "consent", studentId: child.id, title: `${missing.length} consent choices awaiting your response`, detail: missing.map((definition) => definition.title).join(", "), childName: child.preferredName || child.name, to: `/hub/forms?student=${child.id}`, dueDate: null });
    const fee = fees.find((item) => item.studentId === child.id);
    if (fee && fee.outstanding > 0) actions.push({ kind: "payment", studentId: child.id, title: `Outstanding fees: RM ${fee.outstanding.toLocaleString("en-MY")}`, childName: child.preferredName || child.name, to: "/hub/parent/fees", dueDate: fee.nextDueDate || null });
  }
  for (const request of formRequests) {
    if (request.status !== "pending") continue;
    const child = children.find((item) => item.id === request.studentId);
    actions.push({ kind: "form", studentId: request.studentId || null, title: request.formTitle || "Form awaiting your response", childName: child ? child.preferredName || child.name : null, to: `/hub/forms/${request.id}`, dueDate: request.dueDate || null });
  }
  const dueRank = (action) => (action.dueDate ? new Date(action.dueDate).getTime() : Number.MAX_SAFE_INTEGER);
  return actions.sort((a, b) => dueRank(a) - dueRank(b)).map((action) => ({ ...action, overdue: Boolean(action.dueDate && new Date(action.dueDate) < today) }));
}

// Record-completeness indicator for the student register (PRD §16).
export const COMPLETENESS_FIELDS = { emergencyContact: "Emergency contact", medical: "Medical declaration", photoConsent: "Photo consent", birthCertificate: "Birth certificate" };
export function completeness(student) {
  const flags = student.completeness || {};
  const missing = Object.entries(COMPLETENESS_FIELDS).filter(([key]) => !flags[key]).map(([, label]) => label);
  const total = Object.keys(COMPLETENESS_FIELDS).length;
  return { complete: missing.length === 0, missing, percent: Math.round(((total - missing.length) / total) * 100) };
}

// Teacher dashboard "Next class" from assignment slots ({ day: weekday 1–5, time: "HH:MM" }).
export function nextClass(assignments, now = new Date()) {
  const weekday = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
  const upcoming = [];
  for (const assignment of assignments) {
    for (const { day, time } of assignment.slots || []) {
      const daysAhead = (day - weekday + 7) % 7;
      const offset = daysAhead === 0 && toMinutes(time) < minutes - 30 ? 7 : daysAhead; // 30-min grace while a lesson runs
      upcoming.push({ ...assignment, day, time, offset, sortKey: offset * 1440 + toMinutes(time) });
    }
  }
  return upcoming.sort((a, b) => a.sortKey - b.sortKey)[0] || null;
}

export function todaysLessons(assignments, now = new Date()) {
  return assignments.flatMap((assignment) => (assignment.slots || []).filter((slot) => slot.day === now.getDay()).map((slot) => ({ ...assignment, time: slot.time }))).sort((a, b) => a.time.localeCompare(b.time));
}

// Student 360° tabs (PRD §17, SIS-002): a tab renders only when the viewer's roles can read its module.
export const STUDENT_360_TABS = [
  ["overview", "Overview", "students"], ["personal", "Personal", "students"], ["family", "Family & guardians", "guardians"],
  ["academic", "Academic", "assessments"], ["attendance", "Attendance", "attendance"], ["portfolio", "Portfolio", "portfolio"],
  ["humanExcellence", "Human Excellence", "humanExcellence"], ["support", "Support", "support"], ["achievements", "Achievements", "achievements"],
  ["fees", "Fees", "fees"], ["documents", "Documents", "documents"], ["incidents", "Incidents & behaviour", "incidents"], ["history", "History", "governance"],
];
