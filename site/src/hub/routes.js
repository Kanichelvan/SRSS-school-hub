// Secure hub route metadata — one source of truth for label, hub, permission module, launch phase,
// supporting Google services and the screen that renders it. Navigation follows the PRD "Secure Hub
// navigation" (§3 of the final model); phases follow the revised priority matrix.
// `screen` names a built screen in HubApp; routes without one render the module placeholder.
// `hub: "staff"` routes are shared by the Teaching and Admin hubs: `navHubs` lists the hubs that show them
// and `navAfter` the entry they follow in each hub's navigation.

export const HUB_LABELS = { shared: "My SRSS", admin: "Admin", teacher: "Teaching", parent: "My Family", student: "My Learning" };

export const hubRoutes = [
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

  // Teacher — My Classes | Attendance | Teaching | Assessments | Students | Portfolios | Parents | Resources
  { path: "/hub/teacher", hub: "teacher", label: "Teacher dashboard", module: "dashboard", google: ["Classroom", "Calendar"], screen: "teacherDashboard", index: true },
  { path: "/hub/teacher/classes", hub: "teacher", label: "My classes", module: "academics", google: ["Classroom", "Groups"], screen: "myClasses" },
  { path: "/hub/teacher/attendance", hub: "teacher", label: "Attendance", module: "attendance", google: [], screen: "attendance" },
  { path: "/hub/teacher/attendance/:classId", hub: "teacher", label: "Take attendance", module: "attendance", google: [], screen: "attendance", hidden: true },
  { path: "/hub/teacher/students", hub: "teacher", label: "Students", module: "students", google: [], screen: "studentRegister" },
  { path: "/hub/teacher/portfolios", hub: "teacher", label: "Portfolios", module: "portfolio", google: ["Drive", "Classroom"] },
  { path: "/hub/teacher/parents", hub: "teacher", label: "Parents", module: "meetings", google: ["Meet", "Gmail", "Calendar"] },
  { path: "/hub/teacher/resources", hub: "teacher", label: "Resources", module: "documents", google: ["Drive"] },

  // Parent — My Children | Progress | Attendance | Portfolio | Tasks | Reports | Fees | Meetings
  { path: "/hub/parent", hub: "parent", label: "Family dashboard", module: "dashboard", google: ["Calendar"], screen: "parentDashboard", index: true },
  { path: "/hub/parent/children", hub: "parent", label: "My children", module: "students", google: [], screen: "myChildren" },
  { path: "/hub/parent/consent", hub: "parent", label: "Consent choices", module: "consent", google: [], screen: "parentConsent" },
  { path: "/hub/parent/progress", hub: "parent", label: "Progress", module: "assessments", google: [], screen: "familyResults" },
  { path: "/hub/parent/attendance", hub: "parent", label: "Attendance", module: "attendance", google: [], screen: "childAttendance" },
  { path: "/hub/parent/portfolio", hub: "parent", label: "Portfolio · My SRSS Journey", module: "portfolio", google: ["Drive"], screen: "journey" },
  { path: "/hub/parent/tasks", hub: "parent", label: "Tasks", module: "teaching", google: ["Classroom"], screen: "familyTasks" },
  { path: "/hub/parent/reports", hub: "parent", label: "Reports", module: "reportCards", google: [] },
  { path: "/hub/parent/fees", hub: "parent", label: "Fees", module: "fees", google: [] },
  { path: "/hub/parent/meetings", hub: "parent", label: "Meetings", module: "meetings", google: ["Meet", "Calendar"] },

  // Student — Today | My Learning | My Portfolio | My Progress | Achievements (kept deliberately small)
  { path: "/hub/student", hub: "student", label: "Today", module: "dashboard", google: ["Classroom"], screen: "studentDashboard", index: true },
  { path: "/hub/student/learning", hub: "student", label: "My learning", module: "teaching", google: ["Classroom"], screen: "familyTasks" },
  { path: "/hub/student/portfolio", hub: "student", label: "My portfolio", module: "portfolio", google: ["Drive"], screen: "journey" },
  { path: "/hub/student/progress", hub: "student", label: "My progress", module: "assessments", google: [], screen: "familyResults" },
  { path: "/hub/student/achievements", hub: "student", label: "My achievements", module: "achievements", google: [] },

  // Admin — Students | Staff | Academics | Admissions | Attendance | Assessments | Communications |
  //         Content | Fees | Assets | Reports | Governance | Settings
  { path: "/hub/admin", hub: "admin", label: "Admin dashboard", module: "dashboard", google: [], screen: "adminDashboard", index: true },
  { path: "/hub/admin/students", hub: "admin", label: "Students", module: "students", google: ["Drive"], screen: "studentRegister" },
  { path: "/hub/admin/staff", hub: "admin", label: "Staff", module: "staff", google: ["Groups"], screen: "staffDirectory" },
  { path: "/hub/admin/academics", hub: "admin", label: "Academic structure", module: "academics", google: ["Classroom"], screen: "academics" },
  { path: "/hub/admin/admissions", hub: "admin", label: "Admissions", module: "admissions", google: ["Gmail", "Calendar"], screen: "admissions" },
  { path: "/hub/admin/attendance", hub: "admin", label: "Attendance", module: "attendance", google: ["Sheets"], screen: "attendanceOverview" },
  { path: "/hub/admin/communications", hub: "admin", label: "Communications", module: "announcements", google: ["Gmail", "Groups"], screen: "announcements" },
  { path: "/hub/admin/consent", hub: "admin", label: "Consent", module: "consent", google: [], screen: "consentOverview" },
  { path: "/hub/consent/print/:studentId?", hub: "admin", label: "Printable consent form", module: "consent", google: [], screen: "consentPrint", hidden: true },
  { path: "/hub/admin/showcase", hub: "admin", label: "Showcase moderation", module: "showcase", google: ["Drive"], screen: "showcase" },
  { path: "/hub/admin/content", hub: "admin", label: "Content", module: "content", google: ["Drive"], screen: "content" },
  { path: "/hub/admin/inbox", hub: "admin", label: "Website inbox", module: "inbox", google: ["Gmail"], screen: "inbox" },
  { path: "/hub/admin/fees", hub: "admin", label: "Fees", module: "fees", google: ["Sheets"] },
  { path: "/hub/admin/assets", hub: "admin", label: "Assets", module: "assets", google: ["Drive"] },
  { path: "/hub/admin/reports", hub: "admin", label: "Reports", module: "reports", google: ["Sheets"] },
  { path: "/hub/admin/governance", hub: "admin", label: "Governance", module: "governance", google: ["Vault"], screen: "audit" },
  { path: "/hub/admin/settings", hub: "admin", label: "Settings", module: "settings", google: ["Admin console"] },
  { path: "/hub/admin/roles", hub: "admin", label: "Roles & access", module: "accessAdministration", google: ["Admin console", "Groups"], requiresClaim: "accessAdmin" },

  // Academic operations (Stage 1) — shared by teachers, the Academic Coordinator and leadership.
  ...[
    { path: "/hub/academics", label: "Academics", module: "teaching", google: ["Docs", "Slides", "Drive", "Classroom"], screen: "academicsOverview", navAfter: { teacher: "/hub/teacher/attendance", admin: "/hub/admin/attendance" } },
    { path: "/hub/academics/curriculum", label: "Curriculum", module: "teaching", google: ["Drive"], screen: "curriculumPlans", hidden: true },
    { path: "/hub/academics/lessons", label: "Lesson plans", module: "teaching", google: ["Docs", "Slides", "Drive"], screen: "lessonPlans", hidden: true },
    { path: "/hub/academics/lessons/:lessonId", label: "Lesson plan", module: "teaching", google: ["Docs", "Slides", "Drive"], screen: "lessonPlanEditor", hidden: true },
    { path: "/hub/academics/tasks", label: "Learning tasks", module: "teaching", google: ["Drive", "Forms", "Classroom"], screen: "learningTasks", hidden: true },
    { path: "/hub/academics/tasks/:taskId", label: "Learning task", module: "teaching", google: ["Drive", "Forms", "Classroom"], screen: "learningTaskDetail", hidden: true },
    { path: "/hub/assessments", label: "Assessments", module: "assessments", google: ["Sheets"], screen: "assessments", navAfter: { teacher: "/hub/academics", admin: "/hub/academics" } },
    { path: "/hub/assessments/setup", label: "Assessment setup", module: "assessments", google: [], screen: "assessmentSetup", hidden: true },
    { path: "/hub/assessments/marks/:periodId/:assessmentId/:classId", label: "Mark sheet", module: "assessments", google: ["Sheets"], screen: "markEntry", hidden: true },
  ].map((route) => ({ hub: "staff", navHubs: ["teacher", "admin"], ...route })),
];

