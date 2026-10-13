// Teacher hub: My classes → class dashboard → roster, plus portfolio entries, class notices and class
// events. Everything a teacher sees comes from their active assignments for the current academic year
// (users/{uid}.classIds and assignmentKeys, derived on the server); firestore.rules checks the same scope.
import { Link, useParams } from "react-router-dom";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthProvider";
import { announcementsFor, configList, currentYearId, daysAgo, getMany, list, listIn, today, useLoad } from "../data";
import { HUMAN_VALUES, attendanceByClass, attendanceSummary } from "../logic/dashboard";
import { EVENT_CATEGORIES, linksError, linksText, parseLinks } from "../audience";
import { PORTFOLIO_CATEGORIES, TEACHER_VISIBILITY, VISIBILITY, categoryLabel, humanValuesOf, moderationFor, showcaseConsent } from "../portfolio";
import { RecordManager } from "../manage";
import { DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const CONSENT_LABEL = { granted: "Consent given", declined: "No consent", withdrawn: "Consent withdrawn", missing: "Consent not answered" };
const byStandard = (a, b) => (a.standard || 0) - (b.standard || 0) || String(a.name).localeCompare(String(b.name));

// The teacher's classes, pupils and subjects for the current year.
async function teachingContext(auth) {
  const classIds = auth.scope?.classIds || [];
  const [classes, students, assignments, subjects, yearId] = await Promise.all([
    getMany("classes", classIds), listIn("students", "currentClassId", classIds), list("teacherAssignments", where("teacherUid", "==", auth.user.uid)), list("subjects"), currentYearId(),
  ]);
  const mine = assignments.filter((item) => (item.status ?? "active") === "active" && item.academicYearId === yearId);
  return { classes: classes.sort(byStandard), students: students.filter((student) => student.status === "active").sort((a, b) => a.name.localeCompare(b.name)), assignments: mine, subjects, homeroom: auth.scope?.homeroomClassIds || [] };
}
const subjectsFor = (ctx, classId) => (ctx.homeroom.includes(classId) ? ctx.subjects.filter((subject) => (subject.status ?? "active") === "active") : ctx.subjects.filter((subject) => ctx.assignments.some((item) => item.classId === classId && item.subjectId === subject.id)));

function NotYourClass() {
  return <div className="hub-message"><h1>This class isn't assigned to you</h1><p>You see a class through an active teaching assignment or as its class teacher. The school office makes assignments.</p><Link className="hub-button" to="/hub/teacher/classes">My classes</Link></div>;
}

// ---------- My classes ----------
export function MyClasses() {
  const auth = useAuth();
  const { data, loading, error } = useLoad(async () => {
    const ctx = await teachingContext(auth);
    const sessions = await listIn("attendanceSessions", "classId", ctx.classes.map((cls) => cls.id), where("date", "==", today()));
    return { ...ctx, states: attendanceByClass(ctx.classes, sessions, today()) };
  }, [(auth.scope?.classIds || []).join("|")]);
  return <>
    <PageHeader kicker="Teaching" title="My classes">The classes you teach this year. Open one for its roster, attendance, notices and portfolio work.</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : !data.classes.length ? <EmptyState title="No classes assigned to you yet.">The school office assigns teachers to classes and subjects. Once they do, your classes appear here.</EmptyState>
      : <ul className="hub-cards">{data.classes.map((cls) => {
        const subjects = subjectsFor({ ...data, homeroom: [] }, cls.id).map((subject) => subject.name);
        const state = data.states.find((row) => row.classId === cls.id)?.state;
        return <li key={cls.id} className="hub-card hub-class-card">
          <div className="hub-card-top"><Link to={`/hub/teacher/classes/${cls.id}`} className="hub-class-name">{cls.name}</Link>{data.homeroom.includes(cls.id) && <StatusBadge status="info" label="Class teacher" />}</div>
          <small>Standard {cls.standard}{cls.room ? ` · ${cls.room}` : ""} · {data.students.filter((student) => student.currentClassId === cls.id).length} pupils</small>
          {subjects.length > 0 && <p>You teach: {subjects.join(", ")}</p>}
          <p>Attendance today: <StatusBadge status={state} label={state === "missing" ? "Not taken" : undefined} /></p>
          <div className="hub-form-actions"><Link className="hub-button hub-button-small" to={`/hub/teacher/classes/${cls.id}`}>Open class</Link><Link className="hub-button hub-button-quiet hub-button-small" to={`/hub/teacher/attendance/${cls.id}`}>Attendance</Link></div>
        </li>;
      })}</ul>}
  </>;
}

