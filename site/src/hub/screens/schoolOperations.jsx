import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Loading, PageHeader, Section, StatusBadge } from '../ui';
import { operationsCall, operationsError, operationDate } from '../operations-api';
import { URGENT_CHANGES, HUB_TEAM_DUTIES, RESPONSIBILITIES } from '../../../functions/operations-model.js';
import '../operations.css';

const OWNER_LABELS = { office: 'School Clerk · office', pic: 'PIC Teacher · audit lead', leadership: 'Headmistress / authorised leader', content: 'Content editor', finance: 'Finance Officer · fee information', safeguarding: 'Safeguarding Lead', technical: 'Hub team', teacher: 'Class teachers' };
const STATUS_LABELS = { notStarted: 'Not started', inProgress: 'In progress', submitted: 'Awaiting review', approved: 'Approved', returned: 'Changes requested', deferred: 'From when it opens', due: 'Due this period', complete: 'Signed off' };
const TABS = [['setup', 'Set up the school'], ['mine', 'My tasks'], ['upkeep', 'Upkeep timetable'], ['log', 'Sign-off record'], ['help', 'Questions & support'], ['team', 'Team & settings']];
const IMPORT_LINKS = { staff: 'staff', pupils: 'students', students: 'students', guardians: 'guardians', classes: 'classes', subjects: 'subjects', enrolments: 'enrollments', enrollment: 'enrollments', assignments: 'teacherAssignments' };

