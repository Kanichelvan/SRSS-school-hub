// SRSS School Fees and Payment Policy (effective Academic Year 2025; supplied by the School, Nov 2026).
// One source for every figure the website and the hub show: fee pages, the family calculator, the
// FAQ and the hub's Fees-Lite statements. Change an amount here and everywhere follows.
// School tuition and the external vendor's meal charge are always separate lines (policy §3).

export const FEES = {
  effectiveFrom: 2025,
  tuitionMonthly: 385,
  mealMonthly: 70, // charged by the independent food vendor; not a school tuition fee
  months: 11, // January to November
  dueDay: 10, // monthly tuition is due by the 10th
  // Sibling tuition discounts for concurrently enrolled children (policy §4). Tuition only.
  siblingDiscounts: [0, 0.2, 0.35, 0.45],
  // Six-monthly plan: January–June and July–November (recommended decision).
  sixMonthly: [{ label: "January–June", months: 6, dueMonth: 1 }, { label: "July–November", months: 5, dueMonth: 7 }],
};
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
export const PLANS = { monthly: "Monthly (by the 10th)", sixMonthly: "Six-monthly (January and July)", fortnightly: "Fortnightly (written schedule)" };
export const CHILD_LABELS = ["First child", "Second child", "Third child", "Fourth child", "Fifth child", "Sixth child"];

const cents = (value) => Math.round(value * 100) / 100;
export const ringgit = (value, { decimals } = {}) => `RM${Number(value).toLocaleString("en-MY", { minimumFractionDigits: decimals ?? (Number.isInteger(cents(value)) ? 0 : 2), maximumFractionDigits: 2 })}`;

// The discount for the nth concurrently enrolled child (1 = the oldest enrolled child).
export const siblingDiscount = (position) => FEES.siblingDiscounts[Math.min(Math.max(position, 1), FEES.siblingDiscounts.length) - 1];
export const siblingTuition = (position) => cents(FEES.tuitionMonthly * (1 - siblingDiscount(position)));

// One child's standard monthly and annual amounts, before any hardship concession.
export function childFees(position, { meals = true } = {}) {
  const tuition = siblingTuition(position);
  const meal = meals ? FEES.mealMonthly : 0;
  return { position, discount: siblingDiscount(position), tuition, meal, monthly: cents(tuition + meal), tuitionAnnual: cents(tuition * FEES.months), mealAnnual: cents(meal * FEES.months), annual: cents((tuition + meal) * FEES.months) };
}

// A family's standard fees (Part B calculator): children in order, oldest enrolled first.
export function familyFees(children, { meals = true } = {}) {
  const rows = Array.from({ length: children }, (_, index) => childFees(index + 1, { meals: Array.isArray(meals) ? meals[index] !== false : meals }));
  const sum = (key) => cents(rows.reduce((total, row) => total + row[key], 0));
  return { rows, tuition: sum("tuition"), meal: sum("meal"), monthly: sum("monthly"), tuitionAnnual: sum("tuitionAnnual"), mealAnnual: sum("mealAnnual"), annual: sum("annual"), saving: cents(rows.length * FEES.tuitionMonthly - sum("tuition")) };
}

// Sibling order: the oldest enrolled child is the first child; recalculated whenever enrolment changes.
export function siblingOrder(children) {
  return [...children].sort((a, b) => String(a.dateOfBirth || "9999").localeCompare(String(b.dateOfBirth || "9999")) || String(a.name || "").localeCompare(String(b.name || "")));
}

// Families: pupils who share any guardian are siblings. Order within a family: oldest enrolled first.
export function families(students, links) {
  const parent = new Map(students.map((student) => [student.id, student.id]));
  const find = (id) => { while (parent.get(id) !== id) id = parent.get(id); return id; };
  const byGuardian = new Map();
  for (const link of links) if (parent.has(link.studentId)) byGuardian.set(link.guardianId, [...(byGuardian.get(link.guardianId) || []), link.studentId]);
  for (const ids of byGuardian.values()) for (const id of ids.slice(1)) parent.set(find(id), find(ids[0]));
  const groups = new Map();
  for (const student of students) groups.set(find(student.id), [...(groups.get(find(student.id)) || []), student]);
  return [...groups.values()].map((members) => siblingOrder(members).map((student, index) => ({ student, position: index + 1, familyKey: siblingOrder(members)[0].id, familySize: members.length })));
}

// Amount due so far in the year for one line (tuition or meals) under a payment plan, as at a date.
// Months are charged January–November; the instalment falls due on the 10th of its month.
export function dueToDate(monthlyAmount, plan, year, onDate) {
  const [y, m, d] = String(onDate).split("-").map(Number);
  if (y < year) return 0;
  const reached = (month) => y > year || m > month || (m === month && d >= FEES.dueDay);
  const months = plan === "sixMonthly"
    ? FEES.sixMonthly.filter((part) => reached(part.dueMonth)).reduce((total, part) => total + part.months, 0)
    : Array.from({ length: FEES.months }, (_, index) => index + 1).filter(reached).length;
  return cents(monthlyAmount * months);
}

// A student's fee statement (policy §8): tuition and vendor meals as separate lines.
// `assignment` is a studentFeeAssignments record; `payments` its payments.
export function statement(assignment, payments = [], onDate) {
  const concession = assignment.concessionRate || 0; // 1 = full sponsorship
  const tuitionMonthly = cents(siblingTuition(assignment.siblingPosition || 1) * (1 - concession));
  const mealMonthly = assignment.meals ? (assignment.mealSponsored ? 0 : FEES.mealMonthly) : 0;
  const paid = (line) => cents(payments.filter((payment) => payment.line === line).reduce((total, payment) => total + Number(payment.amount || 0), 0));
  const line = (monthly, key) => {
    const charged = cents(monthly * FEES.months);
    const due = dueToDate(monthly, assignment.plan, assignment.year, onDate);
    const received = paid(key);
    return { monthly, charged, due, paid: received, outstanding: Math.max(0, cents(due - received)), balance: cents(charged - received) };
  };
  const tuition = line(tuitionMonthly, "tuition");
  const meals = line(mealMonthly, "meals");
  return { tuition, meals, discount: siblingDiscount(assignment.siblingPosition || 1), concession, outstanding: cents(tuition.outstanding + meals.outstanding), balance: cents(tuition.balance + meals.balance) };
}

// 2025 financial statements (Part D, supplied by the School).
export const FINANCES_2025 = {
  income: [["School fees & books", 460007], ["Donations received", 374692], ["Other operating income", 76587]],
  expenses: 811911,
  donations: [["Sathya Sai Education & Welfare Fund", 165650], ["SSIOM", 115000], ["Other donors", 94042]],
};
