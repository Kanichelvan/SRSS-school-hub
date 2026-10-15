// SRSS Digital Hub permission model — single source of truth for hub roles, modules and access levels.
// Sources: "SRSS Full Permission Matrix" (original nine role columns) and the "SRSS Digital Hub PRD"
// (user groups §6, authorisation model §44, priority matrix). Where the two differ, the PRD wins and the
// cell is commented. The UI reads this to build navigation; firestore.rules enforces the same boundaries.
// Hiding a navigation item is never an access control (PRD §43, AUTH-002).

export const ROLES = {
  superAdmin: { label: "Super Administrator", hub: "admin" },
  student: { label: "Student", hub: "student" },
  parent: { label: "Parent / Guardian", hub: "parent" },
  teacher: { label: "Teacher", hub: "teacher" },
  classTeacher: { label: "Class Teacher", hub: "teacher" },
  specialistTeacher: { label: "Specialist / Learning Studio Teacher", hub: "teacher" },
  academicCoordinator: { label: "Academic Coordinator", hub: "admin" },
  schoolAdmin: { label: "School Administrator", hub: "admin" },
  admissionsOfficer: { label: "Admissions Officer", hub: "admin" },
  attendanceManager: { label: "School Attendance Manager (Clerk)", hub: "admin" },
  financeOfficer: { label: "Finance Officer", hub: "admin" },
  leadership: { label: "Headmistress / Leadership", hub: "admin" },
  safeguardingLead: { label: "Safeguarding / Welfare Lead", hub: "admin" },
  privacySteward: { label: "Privacy / Consent Steward", hub: "admin" },
  portfolioModerator: { label: "Portfolio Moderator", hub: "admin" },
  contentEditor: { label: "Content Editor", hub: "admin" },
  technicalAdmin: { label: "Technical Administrator", hub: "admin" },
  // Future roles (PRD §6) — defined now so data and rules stay stable when their modules ship.
  librarian: { label: "Librarian", hub: "admin", future: true },
  auditor: { label: "Auditor / Read-only Reviewer", hub: "admin", future: true },
};
// Super Administrator (1–2 people, PRD §62) holds everything School Administrator, Leadership and
// Technical Administrator hold, and is the only role that can assign staff roles. The server keeps the
// legacy `accessAdmin` claim in step with it.

export const ROLE_IDS = Object.keys(ROLES);
export const TEACHING_ROLES = ["teacher", "classTeacher", "specialistTeacher"];

// The six initial roles (user decision, 14 Oct 2026). Every other role is an additional responsibility
// that can be added to a person, e.g. Teacher + Class Teacher + Portfolio Moderator.
export const PRIMARY_ROLES = ["superAdmin", "schoolAdmin", "teacher", "parent", "student", "contentEditor"];
export const ADDITIONAL_ROLES = ROLE_IDS.filter((role) => !PRIMARY_ROLES.includes(role) && !ROLES[role].future);

// The school office may give families and teachers their accounts. Roles that open the Admin hub are
// "elevated": only a Super Administrator can grant or remove them (enforced in functions/index.js).
export const OFFICE_ASSIGNABLE_ROLES = ["parent", "student", "teacher", "classTeacher", "specialistTeacher"];
export const isElevated = (role) => !OFFICE_ASSIGNABLE_ROLES.includes(role);
export const isSuperAdmin = (roles, claims = {}) => (roles || []).includes("superAdmin") || claims.accessAdmin === true;
// Roles the signed-in person may grant or remove for someone else.
export const assignableRoles = (roles, claims) => (isSuperAdmin(roles, claims) ? ROLE_IDS : (roles || []).includes("schoolAdmin") ? OFFICE_ASSIGNABLE_ROLES : []);