function useOperations(yearId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError('');
    operationsCall('snapshot', yearId ? { yearId } : {}).then(value => {
      if (alive) setData(value);
    }).catch(reason => { if (alive) setError(operationsError(reason)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [yearId, version]);
  return { data, loading, error, reload };
}

function useSave(yearId, onSaved) {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  async function save(action, payload, success = 'Saved to the school record.') {
    setBusy(true); setError(''); setMessage('');
    try {
      await operationsCall(action, { yearId, ...payload });
      setMessage(success); onSaved?.(); return true;
    } catch (reason) { setError(operationsError(reason)); return false; }
    finally { setBusy(false); }
  }
  return { save, busy, error, message };
}

function SaveFeedback({ state }) {
  return <><p className="ops-feedback" role="status">{state.message}</p>{state.error && <p className="hub-error" role="alert">{state.error}</p>}</>;
}
function Owner({ owner, config }) {
  const person = config?.responsibilities?.[owner];
  return <span>{OWNER_LABELS[owner] || owner}{person?.name ? ` · ${person.name}` : <span className="ops-muted"> · name to be confirmed</span>}</span>;
}
function TaskStatus({ status }) { return <StatusBadge status={status === 'approved' ? 'complete' : status === 'inProgress' ? 'open' : status === 'notStarted' ? 'pending' : status} label={STATUS_LABELS[status] || status} />; }
const isLeader = roles => roles.some(r => ['leadership', 'superAdmin'].includes(r));

export function SchoolOperations() {
  const auth = useAuth();
  const [yearId, setYearId] = useState(''), [tab, setTab] = useState('setup');
  const state = useOperations(yearId);
  const { data, loading, error, reload } = state;
  const approved = data?.tasks.filter(t => t.status !== 'deferred' && t.status === 'approved').length || 0;
  const active = data?.tasks.filter(t => t.status !== 'deferred').length || 0;
  return <div className="school-operations">
    <PageHeader kicker="SRSS25 launch · School operations" title="A clear start. A school that stays up to date." actions={<OperationsModalButton yearId={data?.yearId} />}>
      Prepare the school together, keep track of the next action, and build the hub’s services as they open.
    </PageHeader>
    <div className="ops-toolbar">
      <label className="hub-field">Academic year<select value={yearId || data?.yearId || ''} disabled={loading} onChange={e => setYearId(e.target.value)}>{!(data?.years || []).length && <option value={data?.yearId || ''}>Preparing 2027</option>}{(data?.years || []).map(y => <option key={y.id} value={y.id}>{y.name}</option>)}</select></label>
      <Link to="/hub/admin/setup" className="hub-button hub-button-quiet">Open school records setup</Link>
      <button type="button" className="hub-button hub-button-quiet" onClick={reload} disabled={loading}>Refresh records</button>
    </div>
    {error && <p className="hub-error" role="alert">{error}</p>}
    {loading ? <Loading label="Checking setup and upkeep records…" /> : data && !error && <>
      <section className="ops-progress" aria-label="School setup progress">
        <div><strong>{approved} of {active} setup tasks approved</strong><p>Record checks and school review are shown separately. Future services do not block the SRSS25 launch.</p></div>
        <progress max={active || 1} value={approved} aria-label="Approved setup tasks" />
      </section>
      <nav className="ops-tabs" aria-label="School operations views">{TABS.map(([id, label]) => <button type="button" key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}{id === 'help' && data.help?.some(h => h.status === 'open') ? ` (${data.help.filter(h => h.status === 'open').length})` : ''}</button>)}</nav>
      <div className="ops-view">
        {(tab === 'setup' || tab === 'mine') && <SetupTasks key={`${data.yearId}-${tab}`} data={data} mine={tab === 'mine'} onSaved={reload} />}
        {tab === 'upkeep' && <Upkeep data={data} onSaved={reload} />}
        {tab === 'log' && <Section title="Sign-off record"><p>Start a blank record for the routine you have completed. The hub records your account and the signing time.</p><SignOffForm data={data} onSaved={reload} /><SignOffHistory rows={data.signoffs} /></Section>}
        {tab === 'help' && <HelpDesk data={data} onSaved={reload} />}
        {tab === 'team' && <TeamSettings key={`${data.yearId}-${data.config.revision}`} data={data} onSaved={reload} canConfigure={data.permissions?.configure ?? isLeader(auth.roles)} />}
      </div>
    </>}
  </div>;
}

function SetupTasks({ data, mine, onSaved }) {
  const auth = useAuth();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const myTask = task => task.assigneeUid === auth.user.uid || data.config.responsibilities?.[task.owner]?.uid === auth.user.uid || data.config.responsibilities?.[task.owner]?.backupUid === auth.user.uid;
  const tasks = data.tasks.filter(task => (!mine || myTask(task)) && (filter === 'all' || filter === 'outstanding' && !['approved', 'deferred'].includes(task.status) || filter === 'review' && task.status === 'submitted'));
  return <>
    {mine ? <p>Tasks explicitly assigned to you, including those where you are the named backup. The team settings show responsibilities still waiting for a name.</p> : <p>Open a task for instructions, required information and its editing screen. Save your progress as you go; submit the completed record for school review.</p>}
    <div className="ops-filter"><label>Show<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All tasks</option><option value="outstanding">Needs attention</option><option value="review">Awaiting review</option></select></label><Link to="/hub/admin/import" className="hub-button hub-button-quiet">Import school spreadsheets</Link></div>
    {!tasks.length && <p className="hub-empty">{mine ? 'No tasks have been assigned to your account yet. Check the team responsibilities or open Set up the school.' : 'No tasks match this view.'}</p>}
    <ol className="ops-task-list">{tasks.map(task => {
      const expanded = open === task.id;
      return <li key={task.id}>
        <button type="button" className="ops-task-head" onClick={() => setOpen(expanded ? null : task.id)} aria-expanded={expanded} aria-controls={`ops-task-${task.id}`}>
          <span><strong>{task.title}</strong><small><Owner owner={task.owner} config={data.config} />{task.dueDate ? ` · Due ${task.dueDate}` : ''}</small></span><TaskStatus status={task.status} />
        </button>
        {expanded && <div id={`ops-task-${task.id}`} className="ops-task-body"><TaskEditor key={`${task.id}-${task.revision}`} task={task} data={data} onSaved={onSaved} /></div>}
      </li>;
    })}</ol>
    <Section title="Readiness for school launch" className="ops-readiness">
      <TaskStatus status={data.readiness?.ready ? 'approved' : 'inProgress'} />
      <p>{data.readiness?.ready ? 'The current checks and required approvals are complete. Leadership can coordinate the school’s staged launch.' : 'Complete the following checks before leadership confirms the school launch.'}</p>
      {!!data.readiness?.blockers?.length && <ul>{data.readiness.blockers.map((item, i) => <li key={i}>{typeof item === 'string' ? item : item.summary || item.message || item.title}</li>)}</ul>}
      <p className="hub-hint">A saved task or uploaded spreadsheet does not itself grant access or invite families. Use the account and guardian-link screens to verify the authorised records.</p>
    </Section>
  </>;
}

function TaskEditor({ task, data, onSaved }) {
  const auth = useAuth();
  const state = useSave(data.yearId, onSaved);
  const [checked, setChecked] = useState(task.checked || []), [note, setNote] = useState(task.note || ''), [evidence, setEvidence] = useState(task.evidence || ''), [dueDate, setDueDate] = useState(task.dueDate || ''), [assigneeUid, setAssigneeUid] = useState(task.assigneeUid || ''), [reviewNote, setReviewNote] = useState('');
  const [question, setQuestion] = useState('');
  const deferred = task.status === 'deferred';
  const canEdit = task.canEdit ?? auth.roles.some(r => ['schoolAdmin', 'academicCoordinator', 'superAdmin', 'leadership'].includes(r));
  const canReview = task.canReview ?? auth.roles.some(r => ['academicCoordinator', 'superAdmin', 'leadership'].includes(r));
  const payload = { taskId: task.id, revision: task.revision || 0, checked, note, evidence, dueDate, assigneeUid };
  const importDataset = IMPORT_LINKS[task.id];
  return <>
    {deferred && <div className="ops-notice"><strong>From when it opens</strong><p>Results and report cards will be used after February 2027. Leadership opens these routines when the service is ready; they are excluded from launch progress until then.</p></div>}
    {task.description && <p>{task.description}</p>}
    {!!task.steps?.length && <><h3>Step by step</h3><ol className="ops-instructions">{task.steps.map((step, i) => <li key={i}>{step}</li>)}</ol></>}
    {!!task.fields?.length && <details className="ops-details"><summary>Information to prepare</summary><ul>{task.fields.map((field, i) => <li key={i}>{field}</li>)}</ul></details>}
    <div className="ops-actions">{!deferred && (task.links || []).map(([path, label]) => <Link className="hub-button hub-button-quiet" to={path} key={path}>{label}</Link>)}{!deferred && importDataset && <Link className="hub-button hub-button-quiet" to={`/hub/admin/import?dataset=${importDataset}`}>Import existing list</Link>}</div>
    {task.recordCheck && <div className={`ops-record-check ${task.recordCheck.ready ? 'is-ready' : ''}`}><strong>{task.recordCheck.ready ? 'Record check passed' : 'Record check needs attention'}</strong><p>{task.recordCheck.summary}</p></div>}
    {!!task.dependsOn?.length && <p className="hub-hint">Prepare first: {task.dependsOn.map(id => data.tasks.find(t => t.id === id)?.title || id).join(' · ')}.</p>}
    <form className="hub-form ops-form" onSubmit={e => { e.preventDefault(); state.save('saveTask', { ...payload, status: 'inProgress' }, 'Progress saved. You can return to this task later.'); }}>
      <fieldset disabled={!canEdit || deferred || state.busy}><legend>Completion checklist</legend>{(task.checks || []).map((check, index) => <label className="hub-check" key={index}><input type="checkbox" checked={checked.includes(check)} onChange={e => setChecked(e.target.checked ? [...checked, check] : checked.filter(item => item !== check))} />{check}</label>)}</fieldset>
      <div className="ops-form-grid">
        <label>Assigned colleague<select disabled={!canEdit || deferred || state.busy} value={assigneeUid} onChange={e => setAssigneeUid(e.target.value)}><option value="">Use the role’s named owner</option>{data.users.filter(user => user.roles?.some(role => RESPONSIBILITIES.find(r => r.id === task.owner)?.roles.includes(role))).map(user => <option key={user.uid} value={user.uid}>{user.name}</option>)}</select></label>
        <label>Agreed due date<input disabled={!canEdit || deferred || state.busy} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></label>
      </div>
      <label>Progress or corrections<textarea disabled={!canEdit || deferred || state.busy} maxLength={2000} rows={3} value={note} onChange={e => setNote(e.target.value)} /></label>
      <label>Evidence / checked source<textarea disabled={!canEdit || deferred || state.busy} maxLength={2000} rows={3} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Record the checked source, version and review result. Use a restricted file reference where needed." /></label>
      <p className="hub-hint">Keep pupil details, custody information and health records in their authorised records. This checklist needs only a reference and the outcome.</p>
      {canEdit && !deferred && <div className="ops-actions"><button className="hub-button hub-button-quiet" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save progress'}</button><button type="button" className="hub-button" disabled={state.busy || checked.length !== (task.checks || []).length || !evidence.trim()} onClick={() => state.save('saveTask', { ...payload, status: 'submitted' }, 'Submitted for school review.')}>Submit for review</button></div>}
      <SaveFeedback state={state} />
    </form>
    {task.reviewNote && <p className="ops-notice"><strong>Reviewer’s note:</strong> {task.reviewNote}</p>}
    {canReview && task.status === 'submitted' && <form className="hub-form ops-review" onSubmit={e => { e.preventDefault(); state.save('reviewTask', { taskId: task.id, revision: task.revision, decision: 'approved', note: reviewNote }, 'School review recorded.'); }}><h3>School review</h3><label>Review note<textarea required maxLength={2000} value={reviewNote} onChange={e => setReviewNote(e.target.value)} /></label><div className="ops-actions"><button className="hub-button" disabled={state.busy}>Approve checked records</button><button type="button" className="hub-button hub-button-quiet" disabled={state.busy || !reviewNote.trim()} onClick={() => state.save('reviewTask', { taskId: task.id, revision: task.revision, decision: 'returned', note: reviewNote }, 'Returned with your correction note.')}>Return for correction</button></div></form>}
    <details className="ops-details"><summary>Ask for help with this task</summary><form className="hub-form" onSubmit={async e => { e.preventDefault(); if (await state.save('askHelp', { taskId: task.id, question }, 'Your question is in the school support queue.')) setQuestion(''); }}><label>Your question<textarea required maxLength={2000} rows={3} value={question} onChange={e => setQuestion(e.target.value)} /></label><p className="hub-hint">The team can read this in Questions & support. For urgent safeguarding or access concerns, contact the responsible person immediately.</p><button className="hub-button hub-button-quiet" disabled={state.busy}>Save question</button></form></details>
  </>;
}

function Upkeep({ data, onSaved }) {
  const [cadence, setCadence] = useState('all'), [selected, setSelected] = useState('');
  const timings = data.config.timings;
  const routines = data.routines.filter(r => cadence === 'all' || r.cadence === cadence);
  return <>
    <div className="ops-notice"><strong>Proposed routine timings</strong><p>Daily: {timings.dailyTeacher} minutes per class teacher and {timings.dailyOffice} minutes for the office. Weekly: {timings.weekly} minutes. Monthly: {timings.monthlyOffice} minutes for the office and {timings.monthlyOthers} minutes for other owners. Term audit: {timings.auditMinutes / 60} hours (half a day at the suggested four hours).</p><p>Suggested audit months: {(data.config.auditMonths || [5, 11]).map(m => new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2027, m - 1, 1)))).join(' and ')}. The school can adjust these suggestions in Team & settings.</p></div>
    <label className="ops-filter">Routine<select value={cadence} onChange={e => setCadence(e.target.value)}><option value="all">All routines</option>{['daily', 'weekly', 'monthly', 'termly', 'annual'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
    <div className="ops-routines">{routines.map(routine => <article key={routine.id} className="ops-routine"><div className="ops-row"><div><p className="hub-kicker">{routine.cadence} · {routine.period || 'When the module opens'}</p><h3>{routine.title}</h3><small><Owner owner={routine.owner} config={data.config} /></small></div><TaskStatus status={routine.status} /></div>{routine.pendingPeriods?.length>1 && <p className="hub-error">{routine.pendingPeriods.length} periods need a sign-off. Select the period below.</p>}<ul>{(routine.checks || routine.steps || []).map((check, i) => <li key={i}>{check}</li>)}</ul>{routine.status === 'deferred' ? <p className="hub-hint">From when it opens · results and report cards after February 2027.</p> : <><p className="hub-hint">{routine.status === 'complete' ? 'A signed record is retained for this period.' : 'Record the work and evidence once this period’s check is complete.'}</p>{routine.status !== 'complete' && routine.canSignOff !== false && <button type="button" className="hub-button hub-button-quiet" onClick={() => setSelected(selected === routine.id ? '' : routine.id)}>{selected === routine.id ? 'Close sign-off form' : 'Record this check'}</button>}{selected === routine.id && <SignOffForm data={data} onSaved={onSaved} initialRoutine={routine.id} />}</>}</article>)}</div>
  </>;
}

function SignOffForm({ data, onSaved, initialRoutine = '' }) {
  const state = useSave(data.yearId, onSaved);
  const [chosenPeriod, setChosenPeriod] = useState(''), [routineId, setRoutineId] = useState(initialRoutine), [findings, setFindings] = useState(''), [followUp, setFollowUp] = useState(''), [evidence, setEvidence] = useState('');
  const routine = data.routines.find(r => r.id === routineId);
  const available = data.routines.filter(r => r.status !== 'deferred' && r.canSignOff !== false && r.status !== 'complete');
  return <form className="hub-form ops-signoff" onSubmit={async e => {
    e.preventDefault(); if (!routine) return;
    if (await state.save('signOff', { routineId, period: chosenPeriod || routine.period, findings, followUp, evidence }, 'The signed check is saved with your account and signing time.')) { setFindings(''); setFollowUp(''); setEvidence(''); setRoutineId(''); }
  }}>
    <div className="ops-form-grid"><label>Check or audit<select required value={routineId} disabled={state.busy} onChange={e => {setRoutineId(e.target.value);setChosenPeriod('');}}><option value="">Choose a completed check</option>{available.map(r => <option key={r.id} value={r.id}>{r.title} · {r.period}</option>)}</select></label><label>Period<select value={chosenPeriod || routine?.period || ''} onChange={e=>setChosenPeriod(e.target.value)}>{!routine && <option value="">Choose a check first</option>}{(routine?.pendingPeriods || [routine?.period]).filter(Boolean).map(period=><option key={period} value={period}>{period}</option>)}</select></label></div>
    <label>Findings / outcome<textarea required maxLength={2000} rows={3} value={findings} onChange={e => setFindings(e.target.value)} placeholder="Record what you checked and the outcome, including no issues found where appropriate." /></label>
    <label>Follow-up and responsible person<textarea required maxLength={2000} rows={2} value={followUp} onChange={e => setFollowUp(e.target.value)} placeholder="Action, owner and due date, or No follow-up needed." /></label>
    <label>Evidence reference<textarea required maxLength={2000} rows={2} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Check record, log reference or test report. For a restore test, include the restored sample and verification outcome." /></label>
    <p className="hub-hint">Signing records a completed check. It does not run a backup, restore, software update or account change.</p>
    <button className="hub-button" disabled={state.busy || !routine || !available.some(r => r.id === routineId)}>{state.busy ? 'Saving…' : 'Sign and save this check'}</button>
    <SaveFeedback state={state} />
  </form>;
}

function SignOffHistory({ rows = [] }) {
  return <div className="ops-history"><h3>Completed checks</h3>{!rows.length ? <p className="hub-empty">No checks have been signed off for this academic year yet.</p> : <div className="hub-table-scroll"><table className="hub-table"><thead><tr><th scope="col">Date / period</th><th scope="col">Check / completed by</th><th scope="col">Findings / evidence</th><th scope="col">Follow-up</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{operationDate(row.signedAt)}<small>{row.period}</small></td><td>{row.title || row.routineTitle || row.routineId}<small>{row.actorName || row.actorUid}</small></td><td>{row.findings}<small>{row.evidence}</small></td><td>{row.followUp}</td></tr>)}</tbody></table></div>}</div>;
}

