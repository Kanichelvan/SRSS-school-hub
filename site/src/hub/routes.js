// Secure hub route metadata — one source of truth for label, hub, permission module, launch phase,
// supporting Google services and the screen that renders it. Navigation follows the PRD "Secure Hub
// navigation" (§3 of the final model); phases follow the revised priority matrix.
// `screen` names a built screen in HubApp; routes without one render the module placeholder.

export const HUB_LABELS = { shared: "My SRSS", admin: "Admin", teacher: "Teaching", parent: "My Family", student: "My Learning" };

export const hubRoutes = [
  { path: "/hub/staff/quest", hub: "shared", label: "SRSS25 Staff Quest", module: "engagement", google: ["Drive", "Docs"], screen: "staffQuest", staffOnly: true },
  { path: "/hub/quest/play/:challengeId", hub: "shared", label: "Challenge", module: "engagement", google: [], screen: "challengePlayer", hidden: true },
  { path: "/hub/staff/passport", hub: "shared", label: "Staff Passport", module: "engagement", google: [], screen: "questJourney", staffOnly: true, hidden: true },
  { path: "/hub/teacher/quest-content", hub: "teacher", label: "Challenge studio", module: "engagement", google: ["Drive", "Docs"], screen: "challengeCms" },
  { path: "/hub/teacher/quest-review", hub: "teacher", label: "Challenge reviews", module: "engagement", google: [], screen: "questReview" },
  { path: "/hub/teacher/nilam", hub: "teacher", label: "Buku NILAM", module: "engagement", google: ["Sheets"], screen: "questReview" },
  { path: "/hub/parent/reading", hub: "parent", label: "Reading journey & achievements", module: "engagement", google: [], screen: "parentReading" },
  { path: "/hub/student/quest", hub: "student", label: "SRSS25 Quest", module: "engagement", google: [], screen: "quest" },
  { path: "/hub/student/challenges", hub: "student", label: "My challenges", module: "engagement", google: [], screen: "challenges" },
  { path: "/hub/student/badges", hub: "student", label: "My badges", module: "engagement", google: [], screen: "questBadges" },
  { path: "/hub/student/nilam", hub: "student", label: "Buku NILAM", module: "engagement", google: [], screen: "nilam" },
  { path: "/hub/student/leaderboard", hub: "student", label: "Leaderboard", module: "engagement", google: [], screen: "questLeaderboard" },
  { path: "/hub/student/journey", hub: "student", label: "My SRSS Journey", module: "engagement", google: [], screen: "questJourney" },
  // Shared — Dashboard | Announcements | Calendar | Messages | Forms & Actions | Search
  { path: "/hub/announcements", hub: "shared", label: "Announcements", module: "announcements", google: ["Gmail", "Groups"], screen: "announcements" },
  { path: "/hub/calendar", hub: "shared", label: "Calendar", module: "calendar", google: ["Calendar"], screen: "calendar" },
  { path: "/hub/messages", hub: "shared", label: "Messages", module: "messages", google: ["Gmail"] },
  { path: "/hub/forms", hub: "shared", label: "Forms & Actions", module: "forms", google: ["Forms", "Drive"] },
  { path: "/hub/notifications", hub: "shared", label: "Notifications", module: "notifications", google: [], screen: "notifications" },
  { path: "/hub/search", hub: "shared", label: "Search", module: "search", google: [] },
  { path: "/hub/profile", hub: "shared", label: "Profile", module: "profile", google: [], screen: "profile", hidden: true },
  { path: "/hub/help", hub: "shared", label: "Help", module: "dashboard", google: [], hidden: true },
  { path: "/hub/students/:studentId", hub: "shared", label: "Student profile", module: "students", google: ["Drive"], screen: "student360", hidden: true },

  // Teacher — Dashboard | My Classes | Attendance | Class notices | Portfolio entries | Class events | Students
  { path: "/hub/teacher", hub: "teacher", label: "Teacher dashboard", module: "dashboard", google: ["Classroom", "Calendar"], screen: "teacherDashboard", index: true },
  { path: "/hub/teacher/classes", hub: "teacher", label: "My classes", module: "academics", google: ["Classroom", "Groups"], screen: "myClasses" },
  { path: "/hub/teacher/classes/:classId", hub: "teacher", label: "Class dashboard", module: "academics", google: [], screen: "classDashboard", hidden: true },
  { path: "/hub/teacher/classes/:classId/roster", hub: "teacher", label: "Class roster", module: "students", google: [], screen: "classRoster", hidden: true },
  { path: "/hub/teacher/attendance", hub: "teacher", label: "Attendance", module: "attendance", google: [], screen: "attendance" },
  { path: "/hub/teacher/attendance/:classId", hub: "teacher", label: "Take attendance", module: "attendance", google: [], screen: "attendance", hidden: true },
  { path: "/hub/teacher/announcements", hub: "teacher", label: "Class notices", module: "announcements", google: ["Gmail"], screen: "teacherAnnouncements" },
  { path: "/hub/teacher/portfolios", hub: "teacher", label: "Portfolio entries", module: "portfolio", google: ["Drive", "Classroom"], screen: "teacherPortfolio" },
  { path: "/hub/teacher/events", hub: "teacher", label: "Class events", module: "calendar", google: ["Calendar"], screen: "teacherEvents" },
  { path: "/hub/teacher/students", hub: "teacher", label: "Students", module: "students", google: [], screen: "studentRegister" },
  { path: "/hub/teacher/teaching", hub: "teacher", label: "Teaching", module: "teaching", google: ["Classroom", "Docs", "Slides", "Drive"] },
  { path: "/hub/teacher/assessments", hub: "teacher", label: "Assessments", module: "assessments", google: ["Sheets"] },
  { path: "/hub/teacher/parents", hub: "teacher", label: "Parents", module: "meetings", google: ["Meet", "Gmail", "Calendar"] },
  { path: "/hub/teacher/resources", hub: "teacher", label: "Resources", module: "documents", google: ["Drive"] },

  // Parent — My Children | Consent | Attendance | Portfolio (+ shared Announcements and Calendar)
  { path: "/hub/parent", hub: "parent", label: "Family dashboard", module: "dashboard", google: ["Calendar"], screen: "parentDashboard", index: true },
  { path: "/hub/parent/children", hub: "parent", label: "My children", module: "students", google: [], screen: "myChildren" },
  { path: "/hub/parent/consent", hub: "parent", label: "Consent choices", module: "consent", google: [], screen: "parentConsent" },
  { path: "/hub/parent/attendance", hub: "parent", label: "Attendance", module: "attendance", google: [], screen: "childAttendance" },
  { path: "/hub/parent/portfolio", hub: "parent", label: "Portfolio · My SRSS Journey", module: "portfolio", google: ["Drive"], screen: "journey" },
  { path: "/hub/parent/progress", hub: "parent", label: "Progress", module: "assessments", google: [] },
  { path: "/hub/parent/tasks", hub: "parent", label: "Tasks", module: "teaching", google: ["Classroom"] },
  { path: "/hub/parent/reports", hub: "parent", label: "Reports", module: "reportCards", google: [] },
  { path: "/hub/parent/fees", hub: "parent", label: "Fees", module: "fees", google: [] },
  { path: "/hub/parent/meetings", hub: "parent", label: "Meetings", module: "meetings", google: ["Meet", "Calendar"] },

  // Student — Today | My Class | My Portfolio | My Achievements | Notices | Calendar (deliberately small)
  { path: "/hub/student", hub: "student", label: "Today", module: "dashboard", google: ["Classroom"], screen: "studentDashboard", index: true },
  { path: "/hub/student/class", hub: "student", label: "My class", module: "dashboard", google: [], screen: "myClass" },
  { path: "/hub/student/portfolio", hub: "student", label: "My portfolio", module: "portfolio", google: ["Drive"], screen: "journey" },
  { path: "/hub/student/achievements", hub: "student", label: "My achievements", module: "achievements", google: [], screen: "myAchievements" },
  { path: "/hub/student/announcements", hub: "student", label: "Notices", module: "announcements", google: [], screen: "announcements" },
  { path: "/hub/student/calendar", hub: "student", label: "Calendar", module: "calendar", google: [], screen: "calendar" },
  { path: "/hub/student/learning", hub: "student", label: "My learning", module: "teaching", google: ["Classroom"], hidden: true },
  { path: "/hub/student/progress", hub: "student", label: "My progress", module: "assessments", google: [], hidden: true },

  // Admin — grouped as the admin hub navigation (user decision, 14 Oct 2026).
  { path: "/hub/admin", hub: "admin", label: "Admin dashboard", module: "dashboard", google: [], screen: "adminDashboard", index: true },
  { path: "/hub/admin/setup", hub: "admin", group: "Overview", label: "School setup wizard", module: "settings", google: [], screen: "setupWizard" },
  { path: "/hub/admin/academic-years", hub: "admin", group: "School setup", label: "Academic years", module: "academics", google: [], screen: "academicYears" },
  { path: "/hub/admin/terms", hub: "admin", group: "School setup", label: "Terms", module: "academics", google: [], screen: "terms" },
  { path: "/hub/admin/standards", hub: "admin", group: "School setup", label: "Standards", module: "academics", google: [], screen: "standards" },
  { path: "/hub/admin/classes", hub: "admin", group: "School setup", label: "Classes", module: "academics", google: ["Classroom"], screen: "classes" },
  { path: "/hub/admin/subjects", hub: "admin", group: "School setup", label: "Subjects", module: "academics", google: [], screen: "subjects" },
  { path: "/hub/admin/students", hub: "admin", group: "People", label: "Students", module: "students", google: ["Drive"], screen: "studentsAdmin" },
  { path: "/hub/admin/guardians", hub: "admin", group: "People", label: "Parents & guardians", module: "guardians", google: [], screen: "guardians" },
  { path: "/hub/admin/staff", hub: "admin", group: "People", label: "Staff & teachers", module: "staff", google: ["Groups"], screen: "staffAdmin" },
  { path: "/hub/admin/accounts", hub: "admin", group: "People", label: "User accounts", module: "accessAdministration", google: ["Admin console"], screen: "accounts" },
  { path: "/hub/admin/enrolments", hub: "admin", group: "Assignments", label: "Student enrolments", module: "students", google: [], screen: "enrolments" },
  { path: "/hub/admin/teacher-assignments", hub: "admin", group: "Assignments", label: "Teacher assignments", module: "academics", google: [], screen: "teacherAssignments" },
  { path: "/hub/admin/guardian-links", hub: "admin", group: "Assignments", label: "Guardian links", module: "guardians", google: [], screen: "guardianLinks" },
  { path: "/hub/admin/support-groups", hub: "admin", group: "Assignments", label: "Remedial group", module: "students", google: [], screen: "supportGroups" },
  { path: "/hub/admin/communications", hub: "admin", group: "Content & communication", label: "Announcements", module: "announcements", google: ["Gmail", "Groups"], screen: "announcementsAdmin" },
  { path: "/hub/admin/calendar", hub: "admin", group: "Content & communication", label: "Calendar", module: "calendar", google: ["Calendar"], screen: "calendarAdmin" },
  { path: "/hub/admin/showcase", hub: "admin", group: "Content & communication", label: "Portfolio moderation", module: "showcase", google: ["Drive"], screen: "showcase" },
  { path: "/hub/admin/content", hub: "admin", group: "Content & communication", label: "Website content", module: "content", google: ["Drive"], screen: "content" },
  { path: "/hub/admin/inbox", hub: "admin", group: "Content & communication", label: "Website inbox", module: "inbox", google: ["Gmail"], screen: "inbox" },
  { path: "/hub/admin/attendance", hub: "admin", group: "School operations", label: "Attendance", module: "attendance", google: ["Sheets"], screen: "attendanceOverview" },
  { path: "/hub/admin/attendance/:classId", hub: "admin", label: "Attendance register", module: "attendance", google: [], screen: "attendance", hidden: true },
  { path: "/hub/admin/admissions", hub: "admin", group: "School operations", label: "Admissions", module: "admissions", google: ["Gmail", "Calendar"], screen: "admissions" },
  { path: "/hub/admin/consent", hub: "admin", group: "School operations", label: "Consent", module: "consent", google: [], screen: "consentOverview" },
  { path: "/hub/consent/print/:studentId?", hub: "admin", label: "Printable consent form", module: "consent", google: [], screen: "consentPrint", hidden: true },
  { path: "/hub/admin/assessments", hub: "admin", group: "School operations", label: "Assessments", module: "assessments", google: ["Sheets"] },
  { path: "/hub/admin/fees", hub: "admin", group: "School operations", label: "Fees", module: "fees", google: ["Sheets"] },
  { path: "/hub/admin/assets", hub: "admin", group: "School operations", label: "Assets", module: "assets", google: ["Drive"] },
  { path: "/hub/admin/reports", hub: "admin", group: "School operations", label: "Reports", module: "reports", google: ["Sheets"] },
  { path: "/hub/admin/engagement/challenges", hub: "admin", group: "Engagement", label: "Challenges", module: "engagement", google: ["Drive", "Docs"], screen: "challengeCms", editorOnly: true },
  { path: "/hub/admin/engagement/releases", hub: "admin", group: "Engagement", label: "Release calendar", module: "engagement", google: [], screen: "questReleases", editorOnly: true },
  { path: "/hub/admin/engagement/badges", hub: "admin", group: "Engagement", label: "Badges & campaigns", module: "engagement", google: [], screen: "badgeCms", editorOnly: true },
  { path: "/hub/admin/engagement/review", hub: "admin", group: "Engagement", label: "Participation & reviews", module: "engagement", google: ["Sheets"], screen: "questReview", publisherOnly: true },
  { path: "/hub/admin/engagement/settings", hub: "admin", group: "Engagement", label: "Quest & NILAM settings", module: "engagement", google: [], screen: "questSettings", publisherOnly: true },
  { path: "/hub/admin/roles", hub: "admin", group: "System", label: "Roles & permissions", module: "accessAdministration", google: ["Admin console", "Groups"], screen: "rolesMatrix" },
  { path: "/hub/admin/settings", hub: "admin", group: "System", label: "Settings", module: "settings", google: ["Admin console"], screen: "settings" },
  { path: "/hub/admin/governance", hub: "admin", group: "System", label: "Audit history", module: "governance", google: ["Vault"], screen: "audit" },
];

export const hubIndex = (hub) => hubRoutes.find((route) => route.hub === hub && route.index);

// Aliases for addresses used in the Developer PRD (PUB-001 AC2).
const ROLE_HUBS = ["admin", "teacher", "parent", "student"];
export const ROUTE_ALIASES = [
  ["/sign-in", "/login"],
  // Developer PRD (/dashboard/{role}) and Dual-Plane brief (/portal/{role}) addresses.
  ...["/dashboard", "/portal"].flatMap((prefix) => [[prefix, "/hub"], ...ROLE_HUBS.map((hub) => [`${prefix}/${hub}`, `/hub/${hub}`])]),
  // Retired prototype addresses (pre-Firebase Parent Hub and /admin CMS).
  ["/hub/admin/academics", "/hub/admin/classes"],
  ["/parent-hub", "/hub/parent"], ["/parent-hub/admin", "/hub/admin/content"], ["/parent-hub/*", "/hub/parent"], ["/admin", "/hub/admin/content"],
];