// Modules, with the release phase from the PRD's revised priority matrix (1 = Jubilee launch).
export const MODULES = {
  dashboard: { label: "Dashboard", phase: 1 },
  announcements: { label: "Announcements", phase: 1 },
  calendar: { label: "Calendar & events", phase: 1 },
  messages: { label: "Messages", phase: 1 },
  notifications: { label: "Notifications", phase: 1 },
  forms: { label: "Forms & Actions", phase: 1 },
  search: { label: "Search", phase: 1 },
  profile: { label: "Profile", phase: 1 },
  students: { label: "Student records (SIS)", phase: 1 },
  guardians: { label: "Family & guardians", phase: 1 },
  staff: { label: "Staff directory", phase: 1 },
  academics: { label: "Academic structure", phase: 1 },
  attendance: { label: "Attendance", phase: 1 },
  portfolio: { label: "Portfolio", phase: 1 },
  humanExcellence: { label: "Human Excellence record", phase: 1 },
  showcase: { label: "Public showcase moderation", phase: 1 },
  achievements: { label: "Achievements", phase: 1 },
  engagement: { label: "Quest & reading", phase: 1 },
  consent: { label: "Consent centre", phase: 1 },
  admissions: { label: "Admissions", phase: 1 },
  inbox: { label: "Website inbox", phase: 1 },
  content: { label: "Website content (CMS)", phase: 1 },
  documents: { label: "Documents", phase: 1 },
  reports: { label: "Reports", phase: 1 },
  governance: { label: "Governance & audit", phase: 1 },
  settings: { label: "Settings", phase: 1 },
  accessAdministration: { label: "Roles & access", phase: 1 },
  timetable: { label: "Timetable", phase: 2 },
  teaching: { label: "Teaching & planning", phase: 2 },
  assessments: { label: "Assessments & gradebook", phase: 2 },
  reportCards: { label: "Report cards", phase: 2 },
  support: { label: "Learning support", phase: 2 },
  incidents: { label: "Incidents & behaviour", phase: 2 },
  meetings: { label: "Parent–teacher meetings", phase: 2 },
  fees: { label: "Fees-lite", phase: 2 },
  familyAdmissions: {label:"Family admissions applications",phase:1},
  teacherDevelopment: { label: "Teacher development", phase: 1 },
  staffHR: { label: "Staff HR (leave, training, appraisal)", phase: 2 },
  assets: { label: "Assets", phase: 3 },
  library: { label: "Library & Resource Centre", phase: 3 },
};

// Cell notation: "<actions> <scope>"
//   actions: V view · C create/submit · U update (implies V) · A approve/publish (implies V) · R restricted (exception only)
//   scope:   all (default) · own · child · assigned · class · selected · relevant · summary · published
// A role missing from a row has no access.
const ALL_STAFF = ["superAdmin", "attendanceManager", "teacher", "classTeacher", "specialistTeacher", "academicCoordinator", "schoolAdmin", "admissionsOfficer", "financeOfficer", "leadership", "safeguardingLead", "privacySteward", "portfolioModerator", "contentEditor", "technicalAdmin", "librarian", "auditor"];
const everyone = (cell) => Object.fromEntries([...ROLE_IDS].map((role) => [role, cell]));
const staffOnly = (cell) => Object.fromEntries(ALL_STAFF.map((role) => [role, cell]));