export const hubIndex = (hub) => hubRoutes.find((route) => route.hub === hub && route.index);

// Navigation entries for a hub, with shared staff routes placed after their `navAfter` entry.
export function navRoutesFor(hub, routes = hubRoutes) {
  const own = routes.filter((route) => route.hub === hub);
  const shared = routes.filter((route) => route.hub === "staff" && route.navHubs?.includes(hub));
  const ordered = [...own];
  for (const route of shared) {
    const after = ordered.findIndex((item) => item.path === route.navAfter?.[hub]);
    ordered.splice(after >= 0 ? after + 1 : ordered.length, 0, route);
  }
  return ordered;
}

// Aliases for addresses used in the Developer PRD (PUB-001 AC2).
const ROLE_HUBS = ["admin", "teacher", "parent", "student"];
export const ROUTE_ALIASES = [
  ["/sign-in", "/login"],
  // Developer PRD (/dashboard/{role}) and Dual-Plane brief (/portal/{role}) addresses.
  ...["/dashboard", "/portal"].flatMap((prefix) => [[prefix, "/hub"], ...ROLE_HUBS.map((hub) => [`${prefix}/${hub}`, `/hub/${hub}`])]),
  // Retired prototype addresses (pre-Firebase Parent Hub and /admin CMS).
  // Moved 13 Oct 2026 when Academics and Assessments became shared staff modules.
  ["/hub/teacher/teaching", "/hub/academics"], ["/hub/teacher/assessments", "/hub/assessments"], ["/hub/admin/assessments", "/hub/assessments"],
  ["/parent-hub", "/hub/parent"], ["/parent-hub/admin", "/hub/admin/content"], ["/parent-hub/*", "/hub/parent"], ["/admin", "/hub/admin/content"],
];
