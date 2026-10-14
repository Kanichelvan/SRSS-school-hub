// Student hub — kept deliberately simple for Standard 1–6 pupils: large cards, short words, few choices.
// A pupil reads only their own records (firestore.rules: isSelf) and notices addressed to them.
import { Link } from "react-router-dom";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { QuestDashboardCard, JourneySummary } from "./quest";
import { announcementsFor, daysAgo, eventsFor, getMany, list, one, schoolSettings, today, useLoad } from "../data";
import { HUMAN_VALUES, attendanceSummary } from "../logic/dashboard";
import { FAMILY_VISIBLE, categoryOf, humanValuesOf, visibleToFamily } from "../portfolio";
import { EmptyState, ErrorNote, Loading, PageHeader, formatDate } from "../ui";

const greeting = () => { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; };
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function NotLinked() {
  return <EmptyState title="Your account isn't linked to your school record yet.">Please tell your teacher.</EmptyState>;
}

async function myRecord(auth) {
  const studentId = auth.scope?.studentId;
  if (!studentId) return null;
  const me = await one(`students/${studentId}`);
  const cls = me?.currentClassId ? await one(`classes/${me.currentClassId}`) : null;
  return { me, cls };
}

export function StudentDashboard() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const { data, loading, error } = useLoad(async () => {
    const mine = await myRecord(auth);
    if (!mine) return null;
    const id = mine.me.id;
    const [entries, achievements, events, notices, records] = await Promise.all([
      list("portfolioEntries", where("studentId", "==", id), where("visibility", "in", FAMILY_VISIBLE)),
      list("studentAchievements", where("studentId", "==", id), where("visibility", "in", ["family", "public"])),
      eventsFor(keys, today()), announcementsFor(keys, 5),
      list("attendanceRecords", where("studentId", "==", id), where("date", ">=", daysAgo(30))),
    ]);
    return { ...mine, entries: entries.filter(visibleToFamily), achievements, events, notices: notices.filter((item) => !item.expiresAt || item.expiresAt >= today()), records };
  }, [auth.scope?.studentId]);
  const name = data?.me?.preferredName || (auth.user.displayName || "").split(" ")[0];
  return <div className="hub-student">
    <PageHeader kicker={`${WEEKDAYS[new Date().getDay()]} ${formatDate(today(), { day: "numeric", month: "long" })}`} title={`${greeting()}, ${name}!`} />
    <ErrorNote error={error} />
    <QuestDashboardCard />
    {loading ? <Loading /> : !data ? <NotLinked /> : <div className="hub-student-cards">
      <Link className="hub-big-card hub-big-today" to="/hub/student/announcements"><span>Notices</span><strong>{data.notices[0]?.title || "No new notices today"}</strong>{data.notices.length > 1 && <small>+{data.notices.length - 1} more</small>}</Link>
      <Link className="hub-big-card hub-big-class" to="/hub/student/class"><span>My class</span><strong>{data.cls?.name || "Not in a class yet"}</strong>{attendanceSummary(data.records).total > 0 && <small>I was at school {attendanceSummary(data.records).total - attendanceSummary(data.records).counts.absent} of the last {attendanceSummary(data.records).total} school days</small>}</Link>
      <Link className="hub-big-card hub-big-work" to="/hub/student/portfolio"><span>My portfolio</span><strong>{data.entries.length} {data.entries.length === 1 ? "piece of work" : "pieces of work"}</strong>{data.entries[0] && <small>Latest: {data.entries.sort((a, b) => String(b.date).localeCompare(String(a.date)))[0].title}</small>}</Link>
      <Link className="hub-big-card hub-big-awards" to="/hub/student/achievements"><span>My achievements</span><strong>{data.achievements[0]?.title || "Keep going — your achievements will appear here!"}</strong></Link>
      <Link className="hub-big-card hub-big-week" to="/hub/student/calendar"><span>Coming up</span><strong>{data.events[0] ? data.events[0].title : "Nothing planned yet"}</strong>{data.events[0] && <small>{formatDate(data.events[0].date, { weekday: "long", day: "numeric", month: "long" })}</small>}</Link>
    </div>}
  </div>;
}

