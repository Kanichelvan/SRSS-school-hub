// Must match ROLE_IDS and OFFICE_ASSIGNABLE_ROLES in src/auth/permissions.js — `npm test` in site/ checks this.
export const ROLE_IDS = ["superAdmin","student","parent","teacher","classTeacher","specialistTeacher","academicCoordinator","schoolAdmin","admissionsOfficer","attendanceManager","financeOfficer","leadership","safeguardingLead","privacySteward","portfolioModerator","contentEditor","technicalAdmin","librarian","auditor"];
// The school office (schoolAdmin) may grant or remove only these; every other role needs a Super Administrator.
export const OFFICE_ASSIGNABLE_ROLES = ["parent","student","teacher","classTeacher","specialistTeacher"];
