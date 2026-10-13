// Role dashboards (PRD §12–15): operational, answering "what do I need to know or do now?".
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { QuestDashboardCard } from "./quest";
import { can } from "../../auth/permissions";
import { announcementsFor, consentItems, currentYearId, daysAgo, eventsFor, getMany, list, listIn, one, today, useLoad } from "../data";
import { HUMAN_VALUES, attendanceByClass, attendanceSummary, completeness, followUpPrompts, nextClass, parentActions, todaysLessons } from "../logic/dashboard";
import { ActionsRequired, ChildSwitcher, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, TrendBars, formatDate } from "../ui";

const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; };
const firstName = (auth) => (auth.user.displayName || auth.user.email || "").split(/[ @]/)[0];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Announcements({ keys, max = 4 }) {
  const { data, loading, error } = useLoad(() => announcementsFor(keys, max), [keys.join("|")]);
  return <Section title="Announcements" action={<Link to="/hub/announcements">All</Link>}>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data?.length ? <EmptyState title="No announcements." /> : <ul className="hub-list">{data.map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.body}</p><small>{formatDate(item.publishedAt)}</small></li>)}</ul>}
  </Section>;
}

function UpcomingEvents({ keys }) {
  const { data, loading, error } = useLoad(() => eventsFor(keys, today()), [keys.join("|")]);
  return <Section title="Upcoming events" action={<Link to="/hub/calendar">Calendar</Link>}>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data?.length ? <EmptyState title="Nothing scheduled." /> : <ul className="hub-list hub-list-dates">{data.slice(0, 4).map((event) => <li key={event.id}><time>{formatDate(event.date)}</time><span><strong>{event.title}</strong><small>{[event.startTime || event.time, event.location].filter(Boolean).join(" · ")}</small></span></li>)}</ul>}
  </Section>;
}

