// Academic planning (Stage 1): curriculum overview and coverage, curriculum plans, weekly lesson planning,
// learning tasks with completion and feedback, and the family/pupil task view.
// Firestore keeps planning metadata and status; when a lesson plan says its content lives in a Google Doc,
// the hub stores only the Doc reference so there is one copy of the plan (no conflicting versions).
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, listIn, one, useLoad } from "../data";
import { HUMAN_VALUES } from "../logic/dashboard";
import {
  LESSON_LABELS, PROGRESS_LABELS, PROGRESS_STATUSES, SUBMISSION_MODES, TASK_STATUSES, canConfigureCurriculum, chunk, curriculumCoverage,
  familyTaskView, isCoordinator, lessonStatusOptions, taskSummary, teachesSubject, validateCurriculumPlan, validateLessonPlan, validateTask,
} from "../logic/academics";
import { addAttachment } from "../logic/workspace";
import { useAcademicContext, schoolToday } from "../academicContext";
import { AddResource, AttachmentList, WorkspaceActionModal } from "../workspace";
import { ChildSwitcher, DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const stamp = (uid, isNew) => ({ updatedAt: serverTimestamp(), updatedBy: uid, ...(isNew ? { createdAt: serverTimestamp(), createdBy: uid } : {}) });
const VALUE_KEYS = Object.keys(HUMAN_VALUES);
const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const lines = (text) => String(text || "").split("\n").map((line) => line.trim()).filter(Boolean);

export function AcademicsTabs() {
  const tabs = [["/hub/academics", "Overview"], ["/hub/academics/curriculum", "Curriculum"], ["/hub/academics/lessons", "Lesson plans"], ["/hub/academics/tasks", "Learning tasks"]];
  return <nav className="hub-tabs hub-module-tabs" aria-label="Academics sections">{tabs.map(([to, label]) => <NavLink key={to} to={to} end={to === "/hub/academics"}>{label}</NavLink>)}</nav>;
}

function Header({ title, children, actions }) {
  return <><PageHeader kicker="Academics" title={title} actions={actions}>{children}</PageHeader><AcademicsTabs /></>;
}

// ---------- Overview & coverage ----------
export function AcademicsOverview() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const coordinatorView = isCoordinator(auth.roles) || auth.roles.includes("leadership");
  const { data, loading, error } = useLoad(async () => {
    if (!ctx.data) return null;
    const { yearId, termId } = ctx.data;
    const [plans, own, all, tasks] = await Promise.all([
      list("curriculumPlans", where("academicYearId", "==", yearId)),
      list("lessonPlans", where("ownerUid", "==", auth.user.uid), where("academicYearId", "==", yearId)),
      coordinatorView ? list("lessonPlans", where("academicYearId", "==", yearId), where("termId", "==", termId)) : [],
      listIn("learningTasks", "classId", auth.scope?.classIds || []),
    ]);
    return { plans: plans.filter((plan) => plan.status !== "archived"), own, all, tasks };
  }, [ctx.data?.yearId, coordinatorView]);
  const planFor = (standard, subjectId) => data?.plans.find((plan) => plan.standard === standard && plan.subjectId === subjectId);

  return <>
    <Header title="Teaching & learning">Curriculum, weekly planning and learning tasks for your classes.</Header>
    <ErrorNote error={ctx.error || error} />
    {ctx.loading || loading || !data ? <Loading /> : <>
      {ctx.data.mine.length > 0 && <Section title="My teaching this year">
        <ul className="hub-cards">{ctx.data.mine.map((pair) => {
          const lessons = data.own.filter((lesson) => lesson.classId === pair.classId && lesson.subjectId === pair.subjectId);
          const coverage = curriculumCoverage(planFor(pair.standard, pair.subjectId), lessons);
          const open = data.tasks.filter((task) => task.classId === pair.classId && task.subjectId === pair.subjectId && task.status === "published").length;
          return <li key={pair.key} className="hub-card hub-teach-card">
            <div className="hub-card-top"><strong>{pair.label}</strong>{coverage.percent != null ? <StatusBadge status={coverage.percent >= 50 ? "good" : "info"} label={`${coverage.percent}% covered`} /> : <StatusBadge status="neutral" label="No curriculum plan" />}</div>
            {coverage.total > 0 && <div className="hub-meter" role="img" aria-label={`${coverage.covered} of ${coverage.total} topics covered`}><span style={{ width: `${coverage.percent}%` }} /></div>}
            <small>{lessons.length} lesson {lessons.length === 1 ? "plan" : "plans"} · {lessons.filter((lesson) => ["completed", "reviewed"].includes(lesson.status)).length} taught · {open} open {open === 1 ? "task" : "tasks"}</small>
            <div className="hub-form-actions">
              <Link className="hub-button hub-button-small" to={`/hub/academics/lessons/new?class=${pair.classId}&subject=${pair.subjectId}`}>Plan a lesson</Link>
              <Link className="hub-button hub-button-quiet hub-button-small" to={`/hub/academics/tasks/new?class=${pair.classId}&subject=${pair.subjectId}`}>Set a task</Link>
              <Link className="hub-button hub-button-quiet hub-button-small" to="/hub/assessments">Marks</Link>
            </div>
          </li>;
        })}</ul>
      </Section>}
      {coordinatorView && <CoverageTable ctx={ctx.data} plans={data.plans} lessons={data.all} />}
      {!ctx.data.mine.length && !coordinatorView && <EmptyState title="No classes or subjects are assigned to you this year.">The Academic Coordinator or school office assigns classes and subjects.</EmptyState>}
    </>}
  </>;
}

