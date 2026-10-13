// Assessment management (Stage 1): configuration, spreadsheet-style marks entry, the approval workflow
// (Draft → Submitted → Reviewed → Approved → Published → Locked) and families' published results.
// Firestore is the authoritative record of results. Google Sheets is used only for preparation: teachers
// export a template and import validated marks into their DRAFT sheet; there is no two-way sync.
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useParams } from "react-router-dom";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase-firestore";
import { useAuth } from "../../auth/AuthProvider";
import { getMany, list, listIn, one, useLoad } from "../data";
import {
  COMPONENT_TYPES, FLAG_LABELS, GRADING_PRESETS, PERIOD_STATUSES, RESULT_LABELS, canAmend, canConfigureAssessments, canEditMarks, canPublishResults,
  canReviewResults, cellText, chunk, computeResult, importMarks, markSheetId, marksTemplateCsv, readMarkCell, sheetActions, sheetProgress, teachesSubject, validateAssessment,
} from "../logic/academics";
import { useAcademicContext } from "../academicContext";
import { ChildSwitcher, DataTable, EmptyState, ErrorNote, Loading, PageHeader, Section, StatCard, StatusBadge, formatDate } from "../ui";

const stamp = (uid, isNew) => ({ updatedAt: serverTimestamp(), updatedBy: uid, ...(isNew ? { createdAt: serverTimestamp(), createdBy: uid } : {}) });
const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const SHEET_TONE = { draft: "info", submitted: "pending", reviewed: "review", approved: "approved", published: "published", locked: "complete" };
const SheetBadge = ({ status }) => <StatusBadge status={status ? SHEET_TONE[status] : "missing"} label={status ? RESULT_LABELS[status] : "Not started"} />;
const wideRoles = ["academicCoordinator", "schoolAdmin", "leadership", "safeguardingLead", "privacySteward", "auditor"];

function Header({ title, children, actions }) {
  const { roles } = useAuth();
  const tabs = [["/hub/assessments", "Mark sheets"], ...(canConfigureAssessments(roles) ? [["/hub/assessments/setup", "Setup"]] : [])];
  return <><PageHeader kicker="Assessments" title={title} actions={actions}>{children}</PageHeader>
    {tabs.length > 1 && <nav className="hub-tabs hub-module-tabs" aria-label="Assessment sections">{tabs.map(([to, label]) => <NavLink key={to} to={to} end>{label}</NavLink>)}</nav>}</>;
}

function usePeriods(yearId) {
  return useLoad(async () => (yearId ? (await list("assessmentPeriods", where("academicYearId", "==", yearId))).sort((a, b) => String(b.startDate).localeCompare(String(a.startDate))) : []), [yearId]);
}

function PeriodPicker({ periods, value, onChange }) {
  return <label className="hub-inline-field">Period<select value={value || ""} onChange={(event) => onChange(event.target.value)}>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}{period.status === "open" ? " · open" : period.status === "closed" ? " · closed" : ""}</option>)}</select></label>;
}

// ---------- Overview: my sheets, review queue, entry progress ----------
export function AssessmentsHome() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const periods = usePeriods(ctx.data?.yearId);
  const [periodId, setPeriodId] = useState(null);
  useEffect(() => { if (periods.data?.length && !periodId) setPeriodId((periods.data.find((period) => period.status === "open") || periods.data[0]).id); }, [periods.data, periodId]);
  const wide = auth.roles.some((role) => wideRoles.includes(role));
  const { data, loading, error } = useLoad(async () => {
    if (!periodId) return null;
    const [assessments, wideSheets, mySheets] = await Promise.all([
      list("assessments", where("periodId", "==", periodId)),
      wide ? list("markSheets", where("periodId", "==", periodId)) : [],
      listIn("markSheets", "classId", auth.scope?.classIds || [], where("periodId", "==", periodId)),
    ]);
    return { assessments, sheets: Object.fromEntries([...wideSheets, ...mySheets].map((sheet) => [sheet.id, sheet])) };
  }, [periodId, wide]);

  const period = periods.data?.find((item) => item.id === periodId);
  const rowsFor = (pairs) => pairs.flatMap((pair) => {
    const assessment = data?.assessments.find((item) => item.standard === pair.standard && item.subjectId === pair.subjectId);
    if (!assessment) return [];
    const id = markSheetId(periodId, assessment.id, pair.classId);
    const sheet = data.sheets[id];
    return [{ id, to: `/hub/assessments/marks/${periodId}/${assessment.id}/${pair.classId}`, className: ctx.data.className(pair.classId), subject: ctx.data.subjectName(pair.subjectId), teacher: ctx.data.personName(pair.teacherUid), standard: pair.standard, status: sheet?.status || "", progress: sheet?.progress, returnNote: sheet?.status === "draft" ? sheet?.returnNote : null }];
  });
  const unique = (rows) => [...new Map(rows.map((row) => [row.id, row])).values()];
  const mine = ctx.data && data ? unique(rowsFor(ctx.data.mine)) : [];
  const all = ctx.data && data && wide ? unique(rowsFor(ctx.data.pairs)) : [];
  const queue = all.filter((row) => (canReviewResults(auth.roles) && row.status === "submitted") || (canPublishResults(auth.roles) && ["reviewed", "approved"].includes(row.status)));
  const unconfigured = ctx.data && data ? ctx.data.mine.filter((pair) => !data.assessments.some((item) => item.standard === pair.standard && item.subjectId === pair.subjectId)) : [];
  const columns = (withTeacher) => [{ key: "className", label: "Class" }, { key: "subject", label: "Subject" }, ...(withTeacher ? [{ key: "teacher", label: "Teacher" }] : []), { key: "status", label: "Status", sortValue: (row) => Object.keys(RESULT_LABELS).indexOf(row.status), csv: (row) => RESULT_LABELS[row.status] || "Not started", render: (row) => <SheetBadge status={row.status} /> }, { key: "progress", label: "Entered", sortValue: (row) => row.progress?.done ?? -1, csv: (row) => (row.progress ? `${row.progress.done}/${row.progress.total}` : ""), render: (row) => (row.progress ? `${row.progress.done} of ${row.progress.total}` : "—") }];

  return <>
    <Header title="Assessments" actions={periods.data?.length > 0 && <PeriodPicker periods={periods.data} value={periodId} onChange={setPeriodId} />}>
      {period ? `${period.name}${period.entryDeadline ? ` · marks due ${formatDate(period.entryDeadline, { day: "numeric", month: "long" })}` : ""}` : "Enter marks, review and publish results."}
    </Header>
    <ErrorNote error={ctx.error || periods.error || error} />
    {ctx.loading || periods.loading || (periodId && loading) ? <Loading /> : !periods.data.length ? <EmptyState title="No assessment periods yet.">{canConfigureAssessments(auth.roles) ? <>Create one under <Link to="/hub/assessments/setup">Setup</Link>.</> : "The Academic Coordinator sets up assessment periods and structures."}</EmptyState> : <>
      {mine.length > 0 && <Section title="My mark sheets">
        {mine.filter((row) => row.returnNote).map((row) => <p key={row.id} className="hub-error" role="alert"><strong>{row.className} · {row.subject} was returned:</strong> {row.returnNote}</p>)}
        <DataTable rows={mine} columns={columns(false)} rowHref={(row) => row.to} pageSize={20} />
      </Section>}
      {unconfigured.length > 0 && <p className="hub-hint">No assessment structure yet for {unconfigured.map((pair) => pair.label).join(", ")} in this period.</p>}
      {queue.length > 0 && <Section title={canPublishResults(auth.roles) ? "Waiting for approval or publication" : "Waiting for your review"}>
        <DataTable rows={queue} columns={columns(true)} rowHref={(row) => row.to} pageSize={20} />
      </Section>}
      {wide && <Section title="Entry progress">
        <div className="hub-stats">{["", "draft", "submitted", "reviewed", "approved", "published"].map((status) => <StatCard key={status || "none"} label={status ? RESULT_LABELS[status] : "Not started"} value={all.filter((row) => row.status === status).length} />)}</div>
        <DataTable rows={all} columns={columns(true)} rowHref={(row) => row.to} searchKeys={["className", "subject", "teacher"]} exportName={`srss-assessment-progress-${periodId}`}
          filters={[{ key: "standard", label: "Standard", options: [1, 2, 3, 4, 5, 6].map((s) => [String(s), `Standard ${s}`]) }, { key: "status", label: "Status", options: [["", "Not started"], ...Object.entries(RESULT_LABELS)] }]} />
      </Section>}
      {!mine.length && !wide && <EmptyState title="No mark sheets for you in this period." />}
    </>}
  </>;
}