// ---------- Admin / leadership ----------
export function AdminDashboard() {
  const auth = useAuth();
  const { roles } = auth;
  const keys = auth.scope?.audienceKeys || ["school"];
  const canStudents = can(roles, "students", "V") === "all";
  const canAttendance = Boolean(can(roles, "attendance", "V"));
  const canAdmissions = Boolean(can(roles, "admissions", "V"));
  const canFees = Boolean(can(roles, "fees", "V"));
  const canConsent = Boolean(can(roles, "consent", "V"));
  const canModerate = Boolean(can(roles, "showcase", "A"));
  const canInbox = Boolean(can(roles, "inbox", "V"));
  const canSetup = can(roles, "settings", "U") === "all";

  const { data, loading, error } = useLoad(async () => {
    const yearId = await currentYearId();
    const [students, staff, classes, sessions, records, enquiries, applications, consent, fees, portfolio, candidates, messages, enrolments] = await Promise.all([
      canStudents ? list("students", where("status", "==", "active")) : [],
      list("staff", where("status", "==", "active")),
      list("classes", where("academicYearId", "==", yearId || "")),
      canAttendance ? list("attendanceSessions", where("date", ">=", daysAgo(10))) : [],
      canAttendance ? list("attendanceRecords", where("date", ">=", daysAgo(10))) : [],
      canAdmissions ? list("admissionEnquiries", where("status", "in", ["new", "contacted", "visitBooked"])) : [],
      canAdmissions ? list("applications", where("status", "in", ["submitted", "documentsPending", "underReview", "interview", "accepted"])) : [],
      canConsent ? list("studentConsentStatus") : [],
      canFees ? list("studentFeeAssignments") : [],
      canStudents ? list("portfolioEntries", where("date", ">=", daysAgo(30))).catch(() => []) : [],
      canModerate ? list("portfolioEntries", where("visibility", "==", "showcaseCandidate")).catch(() => []) : [],
      canInbox ? list("contactMessages", where("status", "==", "new")).catch(() => []) : [],
      canStudents ? list("enrollments", where("academicYearId", "==", yearId || ""), where("status", "==", "active")).catch(() => []) : [],
    ]);
    return { yearId, students, staff, classes: classes.filter((cls) => (cls.status ?? "active") === "active"), sessions, records, enquiries, applications, consent, fees, portfolio, candidates, messages, enrolments };
  }, [roles.join("|")]);

  const view = useMemo(() => {
    if (!data) return null;
    // Only submitted registers count as completed attendance (ATT-002).
    const submittedToday = new Set(data.sessions.filter((session) => session.date === today() && session.status === "submitted").map((session) => session.id));
    const todayRecords = data.records.filter((record) => record.date === today() && submittedToday.has(record.sessionId));
    const byClass = attendanceByClass([...data.classes].sort((a, b) => a.standard - b.standard), data.sessions, today());
    const submitted = new Set(data.sessions.filter((session) => session.status === "submitted").map((session) => session.id));
    const dates = [...new Set(data.records.filter((record) => submitted.has(record.sessionId)).map((record) => record.date))].sort().slice(-5);
    const trend = dates.map((date) => ({ label: WEEKDAYS[new Date(`${date}T12:00:00`).getDay()], value: attendanceSummary(data.records.filter((record) => record.date === date && submitted.has(record.sessionId))).rate }));
    const incomplete = data.students.filter((student) => !completeness(student).complete);
    const consentGaps = data.consent.filter((status) => !status.types?.photoVideo).length;
    const outstanding = data.fees.reduce((sum, fee) => sum + (fee.outstanding || 0), 0);
    const unenrolled = data.students.filter((student) => !data.enrolments.some((item) => item.studentId === student.id)).length;
    const notTaken = byClass.filter((row) => row.state !== "submitted").length;
    const pending = [
      notTaken && canAttendance ? { to: "/hub/admin/attendance", label: `${notTaken} ${notTaken === 1 ? "class has" : "classes have"} not submitted attendance today` } : null,
      data.candidates.length ? { to: "/hub/admin/showcase", label: `${data.candidates.length} portfolio ${data.candidates.length === 1 ? "entry awaits" : "entries await"} moderation` } : null,
      data.enquiries.length + data.applications.length ? { to: "/hub/admin/admissions", label: `${data.enquiries.length + data.applications.length} admissions to follow up` } : null,
      data.messages.length ? { to: "/hub/admin/inbox", label: `${data.messages.length} new website ${data.messages.length === 1 ? "message" : "messages"}` } : null,
      consentGaps && canConsent ? { to: "/hub/admin/consent", label: `${consentGaps} pupils without photo/video consent answers` } : null,
      unenrolled && canStudents ? { to: "/hub/admin/enrolments", label: `${unenrolled} active ${unenrolled === 1 ? "pupil is" : "pupils are"} not enrolled in a class this year` } : null,
      incomplete.length && canStudents ? { to: "/hub/admin/students", label: `${incomplete.length} incomplete student records` } : null,
    ].filter(Boolean);
    const recentPortfolio = [...data.portfolio].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 5);
    return { todayRecords, byClass, trend, outstanding, pending, recentPortfolio };
  }, [data]);

  return <>
    <PageHeader kicker="Admin dashboard" title={`${greeting()}, ${firstName(auth)}.`} actions={canSetup && <Link className="hub-button hub-button-quiet" to="/hub/admin/setup">School setup wizard</Link>}>A concise picture of the school today.</PageHeader>
    <QuestDashboardCard staff />
    <ErrorNote error={error} />
    {loading || !view ? <Loading /> : <>
      <div className="hub-stats">
        <StatCard label="Active students" value={canStudents ? data.students.length : "—"} detail={canStudents ? `${data.enrolments.length} enrolled this year` : null} to={canStudents ? "/hub/admin/students" : undefined} />
        <StatCard label="Active staff" value={data.staff.length} to="/hub/admin/staff" />
        <StatCard label="Active classes" value={data.classes.length} detail="this academic year" to="/hub/admin/classes" />
        <StatCard label="Attendance today" value={attendanceSummary(view.todayRecords).rate != null ? `${attendanceSummary(view.todayRecords).rate}%` : "—"} detail={`${view.byClass.filter((row) => row.state === "submitted").length} of ${view.byClass.length} classes submitted`} tone={view.byClass.some((row) => row.state !== "submitted") ? "warn" : "good"} to="/hub/admin/attendance" />
        {canFees && <StatCard label="Fees outstanding" value={`RM ${view.outstanding.toLocaleString("en-MY")}`} detail={`${data.fees.filter((fee) => fee.outstanding > 0).length} families`} />}
      </div>
      <div className="hub-grid-2">
        <Section title="Pending actions">{view.pending.length ? <ul className="hub-list hub-list-compact hub-pending">{view.pending.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link><span aria-hidden="true">→</span></li>)}</ul> : <EmptyState title="Nothing waiting.">Every register is in and nothing needs a decision.</EmptyState>}</Section>
        {canAttendance && <Section title="Attendance today" action={<Link to="/hub/admin/attendance">Details</Link>}>
          <ul className="hub-list hub-list-compact">{view.byClass.map((row) => <li key={row.classId}><Link to={`/hub/admin/attendance/${row.classId}`}>{row.className}</Link><StatusBadge status={row.state} label={row.state === "missing" ? "Not taken" : row.state === "open" ? "Not submitted" : undefined} /></li>)}</ul>
          {view.trend.length > 0 && <TrendBars points={view.trend} label="Attendance rate, last five school days (submitted registers only)" />}
        </Section>}
      </div>
      <div className="hub-grid-2">
        <Section title="Recent portfolio activity" action={canModerate ? <Link to="/hub/admin/showcase">Moderation</Link> : null}>{view.recentPortfolio.length ? <ul className="hub-list">{view.recentPortfolio.map((entry) => <li key={entry.id}><strong>{entry.title}</strong><small><Link to={`/hub/students/${entry.studentId}`}>{data.students.find((student) => student.id === entry.studentId)?.name || "Pupil"}</Link> · {formatDate(entry.date)} · <StatusBadge status={entry.visibility} /></small></li>)}</ul> : <EmptyState title="No portfolio entries in the last 30 days." />}</Section>
        <UpcomingEvents keys={keys} />
      </div>
      <Announcements keys={keys} />
    </>}
  </>;
}