function CoverageTable({ ctx, plans, lessons }) {
  const rows = ctx.pairs.map((pair) => {
    const plan = plans.find((item) => item.standard === pair.standard && item.subjectId === pair.subjectId);
    const mine = lessons.filter((lesson) => lesson.classId === pair.classId && lesson.subjectId === pair.subjectId);
    const coverage = curriculumCoverage(plan, mine);
    return { id: pair.id, className: ctx.className(pair.classId), subject: ctx.subjectName(pair.subjectId), teacher: ctx.personName(pair.teacherUid), standard: pair.standard, plan: Boolean(plan), lessons: mine.length, review: mine.filter((lesson) => lesson.status === "completed").length, coverage: coverage.percent };
  });
  return <Section title="Curriculum coverage this term" action={<Link to="/hub/academics/lessons?view=review">Lesson plans to review</Link>}>
    <DataTable rows={rows} exportName="srss-curriculum-coverage" searchKeys={["className", "subject", "teacher"]} pageSize={20}
      filters={[{ key: "standard", label: "Standard", options: [1, 2, 3, 4, 5, 6].map((s) => [String(s), `Standard ${s}`]) }]}
      columns={[{ key: "className", label: "Class" }, { key: "subject", label: "Subject" }, { key: "teacher", label: "Teacher" },
        { key: "plan", label: "Curriculum plan", csv: (row) => (row.plan ? "Yes" : "No"), render: (row) => row.plan ? <StatusBadge status="good" label="In place" /> : <StatusBadge status="missing" label="Not set up" /> },
        { key: "lessons", label: "Lesson plans" }, { key: "review", label: "Awaiting review" },
        { key: "coverage", label: "Coverage", sortValue: (row) => row.coverage ?? -1, csv: (row) => (row.coverage == null ? "" : `${row.coverage}%`), render: (row) => (row.coverage == null ? "—" : `${row.coverage}%`) }]} />
  </Section>;
}

// ---------- Curriculum plans ----------
export function CurriculumPlans() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const canEdit = canConfigureCurriculum(auth.roles);
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useLoad(async () => (ctx.data ? list("curriculumPlans", where("academicYearId", "==", ctx.data.yearId)) : null), [ctx.data?.yearId]);
  // Teachers see the plans for the Standards and subjects they teach; coordinators and leadership see all.
  const relevant = (data || []).filter((plan) => canEdit || auth.roles.includes("leadership") || ctx.data?.mine.some((pair) => pair.standard === plan.standard && pair.subjectId === plan.subjectId));
  if (editing) return <><Header title={editing.id ? editing.title : "New curriculum plan"} /><CurriculumEditor plan={editing} ctx={ctx.data} editable={canEdit} onDone={() => { setEditing(null); reload(); }} /></>;
  return <>
    <Header title="Curriculum" actions={canEdit && <button type="button" className="hub-button" onClick={() => setEditing({ status: "draft", topics: [], sourceRefs: [] })}>New curriculum plan</button>}>
      {canEdit ? "Set out each Standard's topics and learning objectives from the school's approved curriculum documents." : "Topics and objectives for the Standards and subjects you teach."}
    </Header>
    <ErrorNote error={ctx.error || error} />
    {ctx.loading || loading ? <Loading /> : !relevant.length ? <EmptyState title="No curriculum plans yet.">{canEdit ? "Start with one Standard and subject; link the approved curriculum document as its source." : "The Academic Coordinator publishes curriculum plans here."}</EmptyState>
      : <DataTable rows={relevant.map((plan) => ({ ...plan, subject: ctx.data.subjectName(plan.subjectId), topicCount: plan.topics?.length || 0 }))} searchKeys={["title", "subject"]} onRowClick={(row) => setEditing(row)} exportName="srss-curriculum-plans"
        filters={[{ key: "standard", label: "Standard", options: [1, 2, 3, 4, 5, 6].map((s) => [String(s), `Standard ${s}`]) }, { key: "status", label: "Status", options: [["draft", "Draft"], ["active", "Active"], ["archived", "Archived"]] }]}
        columns={[{ key: "title", label: "Plan" }, { key: "standard", label: "Standard", render: (row) => `Std ${row.standard}` }, { key: "subject", label: "Subject" }, { key: "topicCount", label: "Topics" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status === "active" ? "active" : row.status} /> }]} />}
  </>;
}