// ---------- Class dashboard ----------
export function ClassDashboard() {
  const { classId } = useParams();
  const auth = useAuth();
  const allowed = (auth.scope?.classIds || []).includes(classId);
  const { data, loading, error } = useLoad(async () => {
    if (!allowed) return null;
    const ctx = await teachingContext(auth);
    const [records, session, notices, entries] = await Promise.all([
      list("attendanceRecords", where("classId", "==", classId), where("date", ">=", daysAgo(30))),
      list("attendanceSessions", where("classId", "==", classId), where("date", "==", today())),
      announcementsFor([`class:${classId}`], 5),
      list("portfolioEntries", where("classId", "==", classId)),
    ]);
    return { ...ctx, cls: ctx.classes.find((item) => item.id === classId), records, session: session[0] || null, notices, entries: entries.filter((entry) => entry.status !== "archived").sort((a, b) => String(b.date).localeCompare(String(a.date))) };
  }, [classId, allowed]);
  if (!allowed) return <NotYourClass />;
  if (loading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const pupils = data.students.filter((student) => student.currentClassId === classId);
  const summary = attendanceSummary(data.records);
  const state = data.session?.status === "submitted" ? "submitted" : data.session ? "open" : "missing";
  const teaches = subjectsFor({ ...data, homeroom: [] }, classId).map((subject) => subject.name);
  return <>
    <PageHeader kicker={`Standard ${data.cls.standard}${data.cls.room ? ` · ${data.cls.room}` : ""}`} title={data.cls.name}
      actions={<><Link className="hub-button" to={`/hub/teacher/attendance/${classId}`}>{state === "submitted" ? "Review attendance" : "Take attendance"}</Link><Link className="hub-button hub-button-quiet" to={`/hub/teacher/portfolios?class=${classId}&new=1`}>New portfolio entry</Link><Link className="hub-button hub-button-quiet" to={`/hub/teacher/announcements?class=${classId}&new=1`}>New notice</Link></>}>
      {data.homeroom.includes(classId) ? "You are the class teacher." : teaches.length ? `You teach ${teaches.join(", ")} here.` : null}
    </PageHeader>
    <div className="hub-stats">
      <StatCard label="Pupils" value={pupils.length} to={`/hub/teacher/classes/${classId}/roster`} detail="View roster" />
      <StatCard label="Attendance today" value={state === "submitted" ? "Submitted" : state === "open" ? "In progress" : "Not taken"} tone={state === "submitted" ? "good" : "warn"} to={`/hub/teacher/attendance/${classId}`} />
      <StatCard label="Attendance (30 days)" value={summary.rate != null ? `${summary.rate}%` : "—"} detail={`${summary.counts.absent} absences · ${summary.counts.late} late`} />
      <StatCard label="Portfolio entries" value={data.entries.length} to={`/hub/teacher/portfolios?class=${classId}`} />
    </div>
    <div className="hub-grid-2">
      <Section title="Roster" action={<Link to={`/hub/teacher/classes/${classId}/roster`}>Full roster</Link>}>
        {pupils.length ? <ol className="hub-list hub-list-compact hub-roster-preview">{pupils.map((student) => <li key={student.id}><Link to={`/hub/students/${student.id}`}>{student.name}</Link><small>{student.studentNumber}</small></li>)}</ol> : <EmptyState title="No pupils enrolled yet." />}
      </Section>
      <div>
        <Section title="Class notices" action={<Link to="/hub/teacher/announcements">All notices</Link>}>
          {data.notices.length ? <ul className="hub-list">{data.notices.map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.body}</p><small>{formatDate(item.publishedAt)}</small></li>)}</ul> : <EmptyState title="No class notices yet." />}
        </Section>
        <Section title="Recent portfolio work" action={<Link to={`/hub/teacher/portfolios?class=${classId}`}>All entries</Link>}>
          {data.entries.length ? <ul className="hub-list">{data.entries.slice(0, 4).map((entry) => <li key={entry.id}><strong>{entry.title}</strong><small>{pupils.find((student) => student.id === entry.studentId)?.name || "Pupil"} · {formatDate(entry.date)} · <StatusBadge status={entry.visibility} /></small></li>)}</ul> : <EmptyState title="No entries yet." />}
        </Section>
      </div>
    </div>
  </>;
}