// ---------- Teacher ----------
export function TeacherDashboard() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const classIds = auth.scope?.classIds || [];
  const { data, loading, error } = useLoad(async () => {
    const [allAssignments, classes, sessions, records, students, yearId] = await Promise.all([
      list("teacherAssignments", where("teacherUid", "==", auth.user.uid)),
      getMany("classes", classIds),
      listIn("attendanceSessions", "classId", classIds, where("date", "==", today())),
      listIn("attendanceRecords", "classId", classIds, where("date", ">=", daysAgo(30))),
      listIn("students", "currentClassId", classIds),
      currentYearId(),
    ]);
    // Only this year's active assignments count; ended ones are history.
    const assignments = allAssignments.filter((item) => (item.status ?? "active") === "active" && item.academicYearId === yearId);
    const subjects = await getMany("subjects", assignments.map((item) => item.subjectId));
    return { assignments, classes, sessions, records, students, subjects };
  }, [auth.user.uid, classIds.join("|")]);

  const view = useMemo(() => {
    if (!data) return null;
    const label = (assignment) => `${data.classes.find((cls) => cls.id === assignment.classId)?.name ?? assignment.classId} · ${data.subjects.find((subject) => subject.id === assignment.subjectId)?.name ?? assignment.subjectId}`;
    const next = nextClass(data.assignments);
    const lessons = todaysLessons(data.assignments);
    const states = attendanceByClass(data.classes, data.sessions, today());
    const prompts = followUpPrompts(data.records).map((prompt) => ({ ...prompt, student: data.students.find((student) => student.id === prompt.studentId) }));
    return { label, next, lessons, states, prompts };
  }, [data]);

  return <>
    <PageHeader kicker="Teacher dashboard" title={`${greeting()}, ${firstName(auth)}.`}>Today's work first.</PageHeader>
    <QuestDashboardCard staff />
    <ErrorNote error={error} />
    {loading || !view ? <Loading /> : <>
      {view.next ? <section className="hub-next">
        <div><p className="hub-kicker">{view.next.offset === 0 ? "Your next class" : `Next class · ${WEEKDAYS[view.next.day]}`}</p><h2>{view.label(view.next)} · {view.next.time}</h2></div>
        <span className="hub-form-actions"><Link className="hub-button" to={`/hub/teacher/attendance/${view.next.classId}`}>Take attendance</Link><Link className="hub-button hub-button-quiet" to={`/hub/teacher/classes/${view.next.classId}`}>Open class</Link></span>
      </section> : <EmptyState title="No classes assigned yet.">The school office assigns classes and subjects.</EmptyState>}
      <div className="hub-grid-2">
        <Section title="Today's lessons">{view.lessons.length ? <ul className="hub-list hub-list-dates">{view.lessons.map((lesson) => <li key={`${lesson.id}-${lesson.time}`}><time>{lesson.time}</time><span><strong>{view.label(lesson)}</strong></span></li>)}</ul> : <EmptyState title="No lessons today." />}</Section>
        <Section title="My classes · attendance today" action={<Link to="/hub/teacher/attendance">Attendance</Link>}>
          <ul className="hub-list hub-list-compact">{view.states.map((row) => <li key={row.classId}><Link to={`/hub/teacher/classes/${row.classId}`}>{row.className}</Link><StatusBadge status={row.state} label={row.state === "missing" ? "Not taken" : row.state === "open" ? "Not submitted" : undefined} /></li>)}</ul>
        </Section>
      </div>
      <div className="hub-grid-2">
        <Section title="Students requiring follow-up">
          {view.prompts.length ? <ul className="hub-list">{view.prompts.map((prompt) => <li key={prompt.studentId}><Link to={`/hub/students/${prompt.studentId}`}><strong>{prompt.student?.name ?? prompt.studentId}</strong></Link><p>{prompt.message}</p></li>)}</ul> : <EmptyState title="No follow-up prompts.">Prompts appear for review; they never label a child.</EmptyState>}
        </Section>
        <UpcomingEvents keys={keys} />
      </div>
      <div className="hub-grid-2">
        <Section title="Pending assessments & report comments"><EmptyState title="Phase 2 module.">The gradebook and report-card workflow arrive with SRSS Learn.</EmptyState></Section>
        <Announcements keys={keys} max={3} />
      </div>
    </>}
  </>;
}

