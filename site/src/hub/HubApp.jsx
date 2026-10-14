import { Suspense, lazy } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/AuthProvider";
import { MODULES, ROLES, can, canOpen } from "../auth/permissions";
import { HUB_LABELS, ROUTE_ALIASES, hubIndex, hubRoutes } from "./routes";
import { Loading, PageHeader, Section } from "./ui";
import { CookiePreferencesButton } from "../components/CookiePreferences.jsx";
import "./hub.css";

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const dashboards = () => import("./screens/dashboards");
const records = () => import("./screens/records");
const attendance = () => import("./screens/attendance");
const family = () => import("./screens/family");
const comms = () => import("./screens/comms");
const admin = () => import("./screens/admin");
const content = () => import("./screens/content");
const consent = () => import("./screens/consent");
const setup = () => import("./screens/setup");
const people = () => import("./screens/people");
const system = () => import("./screens/system");
const teaching = () => import("./screens/teaching");
const student = () => import("./screens/student");
const wizard = () => import("./screens/wizard");
const quest = () => import("./screens/quest");
const questAdmin = () => import("./screens/quest-admin");
const nilam = () => import("./screens/nilam");

const StaffAcknowledgementCard = lazyNamed(consent, "StaffAcknowledgement");
const SignIn = lazyNamed(() => import("./SignIn"), "SignIn");

const SCREENS = {
  quest: lazyNamed(quest, "QuestHome"), challenges: lazyNamed(quest, "MyChallenges"), challengePlayer: lazyNamed(quest, "ChallengePlayer"), questBadges: lazyNamed(quest, "QuestBadges"), questJourney: lazyNamed(quest, "QuestJourney"), questLeaderboard: lazyNamed(quest, "QuestLeaderboard"), staffQuest: lazyNamed(quest, "StaffQuest"),
  challengeCms: lazyNamed(questAdmin, "ChallengeCMS"), questReleases: lazyNamed(questAdmin, "ReleaseCalendar"), badgeCms: lazyNamed(questAdmin, "BadgeCMS"), questReview: lazyNamed(questAdmin, "QuestReview"), questSettings: lazyNamed(questAdmin, "EngagementSettings"),
  nilam: lazyNamed(nilam, "Nilam"), parentReading: lazyNamed(nilam, "ParentReading"),
  adminDashboard: lazyNamed(dashboards, "AdminDashboard"), teacherDashboard: lazyNamed(dashboards, "TeacherDashboard"), parentDashboard: lazyNamed(dashboards, "ParentDashboard"), studentDashboard: lazyNamed(student, "StudentDashboard"),
  studentRegister: lazyNamed(records, "StudentRegister"), student360: lazyNamed(records, "Student360"), staffDirectory: lazyNamed(records, "StaffDirectory"), academics: lazyNamed(records, "Academics"),
  attendance: lazyNamed(attendance, "AttendanceHome"), attendanceOverview: lazyNamed(() => import("./screens/attendanceOffice"), "AttendanceOffice"), childAttendance: lazyNamed(attendance, "ChildAttendance"),
  myChildren: lazyNamed(family, "MyChildren"), journey: lazyNamed(family, "Journey"),
  announcements: lazyNamed(comms, "Announcements"), calendar: lazyNamed(comms, "Calendar"), notifications: lazyNamed(comms, "Notifications"), profile: lazyNamed(comms, "Profile"),
  admissions: lazyNamed(admin, "Admissions"), consentOverview: lazyNamed(admin, "ConsentOverview"), showcase: lazyNamed(admin, "Showcase"), audit: lazyNamed(admin, "Audit"),
  content: lazyNamed(content, "Content"), inbox: lazyNamed(content, "Inbox"), parentConsent: lazyNamed(consent, "ParentConsent"), consentPrint: lazyNamed(consent, "ConsentPrint"),
  // School setup, people and assignments (Admin hub)
  setupWizard: lazyNamed(wizard, "SetupWizard"), academicYears: lazyNamed(setup, "AcademicYears"), terms: lazyNamed(setup, "Terms"), standards: lazyNamed(setup, "Standards"), classes: lazyNamed(setup, "Classes"), subjects: lazyNamed(setup, "Subjects"),
  teacherAssignments: lazyNamed(setup, "TeacherAssignments"), enrolments: lazyNamed(setup, "Enrolments"),
  studentsAdmin: lazyNamed(people, "StudentsAdmin"), guardians: lazyNamed(people, "Guardians"), staffAdmin: lazyNamed(people, "StaffAdmin"), guardianLinks: lazyNamed(people, "GuardianLinks"), supportGroups: lazyNamed(people, "SupportGroups"), accounts: lazyNamed(people, "Accounts"),
  rolesMatrix: lazyNamed(system, "RolesMatrix"), settings: lazyNamed(system, "Settings"), announcementsAdmin: lazyNamed(system, "AnnouncementsAdmin"), calendarAdmin: lazyNamed(system, "CalendarAdmin"),
  // Teacher hub
  myClasses: lazyNamed(teaching, "MyClasses"), classDashboard: lazyNamed(teaching, "ClassDashboard"), classRoster: lazyNamed(teaching, "ClassRoster"), teacherPortfolio: lazyNamed(teaching, "TeacherPortfolio"), teacherAnnouncements: lazyNamed(teaching, "TeacherAnnouncements"), teacherEvents: lazyNamed(teaching, "TeacherEvents"),
  // Student hub
  myClass: lazyNamed(student, "MyClass"), myAchievements: lazyNamed(student, "MyAchievements"),
};