function HelpDesk({ data, onSaved }) {
  const auth = useAuth();
  const state = useSave(data.yearId, onSaved);
  const [taskId, setTaskId] = useState(''), [question, setQuestion] = useState('');
  const canResolve = data.permissions?.resolveHelp ?? auth.roles.some(r => ['schoolAdmin', 'academicCoordinator', 'technicalAdmin', 'leadership', 'superAdmin'].includes(r));
  return <Section title="Questions & support"><p>Keep setup questions beside the work they relate to. This queue is checked by the school and hub team; urgent concerns need direct contact.</p><form className="hub-form" onSubmit={async e => { e.preventDefault(); if (await state.save('askHelp', { taskId, question }, 'Question saved for the team.')) setQuestion(''); }}><label>Related task<select required value={taskId} onChange={e => setTaskId(e.target.value)}><option value="">Choose a task</option>{data.tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label><label>Question<textarea required maxLength={2000} value={question} onChange={e => setQuestion(e.target.value)} /></label><button className="hub-button" disabled={state.busy}>Save question</button><SaveFeedback state={state} /></form><div className="ops-help-list">{data.help.length ? data.help.map(item => <HelpItem key={item.id} item={item} data={data} canResolve={canResolve} onSaved={onSaved} />) : <p className="hub-empty">No questions recorded yet.</p>}</div></Section>;
}
function HelpItem({ item, data, canResolve, onSaved }) {
  const state = useSave(data.yearId, onSaved), [reply, setReply] = useState('');
  return <article className="ops-help-item"><div className="ops-row"><h3>{data.tasks.find(t => t.id === item.taskId)?.title || 'School setup'}</h3><TaskStatus status={item.status} /></div><p>{item.question}</p>{item.reply && <p className="ops-notice"><strong>Team response:</strong> {item.reply}</p>}{canResolve && item.status === 'open' && <form className="hub-form" onSubmit={e => { e.preventDefault(); state.save('resolveHelp', { helpId: item.id, reply }, 'Response saved and question resolved.'); }}><label>Response<textarea required maxLength={2000} value={reply} onChange={e => setReply(e.target.value)} /></label><button className="hub-button hub-button-quiet" disabled={state.busy}>Respond and resolve</button><SaveFeedback state={state} /></form>}</article>;
}

function TeamSettings({ data, onSaved, canConfigure }) {
  const state = useSave(data.yearId, onSaved);
  const [config, setConfig] = useState(structuredClone(data.config));
  const updateRole = (role, field, value) => setConfig(previous => ({ ...previous, responsibilities: { ...previous.responsibilities, [role]: { ...previous.responsibilities?.[role], [field]: value, ...(field === 'uid' ? { name: data.users.find(u => u.uid === value)?.name || '' } : {}) } } }));
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return <Section title="Team responsibilities and proposed routines"><p>The Clerk holds the office responsibility and the PIC Teacher leads audits. Confirm the people and backups below. Content editor, Finance Officer and Safeguarding Lead remain unassigned until the school names them.</p><p className="hub-hint">Naming a task owner does not grant account permissions. Access is managed separately in <Link to="/hub/admin/accounts">User accounts</Link>.</p><form className="hub-form ops-form" onSubmit={e => { e.preventDefault(); state.save('configure', { revision: data.config.revision || 0, config }, 'Team responsibilities and routine settings saved.'); }}><fieldset disabled={!canConfigure || state.busy}><legend>Named owners and backups</legend>{Object.entries(OWNER_LABELS).filter(([key]) => key !== 'teacher').map(([key, label]) => <div className="ops-role" key={key}><h3>{label}</h3><div className="ops-form-grid"><label>Responsible person<select value={config.responsibilities?.[key]?.uid || ''} onChange={e => updateRole(key, 'uid', e.target.value)}><option value="">Name to be confirmed</option>{data.users.filter(user => user.roles?.some(role => RESPONSIBILITIES.find(r => r.id === key)?.roles.includes(role))).map(user => <option key={user.uid} value={user.uid}>{user.name}</option>)}</select></label><label>Backup<select value={config.responsibilities?.[key]?.backupUid || ''} onChange={e => updateRole(key, 'backupUid', e.target.value)}><option value="">Backup to be confirmed</option>{data.users.filter(user => user.roles?.some(role => RESPONSIBILITIES.find(r => r.id === key)?.roles.includes(role))).map(user => <option key={user.uid} value={user.uid}>{user.name}</option>)}</select></label></div></div>)}</fieldset><fieldset disabled={!canConfigure || state.busy}><legend>Suggested time allowances</legend><p>The figures below are planning suggestions. Agree changes with the school team.</p><div className="ops-form-grid">{[['dailyTeacher','Daily · class teacher (minutes)'],['dailyOffice','Daily · office (minutes)'],['weekly','Weekly review (minutes)'],['monthlyOffice','Monthly · office (minutes)'],['monthlyOthers','Monthly · other owners (minutes)'],['auditMinutes','Term audit (minutes)']].map(([key,label]) => <label key={key}>{label}<input required type="number" min="1" max="480" value={config.timings[key]} onChange={e => setConfig({ ...config, timings: { ...config.timings, [key]: Number(e.target.value) } })} /></label>)}</div><div className="ops-form-grid">{[0,1].map((i) => <label key={i}>Proposed audit {i + 1} month<select value={config.auditMonths[i]} onChange={e => setConfig({ ...config, auditMonths: config.auditMonths.map((m,n) => n === i ? Number(e.target.value) : m) })}>{months.map((name,n) => <option value={n+1} key={name}>{name}</option>)}</select></label>)}</div></fieldset><fieldset disabled={!canConfigure || state.busy}><legend>Progressive opening</legend><label>School launch stage<select value={config.launchStage || 'preparing'} onChange={e => setConfig({ ...config, launchStage: e.target.value })}><option value="preparing">Preparing records</option><option value="staffPilot">Staff pilot</option><option value="parentPilot">Parent pilot</option><option value="live">School launch approved</option></select></label><p className="hub-hint">The server checks the required setup approvals and records before advancing the launch.</p><label>Agreed launch date<input type="date" value={config.launchDate || ''} onChange={e => setConfig({ ...config, launchDate: e.target.value })} /></label><strong>Results and report cards · From when it opens</strong><p>These services are intended for use after February 2027. Open their tasks only once the school is ready, no earlier than 1 March 2027.</p><label className="hub-check"><input type="checkbox" checked={Boolean(config.resultsOpen)} onChange={e => setConfig({ ...config, resultsOpen: e.target.checked })} />Open results and report-card routines</label><p className="hub-hint">The server checks the earliest date. This records operational readiness; school permissions still apply to each academic record.</p></fieldset>{canConfigure ? <button className="hub-button" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save team and settings'}</button> : <p className="hub-hint">Leadership confirms these settings.</p>}<SaveFeedback state={state} /></form></Section>;
}

export function OperationsModalButton({ yearId, className = 'hub-button hub-button-quiet' }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  return <><button ref={trigger} type="button" className={className} onClick={() => setOpen(true)}>Urgent changes & sign-off</button>{open && <OperationsModal yearId={yearId} onClose={() => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }} />}</>;
}
function OperationsModal({ yearId, onClose }) {
  const dialog = useRef(null), titleId = useId();
  const { data, loading, error, reload } = useOperations(yearId);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.body.style.overflow;
    node.showModal(); document.body.style.overflow = 'hidden';
    return () => { node.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} className="ops-dialog school-operations" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}><header className="ops-dialog-head"><div><p className="hub-kicker">School office reference</p><h2 id={titleId}>Changes that cannot wait</h2></div><button autoFocus type="button" className="hub-button hub-button-quiet" onClick={onClose}>Close</button></header><div className="ops-dialog-body"><p>Act when the change is known. Use the authorised school process and record the outcome; do not wait for the next routine review.</p><div className="hub-table-scroll"><table className="hub-table"><thead><tr><th scope="col">Change</th><th scope="col">Action</th><th scope="col">Owner</th><th scope="col">When</th></tr></thead><tbody>{URGENT_CHANGES.map(([event,action,owner,deadline],i) => <tr key={i}><th scope="row">{event}</th><td>{action}</td><td>{owner}</td><td>{deadline}</td></tr>)}</tbody></table></div><h3>What the hub team looks after</h3><ul className="ops-team-duties">{HUB_TEAM_DUTIES.map((item,i) => <li key={i}>{item}</li>)}</ul><p className="hub-hint">Checks and restore tests need completion evidence. A scheduled task is not proof that technical maintenance has run.</p><h3>Blank sign-off record</h3>{error && <><p className="hub-error" role="alert">{error}</p><button className="hub-button hub-button-quiet" type="button" onClick={reload}>Retry sign-off records</button></>}{loading ? <Loading label="Loading check periods…" /> : data && !error && <><SignOffForm data={data} onSaved={reload} /><details className="ops-details"><summary>Previous sign-offs</summary><SignOffHistory rows={data.signoffs} /></details></>}<Link className="hub-button hub-button-quiet" to="/hub/admin/operations" onClick={onClose}>Open school setup & upkeep</Link></div></dialog>;
}