// ---------- Parent ----------
export function ParentDashboard() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const childIds = auth.scope?.childIds || [];
  const [selected, setSelected] = useState(null);
  const { data, loading, error } = useLoad(async () => {
    const children = (await getMany("students", childIds)).sort((a, b) => (b.currentStandard || 0) - (a.currentStandard || 0));
    const [definitions, statuses, requests, fees] = await Promise.all([
      consentItems(),
      getMany("studentConsentStatus", childIds),
      list("formSubmissions", where("requestedFromUid", "==", auth.user.uid), where("status", "==", "pending")),
      can(auth.roles, "fees", "V") ? listIn("studentFeeAssignments", "studentId", childIds) : [],
    ]);
    return { children, definitions, statuses, requests, fees };
  }, [childIds.join("|")]);

  useEffect(() => { if (data?.children.length && !selected) setSelected(data.children[0].id); }, [data, selected]);
  const child = data?.children.find((item) => item.id === selected);
  const actions = useMemo(() => data ? parentActions({ children: data.children, consentDefinitions: data.definitions, consentStatus: Object.fromEntries(data.statuses.map((status) => [status.id, status])), formRequests: data.requests, fees: data.fees }) : [], [data]);

  const childData = useLoad(async () => {
    if (!child) return null;
    const [records, entries, observations] = await Promise.all([
      list("attendanceRecords", where("studentId", "==", child.id), where("date", ">=", daysAgo(60))),
      list("portfolioEntries", where("studentId", "==", child.id), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"])),
      list("humanValuesObservations", where("studentId", "==", child.id), where("familyVisible", "==", true)),
    ]);
    return { records, entries: entries.filter((entry) => entry.status !== "archived").sort((a, b) => String(b.date).localeCompare(String(a.date))), observations };
  }, [child?.id]);

  return <>
    <PageHeader kicker="Parent dashboard" title={`${greeting()}, ${firstName(auth)}.`}>{child ? `Here is what's happening for ${child.preferredName || child.name}.` : "Your family's school day, in one place."}</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data?.children.length ? <EmptyState title="No children are linked to this account yet.">Please contact the school office to link your account.</EmptyState> : <>
      <ChildSwitcher children={data.children} selectedId={selected} onSelect={setSelected} />
      <ActionsRequired actions={actions} />
      {child && <>
        <div className="hub-stats">
          <StatCard label="Attendance (60 days)" value={childData.data ? `${attendanceSummary(childData.data.records).rate ?? "—"}%` : "…"} detail={childData.data ? `${attendanceSummary(childData.data.records).counts.absent} absent · ${attendanceSummary(childData.data.records).counts.late} late` : null} to="/hub/parent/attendance" />
          <StatCard label="Class" value={child.currentStandard ? `Standard ${child.currentStandard}` : "—"} to={`/hub/students/${child.id}`} detail="Open profile" />
          <StatCard label="Portfolio entries" value={childData.data?.entries.length ?? "…"} to="/hub/parent/portfolio" detail="My SRSS Journey" />
          {data.fees.length > 0 && <StatCard label="Fees" value={(() => { const fee = data.fees.find((item) => item.studentId === child.id); return fee ? (fee.outstanding > 0 ? `RM ${fee.outstanding.toLocaleString("en-MY")} due` : "Paid") : "—"; })()} tone={data.fees.find((item) => item.studentId === child.id)?.outstanding > 0 ? "warn" : "good"} />}
        </div>
        <div className="hub-grid-2">
          <Section title="Portfolio highlight" action={<Link to="/hub/parent/portfolio">Journey</Link>}>
            {childData.loading ? <Loading /> : childData.data?.entries[0] ? <article className="hub-highlight"><strong>{childData.data.entries[0].title}</strong><p>{childData.data.entries[0].teacherObservation}</p>{(childData.data.entries[0].humanValues || [childData.data.entries[0].humanValue].filter(Boolean)).map((value) => <StatusBadge key={value} status="good" label={HUMAN_VALUES[value]} />)}</article> : <EmptyState title="No shared portfolio entries yet." />}
          </Section>
          <Section title="Human Excellence">
            {childData.loading ? <Loading /> : childData.data?.observations.length ? <ul className="hub-list">{childData.data.observations.slice(0, 2).map((item) => <li key={item.id}><strong>{HUMAN_VALUES[item.value]}</strong><p>{item.observation}</p></li>)}</ul> : <EmptyState title="No observations shared yet." />}
          </Section>
        </div>
      </>}
      <div className="hub-grid-2"><UpcomingEvents keys={keys} /><Announcements keys={keys} max={3} /></div>
    </>}
  </>;
}