export function MyClass() {
  const auth = useAuth();
  const keys = auth.scope?.audienceKeys || ["school"];
  const { data, loading, error } = useLoad(async () => {
    const mine = await myRecord(auth);
    if (!mine?.cls) return mine;
    const [assignments, subjects, notices, records] = await Promise.all([
      list("teacherAssignments", where("classId", "==", mine.cls.id)), list("subjects"),
      announcementsFor([`class:${mine.cls.id}`].filter((key) => keys.includes(key)), 5),
      list("attendanceRecords", where("studentId", "==", mine.me.id), where("date", ">=", daysAgo(30))),
    ]);
    const active = assignments.filter((item) => (item.status ?? "active") === "active");
    const settings = await schoolSettings();
    const weekday = new Date().getDay();
    const ends = (mine.cls.standard === 1 ? settings.timings?.standard1 : settings.timings?.standards2to6)?.[weekday];
    const [staff, classTeacher] = await Promise.all([getMany("staff", active.map((item) => item.staffId)), mine.cls.classTeacherUid ? list("staff", where("uid", "==", mine.cls.classTeacherUid), where("directoryVisible", "==", true)).catch(() => []) : []]);
    return { ...mine, hours: ends ? `${settings.schoolStart || "07:40"} – ${ends}` : null, arriveBy: settings.arriveBy || null, classTeacher: classTeacher[0]?.name || null, teachers: active.map((item) => ({ ...item, subject: subjects.find((subject) => subject.id === item.subjectId)?.name || item.subjectId, teacher: staff.find((person) => person.id === item.staffId)?.name })), notices, records };
  }, [auth.scope?.studentId]);
  return <div className="hub-student">
    <PageHeader kicker="My class" title={data?.cls?.name || "My class"}>{data?.cls ? `Standard ${data.cls.standard}${data.cls.room ? ` · ${data.cls.room}` : ""}` : null}</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data ? <NotLinked /> : !data.cls ? <EmptyState title="You're not in a class yet.">Your teacher will add you soon.</EmptyState> : <>
      {data.hours && <section className="hub-student-panel hub-student-hero"><h2>School today</h2><p className="hub-student-big"><strong>{data.hours}</strong>{data.arriveBy ? ` · please arrive by ${data.arriveBy}` : ""}</p></section>}
      {data.classTeacher && <section className="hub-student-panel hub-student-hero"><h2>My class teacher</h2><p className="hub-student-big"><strong>{data.classTeacher}</strong></p></section>}
      <section className="hub-student-panel"><h2>My teachers</h2>{data.teachers.length ? <ul className="hub-student-list">{data.teachers.sort((a, b) => a.subject.localeCompare(b.subject)).map((item) => <li key={item.id}><strong>{item.subject}</strong><span>{item.teacher || "Your teacher"}</span>{item.slots?.length ? <small>{item.slots.map((slot) => WEEKDAYS[slot.day].slice(0, 3)).join(", ")}</small> : null}</li>)}</ul> : <p>Your teachers will appear here.</p>}</section>
      <section className="hub-student-panel"><h2>Class notices</h2>{data.notices.length ? <ul className="hub-student-list">{data.notices.map((item) => <li key={item.id}><strong>{item.title}</strong><span>{item.body}</span></li>)}</ul> : <p>No class notices right now.</p>}</section>
      <section className="hub-student-panel"><h2>Coming to school</h2>{(() => { const summary = attendanceSummary(data.records); return summary.total ? <p className="hub-student-big">I was at school <strong>{summary.total - summary.counts.absent}</strong> of the last <strong>{summary.total}</strong> school days.{summary.counts.late ? ` I was late ${summary.counts.late} ${summary.counts.late === 1 ? "time" : "times"}.` : ""}</p> : <p>Your attendance will appear here.</p>; })()}</section>
    </>}
  </div>;
}

export function MyAchievements() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(async () => {
    const studentId = auth.scope?.studentId;
    if (!studentId) return null;
    const [achievements, entries] = await Promise.all([
      list("studentAchievements", where("studentId", "==", studentId), where("visibility", "in", ["family", "public"])),
      list("portfolioEntries", where("studentId", "==", studentId), where("visibility", "in", FAMILY_VISIBLE)),
    ]);
    const awards = entries.filter((entry) => visibleToFamily(entry) && (categoryOf(entry) === "achievements" || (entry.achievementTags || []).length));
    return [...achievements.map((item) => ({ ...item, kind: "award" })), ...awards.map((item) => ({ ...item, kind: "portfolio" }))].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [auth.scope?.studentId]);
  return <div className="hub-student">
    <PageHeader kicker="Well done!" title="My achievements">Awards, competitions and the good things you have done.</PageHeader>
    <JourneySummary compact />
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data ? <NotLinked /> : !data.length ? <EmptyState title="Nothing here yet.">Keep trying your best — your achievements will appear here.</EmptyState>
      : <ul className="hub-achievements">{data.map((item) => <li key={`${item.kind}-${item.id}`}><span className="hub-achievement-mark" aria-hidden="true">★</span><div><strong>{item.title}</strong><small>{formatDate(item.date, { day: "numeric", month: "long", year: "numeric" })}</small>{humanValuesOf(item).length > 0 && <p>{humanValuesOf(item).map((value) => HUMAN_VALUES[value]).join(" · ")}</p>}</div></li>)}</ul>}
  </div>;
}