function routeAllowed(route, auth) {
  if (route.editorOnly && !can(auth.roles, "engagement", "C")) return false;
  if (route.publisherOnly && !can(auth.roles, "engagement", "A")) return false;
  if (route.staffOnly && !auth.roles.some((role) => !["parent", "student"].includes(role))) return false;
  if (route.requiresClaim) return auth.claims[route.requiresClaim] === true;
  if (route.hub !== "shared" && !auth.hubs.includes(route.hub)) return false;
  return canOpen(auth.roles, route.module);
}

function RequireSignIn() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === "loading") return <div className="hub-loading" role="status">Loading your hub…</div>;
  if (auth.status === "signedOut") return <Navigate to="/login" replace state={auth.userSignedOut ? null : { from: location.pathname + location.search }} />;
  if (!auth.roles.length) return <AccountPending />;
  return <Outlet />;
}

function AccountPending() {
  const { user, signOut, refresh } = useAuth();
  return <div className="hub-message"><h1>Your account isn't linked yet</h1><p>You're signed in as <strong>{user.email}</strong>, but the school office hasn't assigned a hub role to this account.</p><p>Please contact the office, then refresh.</p><div><button type="button" className="hub-button" onClick={refresh}>Refresh access</button><button type="button" className="hub-button hub-button-quiet" onClick={signOut}>Sign out</button></div></div>;
}

function HubHome() {
  const { currentHub } = useAuth();
  return <Navigate to={hubIndex(currentHub)?.path || "/hub/profile"} replace />;
}

function Shell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const own = hubRoutes.filter((route) => route.hub === auth.currentHub && !route.index && !route.hidden && routeAllowed(route, auth));
  // Pupils get one short list; the Admin hub is grouped; other hubs list their own pages, then shared ones.
  const groups = auth.currentHub === "admin" ? [...new Set(own.map((route) => route.group || "More"))].map((group) => ({ hub: group, label: group, routes: own.filter((route) => (route.group || "More") === group) })) : [{ hub: auth.currentHub, label: HUB_LABELS[auth.currentHub], routes: own }];
  const nav = [
    { hub: "dashboard", routes: [hubIndex(auth.currentHub)].filter(Boolean) },
    ...groups,
    ...(auth.currentHub === "student" ? [] : [{ hub: "shared", label: HUB_LABELS.shared, routes: hubRoutes.filter((route) => route.hub === "shared" && !route.hidden && routeAllowed(route, auth)) }]),
  ].filter((group) => group.routes.length);
  const switchTo = (hub) => { auth.switchHub(hub); navigate(hubIndex(hub)?.path || "/hub"); };

  return <div className={`hub-shell hub-shell-${auth.currentHub}`}>
    <a className="hub-skip" href="#hub-main">Skip to content</a>
    <header className="hub-topbar">
      <a href="/" className="hub-brand" aria-label="SRSS Digital Hub · go to the school homepage"><img src="/assets/srss-logo.png" alt="" /><span><strong>SRSS Digital Hub</strong><small>Sekolah Rendah Sathya Sai</small></span></a>
      <div className="hub-topbar-actions">
        {/* Role switcher for people holding several roles (AUTH-001 AC3). */}
        {auth.hubs.length > 1 && <label className="hub-switcher"><span className="hub-visually-hidden">View as</span><select value={auth.currentHub} onChange={(event) => switchTo(event.target.value)}>{auth.hubs.map((hub) => <option key={hub} value={hub}>{HUB_LABELS[hub]}</option>)}</select></label>}
        <Link to="/hub/notifications" className="hub-topbar-link">Notifications</Link>
        <Link to="/hub/profile" className="hub-topbar-link hub-account" title={auth.roles.map((role) => ROLES[role]?.label).join(", ")}>{auth.user.displayName || auth.user.email}</Link>
        <button type="button" onClick={auth.signOut}>Sign out</button>
      </div>
    </header>
    <div className="hub-body">
      <nav aria-label="Hub navigation" className="hub-nav">{nav.map(({ hub, label, routes }) => <div key={hub}>{hub !== "dashboard" && <p>{label}</p>}<ul>{routes.map((route) => <li key={route.path}><NavLink to={route.path} end={route.index || !hubRoutes.some((other) => other.hidden && other.path.startsWith(`${route.path}/`))}>{route.index ? "Dashboard" : route.label}{MODULES[route.module]?.phase > 1 && <span className="hub-phase" title={`Planned for phase ${MODULES[route.module].phase}`}>P{MODULES[route.module].phase}</span>}</NavLink></li>)}</ul></div>)}</nav>
      <main className="hub-main" id="hub-main"><Suspense fallback={null}><StaffAcknowledgementCard /></Suspense><Outlet /></main>
    </div>
    <HubFooter />
  </div>;
}

