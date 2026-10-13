import { Suspense, lazy } from "react";
import { BrowserRouter, Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/AuthProvider";
import { MODULES, ROLES, can, canOpen } from "../auth/permissions";
import { HUB_LABELS, ROUTE_ALIASES, hubIndex, hubRoutes, navRoutesFor } from "./routes";
import { SignIn } from "./SignIn";
import { getMany, useLoad } from "./data";
import { EmptyState, Loading, PageHeader, Section } from "./ui";
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
const academics = () => import("./screens/academics");
const assessments = () => import("./screens/assessments");

const StaffAcknowledgementCard = lazyNamed(consent, "StaffAcknowledgement");

const SCREENS = {
  adminDashboard: lazyNamed(dashboards, "AdminDashboard"), teacherDashboard: lazyNamed(dashboards, "TeacherDashboard"), parentDashboard: lazyNamed(dashboards, "ParentDashboard"), studentDashboard: lazyNamed(dashboards, "StudentDashboard"),
  studentRegister: lazyNamed(records, "StudentRegister"), student360: lazyNamed(records, "Student360"), staffDirectory: lazyNamed(records, "StaffDirectory"), academics: lazyNamed(records, "Academics"),
  attendance: lazyNamed(attendance, "AttendanceHome"), attendanceOverview: lazyNamed(attendance, "AttendanceOverview"), childAttendance: lazyNamed(attendance, "ChildAttendance"),
  myChildren: lazyNamed(family, "MyChildren"), journey: lazyNamed(family, "Journey"), myClasses: MyClasses,
  announcements: lazyNamed(comms, "Announcements"), calendar: lazyNamed(comms, "Calendar"), notifications: lazyNamed(comms, "Notifications"), profile: lazyNamed(comms, "Profile"),
  admissions: lazyNamed(admin, "Admissions"), consentOverview: lazyNamed(admin, "ConsentOverview"), showcase: lazyNamed(admin, "Showcase"), audit: lazyNamed(admin, "Audit"),
  content: lazyNamed(content, "Content"), inbox: lazyNamed(content, "Inbox"), parentConsent: lazyNamed(consent, "ParentConsent"), consentPrint: lazyNamed(consent, "ConsentPrint"),
  academicsOverview: lazyNamed(academics, "AcademicsOverview"), curriculumPlans: lazyNamed(academics, "CurriculumPlans"), lessonPlans: lazyNamed(academics, "LessonPlans"), lessonPlanEditor: lazyNamed(academics, "LessonPlanEditor"),
  learningTasks: lazyNamed(academics, "LearningTasks"), learningTaskDetail: lazyNamed(academics, "LearningTaskDetail"), familyTasks: lazyNamed(academics, "FamilyTasks"),
  assessments: lazyNamed(assessments, "AssessmentsHome"), assessmentSetup: lazyNamed(assessments, "AssessmentSetup"), markEntry: lazyNamed(assessments, "MarkEntry"), familyResults: lazyNamed(assessments, "FamilyResults"),
};

function routeAllowed(route, auth) {
  if (route.requiresClaim) return auth.claims[route.requiresClaim] === true;
  if (route.hub === "staff") { if (!route.navHubs.some((hub) => auth.hubs.includes(hub))) return false; }
  else if (route.hub !== "shared" && !auth.hubs.includes(route.hub)) return false;
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
  const nav = [
    { hub: "dashboard", routes: [hubIndex(auth.currentHub)].filter(Boolean) },
    { hub: "shared", routes: hubRoutes.filter((route) => route.hub === "shared" && !route.hidden && routeAllowed(route, auth)) },
    { hub: auth.currentHub, routes: navRoutesFor(auth.currentHub).filter((route) => !route.index && !route.hidden && routeAllowed(route, auth)) },
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
      <nav aria-label="Hub navigation" className="hub-nav">{nav.map(({ hub, routes }) => <div key={hub}>{hub !== "dashboard" && <p>{HUB_LABELS[hub]}</p>}<ul>{routes.map((route) => <li key={route.path}><NavLink to={route.path} end={route.hub !== "staff"}>{route.index ? "Dashboard" : route.label}{MODULES[route.module]?.phase > 1 && <span className="hub-phase" title={`Planned for phase ${MODULES[route.module].phase}`}>P{MODULES[route.module].phase}</span>}</NavLink></li>)}</ul></div>)}</nav>
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

function MyClasses() {
  const auth = useAuth();
  const classIds = auth.scope?.classIds || [];
  const { data, loading } = useLoad(() => getMany("classes", classIds), [classIds.join("|")]);
  return <>
    <PageHeader kicker="Teaching" title="My classes">Classes you teach this year.</PageHeader>
    {loading ? <Loading /> : !data.length ? <EmptyState title="No classes assigned yet." /> : <ul className="hub-cards">{data.sort((a, b) => a.standard - b.standard).map((cls) => <li key={cls.id} className="hub-card"><div className="hub-card-top"><strong>{cls.name}</strong>{auth.scope?.homeroomClassIds?.includes(cls.id) && <span className="hub-badge hub-tone-info">Class teacher</span>}</div><small>Standard {cls.standard} · {cls.room}</small><div className="hub-form-actions"><Link className="hub-button hub-button-small" to={`/hub/teacher/attendance/${cls.id}`}>Attendance</Link><Link className="hub-button hub-button-quiet hub-button-small" to="/hub/teacher/students">Students</Link></div></li>)}</ul>}
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
        <Route path="/login" element={<SignIn />} />
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
    <small>© {new Date().getFullYear()} Sekolah Rendah Sathya Sai. All rights reserved. · SRSS Digital Hub — an SSIOM Digital Initiative. Platform software © SSIOM.</small>
  </footer>;
}