function CurriculumEditor({ plan, ctx, editable, onDone }) {
  const auth = useAuth();
  const [form, setForm] = useState({ standard: plan.standard || "", subjectId: plan.subjectId || "", title: plan.title || "", status: plan.status || "draft", topics: plan.topics || [], sourceRefs: plan.sourceRefs || [] });
  const [status, setStatus] = useState(null);
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const setTopic = (index, patch) => set({ topics: form.topics.map((topic, i) => (i === index ? { ...topic, ...patch } : topic)) });
  const move = (index, delta) => { const topics = [...form.topics]; const [item] = topics.splice(index, 1); topics.splice(index + delta, 0, item); set({ topics }); };
  const errors = validateCurriculumPlan(form);
  async function save(event) {
    event.preventDefault();
    if (errors.length) return setStatus(new Error(errors.join(" ")));
    setStatus("saving");
    try {
      const payload = { academicYearId: ctx.yearId, standard: Number(form.standard), subjectId: form.subjectId, title: form.title.trim(), status: form.status, sourceRefs: form.sourceRefs,
        topics: form.topics.map((topic) => ({ id: topic.id || newId(), title: topic.title.trim(), objectives: lines(topic.objectivesText ?? (topic.objectives || []).join("\n")), learningStandards: String(topic.learningStandards || "").trim(), weekFrom: topic.weekFrom ? Number(topic.weekFrom) : null, weekTo: topic.weekTo ? Number(topic.weekTo) : null })),
        ...stamp(auth.user.uid, !plan.id) };
      if (plan.id) await updateDoc(doc(db, "curriculumPlans", plan.id), payload); else await addDoc(collection(db, "curriculumPlans"), payload);
      onDone();
    } catch (reason) { setStatus(reason); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={save}>
    <fieldset disabled={!editable} className="hub-fieldset">
      <div className="hub-form-row">
        <label>Standard<select required value={form.standard} onChange={(event) => set({ standard: event.target.value })}><option value="">Choose…</option>{[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Standard {s}</option>)}</select></label>
        <label>Subject<select required value={form.subjectId} onChange={(event) => set({ subjectId: event.target.value, title: form.title || `${ctx.subjectName(event.target.value)} · Standard ${form.standard || ""}`.trim() })}><option value="">Choose…</option>{ctx.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
        <label>Status<select value={form.status} onChange={(event) => set({ status: event.target.value })}><option value="draft">Draft (coordinators only)</option><option value="active">Active (visible to teachers)</option><option value="archived">Archived</option></select></label>
      </div>
      <label>Title<input required maxLength={160} value={form.title} onChange={(event) => set({ title: event.target.value })} /></label>
    </fieldset>
    <div className="hub-subsection"><h3>Source documents</h3><p className="hub-hint">Link the approved curriculum documents (for example the DSKP and the school's scheme of work) this plan follows.</p>
      <AttachmentList items={form.sourceRefs} onRemove={editable ? (item) => set({ sourceRefs: form.sourceRefs.filter((ref) => ref.fileId !== item.fileId) }) : null} empty="No source documents linked." />
      {editable && <AddResource actions={["attach"]} label="Link a curriculum document" context={`Curriculum plan · ${form.title || "new"}`} onAdd={(item) => set({ sourceRefs: addAttachment(form.sourceRefs, item) })} />}
    </div>
    <div className="hub-subsection"><h3>Topics</h3><p className="hub-hint">Type learning standard codes exactly as they appear in the approved document — the hub does not supply official standards.</p>
      {!form.topics.length && <p className="hub-ws-empty">No topics yet.</p>}
      <ol className="hub-topic-list">{form.topics.map((topic, index) => <li key={topic.id || index}>
        <fieldset disabled={!editable} className="hub-fieldset">
          <div className="hub-form-row"><label>Topic {index + 1}<input required value={topic.title || ""} onChange={(event) => setTopic(index, { title: event.target.value })} /></label><label>Weeks<span className="hub-inline-field"><input type="number" min="1" max="45" aria-label="First week" value={topic.weekFrom || ""} onChange={(event) => setTopic(index, { weekFrom: event.target.value })} /> – <input type="number" min="1" max="45" aria-label="Last week" value={topic.weekTo || ""} onChange={(event) => setTopic(index, { weekTo: event.target.value })} /></span></label></div>
          <div className="hub-form-row"><label>Learning objectives <span className="hub-optional">one per line</span><textarea rows={3} value={topic.objectivesText ?? (topic.objectives || []).join("\n")} onChange={(event) => setTopic(index, { objectivesText: event.target.value })} /></label><label>Learning standards <span className="hub-optional">codes from the source document</span><textarea rows={3} value={topic.learningStandards || ""} onChange={(event) => setTopic(index, { learningStandards: event.target.value })} /></label></div>
        </fieldset>
        {editable && <div className="hub-form-actions"><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={index === form.topics.length - 1} onClick={() => move(index, 1)}>Move down</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => set({ topics: form.topics.filter((_, i) => i !== index) })}>Remove topic</button></div>}
      </li>)}</ol>
      {editable && <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => set({ topics: [...form.topics, { id: newId(), title: "" }] })}>Add topic</button>}
    </div>
    {status instanceof Error && (status.code ? <ErrorNote error={status} /> : <p className="hub-error" role="alert">{status.message}</p>)}
    <div className="hub-form-actions">{editable && <button type="submit" className="hub-button" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save curriculum plan"}</button>}<button type="button" className="hub-button hub-button-quiet" onClick={onDone}>{editable ? "Cancel" : "Back"}</button></div>
  </form>;
}

// ---------- Lesson plans ----------
export function LessonPlans() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const [params, setParams] = useSearchParams();
  const reviewer = isCoordinator(auth.roles) || auth.roles.includes("leadership");
  const view = reviewer && params.get("view") !== "mine" ? params.get("view") || "review" : "mine";
  const { data, loading, error } = useLoad(async () => {
    if (!ctx.data) return null;
    if (view === "mine") return list("lessonPlans", where("ownerUid", "==", auth.user.uid), where("academicYearId", "==", ctx.data.yearId));
    return list("lessonPlans", where("academicYearId", "==", ctx.data.yearId), where("termId", "==", ctx.data.termId));
  }, [ctx.data?.yearId, view]);
  const rows = (data || []).filter((lesson) => view !== "review" || lesson.status === "completed").map((lesson) => ({ ...lesson, className: ctx.data.className(lesson.classId), subject: ctx.data.subjectName(lesson.subjectId), teacher: ctx.data.personName(lesson.ownerUid) }));
  return <>
    <Header title="Lesson plans" actions={ctx.data?.mine.length > 0 && <Link className="hub-button" to="/hub/academics/lessons/new">New lesson plan</Link>}>Plan each week's lessons, link resources from Google Drive and record how the lesson went.</Header>
    {reviewer && <div className="hub-chips" role="group" aria-label="Which lesson plans">{[["review", "Awaiting my review"], ["term", "All this term"], ...(ctx.data?.mine.length ? [["mine", "My plans"]] : [])].map(([id, label]) => <button key={id} type="button" className={view === id ? "active" : ""} aria-pressed={view === id} onClick={() => setParams({ view: id })}>{label}</button>)}</div>}
    <ErrorNote error={ctx.error || error} />
    {ctx.loading || loading ? <Loading /> : !rows.length ? <EmptyState title={view === "review" ? "Nothing waiting for review." : "No lesson plans yet."}>{view === "mine" ? "Plans you mark as completed are reviewed by the Academic Coordinator." : null}</EmptyState>
      : <DataTable rows={rows} searchKeys={["topic", "className", "subject", "teacher"]} exportName="srss-lesson-plans" initialSort={{ key: "date", dir: -1 }} rowHref={(row) => `/hub/academics/lessons/${row.id}`}
        filters={[{ key: "classId", label: "Class", options: (ctx.data?.classes || []).map((cls) => [cls.id, cls.name]) }, { key: "subjectId", label: "Subject", options: (ctx.data?.subjects || []).map((subject) => [subject.id, subject.name]) }, { key: "status", label: "Status", options: Object.entries(LESSON_LABELS) }]}
        columns={[{ key: "topic", label: "Topic" }, { key: "date", label: "Date", render: (row) => (row.date ? formatDate(row.date, { weekday: "short", day: "numeric", month: "short" }) : row.week ? `Week ${row.week}` : "—") }, { key: "className", label: "Class" }, { key: "subject", label: "Subject" }, ...(view !== "mine" ? [{ key: "teacher", label: "Teacher" }] : []), { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} label={LESSON_LABELS[row.status]} /> }]} />}
  </>;
}

const EMPTY_LESSON = { termId: "", week: "", date: "", topicId: "", topic: "", objectives: "", activities: "", materials: "", assessmentApproach: "", humanValues: [], humanValuesNote: "", reflection: "", status: "draft", contentSource: "hub", attachments: [], primaryDoc: null, primaryDocId: null };

export function LessonPlanEditor() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const ctx = useAcademicContext();
  const isNew = lessonId === "new";
  const { data, loading, error } = useLoad(async () => {
    if (!ctx.data) return null;
    const [lesson, plans] = await Promise.all([isNew ? null : one(`lessonPlans/${lessonId}`), list("curriculumPlans", where("academicYearId", "==", ctx.data.yearId), where("status", "==", "active"))]);
    return { lesson, plans };
  }, [lessonId, ctx.data?.yearId]);
  const [form, setForm] = useState(null);
  const [state, setState] = useState(null);
  const [docModal, setDocModal] = useState(null);

  useEffect(() => {
    if (!data || !ctx.data) return;
    const lesson = data.lesson;
    const preset = ctx.data.mine.find((pair) => pair.classId === params.get("class") && pair.subjectId === params.get("subject")) || ctx.data.mine[0];
    setForm(lesson ? { ...EMPTY_LESSON, ...lesson, pair: `${lesson.classId}|${lesson.subjectId}`, week: lesson.week || "" } : { ...EMPTY_LESSON, pair: preset?.key || "", termId: ctx.data.termId || "", date: schoolToday() });
  }, [data, ctx.data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ctx.loading || loading || (!form && !error && !ctx.error)) return <Loading />;
  if (error?.code === "permission-denied" || (!isNew && data && !data.lesson)) return <div className="hub-message"><h1>You can't open this lesson plan</h1><p>Lesson plans are visible to their teacher, colleagues teaching the same class and the Academic Coordinator.</p><Link className="hub-button" to="/hub/academics/lessons">Lesson plans</Link></div>;
  if (error || ctx.error) return <ErrorNote error={error || ctx.error} />;

  const [classId, subjectId] = (form.pair || "|").split("|");
  const cls = ctx.data.classById[classId];
  const owner = isNew || data.lesson.ownerUid === auth.user.uid;
  const coordinator = isCoordinator(auth.roles) && !owner;
  const editable = owner && data.lesson?.status !== "reviewed" && (isNew ? ctx.data.mine.length > 0 : teachesSubject(auth.scope, classId, subjectId));
  const plan = data.plans.find((item) => item.standard === cls?.standard && item.subjectId === subjectId);
  const set = (patch) => { setState(null); setForm((current) => ({ ...current, ...patch })); };
  const toggleValue = (value) => set({ humanValues: form.humanValues.includes(value) ? form.humanValues.filter((item) => item !== value) : [...form.humanValues, value] });
  const pickTopic = (topicId) => { const topic = plan?.topics.find((item) => item.id === topicId); set({ topicId, topic: topic ? topic.title : form.topic, objectives: topic && !form.objectives ? (topic.objectives || []).join("\n") : form.objectives }); };
  const statusOptions = lessonStatusOptions({ owner, coordinator: isCoordinator(auth.roles) }, data.lesson?.status || "draft");
  const context = `Lesson plan · ${ctx.data.className(classId)} ${ctx.data.subjectName(subjectId)}${form.topic ? ` · ${form.topic}` : ""}`;

  async function save(event) {
    event.preventDefault();
    const payload = { ...form, classId, subjectId };
    const errors = validateLessonPlan(payload);
    if (errors.length) return setState(new Error(errors.join(" ")));
    setState("saving");
    try {
      const record = {
        academicYearId: ctx.data.yearId, termId: form.termId || null, standard: cls.standard, classId, subjectId, ownerUid: data.lesson?.ownerUid || auth.user.uid,
        week: form.week ? Number(form.week) : null, date: form.date || null, topicId: form.topicId || null, curriculumPlanId: form.topicId ? plan?.id || null : null, topic: form.topic.trim(),
        objectives: form.objectives || "", activities: form.contentSource === "hub" ? form.activities || "" : "", materials: form.contentSource === "hub" ? form.materials || "" : "", assessmentApproach: form.contentSource === "hub" ? form.assessmentApproach || "" : "",
        humanValues: form.humanValues, humanValuesNote: form.humanValuesNote || "", reflection: form.reflection || "", status: form.status, contentSource: form.contentSource,
        primaryDoc: form.contentSource === "googleDoc" ? form.primaryDoc : null, primaryDocId: form.contentSource === "googleDoc" ? form.primaryDocId : null, attachments: form.attachments,
        ...stamp(auth.user.uid, isNew),
      };
      if (isNew) { const ref = await addDoc(collection(db, "lessonPlans"), record); navigate(`/hub/academics/lessons/${ref.id}`, { replace: true }); setState("saved"); }
      else { await updateDoc(doc(db, "lessonPlans", lessonId), record); setState("saved"); }
    } catch (reason) { setState(reason); }
  }

  return <>
    <Header title={isNew ? "New lesson plan" : form.topic || "Lesson plan"} actions={!isNew && <StatusBadge status={data.lesson.status} label={LESSON_LABELS[data.lesson.status]} />}>
      {isNew ? "Choose the class and subject, then plan the lesson here or in a Google Doc." : `${ctx.data.className(classId)} · ${ctx.data.subjectName(subjectId)} · ${ctx.data.personName(data.lesson.ownerUid)}`}
    </Header>
    {data.lesson?.status === "reviewed" && <p className="hub-status" role="status">Reviewed by {ctx.data.personName(data.lesson.reviewedBy)}{data.lesson.reviewNote ? ` — “${data.lesson.reviewNote}”` : ""}.</p>}
    {coordinator && <ReviewPanel lesson={data.lesson} onDone={() => navigate("/hub/academics/lessons?view=review")} />}
    <form className="hub-form hub-form-wide" onSubmit={save}>
      <fieldset disabled={!editable} className="hub-fieldset">
        <div className="hub-form-row">
          <label>Class and subject<select required value={form.pair} disabled={!isNew} onChange={(event) => set({ pair: event.target.value, topicId: "" })}><option value="">Choose…</option>{(isNew ? ctx.data.mine : [{ key: form.pair, label: `${ctx.data.className(classId)} · ${ctx.data.subjectName(subjectId)}` }]).map((pair) => <option key={pair.key} value={pair.key}>{pair.label}</option>)}</select></label>
          <label>Term<select value={form.termId} onChange={(event) => set({ termId: event.target.value })}><option value="">—</option>{ctx.data.terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></label>
          <label>Week<input type="number" min="1" max="45" value={form.week} onChange={(event) => set({ week: event.target.value })} /></label>
          <label>Date<input type="date" value={form.date || ""} onChange={(event) => set({ date: event.target.value })} /></label>
        </div>
        <div className="hub-form-row">
          <label>Curriculum topic<select value={form.topicId || ""} onChange={(event) => pickTopic(event.target.value)} disabled={!plan}><option value="">{plan ? "— Not linked to a topic —" : "No active curriculum plan for this subject"}</option>{(plan?.topics || []).map((topic) => <option key={topic.id} value={topic.id}>{topic.title}{topic.weekFrom ? ` (weeks ${topic.weekFrom}–${topic.weekTo || topic.weekFrom})` : ""}</option>)}</select></label>
          <label>Lesson topic<input required maxLength={200} value={form.topic} onChange={(event) => set({ topic: event.target.value })} /></label>
        </div>
        <label>Learning objectives<textarea rows={3} value={form.objectives} onChange={(event) => set({ objectives: event.target.value })} /></label>
        <fieldset className="hub-choice-row"><legend>Where does the full plan live?</legend>
          <label className="hub-check"><input type="radio" name="source" checked={form.contentSource === "hub"} onChange={() => set({ contentSource: "hub" })} /> Write it here</label>
          <label className="hub-check"><input type="radio" name="source" checked={form.contentSource === "googleDoc"} onChange={() => set({ contentSource: "googleDoc" })} /> In a Google Doc (the hub keeps the link and status only)</label>
        </fieldset>
        {form.contentSource === "hub" ? <>
          <label>Learning activities<textarea rows={4} value={form.activities} onChange={(event) => set({ activities: event.target.value })} /></label>
          <div className="hub-form-row">
            <label>Teaching materials<textarea rows={3} value={form.materials} onChange={(event) => set({ materials: event.target.value })} /></label>
            <label>Assessment approach<textarea rows={3} value={form.assessmentApproach} onChange={(event) => set({ assessmentApproach: event.target.value })} /></label>
          </div>
        </> : <div className="hub-subsection"><h3>Lesson plan document</h3>
          {form.primaryDoc ? <AttachmentList items={[form.primaryDoc]} onRemove={editable ? () => set({ primaryDoc: null, primaryDocId: null }) : null} /> : <p className="hub-ws-empty">No Google Doc attached yet.</p>}
          {editable && !form.primaryDoc && <div className="hub-ws-add"><button type="button" className="hub-button hub-button-small" onClick={() => setDocModal("create")}>Create the plan in Google Docs</button><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => setDocModal("attach")}>Attach an existing Google Doc</button></div>}
        </div>}
        <fieldset className="hub-values"><legend>Human Values integration</legend>
          <div className="hub-values-chips">{VALUE_KEYS.map((value) => <label key={value} className={`hub-value-chip hub-value-${value} ${form.humanValues.includes(value) ? "active" : ""}`}><input type="checkbox" checked={form.humanValues.includes(value)} onChange={() => toggleValue(value)} />{HUMAN_VALUES[value]}</label>)}</div>
          <label>How the lesson brings these values to life <span className="hub-optional">optional</span><textarea rows={2} value={form.humanValuesNote} onChange={(event) => set({ humanValuesNote: event.target.value })} /></label>
        </fieldset>
      </fieldset>
      <div className="hub-subsection"><h3>Resources</h3>
        <AttachmentList items={form.attachments} onRemove={editable ? (item) => set({ attachments: form.attachments.filter((ref) => ref.fileId !== item.fileId) }) : null} />
        {editable && <AddResource actions={["attach", "document", "presentation", "spreadsheet", "form"]} context={context} onAdd={(item) => set({ attachments: addAttachment(form.attachments, item) })} />}
      </div>
      <fieldset disabled={!editable} className="hub-fieldset">
        <label>Teacher reflection <span className="hub-optional">after the lesson</span><textarea rows={3} value={form.reflection} onChange={(event) => set({ reflection: event.target.value })} placeholder="What worked, what to change, who needs follow-up" /></label>
        <label>Status<select value={form.status} onChange={(event) => set({ status: event.target.value })}>{statusOptions.map((status) => <option key={status} value={status}>{LESSON_LABELS[status]}</option>)}</select></label>
      </fieldset>
      {state instanceof Error && (state.code ? <ErrorNote error={state} /> : <p className="hub-error" role="alert">{state.message}</p>)}
      {state === "saved" && <p className="hub-status" role="status">Lesson plan saved.</p>}
      <div className="hub-form-actions">{editable && <button type="submit" className="hub-button" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save lesson plan"}</button>}<Link className="hub-button hub-button-quiet" to="/hub/academics/lessons">Back to lesson plans</Link></div>
    </form>
    {docModal && <WorkspaceActionModal mode={docModal} kind="document" accept={["document"]} context={context} onConfirm={(item) => set({ primaryDoc: item, primaryDocId: item.fileId })} onClose={() => setDocModal(null)} />}
  </>;
}

function ReviewPanel({ lesson, onDone }) {
  const auth = useAuth();
  const [note, setNote] = useState(lesson.reviewNote || "");
  const [state, setState] = useState(null);
  async function move(status) {
    setState("saving");
    try {
      await updateDoc(doc(db, "lessonPlans", lesson.id), status === "reviewed" ? { status, reviewNote: note.trim(), reviewedBy: auth.user.uid, reviewedAt: serverTimestamp(), ...stamp(auth.user.uid) } : { status, ...stamp(auth.user.uid) });
      onDone();
    } catch (reason) { setState(reason); }
  }
  if (!["completed", "reviewed"].includes(lesson.status)) return <p className="hub-status" role="status">This plan is {LESSON_LABELS[lesson.status].toLowerCase()}; it can be reviewed once the teacher marks it completed.</p>;
  return <Section title="Coordinator review" className="hub-review-panel">
    {lesson.status === "completed" && <label className="hub-form-plain">Note for the teacher <span className="hub-optional">optional</span><textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>}
    <ErrorNote error={state instanceof Error ? state : null} />
    <div className="hub-form-actions">{lesson.status === "completed" ? <button type="button" className="hub-button" disabled={state === "saving"} onClick={() => move("reviewed")}>Mark as reviewed</button> : <button type="button" className="hub-button hub-button-quiet" disabled={state === "saving"} onClick={() => move("completed")}>Reopen for the teacher</button>}</div>
  </Section>;
}

// ---------- Learning tasks ----------
export function LearningTasks() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const wide = isCoordinator(auth.roles) || auth.roles.includes("leadership");
  const { data, loading, error } = useLoad(async () => {
    if (!ctx.data) return null;
    const [mine, all] = await Promise.all([listIn("learningTasks", "classId", auth.scope?.classIds || []), wide ? list("learningTasks", where("academicYearId", "==", ctx.data.yearId)) : []]);
    return [...new Map([...mine, ...all].map((task) => [task.id, task])).values()];
  }, [ctx.data?.yearId, wide]);
  const rows = (data || []).map((task) => ({ ...task, className: ctx.data.className(task.classId), subject: ctx.data.subjectName(task.subjectId), mine: teachesSubject(auth.scope, task.classId, task.subjectId) }));
  return <>
    <Header title="Learning tasks" actions={ctx.data?.mine.length > 0 && <Link className="hub-button" to="/hub/academics/tasks/new">New task</Link>}>Homework and learning tasks: set them for a class, attach resources, track completion and give feedback.</Header>
    <ErrorNote error={ctx.error || error} />
    {ctx.loading || loading ? <Loading /> : !rows.length ? <EmptyState title="No learning tasks yet." />
      : <DataTable rows={rows} searchKeys={["title", "className", "subject"]} exportName="srss-learning-tasks" initialSort={{ key: "dueDate", dir: -1 }} rowHref={(row) => `/hub/academics/tasks/${row.id}`}
        filters={[{ key: "classId", label: "Class", options: (ctx.data?.classes || []).map((cls) => [cls.id, cls.name]) }, { key: "status", label: "Status", options: TASK_STATUSES }, { key: "mineState", label: "Subject", value: (row) => (row.mine ? "mine" : "other"), options: [["mine", "Subjects I teach"], ["other", "Other subjects"]] }]}
        columns={[{ key: "title", label: "Task" }, { key: "dueDate", label: "Due", render: (row) => (row.dueDate ? formatDate(row.dueDate, { weekday: "short", day: "numeric", month: "short" }) : "—") }, { key: "className", label: "Class" }, { key: "subject", label: "Subject" }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> }]} />}
  </>;
}