function Guarded({ route }) {
  const auth = useAuth();
  if (!routeAllowed(route, auth)) return <Unauthorized />;
  const Screen = route.screen && SCREENS[route.screen];
  return Screen ? <Suspense fallback={<Loading />}><Screen /></Suspense> : <ModulePlaceholder route={route} />;
}

// Modules scheduled for later phases: route, navigation and access boundary exist; the workflow follows.
function ModulePlaceholder({ route }) {
  const { roles } = useAuth();
  const module = MODULES[route.module];
  const names = { V: "View", C: "Create", U: "Update", A: "Approve" };
  const scopes = ["V", "C", "U", "A"].map((action) => [action, can(roles, route.module, action)]).filter(([, scope]) => scope && scope !== "restricted");
  return <>
    <PageHeader kicker={`${module?.label} · Phase ${module?.phase}`} title={route.label}>{module?.phase > 1 ? `Scheduled for phase ${module.phase} of the SRSS Digital Hub roadmap.` : "This Jubilee-launch module is being built next."}</PageHeader>
    <Section title="Access and integrations"><dl className="hub-facts">
      <div><dt>Your access</dt><dd>{scopes.length ? scopes.map(([action, scope]) => `${names[action]} (${scope})`).join(", ") : "Navigation only"}</dd></div>
      <div><dt>Google services</dt><dd>{route.google.length ? route.google.join(", ") : "SRSS-native"}</dd></div>
    </dl></Section>
  </>;
}

function Unauthorized() {
  return <div className="hub-message"><h1>You don't have access to this page</h1><p>Your role doesn't include this area of the hub. If you need access, ask the school office — exceptions are approved and recorded.</p><Link className="hub-button" to="/hub">Go to my dashboard</Link></div>;
}

function NotFound() {
  return <div className="hub-message"><h1>Page not found</h1><p>This hub address doesn't exist.</p><Link className="hub-button" to="/hub">Go to my dashboard</Link></div>;
}

export function HubApp() {
  return <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<div className="hub-loading" role="status">Loading…</div>}><SignIn /></Suspense>} />
        {ROUTE_ALIASES.map(([from, to]) => <Route key={from} path={from} element={<Navigate to={to} replace />} />)}
        <Route path="/hub" element={<RequireSignIn />}>
          <Route element={<Shell />}>
            <Route index element={<HubHome />} />
            {hubRoutes.map((route) => <Route key={route.path} path={route.path} element={<Guarded route={route} />} />)}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>;
}

// Shared footer for the hub and sign-in pages: the way back to the public website and the school office.
export function HubFooter() {
  return <footer className="hub-footer">
    <div><strong>Sekolah Rendah Sathya Sai</strong><span>6, Jalan Puchong, Taman Tan Yew Lai, 58200 Kuala Lumpur · <a href="tel:+60126001926">+60 12-600 1926</a> · <a href="mailto:saischoolpuchong@gmail.com">saischoolpuchong@gmail.com</a></span></div>
    <nav aria-label="Hub footer"><a href="/">School website</a><a href="/resources/faq">FAQ</a><a href="/resources/contact">Contact the school</a><a href="/legal/privacy">Privacy Policy</a><a href="/legal/terms">Terms of Use</a><a href="/legal/child-safeguarding#s-4">Child Safeguarding</a><a href="/legal">All Policies →</a></nav>
    <CookiePreferencesButton />
    <small>© {new Date().getFullYear()} Sekolah Rendah Sathya Sai. All rights reserved. · SRSS Digital Hub — an SSIOM Digital Initiative. Platform software © SSIOM.</small>
  </footer>;
}