// ---------- Setup: periods and structures ----------
export function AssessmentSetup() {
  const auth = useAuth();
  const ctx = useAcademicContext();
  const periods = usePeriods(ctx.data?.yearId);
  const [periodId, setPeriodId] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [editing, setEditing] = useState(null);
  useEffect(() => { if (periods.data?.length && !periodId) setPeriodId(periods.data[0].id); }, [periods.data, periodId]);
  const structures = useLoad(async () => (periodId ? list("assessments", where("periodId", "==", periodId)) : []), [periodId]);
  if (!canConfigureAssessments(auth.roles)) return <div className="hub-message"><h1>Setup is for the Academic Coordinator and school office</h1><Link className="hub-button" to="/hub/assessments">Assessments</Link></div>;
  if (ctx.loading || periods.loading) return <Loading />;
  if (editing) return <><Header title={editing.id ? `Edit ${editing.name}` : "New assessment structure"} /><AssessmentEditor assessment={editing} ctx={ctx.data} existing={structures.data || []} onDone={() => { setEditing(null); structures.reload(); }} /></>;
  const period = periods.data.find((item) => item.id === periodId);
  return <>
    <Header title="Assessment setup">Periods, then one structure per Standard and subject: components, maximum marks, weightings and grading.</Header>
    <ErrorNote error={ctx.error || periods.error} />
    <Section title="Assessment periods" action={!editingPeriod && <button type="button" className="hub-button hub-button-small" onClick={() => setEditingPeriod({ status: "planned", termId: ctx.data.termId || "", resultsVisibleToStudents: false })}>New period</button>}>
      {editingPeriod && <PeriodEditor period={editingPeriod} ctx={ctx.data} onDone={(id) => { setEditingPeriod(null); periods.reload(); if (id) setPeriodId(id); }} />}
      {periods.data.length ? <DataTable rows={periods.data.map((item) => ({ ...item, term: ctx.data.terms.find((term) => term.id === item.termId)?.name || "—" }))} onRowClick={(row) => setEditingPeriod(row)} pageSize={10}
        columns={[{ key: "name", label: "Period" }, { key: "term", label: "Term" }, { key: "startDate", label: "Dates", render: (row) => `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` }, { key: "entryDeadline", label: "Marks due", render: (row) => formatDate(row.entryDeadline) }, { key: "resultsVisibleToStudents", label: "Pupils see results", render: (row) => (row.resultsVisibleToStudents ? "Yes" : "No") }, { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status === "open" ? "active" : row.status === "closed" ? "archived" : "pending"} label={PERIOD_STATUSES.find(([value]) => value === row.status)?.[1]} /> }]} />
        : <EmptyState title="No periods yet." />}
    </Section>
    {period && <Section title={`Structures · ${period.name}`} action={<span className="hub-page-actions"><PeriodPicker periods={periods.data} value={periodId} onChange={setPeriodId} /><button type="button" className="hub-button hub-button-small" onClick={() => setEditing({ periodId, weighting: "weighted", absentPolicy: "exclude", components: [{ id: newId("c"), name: "Written", type: "written", maxMarks: 100, weight: 100 }], grading: { preset: "bands", bands: GRADING_PRESETS.bands.bands } })}>New structure</button></span>}>
      <ErrorNote error={structures.error} />
      {structures.loading ? <Loading /> : structures.data.length ? <DataTable rows={structures.data.map((item) => ({ ...item, subject: ctx.data.subjectName(item.subjectId), summary: item.components.map((c) => `${c.name} /${c.maxMarks}${item.weighting === "weighted" ? ` (${c.weight}%)` : ""}`).join(" · ") }))} onRowClick={(row) => setEditing(row)} searchKeys={["subject", "name"]}
        filters={[{ key: "standard", label: "Standard", options: [1, 2, 3, 4, 5, 6].map((s) => [String(s), `Standard ${s}`]) }]}
        columns={[{ key: "standard", label: "Standard", render: (row) => `Std ${row.standard}` }, { key: "subject", label: "Subject" }, { key: "summary", label: "Components" }, { key: "grading", label: "Grading", render: (row) => (row.grading?.bands?.length ? row.grading.bands.map((band) => band.grade).join(" ") : "Marks only") }]} />
        : <EmptyState title="No structures in this period yet.">Create one per Standard and subject; you can create the same structure for several Standards at once.</EmptyState>}
    </Section>}
  </>;
}

