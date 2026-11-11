import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { OPERATIONS_ROLES, RESPONSIBILITIES, DEFAULT_CONFIG, SETUP_TASKS, ROUTINES, RESULTS_NOT_BEFORE, schoolDate, periodFor, routinePeriods, moduleOpen, recordChecks } from './operations-model.js';
const fail=(message,code='invalid-argument')=>{throw new HttpsError(code,message);};
const text=(value,max=2000)=>typeof value==='string'&&value.length<=max?value.trim():fail('Text is missing or too long.');
const id=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value)?value:fail('Invalid record identifier.');
const leader=roles=>roles.some(r=>['superAdmin','leadership'].includes(r));
const rows=async ref=>(await ref.get()).docs.map(d=>({id:d.id,...d.data()}));
const serial=value=>JSON.parse(JSON.stringify(value,(_k,v)=>v&&typeof v.toDate==='function'?v.toDate().toISOString():v));
function configOf(d){return {...DEFAULT_CONFIG,...d,responsibilities:d?.responsibilities||{},timings:{...DEFAULT_CONFIG.timings,...d?.timings}};}
function allowed(roles,config,owner,uid){const role=RESPONSIBILITIES.find(r=>r.id===owner);return roles.includes('superAdmin')||((!config.responsibilities[owner]?.uid||config.responsibilities[owner].uid===uid||config.responsibilities[owner].backupUid===uid)&&roles.some(r=>role?.roles.includes(r)));}
async function evidenceState(db,yearId){const names=['academicYears','terms','classes','staff','teacherAssignments','students','enrollments','studentGuardianLinks','guardians'];const all=await Promise.all(names.map(n=>rows(db.collection(n))));return recordChecks({...Object.fromEntries(names.map((n,i)=>[n,all[i]])),school:(await db.doc('settings/school').get()).data()},yearId);}
function taskView(t,saved,checks,config,date){return {...t,status:'notStarted',revision:0,checked:[],evidence:'',note:'',dueDate:'',...saved,recordCheck:checks[t.id]||{ready:true,summary:'School review and evidence required.'},available:!t.gate||moduleOpen(config,date)};}
export const schoolOperations=onCall({region:"asia-southeast1",maxInstances:5},async request=>{
 const db=getFirestore(), uid=request.auth?.uid, roles=request.auth?.token?.roles||[];
 if(!uid||!roles.some(r=>OPERATIONS_ROLES.includes(r)))fail('This area is for authorised school staff.','permission-denied');
 const actor=(await db.doc(`users/${uid}`).get()).data();if(!actor||actor.status==='disabled')fail('Your staff account is inactive.','permission-denied');
 const input=request.data||{}, action=input.action, yearId=id(input.yearId||'ay2027'), base=db.doc(`operationsYears/${yearId}`), date=schoolDate();
 if(action==='snapshot'){
  const [stored,tasks,signoffs,help,years,users,checks]=await Promise.all([base.get(),rows(base.collection('tasks')),rows(base.collection('signoffs')),rows(base.collection('help')),rows(db.collection('academicYears')),rows(db.collection('users')),evidenceState(db,yearId)]);
  const config=configOf(stored.data());const view=SETUP_TASKS.map(t=>{const v=taskView(t,tasks.find(s=>s.id===t.id),checks,config,date);return {...v,status:v.available?v.status:'deferred',canEdit:(!v.assigneeUid||v.assigneeUid===uid||roles.some(r=>['superAdmin','schoolAdmin'].includes(r)))&&((v.assigneeUid===uid&&roles.some(r=>RESPONSIBILITIES.find(d=>d.id===t.owner)?.roles.includes(r)))||allowed(roles,config,t.owner,uid)||roles.includes('schoolAdmin')),canReview:leader(roles)||(roles.includes('academicCoordinator')&&t.owner!=='leadership')};});
  const blockers=view.filter(t=>!t.gate&&(t.status!=='approved'||!t.recordCheck.ready)).map(t=>t.title);
  return serial({yearId,date,config,tasks:view,routines:ROUTINES.map(r=>{const periods=routinePeriods(r.cadence,config.startDate,date,config),pendingPeriods=periods.filter(p=>!signoffs.some(s=>s.routineId===r.id&&s.period===p)),period=pendingPeriods[0]||periods[0]||periodFor(r.cadence,date,config),signoff=signoffs.find(s=>s.routineId===r.id&&s.period===period);return {...r,period,recordId:`${r.id}_${period}`,status:r.gate&&!moduleOpen(config,date)?'deferred':!periods.length?'scheduled':signoff?'complete':'due',signoff:signoff||null,available:!r.gate||moduleOpen(config,date),pendingPeriods,canSignOff:periods.length>0&&allowed(roles,config,r.owner,uid)};}),signoffs:signoffs.sort((a,b)=>String(b.date).localeCompare(String(a.date))),help,years,users:users.filter(u=>u.status!=='disabled'&&u.roles?.some(r=>OPERATIONS_ROLES.includes(r))).map(u=>({uid:u.id,name:u.displayName||u.email||'Staff member',roles:u.roles})),readiness:{ready:blockers.length===0,blockers},permissions:{configure:leader(roles),review:leader(roles)||roles.includes('academicCoordinator')}});
 }
 if(action==='configure'){
  if(!leader(roles))fail('Leadership approves school setup settings.','permission-denied');
  const proposed=input.config||{}, responsibility={};
  for(const def of RESPONSIBILITIES){const r=proposed.responsibilities?.[def.id]||{};const primary=r.uid? id(r.uid):'',backup=r.backupUid?id(r.backupUid):'';let name='';for(const who of [primary,backup].filter(Boolean)){const u=(await db.doc(`users/${who}`).get()).data();if(!u||u.status==='disabled'||!u.roles?.some(v=>def.roles.includes(v)))fail(`Choose an active account with the correct role for ${def.label}.`);if(who===primary)name=u.displayName||u.email||who;}responsibility[def.id]={uid:primary,backupUid:backup,name};}
  const timings={};for(const [key,value]of Object.entries(DEFAULT_CONFIG.timings)){const v=Number(proposed.timings?.[key]??value);if(!Number.isInteger(v)||v<1||v>480)fail('Routine estimates must be 1–480 minutes.');timings[key]=v;}
  const months=proposed.auditMonths||[5,11];if(!Array.isArray(months)||months.length!==2||months.some(m=>!Number.isInteger(m)||m<1||m>12)||months[0]===months[1])fail('Choose two different audit months.');
  const resultsOpen=proposed.resultsOpen===true;if(resultsOpen&&date<RESULTS_NOT_BEFORE)fail('Results and report cards can open after February 2027.');
  const stage=proposed.launchStage||'preparing';if(!['preparing','staffPilot','parentPilot','live'].includes(stage))fail('Choose a launch stage.');
  for(const key of ['startDate','launchDate'])if(proposed[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(proposed[key]))fail('Use YYYY-MM-DD dates.');
  const checks=await evidenceState(db,yearId);const activeYear=(await db.doc('settings/school').get()).data()?.currentAcademicYearId;
  await db.runTransaction(async tx=>{const snap=await tx.get(base), old=configOf(snap.data());if((input.revision??0)!==old.revision)fail('Settings changed. Refresh and try again.','aborted');
   const required=stage==='live'?SETUP_TASKS.filter(t=>!t.gate):stage==='parentPilot'?SETUP_TASKS.filter(t=>['staff','year','teaching','pupils','families','consent'].includes(t.id)):stage==='staffPilot'?SETUP_TASKS.filter(t=>['staff','year','teaching'].includes(t.id)):[];
   const approvals=await Promise.all(required.map(t=>tx.get(base.collection('tasks').doc(t.id))));
   if(required.some((t,i)=>approvals[i].data()?.status!=='approved'||checks[t.id]?.ready===false))fail('Complete the required records and approvals before opening this stage.','failed-precondition');
   tx.set(base,{revision:old.revision+1,responsibilities:responsibility,timings,auditMonths:months,resultsOpen,resultsNotBefore:RESULTS_NOT_BEFORE,launchStage:stage,startDate:proposed.startDate||old.startDate||date,launchDate:proposed.launchDate||'',updatedAt:FieldValue.serverTimestamp(),updatedBy:uid});
   if(!activeYear||activeYear===yearId) tx.set(db.doc('operationsRelease/current'),{resultsOpen,notBefore:RESULTS_NOT_BEFORE,yearId,updatedAt:FieldValue.serverTimestamp()});
   tx.set(base.collection('audit').doc(),{type:'configure',actorUid:uid,at:FieldValue.serverTimestamp(),revision:old.revision+1});});return {saved:true};
 }
 if(action==='saveTask'||action==='reviewTask'){
  const task=SETUP_TASKS.find(t=>t.id===input.taskId);if(!task)fail('Unknown setup task.');const checks=await evidenceState(db,yearId);
  let assigneeUid=input.assigneeUid?id(input.assigneeUid):'';
  if(assigneeUid){const assignee=(await db.doc(`users/${assigneeUid}`).get()).data();const def=RESPONSIBILITIES.find(r=>r.id===task.owner);if(!assignee||assignee.status==='disabled'||!assignee.roles?.some(r=>def.roles.includes(r)))fail('Choose an active colleague with the correct task role.');}
  await db.runTransaction(async tx=>{const [cfg,oldSnap,...deps]=await Promise.all([tx.get(base),tx.get(base.collection('tasks').doc(task.id)),...task.dependsOn.map(k=>tx.get(base.collection('tasks').doc(k)))]);const config=configOf(cfg.data()),old={revision:0,...oldSnap.data()};
   if(task.gate&&!moduleOpen(config,date))fail('From when it opens: results and report cards are not open yet.','failed-precondition');
   if((input.revision??0)!==old.revision)fail('This task changed. Refresh before saving.','aborted');
   let update;
   if(action==='saveTask'){
    if(old.assigneeUid&&old.assigneeUid!==uid&&!roles.some(r=>['superAdmin','schoolAdmin'].includes(r)))fail('This task is assigned to another colleague.','permission-denied');
    if(!(old.assigneeUid===uid&&roles.some(r=>RESPONSIBILITIES.find(d=>d.id===task.owner)?.roles.includes(r)))&&!allowed(roles,config,task.owner,uid)&&!roles.includes('schoolAdmin'))fail('This task belongs to another school role.','permission-denied');
    if(!['inProgress','submitted'].includes(input.status))fail('Choose In progress or Submitted.');
    const checked=input.checked||[];if(!Array.isArray(checked)||checked.some(c=>!task.checks.includes(c))||new Set(checked).size!==checked.length)fail('Use the checklist items shown.');
    const evidence=text(input.evidence||''),note=text(input.note||'');
    if(input.status==='submitted'&&(checked.length!==task.checks.length||!evidence||checks[task.id]?.ready===false||deps.some(d=>d.data()?.status!=='approved')))fail('Complete the checklist, prerequisites, saved records and evidence before submitting.','failed-precondition');
    const dueDate=input.dueDate||'';if(dueDate&&!/^\d{4}-\d{2}-\d{2}$/.test(dueDate))fail('Use a valid due date.');
    update={status:input.status,checked,evidence,note,dueDate,assigneeUid,submittedBy:input.status==='submitted'?uid:null,approvedBy:null};
   }else{
    if(!leader(roles)&&!roles.includes('academicCoordinator'))fail('A school reviewer must approve this task.','permission-denied');
    if(task.owner==='leadership'&&!leader(roles))fail('Leadership must approve opening.','permission-denied');
    if(old.status!=='submitted')fail('Only submitted tasks can be reviewed.','failed-precondition');
    if(!['approved','returned'].includes(input.decision))fail('Choose approved or returned.');
    if(input.decision==='approved'&&(checks[task.id]?.ready===false||deps.some(d=>d.data()?.status!=='approved')))fail('Saved records or prerequisites still need attention.','failed-precondition');
    const note=text(input.note||'');if(!note)fail('Record your review findings.');update={status:input.decision,reviewNote:note,approvedBy:input.decision==='approved'?uid:null};
   }
   tx.set(base.collection('tasks').doc(task.id),{...update,revision:old.revision+1,updatedAt:FieldValue.serverTimestamp(),updatedBy:uid},{merge:true});
   tx.set(base.collection('audit').doc(),{type:action,taskId:task.id,actorUid:uid,at:FieldValue.serverTimestamp(),...update,revision:old.revision+1});});return {saved:true};
 }
 if(action==='signOff'){
  const routine=ROUTINES.find(r=>r.id===input.routineId);if(!routine)fail('Choose a routine.');
  const findings=text(input.findings||''),evidence=text(input.evidence||''),followUp=text(input.followUp||'');if(!findings||!evidence)fail('Record findings and evidence before signing off.');
  await db.runTransaction(async tx=>{const config=configOf((await tx.get(base)).data());if(!allowed(roles,config,routine.owner,uid))fail('The responsible role must sign off this routine.','permission-denied');if(routine.gate&&!moduleOpen(config,date))fail('From when it opens.','failed-precondition');
   const period=input.period; if(!routinePeriods(routine.cadence,config.startDate,date,config).includes(period))fail('Choose a current or overdue period. Future checks cannot be signed off.','failed-precondition');const ref=base.collection('signoffs').doc(`${routine.id}_${period}`);if((await tx.get(ref)).exists)fail('This period is already signed off.','already-exists');
   tx.create(ref,{routineId:routine.id,period,date,findings,evidence,followUp,signedBy:uid,signedName:actor.displayName||actor.email||uid,at:FieldValue.serverTimestamp()});
   tx.set(base.collection('audit').doc(),{type:'signOff',routineId:routine.id,period,actorUid:uid,at:FieldValue.serverTimestamp()});});return {saved:true};
 }
 if(action==='askHelp'){
  const taskId=id(input.taskId);if(!SETUP_TASKS.some(t=>t.id===taskId))fail('Choose a setup task.');const question=text(input.question||'');if(!question)fail('Enter a question.');await base.collection('help').add({taskId,question,askedBy:uid,askedName:actor.displayName||actor.email||uid,status:'open',date,createdAt:FieldValue.serverTimestamp()});return {saved:true};
 }
 if(action==='resolveHelp'){
  if(!leader(roles)&&!roles.some(r=>['technicalAdmin','schoolAdmin','academicCoordinator'].includes(r)))fail('The office, PIC or hub team can respond.','permission-denied');const reply=text(input.reply||'');if(!reply)fail('Enter a reply.');await db.runTransaction(async tx=>{const ref=base.collection('help').doc(id(input.helpId));if(!(await tx.get(ref)).exists)fail('Question not found.','not-found');tx.update(ref,{reply,status:'resolved',resolvedBy:uid,resolvedAt:FieldValue.serverTimestamp()});});return {saved:true};
 }
 fail('Unknown school operations action.');
});
