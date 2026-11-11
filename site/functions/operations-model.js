export const OPERATIONS_ROLES = ['superAdmin','schoolAdmin','academicCoordinator','leadership','technicalAdmin','contentEditor','financeOfficer','safeguardingLead'];
export const RESPONSIBILITIES = [
  {id:'office',label:'School Clerk · office',roles:['schoolAdmin','superAdmin']},
  {id:'pic',label:'PIC Teacher · audit lead',roles:['academicCoordinator','superAdmin']},
  {id:'leadership',label:'Headmistress / approving leader',roles:['leadership','superAdmin']},
  {id:'technical',label:'Hub team',roles:['technicalAdmin','superAdmin']},
  {id:'content',label:'Content editor · name to be assigned',roles:['contentEditor','superAdmin']},
  {id:'finance',label:'Finance Officer · fee information only · name to be assigned',roles:['financeOfficer','superAdmin']},
  {id:'safeguarding',label:'Safeguarding Lead · name to be assigned',roles:['safeguardingLead','superAdmin']},
];
export const RESULTS_NOT_BEFORE='2027-03-01';
export const DEFAULT_CONFIG = { revision:0, responsibilities:{}, timings:{dailyTeacher:5,dailyOffice:15,weekly:30,monthlyOffice:60,monthlyOthers:15,auditMinutes:240}, auditMonths:[5,11], resultsOpen:false, resultsNotBefore:RESULTS_NOT_BEFORE, launchStage:'preparing', startDate:'', auditDates:[], launchDate:'' };
const task=(id,title,owner,dependsOn,links,fields,steps,checks,gate='')=>({id,title,owner,dependsOn,links,fields,steps,checks,gate,kind:'setup'});
export const SETUP_TASKS=[
 task('school','Confirm school details','office',[],[['/hub/admin/setup','Edit school information']],['Official name','Office contacts','Hours and dismissal by Standard','Logo and letterhead'],['Open the school setup wizard and compare the profile with school records.','Correct the contact details and hours.','Preview the public pages on a phone and computer.'],['School facts checked','Public contact links tested']),
 task('year','Prepare the academic year','pic',['school'],[['/hub/admin/setup','Prepare academic year']],['Year','Term dates','Standards','Class names'],['Add the academic year and approved term dates.','Confirm all six Standards and their class names.','Keep proposed holidays marked as provisional until approved.'],['Academic year and terms checked','All launch classes recorded']),
 task('staff','Add staff and responsibilities','office',['school'],[['/hub/admin/import?dataset=staff','Import staff CSV'],['/hub/admin/staff','Edit staff'],['/hub/admin/accounts','Manage sign-in accounts']],['Full name','Individual email','Position','Staff ID'],['Download the CSV template or add staff individually.','Review duplicate email addresses before saving.','Create individual sign-in accounts and ask the Super Administrator to approve elevated roles.'],['Staff list reconciled','Sign-in details verified','Clerk and PIC roles confirmed']),
 task('teaching','Assign subjects and teachers','pic',['year','staff'],[['/hub/admin/subjects','Edit subjects'],['/hub/admin/classes','Assign class teachers'],['/hub/admin/teacher-assignments','Assign teachers and lessons']],['Class','Subject','Teacher account','Weekly lesson slots'],['Confirm subjects for every Standard.','Choose the class teacher and add subject allocations.','Check lesson times against the school timetable and check for clashes.'],['Subject coverage checked','Class teachers assigned','Timetables checked']),
 task('pupils','Add pupils and enrolments','office',['year'],[['/hub/admin/import?dataset=students','Import pupils CSV'],['/hub/admin/students','Edit pupils'],['/hub/admin/import?dataset=enrollments','Import enrolments'],['/hub/admin/enrolments','Edit enrolments']],['Pupil ID','Full name','School pupil number','Class','Admission date'],['Import or add pupils using the official register.','Enrol each active pupil in the correct class.','Compare class totals and resolve duplicate or missing pupils.'],['Register totals reconciled','Every active pupil enrolled']),
 task('families','Verify parents and guardian links','office',['pupils'],[['/hub/admin/import?dataset=guardians','Import guardians CSV'],['/hub/admin/guardians','Edit guardians'],['/hub/admin/guardian-links','Verify family links']],['Guardian ID','Name','Phone','Email if available','Pupil ID','Relationship','Approved access'],['Add each adult once and reuse their ID for siblings.','Verify every relationship against school records; imported links have hub access off.','Enable authorised parent access only after verification. Record an alternative contact route for families without email.'],['Every family relationship checked','Access restrictions checked privately','No-email families have an alternative route']),
 task('consent','Confirm consent and restricted records','safeguarding',['families'],[['/hub/admin/consent','Review consent records']],['Consent wording','Purpose','Status','Evidence reference','Authorised lead'],['Confirm consent purposes and the School’s approved wording.','Review outstanding responses and existing paper evidence.','Verify restricted access with the authorised lead; keep confidential case details out of task notes.'],['Consent process approved','Restricted access tested']),
 task('calendar','Publish calendar and school documents','pic',['year'],[['/hub/admin/calendar','Edit calendar'],['/hub/admin/downloads','Manage documents'],['/hub/admin/communications','Manage notices']],['Event date/time','Audience','Document version','Owner','Expiry/review date'],['Enter approved events and identify provisional dates.','Upload or link the current circulars and forms.','Check audiences, acknowledgement requirements and expiry dates.'],['Calendar checked','Current documents available','Notice audience tested']),
 task('website','Review the SRSS25 website','content',['school'],[['/hub/admin/content','Edit website content'],['/','Review public website']],['Page','Correction','Approved wording','Photo permission'],['Review Home, About, Learning, Student Life, Admissions and Resources.','Correct names, dates, prices, contacts and broken links.','Check phone display and permission for each pupil image.'],['Content verified','Links and forms tested','Pupil media approved']),
 task('fee-information','Confirm fee information','finance',[],[['/join/fees','Review fee schedule'],['/hub/admin/fees','Fee information']],['Approved fee schedule','Pricing','Billing procedure contact'],['Review the published fee schedule and pricing.','Confirm the explanation of the School’s billing procedure.','Send approved wording corrections to the content editor.'],['Fee schedule checked','Billing guidance checked']),
 task('pilot','Run staff and parent pilots','pic',['staff','teaching','pupils','families','consent','calendar','website'],[['/hub/admin/accounts','Review accounts'],['/hub/admin/roles','Review permissions']],['Pilot participants','Test evidence','Issues','Reviewer'],['Test staff accounts and assigned classes.','Test a family with siblings and confirm unrelated child records cannot be accessed.','Resolve access issues before inviting the next class.'],['Staff pilot passed','Cross-family access denied','Urgent issues resolved']),
 task('launch','Approve SRSS25 opening','leadership',['pilot','fee-information'],[['/hub/admin/operations','Review readiness']],['Approving leader','Launch date','Support owner','Recovery evidence'],['Review the verified records and all setup approvals.','Confirm office and hub support coverage and recovery arrangements.','Approve the staged launch in responsibilities and settings.'],['School sign-off recorded','Support and recovery confirmed']),
 task('results','Prepare results and report cards','pic',[],[['/hub/admin/academic-reports','Open report cards']],['Assessment periods','Grading criteria','Report format','Approvers'],['From when it opens: confirm the assessment periods and approved grading criteria.','Test teacher entry, academic review and Headmistress approval.','Check that families only see published results.'],['Assessment structure approved','Report workflow tested','Published family view checked'],'results'),
];
const routine=(id,title,owner,cadence,steps,gate='')=>({id,title,owner,cadence,steps,gate});
export const ROUTINES=[
 routine('daily-registers','Daily registers and absence follow-up','office','daily',['Confirm each class register is submitted.','Follow up unexplained absences using school procedure.','Record late arrivals and early departures.']),
 routine('daily-inbox','Daily requests and notices','office','daily',['Assign new requests and review urgent messages.','Check notice audiences and approvals.']),
 routine('weekly-school','Friday school review','pic','weekly',['Check register gaps, open cases and overdue acknowledgements.','Confirm next week’s calendar and teaching changes.','Review pending content and portfolio approvals.']),
 routine('weekly-logs','Hub team: weekly log checks','technical','weekly',['Inspect error and access logs and scheduled jobs.','Record the period checked, findings and issue references.']),
 routine('monthly-records','Monthly records and contact review','office','monthly',['Reconcile joiners, leavers and family links.','Review bounced contact details, pending consents and incomplete records.','Summarise unresolved actions for the Headmistress.']),
 routine('monthly-content','Monthly website and document review','content','monthly',['Review school hours, contacts, admissions and fee information.','Archive obsolete notices and check pupil media permissions.']),
 routine('monthly-updates','Hub team: monthly software updates','technical','monthly',['Review software and security updates.','Record changes, validation and outstanding actions.']),
 routine('monthly-restore','Hub team: monthly backup-restore test','technical','monthly',['Record the backup identifier and test environment.','Restore the backup in an isolated test environment.','Verify restored records and access controls; record the result and recovery duration.']),
 routine('term-audit','Termly school audit','pic','termly',['Proposed May and November, half a day; confirm dates with the School.','Reconcile people, classes, family access, permissions, attendance and consent.','Record findings, owners, deadlines and leadership review.']),
 routine('term-technical','Hub team: join the termly audit','technical','termly',['Join the PIC Teacher’s audit.','Review access rules, logs, backup-restore evidence and unresolved technical actions.']),
 routine('year-rollover','Annual handover and next-year preparation','pic','annual',['Confirm next year’s dates, classes, subjects and responsible staff.','Reconcile closing records and approve individual pupil movements.','Test the new year, preserve history and recheck sibling access.']),
 routine('results-review','Results and report-card checks','pic','monthly',['From when it opens: check missing results, review approvals and report accuracy.','Confirm publication and corrections follow the approved workflow.'],'results'),
];
export const URGENT_CHANGES=[
 ['Staff member leaves or changes role','Remove or revise access at the effective time, no later than the last working day. Reassign duties.','Clerk → authorised administrator','Immediately at the effective time'],
 ['Custody or collection arrangements change','Verify privately with the authorised school lead; update guardian access and collection permissions.','Clerk + Safeguarding Lead','Same day; immediately if safety is affected'],
 ['Suspected account misuse or lost device','Contact leadership and the hub team; disable affected access and preserve evidence.','Person who notices → authorised administrator','Immediately'],
 ['Personal data shown to the wrong person','Contain access and contact leadership and the hub team through the private reporting route.','Person who notices','Immediately'],
 ['Pupil joins or leaves','Verify enrolment and family links; preserve access to any siblings who remain.','Clerk','Before access starts / at effective leaving time'],
 ['School closure or urgent change','Obtain leadership approval, update the calendar and notify the affected audience.','Headmistress / authorised backup','As soon as approved'],
];
export const HUB_TEAM_DUTIES=['Weekly: review error logs, access logs and scheduled jobs.','Monthly: review software updates and carry out a documented backup-restore test.','Each term: join the school audit and review access rules.','Annually: support the new academic year, review renewals, costs and recovery arrangements.'];
export function schoolDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(now);}
export function periodFor(cadence,date=schoolDate(),config=DEFAULT_CONFIG){
 const d=new Date(date+'T12:00:00Z');
 if(cadence==='daily')return date;
 if(cadence==='weekly'){d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10);}
 if(cadence==='monthly')return date.slice(0,7);
 if(cadence==='annual')return date.slice(0,4);
 const month=Number(date.slice(5,7)), months=[...(config.auditMonths||[5,11])].sort((a,b)=>a-b);const slot=months.find(m=>m>=month)||months.at(-1);return `${date.slice(0,4)}-${String(slot).padStart(2,'0')}`;
}
export function moduleOpen(config,date=schoolDate()){return config.resultsOpen===true&&date>=RESULTS_NOT_BEFORE;}
export function recordChecks(data,yearId){
 const active=r=>(r.status||'active')==='active';const classes=(data.classes||[]).filter(r=>active(r)&&r.academicYearId===yearId), pupils=(data.students||[]).filter(active), enrol=(data.enrollments||[]).filter(r=>active(r)&&r.academicYearId===yearId), staff=(data.staff||[]).filter(active), links=(data.studentGuardianLinks||[]).filter(active), guardians=(data.guardians||[]).filter(active), assignments=(data.teacherAssignments||[]).filter(r=>active(r)&&r.academicYearId===yearId);
 const result=(ready,summary)=>({ready:Boolean(ready),summary});const settings=data.school||{};
 return {
 school:result(settings.name&&settings.phone,'School name and office phone must be saved.'),
 year:result((data.academicYears||[]).some(y=>y.id===yearId)&&classes.length>0&&(data.terms||[]).some(t=>t.academicYearId===yearId),`${classes.length} classes; academic year and terms required.`),
 staff:result(staff.length&&staff.every(s=>s.name&&s.email),`${staff.length} active staff; name and individual email required.`),
 teaching:result(classes.length&&classes.every(c=>c.classTeacherUid&&assignments.some(a=>a.classId===c.id)),`${assignments.length} teaching allocations; every class needs a teacher and allocation.`),
 pupils:result(pupils.length&&pupils.every(s=>enrol.filter(e=>e.studentId===s.id).length===1),`${pupils.length} active pupils; exactly one enrolment each in this year.`),
 families:result(pupils.length&&pupils.every(s=>links.some(l=>l.studentId===s.id&&guardians.some(g=>g.id===l.guardianId&&(g.phone||g.email)))),'Every active pupil needs a linked guardian with a contact route.'),
 };
}
// All periods since the school adopted the routines remain available until signed off.
export function routinePeriods(cadence,startDate,date=schoolDate(),config=DEFAULT_CONFIG){
 const start=startDate||date; if(start>date)return [];
 const values=new Set(),d=new Date(start+'T12:00:00Z'),end=new Date(date+'T12:00:00Z');
 for(let i=0;d<=end&&i<3700;i++,d.setUTCDate(d.getUTCDate()+1)){
  const day=d.toISOString().slice(0,10), month=d.getUTCMonth()+1;
  if(cadence==='daily'&&[0,6].includes(d.getUTCDay()))continue;
  if(cadence==='termly'&&!(config.auditMonths||[5,11]).includes(month))continue;
  values.add(periodFor(cadence,day,config));
 }
 return [...values].sort().reverse();
}