// ---------- Class roster ----------
export function ClassRoster() {
  const { classId } = useParams();
  const auth = useAuth();
  const allowed = (auth.scope?.classIds || []).includes(classId);
  const homeroom = (auth.scope?.homeroomClassIds || []).includes(classId);
  const { data, loading, error } = useLoad(async () => {
    if (!allowed) return null;
    const [cls] = await getMany("classes", [classId]);
    const [students, records, consent, links] = await Promise.all([
      list("students", where("currentClassId", "==", classId)),
      list("attendanceRecords", where("classId", "==", classId), where("date", ">=", daysAgo(30))),
      list("studentConsentStatus", where("classId", "==", classId)),
      homeroom ? list("studentGuardianLinks", where("classId", "==", classId)) : [],
    ]);
    const guardians = homeroom ? await getMany("guardians", links.filter((link) => (link.status ?? "active") === "active").map((link) => link.guardianId)) : [];
    return { cls, links, guardians, rows: students.filter((student) => student.status === "active").map((student) => {
      const mine = records.filter((record) => record.studentId === student.id);
      const status = consent.find((item) => item.id === student.id);
      const family = links.filter((link) => link.studentId === student.id && (link.status ?? "active") === "active").map((link) => ({ link, guardian: guardians.find((item) => item.id === link.guardianId) })).filter((item) => item.guardian);
      return { ...student, rate: attendanceSummary(mine).rate, absences: attendanceSummary(mine).counts.absent, photo: status?.types?.photoVideo?.response || "missing", showcase: showcaseConsent(status), family };
    }) };
  }, [classId, allowed]);
  if (!allowed) return <NotYourClass />;
  return <>
    <PageHeader kicker={<Link to={`/hub/teacher/classes/${classId}`}>← {data?.cls?.name || "Class"}</Link>} title="Class roster">{homeroom ? "Pupils, attendance over the last 30 days, media consent and family contacts." : "Pupils, attendance over the last 30 days and media consent. Family contacts are shown to the class teacher."}</PageHeader>
    <ErrorNote error={error} />
    {loading ? <Loading /> : <DataTable rows={data.rows} searchKeys={["name", "preferredName", "studentNumber"]} exportName={`roster-${data.cls?.name || classId}`} initialSort={{ key: "name", dir: 1 }} pageSize={40}
      columns={[
        { key: "name", label: "Pupil", render: (row) => <span><Link className="hub-cell-strong" to={`/hub/students/${row.id}`}>{row.name}</Link>{row.preferredName && row.preferredName !== row.name.split(" ")[0] ? <small> (“{row.preferredName}”)</small> : null}</span> },
        { key: "studentNumber", label: "Student no." },
        { key: "rate", label: "Attendance", sortValue: (row) => row.rate ?? -1, csv: (row) => (row.rate == null ? "" : `${row.rate}%`), render: (row) => (row.rate == null ? "—" : <span>{row.rate}%{row.absences ? <small> · {row.absences} absent</small> : null}</span>) },
        { key: "photo", label: "Photos in hub", render: (row) => <StatusBadge status={row.photo} label={CONSENT_LABEL[row.photo]} /> },
        { key: "showcase", label: "Public showcase", render: (row) => <StatusBadge status={row.showcase} label={CONSENT_LABEL[row.showcase]} /> },
        ...(homeroom ? [{ key: "family", label: "Family contacts", sortable: false, csv: (row) => row.family.map(({ guardian }) => `${guardian.name} ${guardian.phone || ""}`).join("; "), render: (row) => row.family.length ? <span>{row.family.map(({ guardian, link }) => <span key={link.id} className="hub-contact">{guardian.name}{guardian.phone ? <> · <a href={`tel:${guardian.phone.replace(/\s/g, "")}`}>{guardian.phone}</a></> : null}</span>)}</span> : <span className="hub-cell-muted">None linked</span> }] : []),
      ]} empty="No pupils are enrolled in this class." />}
  </>;
}