const MATRIX = {
  dashboard: everyone("V"),
  engagement: { ...everyone("V"), student: "C own", parent: "C child", teacher: "C/U class", classTeacher: "C/U class", specialistTeacher: "C/U assigned", contentEditor: "C/U own", schoolAdmin: "C/U/A", leadership: "C/U/A" },
  notifications: everyone("V own"),
  profile: everyone("V own"),
  search: everyone("V relevant"),
  calendar: { ...everyone("V relevant"), schoolAdmin: "U", leadership: "A" },
  // PRD DASH-002: admins and teachers publish targeted announcements (matrix had admin draft / leadership approve).
  announcements: { ...everyone("V relevant"), teacher: "A class", classTeacher: "A class", specialistTeacher: "A class", schoolAdmin: "A", leadership: "A" },
  messages: { ...staffOnly("C/U own"), parent: "C/U own" },
  forms: { ...everyone("C/U own"), schoolAdmin: "A", privacySteward: "A" },

  students: {
    student: "V own", parent: "V child", teacher: "V class", classTeacher: "V class", specialistTeacher: "V assigned",
    academicCoordinator: "V", schoolAdmin: "U", leadership: "V", safeguardingLead: "V", privacySteward: "V",
    financeOfficer: "V summary", portfolioModerator: "V summary", auditor: "V", attendanceManager: "V",
    admissionsOfficer: "R", // PRD §44: applicants only, enrolled records only if separately authorised
  },
  guardians: { parent: "V own", classTeacher: "V class", teacher: "V class", schoolAdmin: "U", leadership: "V", safeguardingLead: "V", privacySteward: "V", attendanceManager: "V" },
  staff: { ...staffOnly("V"), schoolAdmin: "U", parent: "V summary" },
  academics: { ...staffOnly("V"), academicCoordinator: "U", schoolAdmin: "U" },
  // PRD ATT-001 overrides the matrix: subject teachers take attendance for their assigned classes.
  attendance: {
    student: "V own", parent: "V child", teacher: "U class", classTeacher: "U class", specialistTeacher: "V assigned",
    academicCoordinator: "V", schoolAdmin: "U", leadership: "V", safeguardingLead: "V", auditor: "V", attendanceManager: "U",
  },
  portfolio: {
    student: "C own", parent: "V child", teacher: "U class", classTeacher: "U class", specialistTeacher: "U assigned",
    academicCoordinator: "V", portfolioModerator: "V relevant", leadership: "R",
  },
  humanExcellence: {
    student: "V own", parent: "V child", teacher: "U class", classTeacher: "U class", specialistTeacher: "U assigned",
    academicCoordinator: "V", leadership: "V summary",
  },
  // PRD CON-002: only the Portfolio Moderator approves public showcase, and only with consent.
  showcase: { teacher: "C class", classTeacher: "C class", specialistTeacher: "C assigned", portfolioModerator: "A", leadership: "A", contentEditor: "V" },
  achievements: {
    student: "V own", parent: "V child", teacher: "U class", classTeacher: "U class", specialistTeacher: "U assigned",
    academicCoordinator: "A", contentEditor: "V", leadership: "V",
  },
  consent: {
    parent: "C child", teacher: "V relevant", classTeacher: "V class", specialistTeacher: "V relevant", schoolAdmin: "U",
    privacySteward: "A", leadership: "V", portfolioModerator: "V relevant", contentEditor: "V relevant", auditor: "V",
  },
  admissions: { admissionsOfficer: "U", schoolAdmin: "U", leadership: "V" },
  inbox: { schoolAdmin: "U", leadership: "V", admissionsOfficer: "V" },
  content: { contentEditor: "C/U", leadership: "A", schoolAdmin: "V" },
  documents: { ...everyone("V relevant"), schoolAdmin: "U" },
  reports: { academicCoordinator: "V", schoolAdmin: "V", leadership: "V", financeOfficer: "V summary", auditor: "V", attendanceManager: "V" },
  governance: { schoolAdmin: "U", leadership: "A", privacySteward: "U", safeguardingLead: "V summary", technicalAdmin: "V", auditor: "V" },
  settings: { schoolAdmin: "U", technicalAdmin: "U", leadership: "V" },
  // Everyone here sees accounts and the role matrix; what each may change is decided by the server.
  accessAdministration: { superAdmin: "U", schoolAdmin: "U", leadership: "V", technicalAdmin: "V" },

  timetable: { student: "V own", parent: "V child", teacher: "V", classTeacher: "V", specialistTeacher: "V", academicCoordinator: "U", schoolAdmin: "U", leadership: "V" },
  teaching: { student: "V own", parent: "V child", teacher: "U", classTeacher: "U", specialistTeacher: "U", academicCoordinator: "A", leadership: "V summary" },
  assessments: {
    student: "V published", parent: "V published", teacher: "U class", classTeacher: "U class", specialistTeacher: "U assigned",
    academicCoordinator: "A", leadership: "A", schoolAdmin: "V summary",
  },
  reportCards: { student: "V published", parent: "V published", teacher: "U class", classTeacher: "U class", academicCoordinator: "A", leadership: "A" },
  support: { parent: "V selected", classTeacher: "V class", specialistTeacher: "U assigned", academicCoordinator: "V", leadership: "V", safeguardingLead: "V", teacher: "R" },
  incidents: {
    parent: "V selected", teacher: "C/U assigned", classTeacher: "C/U class", specialistTeacher: "C/U assigned",
    schoolAdmin: "U", leadership: "V", safeguardingLead: "U",
  },
  meetings: { parent: "C/U own", teacher: "C/U own", classTeacher: "C/U own", specialistTeacher: "C/U own", schoolAdmin: "U", leadership: "V" },
  // PRD §17/§33: financial permissions are separated from ordinary teacher access.
  fees: { parent: "V child", financeOfficer: "U", schoolAdmin: "V", leadership: "V", auditor: "V" },
  familyAdmissions: {parent:"C/U own"},
  teacherDevelopment: { teacher: "C/U own", classTeacher: "C/U own", specialistTeacher: "C/U own", leadership: "A", superAdmin: "A" },
  staffHR: { schoolAdmin: "U", leadership: "A" },
  assets: { schoolAdmin: "U", technicalAdmin: "U", leadership: "V" },
  library: { librarian: "U", student: "V own", parent: "V child", teacher: "V own", classTeacher: "V own" },
};