function PeriodEditor({ period, ctx, onDone }) {
  const auth = useAuth();
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", entryDeadline: "", ...period });
  const [state, setState] = useState(null);
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  async function save(event) {
    event.preventDefault();
    if (form.startDate && form.endDate && form.endDate < form.startDate) return setState(new Error("The period ends before it starts."));
    setState("saving");
    try {
      const record = { academicYearId: ctx.yearId, termId: form.termId || null, name: form.name.trim(), startDate: form.startDate || null, endDate: form.endDate || null, entryDeadline: form.entryDeadline || null, status: form.status, resultsVisibleToStudents: Boolean(form.resultsVisibleToStudents), ...stamp(auth.user.uid, !period.id) };
      if (period.id) { await updateDoc(doc(db, "assessmentPeriods", period.id), record); onDone(period.id); }
      else { const ref = await addDoc(collection(db, "assessmentPeriods"), record); onDone(ref.id); }
    } catch (reason) { setState(reason); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={save}>
    <div className="hub-form-row">
      <label>Name<input required maxLength={120} value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder="e.g. Term 3 assessment" /></label>
      <label>Term<select value={form.termId || ""} onChange={(event) => set({ termId: event.target.value })}><option value="">—</option>{ctx.terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></label>
      <label>Status<select value={form.status} onChange={(event) => set({ status: event.target.value })}>{PERIOD_STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="hub-form-row">
      <label>Starts<input type="date" value={form.startDate || ""} onChange={(event) => set({ startDate: event.target.value })} /></label>
      <label>Ends<input type="date" value={form.endDate || ""} onChange={(event) => set({ endDate: event.target.value })} /></label>
      <label>Marks due<input type="date" value={form.entryDeadline || ""} onChange={(event) => set({ entryDeadline: event.target.value })} /></label>
    </div>
    <label className="hub-check"><input type="checkbox" checked={Boolean(form.resultsVisibleToStudents)} onChange={(event) => set({ resultsVisibleToStudents: event.target.checked })} /> Pupils may see their own published results (families always can)</label>
    {state instanceof Error && (state.code ? <ErrorNote error={state} /> : <p className="hub-error" role="alert">{state.message}</p>)}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={state === "saving"}>Save period</button><button type="button" className="hub-button hub-button-quiet" onClick={() => onDone(null)}>Cancel</button></div>
  </form>;
}

function AssessmentEditor({ assessment, ctx, existing, onDone }) {
  const auth = useAuth();
  const [form, setForm] = useState({ standard: "", subjectId: "", name: "", ...assessment, alsoStandards: [] });
  const [state, setState] = useState(null);
  const marked = useLoad(async () => (assessment.id ? (await list("markSheets", where("assessmentId", "==", assessment.id))).length : 0), [assessment.id]);
  const set = (patch) => { setState(null); setForm((current) => ({ ...current, ...patch })); };
  const setComponent = (index, patch) => set({ components: form.components.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  const setBand = (index, patch) => set({ grading: { ...form.grading, preset: "custom", bands: form.grading.bands.map((b, i) => (i === index ? { ...b, ...patch } : b)) } });
  const candidate = { ...form, standard: Number(form.standard) || null, components: form.components.map((c) => ({ ...c, maxMarks: Number(c.maxMarks), weight: Number(c.weight) })), grading: { ...form.grading, bands: form.grading.bands.map((b) => ({ ...b, min: Number(b.min) })) } };
  const errors = validateAssessment(candidate);
  const duplicate = (standard) => existing.some((item) => item.id !== assessment.id && item.standard === standard && item.subjectId === form.subjectId);
  if (form.subjectId && candidate.standard && duplicate(candidate.standard)) errors.push(`Standard ${candidate.standard} already has a ${ctx.subjectName(form.subjectId)} structure in this period.`);
  const totalWeight = form.components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  async function save(event) {
    event.preventDefault();
    if (errors.length) return;
    setState("saving");
    try {
      const record = (standard) => ({ academicYearId: ctx.yearId, periodId: form.periodId, standard, subjectId: form.subjectId, name: form.name.trim() || ctx.subjectName(form.subjectId), weighting: form.weighting, absentPolicy: form.absentPolicy,
        components: candidate.components.map((c) => ({ id: c.id, name: c.name.trim(), type: c.type || "written", maxMarks: c.maxMarks, ...(form.weighting === "weighted" ? { weight: c.weight } : {}) })),
        grading: { preset: form.grading.preset || "custom", bands: candidate.grading.bands.map((b) => ({ min: b.min, grade: String(b.grade).trim() })) }, startDate: form.startDate || null, endDate: form.endDate || null, ...stamp(auth.user.uid, !assessment.id) });
      if (assessment.id) await updateDoc(doc(db, "assessments", assessment.id), record(candidate.standard));
      else for (const standard of [candidate.standard, ...form.alsoStandards.map(Number).filter((s) => s !== candidate.standard && !duplicate(s))]) await addDoc(collection(db, "assessments"), record(standard));
      onDone();
    } catch (reason) { setState(reason); }
  }
  return <form className="hub-form hub-form-wide" onSubmit={save}>
    {marked.data > 0 && <p className="hub-restricted">Marks have already been entered against this structure in {marked.data} {marked.data === 1 ? "class" : "classes"}. Renaming or re-weighting is safe; removing a component removes its marks from the results.</p>}
    <div className="hub-form-row">
      <label>Standard<select required value={form.standard} disabled={Boolean(assessment.id)} onChange={(event) => set({ standard: event.target.value })}><option value="">Choose…</option>{[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>Standard {s}</option>)}</select></label>
      <label>Subject<select required value={form.subjectId} disabled={Boolean(assessment.id)} onChange={(event) => set({ subjectId: event.target.value })}><option value="">Choose…</option>{ctx.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
      <label>Name shown on results<input maxLength={120} value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder={form.subjectId ? ctx.subjectName(form.subjectId) : ""} /></label>
    </div>
    <div className="hub-form-row">
      <label>Assessment from<input type="date" value={form.startDate || ""} onChange={(event) => set({ startDate: event.target.value })} /></label>
      <label>to<input type="date" value={form.endDate || ""} onChange={(event) => set({ endDate: event.target.value })} /></label>
    </div>
    <fieldset className="hub-choice-row"><legend>How components combine</legend>
      <label className="hub-check"><input type="radio" name="weighting" checked={form.weighting === "weighted"} onChange={() => set({ weighting: "weighted" })} /> Weighted percentages (weights total 100%)</label>
      <label className="hub-check"><input type="radio" name="weighting" checked={form.weighting === "rawTotal"} onChange={() => set({ weighting: "rawTotal" })} /> Add up the marks</label>
    </fieldset>
    <div className="hub-subsection"><h3>Components</h3>
      <div className="hub-table-scroll"><table className="hub-table hub-edit-table">
        <thead><tr><th scope="col">Component</th><th scope="col">Type</th><th scope="col">Maximum marks</th>{form.weighting === "weighted" && <th scope="col">Weight %</th>}<th scope="col"><span className="hub-visually-hidden">Remove</span></th></tr></thead>
        <tbody>{form.components.map((component, index) => <tr key={component.id}>
          <td data-label="Component"><input aria-label="Component name" required value={component.name} onChange={(event) => setComponent(index, { name: event.target.value })} /></td>
          <td data-label="Type"><select aria-label="Component type" value={component.type || "written"} onChange={(event) => setComponent(index, { type: event.target.value })}>{COMPONENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
          <td data-label="Maximum marks"><input aria-label="Maximum marks" type="number" min="1" max="1000" step="0.5" value={component.maxMarks} onChange={(event) => setComponent(index, { maxMarks: event.target.value })} /></td>
          {form.weighting === "weighted" && <td data-label="Weight %"><input aria-label="Weight" type="number" min="0" max="100" step="0.5" value={component.weight ?? ""} onChange={(event) => setComponent(index, { weight: event.target.value })} /></td>}
          <td><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={form.components.length === 1} onClick={() => set({ components: form.components.filter((_, i) => i !== index) })}>Remove</button></td>
        </tr>)}</tbody>
      </table></div>
      <div className="hub-form-actions"><button type="button" className="hub-button hub-button-quiet hub-button-small" disabled={form.components.length >= 12} onClick={() => set({ components: [...form.components, { id: newId("c"), name: "", type: "oral", maxMarks: 20, weight: 0 }] })}>Add component</button>{form.weighting === "weighted" && <span className={`hub-hint ${Math.abs(totalWeight - 100) < 0.001 ? "" : "hub-hint-warn"}`}>Weights total {Math.round(totalWeight * 100) / 100}%</span>}</div>
    </div>
    <fieldset className="hub-choice-row"><legend>When a pupil is absent for a component</legend>
      <label className="hub-check"><input type="radio" name="absent" checked={form.absentPolicy === "exclude"} onChange={() => set({ absentPolicy: "exclude" })} /> Leave it out of the percentage (like an exemption)</label>
      <label className="hub-check"><input type="radio" name="absent" checked={form.absentPolicy === "zero"} onChange={() => set({ absentPolicy: "zero" })} /> Count it as zero</label>
    </fieldset>
    <div className="hub-subsection"><h3>Grading</h3>
      <label className="hub-form-plain">Start from<select value={form.grading.preset || "custom"} onChange={(event) => event.target.value !== "custom" && set({ grading: { preset: event.target.value, bands: GRADING_PRESETS[event.target.value].bands } })}>{Object.entries(GRADING_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}<option value="custom">Custom bands</option></select></label>
      {form.grading.bands.length > 0 && <div className="hub-table-scroll"><table className="hub-table hub-edit-table"><thead><tr><th scope="col">From %</th><th scope="col">Grade</th><th scope="col"><span className="hub-visually-hidden">Remove</span></th></tr></thead>
        <tbody>{form.grading.bands.map((band, index) => <tr key={index}><td data-label="From %"><input aria-label="Band starts at" type="number" min="0" max="100" step="0.5" value={band.min} onChange={(event) => setBand(index, { min: event.target.value })} /></td><td data-label="Grade"><input aria-label="Grade label" maxLength={12} value={band.grade} onChange={(event) => setBand(index, { grade: event.target.value })} /></td><td><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => set({ grading: { ...form.grading, preset: "custom", bands: form.grading.bands.filter((_, i) => i !== index) } })}>Remove</button></td></tr>)}</tbody></table></div>}
      <button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => set({ grading: { ...form.grading, preset: "custom", bands: [...form.grading.bands, { min: 0, grade: "" }] } })}>Add grade band</button>
    </div>
    {!assessment.id && <fieldset className="hub-choice-row"><legend>Also create this structure for</legend>{[1, 2, 3, 4, 5, 6].filter((s) => s !== Number(form.standard)).map((s) => <label key={s} className="hub-check"><input type="checkbox" checked={form.alsoStandards.includes(s)} onChange={(event) => set({ alsoStandards: event.target.checked ? [...form.alsoStandards, s] : form.alsoStandards.filter((item) => item !== s) })} /> Standard {s}{form.subjectId && duplicate(s) ? " (already set up)" : ""}</label>)}</fieldset>}
    {errors.length > 0 && <ul className="hub-error hub-error-list" role="alert">{errors.map((message) => <li key={message}>{message}</li>)}</ul>}
    {state instanceof Error && <ErrorNote error={state} />}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={errors.length > 0 || state === "saving"}>{state === "saving" ? "Saving…" : "Save structure"}</button><button type="button" className="hub-button hub-button-quiet" onClick={onDone}>Cancel</button></div>
  </form>;
}

// ---------- Marks entry ----------
// Firestore returns map keys in its own order, so compare marks and flags key by key.
const sameMap = (a = {}, b = {}) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].every((key) => (a?.[key] ?? null) === (b?.[key] ?? null));
const sameEntry = (entry, stored) => sameMap(entry.marks, stored.marks) && sameMap(entry.flags, stored.flags) && entry.comment.trim() === (stored.comment || "");
export function MarkEntry() {
  const { periodId, assessmentId, classId } = useParams();
  const auth = useAuth();
  const sheetId = markSheetId(periodId, assessmentId, classId);
  const { data, loading, error, reload } = useLoad(async () => {
    const [period, assessment, cls, sheet, students, results] = await Promise.all([
      one(`assessmentPeriods/${periodId}`), one(`assessments/${assessmentId}`), one(`classes/${classId}`), one(`markSheets/${sheetId}`).catch((reason) => { if (reason.code === "permission-denied") throw reason; return null; }),
      list("students", where("currentClassId", "==", classId), where("status", "==", "active")),
      list("studentResults", where("sheetId", "==", sheetId), where("classId", "==", classId)),
    ]);
    const subject = assessment ? await one(`subjects/${assessment.subjectId}`) : null;
    return { period, assessment, cls, sheet, subject, students: students.sort((a, b) => a.name.localeCompare(b.name)), results: Object.fromEntries(results.map((result) => [result.studentId, result])) };
  }, [sheetId]);
  const [texts, setTexts] = useState({});
  const [comments, setComments] = useState({});
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState(null);
  const [amending, setAmending] = useState(false);
  const [reason, setReason] = useState("");
  const [importing, setImporting] = useState(false);
  const [action, setAction] = useState(null);

  useEffect(() => {
    if (!data?.assessment) return;
    setTexts(Object.fromEntries(data.students.map((student) => [student.id, Object.fromEntries(data.assessment.components.map((c) => [c.id, String(cellText(data.results[student.id], c.id))]))])));
    setComments(Object.fromEntries(data.students.map((student) => [student.id, data.results[student.id]?.comment || ""])));
    setDirty(false); setAmending(false); setReason("");
  }, [data]);

  const entries = useMemo(() => {
    if (!data?.assessment) return {};
    return Object.fromEntries(data.students.map((student) => {
      const marks = {}; const flags = {}; const errors = {};
      for (const c of data.assessment.components) { const cell = readMarkCell(texts[student.id]?.[c.id], c.maxMarks); marks[c.id] = cell.mark; if (cell.flag) flags[c.id] = cell.flag; if (cell.error) errors[c.id] = cell.error; }
      return [student.id, { marks, flags, errors, comment: comments[student.id] || "" }];
    }));
  }, [data, texts, comments]);

  if (loading) return <Loading />;
  if (error?.code === "permission-denied" || (data && (!data.assessment || !data.cls))) return <div className="hub-message"><h1>You can't open this mark sheet</h1><p>Mark sheets are open to the teachers of that class and the staff who review and publish results.</p><Link className="hub-button" to="/hub/assessments">Assessments</Link></div>;
  if (error) return <ErrorNote error={error} />;

  const { assessment, sheet, students, results } = data;
  const status = sheet?.status;
  const teaches = teachesSubject(auth.scope, classId, assessment.subjectId);
  const editable = canEditMarks(status, teaches) || amending;
  const progress = sheetProgress(assessment, students, entries);
  const cellErrors = Object.entries(entries).flatMap(([studentId, entry]) => Object.entries(entry.errors).map(([componentId, message]) => ({ studentId, componentId, message })));
  const actions = sheetActions(auth.roles, status || "draft", { teaches, complete: progress.complete && !cellErrors.length });
  const title = `${data.cls.name} · ${data.subject?.name || assessment.name}`;
  const setCell = (studentId, componentId, value) => { setState(null); setDirty(true); setTexts((current) => ({ ...current, [studentId]: { ...current[studentId], [componentId]: value } })); };
  const focusCell = (row, col) => document.querySelector(`[data-cell="${row}:${col}"]`)?.focus();

  function resultRecord(student, isNew) {
    const entry = entries[student.id];
    const computed = computeResult(assessment, entry);
    return { periodId, assessmentId, classId, subjectId: assessment.subjectId, standard: assessment.standard, academicYearId: assessment.academicYearId || data.cls.academicYearId, studentId: student.id, sheetId,
      marks: entry.marks, flags: entry.flags, percent: computed.percent, grade: computed.grade, comment: entry.comment.trim().slice(0, 1000), ...stamp(auth.user.uid, isNew) };
  }

  // Draft save: results in small batches (rule lookups per batch are limited), then the sheet's progress.
  async function saveDraft() {
    for (const part of chunk(students)) {
      const batch = writeBatch(db);
      for (const student of part) { const existing = results[student.id]; batch.set(doc(db, "studentResults", `${sheetId}_${student.id}`), { ...resultRecord(student, !existing), status: "draft" }, { merge: true }); }
      await batch.commit();
    }
    const sheetRecord = { progress: { done: progress.done, total: progress.total }, ...stamp(auth.user.uid, !sheet) };
    if (sheet) await updateDoc(doc(db, "markSheets", sheetId), sheetRecord);
    else await setDoc(doc(db, "markSheets", sheetId), { periodId, assessmentId, classId, subjectId: assessment.subjectId, standard: assessment.standard, academicYearId: assessment.academicYearId || data.cls.academicYearId, status: "draft", ...sheetRecord });
  }

  // Workflow step: results first (idempotent, so a retry finishes an interrupted step), then the sheet.
  async function move(to, note) {
    setState("saving");
    try {
      if (dirty && canEditMarks(status, teaches)) await saveDraft();
      const current = await list("studentResults", where("sheetId", "==", sheetId), where("classId", "==", classId));
      const studentVisible = Boolean(data.period?.resultsVisibleToStudents);
      for (const part of chunk(current.filter((result) => result.status !== to))) {
        const batch = writeBatch(db);
        for (const result of part) batch.update(doc(db, "studentResults", result.id), { status: to, ...(to === "published" ? { studentVisible } : {}), ...stamp(auth.user.uid) });
        await batch.commit();
      }
      const step = { submitted: "submitted", reviewed: "reviewed", approved: "approved", published: "published", locked: "locked", draft: "returned" }[to];
      await updateDoc(doc(db, "markSheets", sheetId), { status: to, [`${step}By`]: auth.user.uid, [`${step}At`]: serverTimestamp(), ...(to === "draft" ? { returnNote: note } : {}), ...(to === "submitted" ? { progress: { done: progress.done, total: progress.total } } : {}), ...stamp(auth.user.uid) });
      setAction(null); setState({ done: to }); reload();
    } catch (failure) { setState(failure); }
  }

  async function save() {
    setState("saving");
    try {
      if (amending) {
        if (reason.trim().length < 5) throw new Error("Record the reason for this amendment (at least a few words).");
        const changed = students.filter((student) => results[student.id] && !sameEntry(entries[student.id], results[student.id]));
        for (const part of chunk(changed)) {
          const batch = writeBatch(db);
          for (const student of part) { const { marks, flags, percent, grade, comment, updatedAt, updatedBy } = resultRecord(student, false); batch.update(doc(db, "studentResults", `${sheetId}_${student.id}`), { marks, flags, percent, grade, comment, updatedAt, updatedBy, amendmentReason: reason.trim(), amendedBy: auth.user.uid, amendedAt: serverTimestamp() }); }
          await batch.commit();
        }
        setState({ done: "amended", count: changed.length });
      } else { await saveDraft(); setState({ done: "saved" }); }
      reload();
    } catch (failure) { setState(failure); }
  }

  function exportTemplate() {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([marksTemplateCsv(assessment, students, entries)], { type: "text/csv" }));
    link.download = `${data.cls.name}-${data.subject?.name || "marks"}-${data.period?.name || periodId}.csv`.replace(/\s+/g, "-").toLowerCase();
    link.click(); URL.revokeObjectURL(link.href);
  }
  function applyImport(rows) {
    setTexts((current) => { const next = { ...current }; for (const row of rows) next[row.studentId] = { ...next[row.studentId], ...Object.fromEntries(Object.keys(row.marks).map((id) => [id, String(cellText(row, id))])) }; return next; });
    setComments((current) => ({ ...current, ...Object.fromEntries(rows.filter((row) => row.comment !== undefined).map((row) => [row.studentId, row.comment])) }));
    setDirty(true); setImporting(false); setState({ done: "imported", count: rows.length });
  }

  const message = state?.done === "saved" ? "Draft saved. Only you and reviewers can see it." : state?.done === "draft" ? "Returned to the teacher for correction, with your note." : state?.done === "imported" ? `${state.count} ${state.count === 1 ? "row" : "rows"} imported into the draft. Check them, then save.` : state?.done === "amended" ? `${state.count} ${state.count === 1 ? "result" : "results"} amended; the reason is recorded in the audit trail.` : state?.done ? `Mark sheet is now ${RESULT_LABELS[state.done].toLowerCase()}.` : null;
  return <>
    <Header title={title} actions={<SheetBadge status={status} />}>{data.period?.name}{data.period?.entryDeadline ? ` · marks due ${formatDate(data.period.entryDeadline, { day: "numeric", month: "long" })}` : ""} · {assessment.weighting === "weighted" ? "weighted" : "total marks"}{assessment.grading?.bands?.length ? ` · grades ${assessment.grading.bands.map((band) => band.grade).join(" ")}` : ""}</Header>
    {status === "draft" && sheet?.returnNote && <p className="hub-error" role="alert"><strong>Returned for correction:</strong> {sheet.returnNote}</p>}
    {!teaches && !status && <p className="hub-status" role="status">No marks have been entered for this class yet.</p>}
    <SheetTrail sheet={sheet} />
    {editable && !amending && <p className="hub-hint">Type a mark, <strong>A</strong> for absent or <strong>EX</strong> for exempt. Enter and the arrow keys move between pupils.</p>}
    <div className="hub-table-scroll hub-marks-scroll"><table className="hub-table hub-marks">
      <thead><tr><th scope="col">Pupil</th>{assessment.components.map((c) => <th key={c.id} scope="col">{c.name}<small>/{c.maxMarks}{assessment.weighting === "weighted" ? ` · ${c.weight}%` : ""}</small></th>)}<th scope="col">%</th>{assessment.grading?.bands?.length > 0 && <th scope="col">Grade</th>}<th scope="col">Comment</th></tr></thead>
      <tbody>{students.map((student, row) => { const entry = entries[student.id]; const computed = computeResult(assessment, entry); return <tr key={student.id}>
        <th scope="row"><span>{student.name}</span>{results[student.id]?.amendmentReason && <small title={results[student.id].amendmentReason}>Amended</small>}</th>
        {assessment.components.map((c, col) => <td key={c.id} data-label={c.name}>{editable
          ? <input data-cell={`${row}:${col}`} className={entry.errors[c.id] ? "invalid" : ""} aria-invalid={Boolean(entry.errors[c.id])} title={entry.errors[c.id] || ""} aria-label={`${c.name} for ${student.name}, out of ${c.maxMarks}`} inputMode="decimal" autoComplete="off" value={texts[student.id]?.[c.id] ?? ""}
            onChange={(event) => setCell(student.id, c.id, event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === "ArrowDown") { event.preventDefault(); focusCell(row + 1, col); } if (event.key === "ArrowUp") { event.preventDefault(); focusCell(row - 1, col); } }} />
          : <span>{entry.flags[c.id] ? FLAG_LABELS[entry.flags[c.id]] : entry.marks[c.id] ?? "—"}</span>}</td>)}
        <td data-label="%" className="hub-marks-total">{computed.percent ?? (computed.complete ? "—" : "…")}</td>
        {assessment.grading?.bands?.length > 0 && <td data-label="Grade" className="hub-marks-total">{computed.grade ?? "—"}</td>}
        <td data-label="Comment">{editable ? <input aria-label={`Comment for ${student.name}`} maxLength={1000} value={comments[student.id] || ""} onChange={(event) => { setDirty(true); setComments({ ...comments, [student.id]: event.target.value }); }} /> : <span>{entry.comment || "—"}</span>}</td>
      </tr>; })}</tbody>
    </table></div>
    {!students.length && <EmptyState title="No active pupils in this class." />}
    {cellErrors.length > 0 && <ul className="hub-error hub-error-list" role="alert">{cellErrors.slice(0, 6).map((item) => <li key={`${item.studentId}-${item.componentId}`}>{students.find((s) => s.id === item.studentId)?.name}, {assessment.components.find((c) => c.id === item.componentId)?.name}: {item.message}</li>)}</ul>}
    {amending && <label className="hub-form-plain hub-amend">Reason for amending published results<textarea rows={2} required value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Marking error in Ishaan's oral assessment, confirmed with the subject teacher" /></label>}
    <div className="hub-sticky-actions">
      {state instanceof Error && (state.code ? <ErrorNote error={state} /> : <p className="hub-error" role="alert">{state.message}</p>)}
      {message && <p className="hub-status" role="status">{message}</p>}
      <span className="hub-hint">{progress.done} of {progress.total} pupils complete</span>
      {editable && <button type="button" className="hub-button" disabled={state === "saving" || cellErrors.length > 0 || (!dirty && !amending)} onClick={save}>{state === "saving" ? "Saving…" : amending ? "Save amendment" : "Save draft"}</button>}
      {actions.map((item) => <button key={item.to} type="button" className={`hub-button ${item.quiet ? "hub-button-quiet" : ""}`} title={item.hint || undefined} disabled={state === "saving" || item.disabled} onClick={() => (item.note || ["published", "locked"].includes(item.to) ? setAction(item) : move(item.to))}>{item.label}</button>)}
      {canEditMarks(status, teaches) && <><button type="button" className="hub-button hub-button-quiet" onClick={() => setImporting(true)}>Import from Google Sheets</button><button type="button" className="hub-button hub-button-quiet" onClick={exportTemplate}>Export template</button></>}
      {canAmend(auth.roles, status) && !amending && <button type="button" className="hub-button hub-button-quiet" onClick={() => setAmending(true)}>Amend a result</button>}
      {amending && <button type="button" className="hub-button hub-button-quiet" onClick={() => reload()}>Cancel amendment</button>}
      <Link className="hub-button hub-button-quiet" to="/hub/assessments">Back</Link>
    </div>
    {importing && <ImportDialog assessment={assessment} students={students} onApply={applyImport} onClose={() => setImporting(false)} />}
    {action && <ConfirmDialog action={action} title={title} onConfirm={(note) => move(action.to, note)} onClose={() => setAction(null)} busy={state === "saving"} />}
  </>;
}

function SheetTrail({ sheet }) {
  const ctx = useAcademicContext();
  if (!sheet) return null;
  const steps = [["submitted", "Submitted"], ["reviewed", "Reviewed"], ["approved", "Approved"], ["published", "Published"], ["locked", "Locked"], ["returned", "Last returned"]].filter(([step]) => sheet[`${step}At`]);
  if (!steps.length) return null;
  return <ol className="hub-trail">{steps.map(([step, label]) => <li key={step}><strong>{label}</strong> {formatDate(sheet[`${step}At`], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{ctx.data ? ` · ${ctx.data.personName(sheet[`${step}By`])}` : ""}</li>)}</ol>;
}

function Dialog({ title, children, onClose }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return createPortal(<dialog ref={dialog} className="hub-dialog hub-dialog-narrow" aria-labelledby="as-dialog-title" onClose={onClose} onCancel={onClose}>
    <div className="hub-dialog-head"><h2 id="as-dialog-title">{title}</h2><button type="button" className="hub-button hub-button-quiet hub-button-small" onClick={() => dialog.current?.close()}>Close</button></div>
    {children(() => dialog.current?.close())}
  </dialog>, document.body);
}

function ConfirmDialog({ action, title, onConfirm, onClose, busy }) {
  const [note, setNote] = useState("");
  const explain = { draft: "The sheet goes back to the teacher as a draft. Tell them exactly what to check.", published: "Families will see these results on their dashboards straight away. Published results can then only be changed by an amendment with a recorded reason.", locked: "Locking closes the results for this period. Leadership can still amend a result with a recorded reason." }[action.to];
  return <Dialog title={`${action.label} · ${title}`} onClose={onClose}>{(close) => <form className="hub-dialog-form" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); onConfirm(note.trim()); }}>
    <p>{explain}</p>
    {action.note && <label>What needs correcting<textarea rows={3} required value={note} onChange={(event) => setNote(event.target.value)} /></label>}
    <div className="hub-form-actions"><button type="submit" className="hub-button" disabled={busy || (action.note && !note.trim())}>{action.label}</button><button type="button" className="hub-button hub-button-quiet" onClick={close}>Cancel</button></div>
  </form>}</Dialog>;
}

// Controlled import from Google Sheets: paste the cells (or upload a CSV), check the preview, then apply
// to the draft. Nothing is saved until the teacher saves the draft.
function ImportDialog({ assessment, students, onApply, onClose }) {
  const [text, setText] = useState("");
  const result = text.trim() ? importMarks(text, assessment, students) : null;
  async function readFile(event) { const file = event.target.files?.[0]; if (file) setText(await file.text()); }
  return <Dialog title="Import marks from Google Sheets" onClose={onClose}>{(close) => <div className="hub-dialog-form">
    <ol className="hub-ws-steps">
      <li>Use <strong>Export template</strong> (or your own sheet with a <em>Student ID</em> or <em>Name</em> column and one column per component: {assessment.components.map((c) => c.name).join(", ")}).</li>
      <li>In Google Sheets, select the header row and the pupils' rows, copy, and paste below — or download the sheet as CSV and choose the file.</li>
    </ol>
    <label>Paste cells here<textarea rows={8} value={text} onChange={(event) => setText(event.target.value)} placeholder={`Student ID\tName\t${assessment.components.map((c) => c.name).join("\t")}`} /></label>
    <label className="hub-form-plain">Or choose a CSV file<input type="file" accept=".csv,text/csv,text/tab-separated-values" onChange={readFile} /></label>
    {result && <div aria-live="polite">
      <p className={result.rows.length ? "hub-status" : "hub-error"}>{result.rows.length} {result.rows.length === 1 ? "pupil" : "pupils"} ready to import{result.errors.length ? `; ${result.errors.length} ${result.errors.length === 1 ? "problem" : "problems"} to fix in the sheet` : ""}.</p>
      {result.errors.length > 0 && <ul className="hub-error hub-error-list">{result.errors.slice(0, 10).map((item) => <li key={item}>{item}</li>)}{result.errors.length > 10 && <li>…and {result.errors.length - 10} more</li>}</ul>}
    </div>}
    <div className="hub-form-actions"><button type="button" className="hub-button" disabled={!result?.rows.length} onClick={() => { onApply(result.rows); close(); }}>Apply to draft</button><button type="button" className="hub-button hub-button-quiet" onClick={close}>Cancel</button></div>
  </div>}</Dialog>;
}

// ---------- Families and pupils: published results ----------
export function FamilyResults() {
  const auth = useAuth();
  const isStudent = auth.currentHub === "student";
  const childIds = isStudent ? [auth.scope?.studentId].filter(Boolean) : auth.scope?.childIds || [];
  const [selected, setSelected] = useState(null);
  const { data: children } = useLoad(async () => (await getMany("students", childIds)).sort((a, b) => (b.currentStandard || 0) - (a.currentStandard || 0)), [childIds.join("|")]);
  useEffect(() => { if (children?.length && !selected) setSelected(children[0].id); }, [children, selected]);
  const { data, loading, error } = useLoad(async () => {
    if (!selected) return null;
    const results = await list("studentResults", where("studentId", "==", selected), where("status", "in", ["published", "locked"]), ...(isStudent ? [where("studentVisible", "==", true)] : []));
    const [assessments, periods, subjects] = await Promise.all([getMany("assessments", results.map((result) => result.assessmentId)), getMany("assessmentPeriods", results.map((result) => result.periodId)), list("subjects")]);
    return { results, assessments: Object.fromEntries(assessments.map((item) => [item.id, item])), periods: Object.fromEntries(periods.map((item) => [item.id, item])), subjects: Object.fromEntries(subjects.map((item) => [item.id, item])) };
  }, [selected]);
  const byPeriod = {};
  for (const result of data?.results || []) (byPeriod[result.periodId] ||= []).push(result);
  const periodIds = Object.keys(byPeriod).sort((a, b) => String(data.periods[b]?.startDate).localeCompare(String(data.periods[a]?.startDate)));
  const child = children?.find((item) => item.id === selected);
  return <>
    <PageHeader kicker={isStudent ? "My learning" : "My family"} title={isStudent ? "My progress" : "Progress"}>{isStudent ? "Your published results, with your teachers' comments." : `Published results${child ? ` for ${child.preferredName || child.name}` : ""}. Results appear here once the school has reviewed and published them.`}</PageHeader>
    {children && <ChildSwitcher children={children} selectedId={selected} onSelect={setSelected} />}
    <ErrorNote error={error} />
    {loading ? <Loading /> : !periodIds.length ? <EmptyState title="No published results yet.">{isStudent ? "Your teachers will share results here." : "You'll see results here as soon as each assessment is published."}</EmptyState>
      : periodIds.map((periodId) => <Section key={periodId} title={data.periods[periodId]?.name || "Assessment"}>
        <ul className="hub-result-list">{byPeriod[periodId].sort((a, b) => String(data.subjects[a.subjectId]?.name).localeCompare(String(data.subjects[b.subjectId]?.name))).map((result) => { const assessment = data.assessments[result.assessmentId]; return <li key={result.id}>
          <div className="hub-card-top"><strong>{assessment?.name || data.subjects[result.subjectId]?.name}</strong><span className="hub-result-score">{result.percent != null ? `${result.percent}%` : "—"}{result.grade && <StatusBadge status="good" label={`Grade ${result.grade}`} />}</span></div>
          {assessment && <dl className="hub-result-parts">{assessment.components.map((c) => <div key={c.id}><dt>{c.name}</dt><dd>{result.flags?.[c.id] ? FLAG_LABELS[result.flags[c.id]] : result.marks?.[c.id] != null ? `${result.marks[c.id]} / ${c.maxMarks}` : "—"}</dd></div>)}</dl>}
          {result.comment && <p className="hub-quote"><strong>Teacher:</strong> {result.comment}</p>}
        </li>; })}</ul>
      </Section>)}
  </>;
}