// ---------- Portfolio entries ----------
async function portfolioLookups(auth) {
  const ctx = await teachingContext(auth);
  const [statuses, categories, tags] = await Promise.all([listIn("studentConsentStatus", "classId", ctx.classes.map((cls) => cls.id)), configList("portfolioCategories").catch(() => []), configList("portfolioTags").catch(() => [])]);
  return { ...ctx, statuses, categories: categories.length ? categories.map((item) => [item.id, item.name]) : PORTFOLIO_CATEGORIES, tags: tags.map((item) => [item.id, item.name]) };
}

export function TeacherPortfolio() {
  const auth = useAuth();
  const params = new URLSearchParams(window.location.search);
  const startClass = params.get("class");
  const pupilName = (lookups, id) => lookups.students?.find((student) => student.id === id)?.name || "Pupil";
  return <RecordManager kicker="Teaching" title="Portfolio entries" noun="portfolio entry" collection="portfolioEntries" nameOf={(row) => row.title}
    canEdit={(auth.scope?.classIds || []).length > 0}
    intro="Record a pupil's work and growth. Parent-visible entries appear in the family's My SRSS Journey; nominate outstanding work as a showcase candidate — it reaches the public website only after a moderator approves it and the family has given consent."
    load={() => listIn("portfolioEntries", "classId", auth.scope?.classIds || [])}
    lookups={() => portfolioLookups(auth)}
    fields={[
      { key: "classId", label: "Class", type: "select", required: true, immutable: true, options: (lookups) => lookups.classes.map((cls) => [cls.id, cls.name]) },
      { key: "studentId", label: "Pupil", type: "select", required: true, immutable: true, options: (lookups, draft) => lookups.students.filter((student) => student.currentClassId === draft.classId).map((student) => [student.id, student.name]), placeholder: "Choose the class first" },
      { key: "subjectId", label: "Subject", type: "select", options: (lookups, draft) => subjectsFor(lookups, draft.classId).map((subject) => [subject.id, subject.name]), placeholder: "Not subject-specific", help: "Subjects you teach in this class." },
      { key: "category", label: "Category", type: "select", required: true, options: (lookups) => lookups.categories },
      { key: "title", label: "Title", type: "text", required: true, maxLength: 140, wide: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "description", label: "What the pupil did", type: "textarea", maxLength: 4000, wide: true },
      { key: "learningObjective", label: "Learning objective", type: "text", maxLength: 300, wide: true },
      { key: "humanValues", label: "Human Values shown", type: "checkboxes", options: Object.entries(HUMAN_VALUES), wide: true },
      { key: "achievementTags", label: "Achievement tags", type: "checkboxes", options: (lookups) => lookups.tags, wide: true, emptyOptions: "No tags set up yet (Admin › Settings › Achievement tags)." },
      { key: "teacherObservation", label: "Teacher observation", type: "textarea", maxLength: 2000, wide: true, help: "A specific observation — never a score or label." },
      { key: "studentReflection", label: "Pupil's reflection (in their words)", type: "textarea", maxLength: 2000, wide: true },
      { key: "mediaText", label: "Media references", type: "textarea", rows: 2, wide: true, placeholder: "Photo of the model | https://drive.google.com/…", help: "Links to the work in the school's Google Drive. They are never shown on the public website." },
      { key: "visibility", label: "Who can see it", type: "select", required: true, options: TEACHER_VISIBILITY },
    ]}
    defaults={(lookups) => ({ classId: startClass && lookups.classes.some((cls) => cls.id === startClass) ? startClass : lookups.classes[0]?.id, date: today(), category: "academic", visibility: "family", humanValues: [], achievementTags: [] })}
    toDraft={(row) => ({ humanValues: humanValuesOf(row), mediaText: linksText(row.mediaReferences || (row.evidenceUrl ? [{ label: "Evidence", url: row.evidenceUrl }] : [])) })}
    editable={(row) => row.visibility !== "publicShowcase"}
    validate={(values) => ({ mediaText: linksError(values.mediaText), visibility: values.visibility === "publicShowcase" ? "Only a moderator can publish to the public showcase." : null })}
    prepare={(values, { isNew, original, lookups }) => {
      const { mediaText, ...rest } = values;
      const cls = lookups.classes.find((item) => item.id === (rest.classId || original?.classId));
      return { ...rest, mediaReferences: parseLinks(mediaText), humanValues: rest.humanValues || [], achievementTags: rest.achievementTags || [],
        consentStatus: showcaseConsent(lookups.statuses.find((item) => item.id === (rest.studentId || original?.studentId))),
        moderationStatus: moderationFor(rest.visibility, original?.moderationStatus ?? null),
        ...(isNew ? { academicYearId: cls.academicYearId, createdBy: auth.user.uid } : {}) };
    }}
    columns={(lookups) => [
      { key: "date", label: "Date", render: (row) => formatDate(row.date, { day: "numeric", month: "short", year: "numeric" }) },
      { key: "title", label: "Entry", render: (row) => <span><span className="hub-cell-strong">{row.title}</span><br /><small>{pupilName(lookups, row.studentId)} · {categoryLabel(row.category, lookups.categories)}</small></span> },
      { key: "studentId", label: "Pupil", sortValue: (row) => pupilName(lookups, row.studentId), csv: (row) => pupilName(lookups, row.studentId), render: (row) => pupilName(lookups, row.studentId) },
      { key: "visibility", label: "Visibility", render: (row) => <StatusBadge status={row.visibility} label={VISIBILITY.find(([value]) => value === row.visibility)?.[1]} /> },
      { key: "consent", label: "Showcase consent", sortable: false, csv: (row) => showcaseConsent(lookups.statuses.find((item) => item.id === row.studentId)), render: (row) => { const consent = showcaseConsent(lookups.statuses.find((item) => item.id === row.studentId)); return <StatusBadge status={consent} label={CONSENT_LABEL[consent]} />; } },
      { key: "moderationStatus", label: "Moderation", render: (row) => (row.moderationStatus ? <StatusBadge status={row.moderationStatus} label={{ pending: "Awaiting moderator", approved: "Approved", returned: "Returned" }[row.moderationStatus]} /> : "—") },
    ]}
    filters={(lookups) => [{ key: "classId", label: "Class", options: lookups.classes.map((cls) => [cls.id, cls.name]) }, { key: "category", label: "Category", options: lookups.categories }, { key: "visibility", label: "Visibility", options: VISIBILITY }]}
    initialFilters={(lookups) => (startClass && lookups.classes.some((cls) => cls.id === startClass) ? { classId: startClass } : {})}
    searchKeys={["title", "description"]} initialSort={{ key: "date", dir: -1 }} exportName="portfolio-entries" createLabel="New portfolio entry" startOpen={params.get("new") === "1"} />;
}