const IMPLIES = { U: ["V"], A: ["V"], C: [] };
const SCOPE_WIDTH = ["restricted", "selected", "summary", "published", "own", "child", "relevant", "assigned", "class", "all"];

function parseCell(cell) {
  if (!cell) return null;
  const [actionPart, scope = "all"] = cell.split(" ");
  if (actionPart === "R") return { restricted: true, actions: new Set(), scope: "restricted" };
  const actions = new Set();
  for (const action of actionPart.split("/")) {
    actions.add(action);
    for (const implied of IMPLIES[action] || []) actions.add(implied);
  }
  return { restricted: false, actions, scope };
}

// A Super Administrator holds the widest grant of School Administrator, Leadership and Technical Administrator.
const SUPER_SOURCES = ["schoolAdmin", "leadership", "technicalAdmin"];
function superGrant(module) {
  const own = parseCell(MATRIX[module]?.superAdmin);
  const grants = [own, ...SUPER_SOURCES.map((role) => parseCell(MATRIX[module]?.[role]))].filter((grant) => grant && !grant.restricted);
  if (!grants.length) return own;
  const actions = new Set(grants.flatMap((grant) => [...grant.actions]));
  const scope = grants.map((grant) => grant.scope).sort((a, b) => SCOPE_WIDTH.indexOf(b) - SCOPE_WIDTH.indexOf(a))[0];
  return { restricted: false, actions, scope };
}

export function grantFor(role, module) {
  if (role === "superAdmin") return superGrant(module);
  return parseCell(MATRIX[module]?.[role]);
}

// Widest scope any of the user's roles holds for this action, or null when denied.
// "restricted" means "only with a documented, approved exception".
export function can(roles, module, action = "V") {
  let best = null;
  for (const role of roles || []) {
    const grant = grantFor(role, module);
    if (!grant) continue;
    const scope = grant.restricted ? "restricted" : grant.actions.has(action) ? grant.scope : null;
    if (scope && (!best || SCOPE_WIDTH.indexOf(scope) > SCOPE_WIDTH.indexOf(best))) best = scope;
  }
  return best;
}

// True when a module should appear in navigation (any non-restricted view or create right).
export function canOpen(roles, module) {
  const view = can(roles, module, "V");
  const create = can(roles, module, "C");
  return Boolean((view && view !== "restricted") || (create && create !== "restricted"));
}

// Hubs a person can switch between, highest privilege first (PRD AUTH-001 AC3).
const HUB_ORDER = ["admin", "teacher", "parent", "student"];
export function hubsFor(roles) {
  return HUB_ORDER.filter((hub) => (roles || []).some((role) => ROLES[role]?.hub === hub));
}

export function primaryHub(roles) {
  return hubsFor(roles)[0] || null;
}

export const matrixForTesting = { MATRIX };