const EMPTY_TASK = { title: "", instructions: "", setDate: "", dueDate: "", submissionMode: "none", classroomUrl: "", status: "draft", attachments: [] };

export function LearningTaskDetail() {
  const { taskId } = useParams();
  const [params] = useSearchParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const ctx = useAcademicContext();
  const isNew = taskId === "new";
  const { data, loading, error, reload } = useLoad(async () => (isNew ? { task: null } : { task: await one(`learningTasks/${taskId}`) }), [taskId]);
  const [form, setForm] = useState(null);
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!data || !ctx.data) return;
    const preset = ctx.data.mine.find((pair) => pair.classId === params.get("class") && pair.subjectId === params.get("subject")) || ctx.data.mine[0];
    setForm(data.task ? { ...EMPTY_TASK, ...data.task, pair: `${data.task.classId}|${data.task.subjectId}` } : { ...EMPTY_TASK, pair: preset?.key || "", setDate: schoolToday() });
  }, [data, ctx.data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ctx.loading || loading || (!form && !error && !ctx.error)) return <Loading />;
  if (error?.code === "permission-denied" || (!isNew && data && !data.task)) return <div className="hub-message"><h1>You can't open this task</h1><p>Tasks are visible to the teachers of that class.</p><Link className="hub-button" to="/hub/academics/tasks">Learning tasks</Link></div>;
  if (error || ctx.error) return <ErrorNote error={error || ctx.error} />;

  const [classId, subjectId] = (form.pair || "|").split("|");
  const editable = isNew ? ctx.data.mine.length > 0 : teachesSubject(auth.scope, classId, subjectId);
  const set = (patch) => { setState(null); setForm((current) => ({ ...current, ...patch })); };
  async function save(event) {
    event.preventDefault();
    const payload = { ...form, classId, subjectId };
    const errors = validateTask(payload);
    if (errors.length) return setState(new Error(errors.join(" ")));
    setState("saving");
    try {
      const record = { academicYearId: ctx.data.yearId, standard: ctx.data.classById[classId]?.standard || null, classId, subjectId, title: form.title.trim(), instructions: form.instructions || "", setDate: form.setDate || null, dueDate: form.dueDate || null,
        submissionMode: form.submissionMode, classroomUrl: form.submissionMode === "classroom" ? form.classroomUrl || "" : "", status: form.status, attachments: form.attachments, ...stamp(auth.user.uid, isNew) };
      if (isNew) { const ref = await addDoc(collection(db, "learningTasks"), record); navigate(`/hub/academics/tasks/${ref.id}`, { replace: true }); }
      else { await updateDoc(doc(db, "learningTasks", taskId), record); reload(); }
      setState("saved");
    } catch (reason) { setState(reason); }
  }
  return <>
    <Header title={isNew ? "New learning task" : form.title} actions={!isNew && <StatusBadge status={data.task.status} />}>{isNew ? "Families and pupils see a task once it is published." : `${ctx.data.className(classId)} · ${ctx.data.subjectName(subjectId)}${data.task.dueDate ? ` · due ${formatDate(data.task.dueDate, { weekday: "long", day: "numeric", month: "long" })}` : ""}`}</Header>
    <form className="hub-form hub-form-wide" onSubmit={save}>
      <fieldset disabled={!editable} className="hub-fieldset">
        <div className="hub-form-row">
          <label>Class and subject<select required value={form.pair} disabled={!isNew} onChange={(event) => set({ pair: event.target.value })}><option value="">Choose…</option>{(isNew ? ctx.data.mine : [{ key: form.pair, label: `${ctx.data.className(classId)} · ${ctx.data.subjectName(subjectId)}` }]).map((pair) => <option key={pair.key} value={pair.key}>{pair.label}</option>)}</select></label>
          <label>Set on<input type="date" value={form.setDate || ""} onChange={(event) => set({ setDate: event.target.value })} /></label>
          <label>Due<input type="date" value={form.dueDate || ""} onChange={(event) => set({ dueDate: event.target.value })} /></label>
        </div>
        <label>Title<input required maxLength={200} value={form.title} onChange={(event) => set({ title: event.target.value })} /></label>
        <label>Instructions<textarea rows={4} maxLength={5000} value={form.instructions} onChange={(event) => set({ instructions: event.target.value })} placeholder="What pupils should do, in words they can follow at home" /></label>
        <div className="hub-form-row">
          <label>Hand-in<select value={form.submissionMode} onChange={(event) => set({ submissionMode: event.target.value })}>{SUBMISSION_MODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={(event) => set({ status: event.target.value })}>{TASK_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}{value === "published" ? " (families can see it)" : ""}</option>)}</select></label>
        </div>
        {form.submissionMode === "classroom" && <label>Google Classroom assignment link <span className="hub-optional">optional</span><input type="url" value={form.classroomUrl} onChange={(event) => set({ classroomUrl: event.target.value })} placeholder="https://classroom.google.com/…" /><span className="hub-hint">Classroom stays the record for hand-ins and grades; the hub shows the task and links to it, so the assignment isn't duplicated.</span></label>}
      </fieldset>
      <div className="hub-subsection"><h3>Resources</h3>
        <AttachmentList items={form.attachments} onRemove={editable ? (item) => set({ attachments: form.attachments.filter((ref) => ref.fileId !== item.fileId) }) : null} />
        {editable && <AddResource actions={["attach", "document", "presentation", "form"]} context={`Learning task · ${ctx.data.className(classId)} ${ctx.data.subjectName(subjectId)}`} onAdd={(item) => set({ attachments: addAttachment(form.attachments, item) })} />}
      </div>
      {state instanceof Error && (state.code ? <ErrorNote error={state} /> : <p className="hub-error" role="alert">{state.message}</p>)}
      {state === "saved" && <p className="hub-status" role="status">Task saved.</p>}
      <div className="hub-form-actions">{editable && <button type="submit" className="hub-button" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save task"}</button>}<Link className="hub-button hub-button-quiet" to="/hub/academics/tasks">Back to tasks</Link></div>
    </form>
    {!isNew && data.task.status !== "draft" && <TaskProgress task={data.task} editable={editable} />}
  </>;
}

function TaskProgress({ task, editable }) {
  const auth = useAuth();
  const { data, loading, error, reload } = useLoad(async () => {
    const [students, progress] = await Promise.all([list("students", where("currentClassId", "==", task.classId), where("status", "==", "active")), list("learningTaskProgress", where("taskId", "==", task.id), where("classId", "==", task.classId))]);
    return { students: students.sort((a, b) => a.name.localeCompare(b.name)), progress };
  }, [task.id]);
  const [edits, setEdits] = useState({});
  const [state, setState] = useState(null);
  const byStudent = useMemo(() => Object.fromEntries((data?.progress || []).map((item) => [item.studentId, item])), [data]);
  const summary = data ? taskSummary(data.students, data.progress) : null;
  const value = (studentId, field) => edits[studentId]?.[field] ?? byStudent[studentId]?.[field] ?? "";
  const edit = (studentId, patch) => { setState(null); setEdits((current) => ({ ...current, [studentId]: { ...current[studentId], ...patch } })); };

  async function save() {
    setState("saving");
    try {
      const changed = Object.entries(edits).filter(([studentId]) => value(studentId, "status"));
      for (const part of chunk(changed)) {
        const batch = writeBatch(db);
        for (const [studentId, patch] of part) {
          const existing = byStudent[studentId];
          const record = { taskId: task.id, studentId, classId: task.classId, subjectId: task.subjectId, status: patch.status ?? existing?.status, ...stamp(auth.user.uid, !existing) };
          if (patch.feedback !== undefined && patch.feedback !== (existing?.feedback || "")) Object.assign(record, { feedback: patch.feedback.trim() || null, feedbackBy: auth.user.uid, feedbackAt: serverTimestamp() });
          if (!existing) Object.assign(record, { submissionText: "", submissionUrl: "" });
          batch.set(doc(db, "learningTaskProgress", `${task.id}_${studentId}`), record, { merge: true });
        }
        await batch.commit();
      }
      setEdits({}); setState("saved"); reload();
    } catch (reason) { setState(reason); }
  }
  return <Section title="Completion and feedback">
    <ErrorNote error={error} />
    {loading ? <Loading /> : <>
      <div className="hub-stats">{PROGRESS_STATUSES.map(([status, label]) => <StatCard key={status} label={label} value={summary.counts[status]} />)}<StatCard label="Not yet recorded" value={summary.notYet} tone={summary.notYet ? "warn" : "good"} /></div>
      <div className="hub-table-scroll"><table className="hub-table hub-progress-table">
        <thead><tr><th scope="col">Pupil</th><th scope="col">Hand-in</th><th scope="col">Status</th><th scope="col">Feedback</th></tr></thead>
        <tbody>{data.students.map((student) => { const item = byStudent[student.id]; return <tr key={student.id}>
          <td data-label="Pupil"><strong>{student.preferredName || student.name}</strong></td>
          <td data-label="Hand-in">{item?.submissionText || item?.submissionUrl ? <>{item.submissionText && <p className="hub-submission">{item.submissionText}</p>}{item.submissionUrl && <a href={item.submissionUrl} target="_blank" rel="noreferrer">Open link</a>}<small>{formatDate(item.submittedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small></> : <span className="hub-muted">—</span>}</td>
          <td data-label="Status"><select aria-label={`Status for ${student.name}`} disabled={!editable} value={value(student.id, "status")} onChange={(event) => edit(student.id, { status: event.target.value })}><option value="">Not recorded</option>{PROGRESS_STATUSES.map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></td>
          <td data-label="Feedback"><input aria-label={`Feedback for ${student.name}`} disabled={!editable} maxLength={1000} value={value(student.id, "feedback")} onChange={(event) => edit(student.id, { feedback: event.target.value })} placeholder="Encouraging, specific feedback" /></td>
        </tr>; })}</tbody>
      </table></div>
      {state instanceof Error && <ErrorNote error={state} />}
      {state === "saved" && <p className="hub-status" role="status">Completion and feedback saved. Families see them with the task.</p>}
      {editable && <div className="hub-form-actions"><button type="button" className="hub-button" disabled={state === "saving" || !Object.keys(edits).length} onClick={save}>{state === "saving" ? "Saving…" : "Save completion and feedback"}</button></div>}
    </>}
  </Section>;
}

// ---------- Family & pupil view ----------
export function FamilyTasks() {
  const auth = useAuth();
  const isStudent = auth.currentHub === "student";
  const childIds = isStudent ? [auth.scope?.studentId].filter(Boolean) : auth.scope?.childIds || [];
  const [selected, setSelected] = useState(null);
  const { data: base, loading: baseLoading, error: baseError } = useLoad(async () => ({ children: (await getMany("students", childIds)).sort((a, b) => (b.currentStandard || 0) - (a.currentStandard || 0)), subjects: await list("subjects") }), [childIds.join("|")]);
  useEffect(() => { if (base?.children.length && !selected) setSelected(base.children[0].id); }, [base, selected]);
  const child = base?.children.find((item) => item.id === selected);
  const { data, loading, error, reload } = useLoad(async () => {
    if (!child?.currentClassId) return { tasks: [], progress: [] };
    const [tasks, progress] = await Promise.all([list("learningTasks", where("classId", "==", child.currentClassId), where("status", "in", ["published", "closed"])), list("learningTaskProgress", where("studentId", "==", child.id))]);
    return { tasks, progress };
  }, [child?.id]);
  const subjectName = (id) => base?.subjects.find((subject) => subject.id === id)?.name || id;
  const view = data && child ? familyTaskView(data.tasks, data.progress, child.id, schoolToday()) : [];
  const upcoming = view.filter((task) => task.status === "published" && !["completed", "excused"].includes(task.progress?.status));
  return <>
    <PageHeader kicker={isStudent ? "My learning" : "My family"} title={isStudent ? "My tasks" : "Learning tasks"}>{isStudent ? "Your homework and learning tasks, with your teachers' feedback." : "Homework and learning tasks set for your child's class, with due dates and completion."}</PageHeader>
    {base && <ChildSwitcher children={base.children} selectedId={selected} onSelect={setSelected} />}
    <ErrorNote error={baseError || error} />
    {baseLoading || loading ? <Loading /> : !child ? <EmptyState title={isStudent ? "Your account isn't linked to a student record yet." : "No children are linked to this account yet."} /> : !view.length ? <EmptyState title="No learning tasks have been set yet." /> : <>
      <div className="hub-stats"><StatCard label="To do" value={upcoming.length} tone={upcoming.some((task) => task.overdue) ? "warn" : "neutral"} /><StatCard label="Overdue" value={view.filter((task) => task.overdue).length} tone={view.some((task) => task.overdue) ? "bad" : "good"} /><StatCard label="Completed" value={view.filter((task) => task.progress?.status === "completed").length} /></div>
      <ul className="hub-list hub-list-feed hub-task-feed">{view.map((task) => <li key={task.id}>
        <div className="hub-card-top"><span><span className="hub-kicker">{subjectName(task.subjectId)}</span><strong>{task.title}</strong></span><span className="hub-badges">{task.overdue && <StatusBadge status="overdue" />}{task.progress ? <StatusBadge status={task.progress.status === "incomplete" ? "missing" : task.progress.status === "excused" ? "info" : "good"} label={PROGRESS_LABELS[task.progress.status]} /> : task.status === "closed" ? <StatusBadge status="archived" label="Closed" /> : null}</span></div>
        <small>{task.dueDate ? `Due ${formatDate(task.dueDate, { weekday: "long", day: "numeric", month: "long" })}` : "No due date"}</small>
        {task.instructions && <p className="hub-pre">{task.instructions}</p>}
        {task.attachments?.length > 0 && <AttachmentList items={task.attachments} />}
        {task.submissionMode === "classroom" && (task.classroomUrl ? <a className="hub-button hub-button-quiet hub-button-small" href={task.classroomUrl} target="_blank" rel="noreferrer">Open in Google Classroom</a> : <p className="hub-hint">Hand this in through Google Classroom.</p>)}
        {task.progress?.feedback && <p className="hub-quote"><strong>Teacher:</strong> {task.progress.feedback}</p>}
        {isStudent && task.submissionMode === "hub" && task.status === "published" && (!task.progress || ["submitted", "incomplete"].includes(task.progress.status)) && <HandIn task={task} studentId={child.id} existing={task.progress} onDone={reload} />}
      </li>)}</ul>
    </>}
  </>;
}

function HandIn({ task, studentId, existing, onDone }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existing?.submissionText || "");
  const [url, setUrl] = useState(existing?.submissionUrl || "");
  const [state, setState] = useState(null);
  async function submit(event) {
    event.preventDefault();
    if (url && !/^https:\/\//.test(url)) return setState(new Error("Links must start with https://"));
    setState("saving");
    try {
      const record = { status: "submitted", submissionText: text.trim(), submissionUrl: url.trim(), submittedAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: auth.user.uid };
      if (existing) await updateDoc(doc(db, "learningTaskProgress", existing.id), record);
      else await setDoc(doc(db, "learningTaskProgress", `${task.id}_${studentId}`), { taskId: task.id, studentId, classId: task.classId, subjectId: task.subjectId, createdAt: serverTimestamp(), createdBy: auth.user.uid, ...record });
      setOpen(false); onDone();
    } catch (reason) { setState(reason); }
  }
  if (!open) return <button type="button" className="hub-button hub-button-small" onClick={() => setOpen(true)}>{existing ? "Update my hand-in" : "Hand in my work"}</button>;
  return <form className="hub-form hub-hand-in" onSubmit={submit}>
    <label>My work<textarea rows={4} maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} placeholder="Type your answer or a note for your teacher" /></label>
    <label>Link to my work <span className="hub-optional">optional, e.g. a Google Doc</span><input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://docs.google.com/…" /></label>
    {state instanceof Error && (state.code ? <ErrorNote error={state} /> : <p className="hub-error" role="alert">{state.message}</p>)}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state === "saving" || (!text.trim() && !url.trim())}>Hand in</button><button type="button" className="hub-button hub-button-quiet" onClick={() => setOpen(false)}>Cancel</button></div>
  </form>;
}