// ---------- Class notices (routine announcements to the teacher's own classes) ----------
const TEACHER_CATEGORIES = [["class", "Class"], ["academic", "Academic"], ["event", "Event"], ["reminder", "Reminder"]];
export function TeacherAnnouncements() {
  const auth = useAuth();
  const publishKeys = auth.scope?.publishKeys || [];
  const startClass = new URLSearchParams(window.location.search).get("class");
  return <RecordManager kicker="Teaching" title="Class notices" noun="notice" collection="announcements" nameOf={(row) => row.title} canEdit={publishKeys.length > 0}
    intro="Routine notices for the families and pupils of your classes. School-wide and urgent notices come from the school office."
    load={() => list("announcements", where("createdBy", "==", auth.user.uid))}
    lookups={async () => ({ classes: await getMany("classes", publishKeys.map((key) => key.slice(6))) })}
    fields={[
      { key: "classKey", label: "Class", type: "select", required: true, options: (lookups) => lookups.classes.map((cls) => [`class:${cls.id}`, cls.name]) },
      { key: "category", label: "Category", type: "select", required: true, options: TEACHER_CATEGORIES },
      { key: "title", label: "Headline", type: "text", required: true, maxLength: 140, wide: true },
      { key: "body", label: "Message", type: "textarea", required: true, maxLength: 5000, rows: 4, wide: true },
      { key: "expiresAt", label: "Remove after", type: "date", help: "Optional." },
      { key: "status", label: "Publishing", type: "select", required: true, options: [["published", "Publish now"], ["draft", "Save as draft"]] },
      { key: "attachmentsText", label: "Attachments (links)", type: "textarea", rows: 2, wide: true, placeholder: "Reading list | https://drive.google.com/…" },
    ]}
    defaults={() => ({ classKey: startClass ? `class:${startClass}` : publishKeys[0], category: "class", status: "published" })}
    toDraft={(row) => ({ classKey: row.audienceKeys?.[0], attachmentsText: linksText(row.attachments) })}
    validate={(values) => ({ attachmentsText: linksError(values.attachmentsText), classKey: values.classKey && !publishKeys.includes(values.classKey) ? "You can post only to your own classes." : null })}
    prepare={(values, { original }) => {
      const { classKey, attachmentsText, ...rest } = values;
      return { ...rest, audienceKeys: [classKey], pinned: false, attachments: parseLinks(attachmentsText), ...(rest.status === "published" && original?.status !== "published" ? { publishedAt: new Date() } : {}), ...(!original ? { createdBy: auth.user.uid } : {}) };
    }}
    columns={(lookups) => [
      { key: "title", label: "Notice", render: (row) => <span><span className="hub-cell-strong">{row.title}</span><br /><small>{lookups.classes.find((cls) => `class:${cls.id}` === row.audienceKeys?.[0])?.name || "Class"}</small></span> },
      { key: "category", label: "Category", render: (row) => TEACHER_CATEGORIES.find(([id]) => id === row.category)?.[1] || row.category },
      { key: "publishedAt", label: "Published", sortValue: (row) => row.publishedAt?.seconds || 0, render: (row) => formatDate(row.publishedAt, { day: "numeric", month: "short" }) },
      { key: "statusBadge", label: "Status", sortValue: (row) => row.status, csv: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    ]}
    statusOptions={[["published", "Published"], ["draft", "Draft"], ["archived", "Archived"]]}
    searchKeys={["title", "body"]} initialSort={{ key: "publishedAt", dir: -1 }} createLabel="New class notice" startOpen={new URLSearchParams(window.location.search).get("new") === "1"}
    emptyHint="Notices you post to your classes appear here." />;
}

// ---------- Class events ----------
const TEACHER_EVENT_CATEGORIES = EVENT_CATEGORIES.filter(([id]) => ["class", "academic", "meeting"].includes(id));
export function TeacherEvents() {
  const auth = useAuth();
  const publishKeys = auth.scope?.publishKeys || [];
  return <RecordManager kicker="Teaching" title="Class events" noun="class event" collection="events" nameOf={(row) => row.title} canEdit={publishKeys.length > 0}
    intro="Trips, class meetings and other dates for one of your classes. They appear in the calendar of that class's families and pupils."
    load={() => list("events", where("createdBy", "==", auth.user.uid))}
    lookups={async () => ({ classes: await getMany("classes", publishKeys.map((key) => key.slice(6))) })}
    fields={[
      { key: "classKey", label: "Class", type: "select", required: true, options: (lookups) => lookups.classes.map((cls) => [`class:${cls.id}`, cls.name]) },
      { key: "category", label: "Type", type: "select", required: true, options: TEACHER_EVENT_CATEGORIES },
      { key: "title", label: "Event", type: "text", required: true, maxLength: 140, wide: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "startTime", label: "Start", type: "time" },
      { key: "endTime", label: "End", type: "time" },
      { key: "location", label: "Location", type: "text", maxLength: 120 },
      { key: "description", label: "Details", type: "textarea", maxLength: 2000, wide: true },
      { key: "status", label: "Status", type: "select", required: true, options: [["published", "Published"], ["draft", "Draft"]] },
    ]}
    defaults={() => ({ classKey: publishKeys[0], category: "class", status: "published" })}
    toDraft={(row) => ({ classKey: row.audienceKeys?.[0] })}
    prepare={(values) => { const { classKey, ...rest } = values; return { ...rest, audienceKeys: [classKey], publicListing: false, attachments: [] }; }}
    columns={(lookups) => [
      { key: "date", label: "When", render: (row) => `${formatDate(row.date, { weekday: "short", day: "numeric", month: "short" })}${row.startTime ? ` · ${row.startTime}` : ""}` },
      { key: "title", label: "Event", render: (row) => <span><span className="hub-cell-strong">{row.title}</span><br /><small>{lookups.classes.find((cls) => `class:${cls.id}` === row.audienceKeys?.[0])?.name}</small></span> },
      { key: "category", label: "Type", render: (row) => EVENT_CATEGORIES.find(([id]) => id === row.category)?.[1] || row.category },
      { key: "statusBadge", label: "Status", sortValue: (row) => row.status, csv: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    ]}
    statusOptions={[["published", "Published"], ["draft", "Draft"], ["archived", "Archived"]]}
    searchKeys={["title"]} initialSort={{ key: "date", dir: 1 }} createLabel="Add class event" />;
}

