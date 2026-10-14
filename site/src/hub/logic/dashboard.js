// Pure dashboard derivations, kept free of Firebase so they can be unit-tested (npm test).
// Flags prompt human review; nothing here labels a child (PRD §4.8).
import { CODES, followUps, summarise } from "./attendance.js";

export const ATTENDANCE_STATUSES = CODES.map((item) => item.status);
export const ATTENDANCE_LABELS = Object.fromEntries(CODES.map((item) => [item.status, item.label]));
ATTENDANCE_LABELS.other = "Other authorised absence";
export const HUMAN_VALUES = { truth: "Truth", rightConduct: "Right Conduct", peace: "Peace", love: "Love", nonViolence: "Non-violence" };

// Attendance Policy §11: attended (present, trip, late) ÷ counted sessions (all but X).
// `counts.absent` is every authorised or unauthorised absence.
export function attendanceSummary(records) {
  const summary = summarise(records);
  return { ...summary, counts: { present: summary.byCode["/"], late: summary.late, excused: summary.byCode.P, absent: summary.absences, authorised: summary.authorised, unauthorised: summary.unauthorised } };
}

// ATT-002: distinguish "not submitted" from "submitted, everyone present".
export function attendanceByClass(classes, sessions, date) {
  return classes.map((cls) => {
    const session = sessions.find((item) => item.classId === cls.id && item.date === date);
    return { classId: cls.id, className: cls.name, state: session?.status === "submitted" ? "submitted" : session ? "open" : "missing", session: session || null };
  });
}

// Follow-up prompts from the Attendance Policy (late 5×/month, 3 unauthorised/month, persistent absence,
// near the 95% minimum). Prompts invite review by staff; they never label a child.
export function followUpPrompts(records, { today = new Date() } = {}) {
  const byStudent = {};
  for (const record of records) (byStudent[record.studentId] ||= []).push(record);
  const month = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 7);
  return followUps(byStudent, { month, minSessions: 10 });
}

// DASH-001: everything a family needs to act on, isolated from announcements, most urgent first.
export function parentActions({ children, consentDefinitions, consentStatus, formRequests, fees, today = new Date() }) {
  const actions = [];
  for (const child of children) {
    // Missing consents are grouped into one action per child so the list stays short and scannable.
    const status = consentStatus[child.id]?.types || {};
    const missing = consentDefinitions.filter((definition) => !status[definition.type] || (status[definition.type].version ?? 1) < (definition.version ?? 1));
    if (missing.length === 1) actions.push({ kind: "consent", studentId: child.id, title: `${missing[0].title} consent awaiting your response`, childName: child.preferredName || child.name, to: `/hub/parent/consent?student=${child.id}`, dueDate: null });
    if (missing.length > 1) actions.push({ kind: "consent", studentId: child.id, title: `${missing.length} consent choices awaiting your response`, detail: missing.map((definition) => definition.title).join(", "), childName: child.preferredName || child.name, to: `/hub/parent/consent?student=${child.id}`, dueDate: null });
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
