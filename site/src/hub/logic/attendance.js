// SRSS Attendance Policy (approved 14 Oct 2026) as code: registration codes, how attendance % is
// worked out, the rating scale and the follow-up triggers. Plain JS so it is unit-tested (npm test).

// Appendix A. `status` is the stored category name kept for older records and queries.
export const CODES = [
  { code: "/", label: "Present", status: "present", kind: "present" },
  { code: "R", label: "School trip / representation", status: "schoolActivity", kind: "present" },
  { code: "L", label: "Late", status: "late", kind: "present" },
  { code: "M", label: "Medical / sickness", status: "medical", kind: "authorised" },
  { code: "S", label: "Suspension", status: "suspended", kind: "authorised" },
  { code: "P", label: "Other authorised absence", status: "excused", kind: "authorised" },
  { code: "O", label: "Unknown absence", status: "absent", kind: "unauthorised" },
  { code: "T", label: "Other unauthorised absence", status: "unauthorised", kind: "unauthorised" },
  { code: "X", label: "No attendance required", status: "notRequired", kind: "notCounted" },
];
export const CODE = Object.fromEntries(CODES.map((item) => [item.code, item]));
export const KIND_LABELS = { present: "Present", authorised: "Authorised absence", unauthorised: "Unauthorised absence", notCounted: "Not counted" };
// Older records stored only a status.
const LEGACY = { present: "/", late: "L", absent: "O", excused: "P", schoolActivity: "R", medical: "M", other: "P", suspended: "S", unauthorised: "T", notRequired: "X" };
export const codeOf = (record) => (record?.code && CODE[record.code] ? record.code : LEGACY[record?.status] || "/");
export const kindOf = (record) => CODE[codeOf(record)].kind;
export const isAbsence = (record) => ["authorised", "unauthorised"].includes(kindOf(record));

// The school day: arrive by 07:35, registration at 07:40, after 08:00 sign in at the office.
export const SCHOOL_START = "07:40";
export const LATE_AFTER_MINUTES = 5; // policy §7: L when 5 or more minutes late
export const minutesAfter = (time, start = SCHOOL_START) => { const [h, m] = time.split(":").map(Number); const [sh, sm] = start.split(":").map(Number); return h * 60 + m - (sh * 60 + sm); };

// Attendance % = sessions attended (present, trip or late) ÷ sessions counted (everything except X).
// Authorised and unauthorised absences both count as missed sessions.
export function summarise(records) {
  const byCode = Object.fromEntries(CODES.map((item) => [item.code, 0]));
  for (const record of records) byCode[codeOf(record)]++;
  const kinds = { present: 0, authorised: 0, unauthorised: 0, notCounted: 0 };
  for (const item of CODES) kinds[item.kind] += byCode[item.code];
  const counted = records.length - kinds.notCounted;
  const rate = counted ? Math.round((kinds.present / counted) * 1000) / 10 : null;
  return { total: records.length, counted, attended: kinds.present, authorised: kinds.authorised, unauthorised: kinds.unauthorised, absences: kinds.authorised + kinds.unauthorised, late: byCode.L, byCode, rate };
}

// §11 Attendance Rating Scale.
export function rating(rate) {
  if (rate == null) return null;
  if (rate >= 100) return { label: "Excellent", tone: "good" };
  if (rate >= 95) return { label: "Good", tone: "good" };
  if (rate >= 90) return { label: "Poor", tone: "warn" };
  return { label: "Unsatisfactory", tone: "bad" };
}

// Follow-up the attendance manager acts on (§6.3, §10, §11). Prompts for people to review, never labels.
export function followUps(recordsByStudent, { month = new Date().toISOString().slice(0, 7), minSessions = 10 } = {}) {
  const prompts = [];
  for (const [studentId, records] of Object.entries(recordsByStudent)) {
    const thisMonth = records.filter((record) => String(record.date).startsWith(month));
    const lates = thisMonth.filter((record) => codeOf(record) === "L").length;
    const unauthorised = thisMonth.filter((record) => kindOf(record) === "unauthorised").length;
    const summary = summarise(records);
    if (lates >= 5) prompts.push({ studentId, kind: "late", severity: "warn", message: `Late ${lates} times this month — contact parents (policy: 5 in a month)` });
    if (unauthorised >= 3) prompts.push({ studentId, kind: "unauthorised", severity: "bad", message: `${unauthorised} unauthorised absences this month — contact parents (policy: 3 in a month)` });
    if (summary.counted >= minSessions && summary.rate != null) {
      if (100 - summary.rate >= 10) prompts.push({ studentId, kind: "persistent", severity: "bad", message: `Persistent absence: ${summary.rate}% attendance (missed ${Math.round((100 - summary.rate) * 10) / 10}%) — targeted support` });
      else if (summary.rate < 96) prompts.push({ studentId, kind: "approaching", severity: "warn", message: `Attendance ${summary.rate}% — near the 95% minimum; early contact with parents` });
    }
  }
  const rank = { persistent: 0, unauthorised: 1, late: 2, approaching: 3 };
  return prompts.sort((a, b) => rank[a.kind] - rank[b.kind]);
}

// School days between two dates (Mon–Fri, excluding listed closures; Saturdays only when listed as open).
export function schoolDays(from, to, { closed = [], openSaturdays = [] } = {}) {
  const days = [];
  for (let date = new Date(`${from}T12:00:00`); date <= new Date(`${to}T12:00:00`); date.setDate(date.getDate() + 1)) {
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const weekday = date.getDay();
    if ((weekday >= 1 && weekday <= 5 && !closed.includes(iso)) || openSaturdays.includes(iso)) days.push(iso);
  }
  return days;
}