// ---------- Student (deliberately simple: large cards, few choices) ----------
export function StudentDashboard() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const studentId = auth.scope?.studentId;
  const { data, loading, error } = useLoad(async () => {
    if (!studentId) return null;
    const [entries, achievements, events, notices] = await Promise.all([
      list("portfolioEntries", where("studentId", "==", studentId), where("visibility", "in", ["family", "showcaseCandidate", "publicShowcase"])),
      list("studentAchievements", where("studentId", "==", studentId), where("visibility", "in", ["family", "public"])),
      eventsFor(keys, today()),
      announcementsFor(keys, 3),
    ]);
    return { entries, achievements, events, notices };
  }, [studentId]);
  return <div className="hub-student">
    <PageHeader kicker={new Intl.DateTimeFormat("en-MY", { weekday: "long", day: "numeric", month: "long" }).format(new Date())} title={`${greeting()}, ${firstName(auth)}!`} />
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data ? <EmptyState title="Your account isn't linked to a student record yet." /> : <div className="hub-student-cards">
      <Link className="hub-big-card hub-big-today" to="/hub/student"><span>Today</span><strong>{data.notices[0]?.title || "Have a wonderful day!"}</strong></Link>
      <Link className="hub-big-card hub-big-work" to="/hub/student/portfolio"><span>My work</span><strong>{data.entries.length} portfolio {data.entries.length === 1 ? "piece" : "pieces"}</strong></Link>
      <Link className="hub-big-card hub-big-awards" to="/hub/student/achievements"><span>My achievements</span><strong>{data.achievements[0]?.title || "Keep going!"}</strong></Link>
      <Link className="hub-big-card hub-big-week" to="/hub/calendar"><span>Coming up</span><strong>{data.events[0] ? `${data.events[0].title} · ${formatDate(data.events[0].date)}` : "Nothing yet"}</strong></Link>
    </div>}
  </div>;
}
