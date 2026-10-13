// DEVELOPMENT-ONLY demo dataset: an entirely fictional Sekolah Rendah Sathya Sai for academic year 2027,
// with 2026 kept as last year's history. Every person here is invented — no real pupil, parent or staff
// member. Used only by scripts/seed-emulator.mjs, which refuses to run anywhere except the local emulators.
// Dates for attendance, notices and events are relative to the day the seed runs, so dashboards have data.

export const DEMO_PASSWORD = "srss-demo-only"; // emulator-only; shared with the demo buttons in src/hub/SignIn.jsx
export const YEAR = { id: "ay2027", name: "2027", startDate: "2027-01-11", endDate: "2027-11-26" };
export const PREVIOUS_YEAR = { id: "ay2026", name: "2026", startDate: "2026-01-12", endDate: "2026-12-04" };
export const TERMS = [["t1", "Term 1", "2027-01-11", "2027-05-21"], ["t2", "Term 2", "2027-06-07", "2027-09-03"], ["t3", "Term 3", "2027-09-13", "2027-11-26"]];

// One sign-in account per role (all @demo.srss.test). `staff` gives them a staff record and position.
export const ACCOUNTS = [
  { key: "superadmin", name: "Mr Hafiz Rahman (demo)", roles: ["superAdmin"], staff: "Digital Hub Super Administrator" },
  { key: "office", name: "Puan Salmah Idris (demo)", roles: ["schoolAdmin"], staff: "School Administrator" },
  { key: "principal", name: "Dr Meera Nathan (demo)", roles: ["leadership"], staff: "Headmistress" },
  { key: "coordinator", name: "Cikgu Rohani Aziz (demo)", roles: ["academicCoordinator", "teacher"], staff: "Academic Coordinator" },
  { key: "teacher", name: "Cikgu Lim Wei Ling (demo)", roles: ["teacher", "classTeacher"], staff: "Class Teacher, Standard 4" },
  { key: "teacher2", name: "Mr Daniel Tan (demo)", roles: ["teacher", "classTeacher"], staff: "Class Teacher, Standard 5" },
  { key: "specialist", name: "Ms Kavitha Rao (demo)", roles: ["specialistTeacher"], staff: "Learning Studio Teacher" },
  { key: "admissions", name: "Encik Faizal Omar (demo)", roles: ["admissionsOfficer"], staff: "Admissions Officer" },
  { key: "finance", name: "Mrs Chong Siew Mei (demo)", roles: ["financeOfficer"], staff: "Finance Officer" },
  { key: "welfare", name: "Ms Devi Krishnan (demo)", roles: ["safeguardingLead"], staff: "Welfare Lead" },
  { key: "privacy", name: "Mr Arif Hassan (demo)", roles: ["privacySteward"], staff: "Privacy & Consent Steward" },
  { key: "moderator", name: "Ms Anita Joseph (demo)", roles: ["portfolioModerator", "teacher"], staff: "Portfolio Lead" },
  { key: "editor", name: "Ms Grace Wong (demo)", roles: ["contentEditor"], staff: "Communications" },
  { key: "parent", name: "Priya Raman (demo)", roles: ["parent"] },
  { key: "parent2", name: "Jason Tan (demo)", roles: ["parent"] },
  { key: "student", name: "Aarav Raman (demo)", roles: ["student"] },
];
// A staff member without an account yet (shows the "Create account" step).
export const STAFF_WITHOUT_ACCOUNT = [["staff-noraini", "Puan Noraini Yusof (demo)", "Music Teacher"]];

export const CLASS_NAMES = ["Amanah", "Bakti", "Cekal", "Dedikasi", "Ehsan", "Fikrah"];
export const classId = (yearId, standard) => `${yearId}-${standard}-${CLASS_NAMES[standard - 1].toLowerCase()}`;
export const CLASS_TEACHERS = { 4: "teacher", 5: "teacher2" };

export const SUBJECTS = [["bm", "Bahasa Melayu"], ["bi", "English"], ["math", "Mathematics"], ["sci", "Science"], ["ehv", "Education in Human Values"], ["pe", "Physical Education"], ["art", "Visual Arts"], ["music", "Music"]];

// [id, teacher key, Standard, subject, weekly slots]
export const ASSIGNMENTS = [
  ["math-3", "teacher", 3, "math", [[1, "10:30"], [3, "10:30"], [5, "08:30"]]],
  ["math-4", "teacher", 4, "math", [[1, "08:30"], [2, "08:30"], [3, "08:30"], [4, "08:30"], [5, "10:30"]]],
  ["ehv-4", "teacher", 4, "ehv", [[2, "11:30"], [4, "11:30"]]],
  ["bi-5", "teacher2", 5, "bi", [[1, "08:30"], [3, "11:30"]]],
  ["bi-6", "teacher2", 6, "bi", [[2, "10:30"], [4, "10:30"]]],
  ["bi-2", "moderator", 2, "bi", [[1, "08:30"], [3, "08:30"]]],
  ["sci-6", "coordinator", 6, "sci", [[2, "08:30"], [5, "11:30"]]],
];

// Six fictional pupils per Standard for 2027.
export const ROSTER = {
  1: ["Ananya Pillai", "Haziq Ismail", "Mei Xin Tan", "Arjun Nair", "Nur Aisyah Rahman", "Ethan Lee"],
  2: ["Anika Raman", "Danish Hakim", "Sofia Wong", "Rohan Menon", "Siti Hajar", "Lucas Teoh"],
  3: ["Kavya Suresh", "Irfan Zulkifli", "Chloe Lim", "Vikram Das", "Aina Sofea", "Jayden Ng"],
  4: ["Aarav Raman", "Mei Ling Tan", "Adam Harith", "Ishaan Kumar", "Nurul Iman", "Ryan Chua"],
  5: ["Diya Krishnan", "Amir Hamzah", "Hui Min Ooi", "Karthik Raj", "Balqis Zahra", "Marcus Tan"],
  6: ["Tara Subramaniam", "Hakimi Yusof", "Jia Yi Koh", "Nikhil Rao", "Puteri Alya", "Daniel Goh"],
};

export const ANNOUNCEMENT_CATEGORIES = [["school", "School-wide", 1], ["class", "Class", 2], ["academic", "Academic", 3], ["event", "Event", 4], ["reminder", "Reminder", 5], ["urgent", "Urgent", 6]];
export const PORTFOLIO_CATEGORIES = [["academic", "Academic Learning", 1], ["humanValues", "Human Values", 2], ["cocurricular", "Co-curricular", 3], ["achievements", "Achievements", 4], ["reflections", "Reflections & Growth", 5]];
export const PORTFOLIO_TAGS = [["competition-award", "Competition award", 1], ["leadership", "Leadership", 2], ["service-project", "Service project", 3], ["sports", "Sports", 4], ["performing-arts", "Performing arts", 5], ["personal-best", "Personal best", 6]];
export const DOWNLOAD_CATEGORIES = [["forms", "Forms", 1], ["policies", "Policies", 2], ["newsletters", "Newsletters", 3], ["curriculum", "Curriculum", 4]];
