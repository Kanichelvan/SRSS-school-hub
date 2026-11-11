// Strict, create-only CSV intake. Account privileges are never accepted from a file.
import { GENDERS, MOTHER_TONGUES, STAFF_TYPES, normalisePhone, parseChoice, parseYesNo, validMonth } from '../../../functions/shared/fields.js';
// Columns typed by a person ("Boy", "Yes", "012-345 6789") are stored in the canonical form the rules expect.
const CHOICES = { gender: [GENDERS, 'gender must be Boy or Girl.'], motherTongue: [MOTHER_TONGUES, 'motherTongue must be Tamil, Chinese or Telugu.'], staffType: [STAFF_TYPES, 'staffType must be Teaching or Non-teaching.'] };
const YES_NO = ['meals', 'newThisYear'];
export const IMPORTS = {
  staff: { label: 'Staff', fields: ['id','name','schoolName','email','position','staffType','phone','startedAt'], required: ['id','name','email'], to: '/hub/admin/staff' },
  students: { label: 'Pupils', fields: ['id','name','preferredName','studentNumber','gender','dateOfBirth','admissionDate','motherTongue','meals','newThisYear'], required: ['id','name','studentNumber'], to: '/hub/admin/students' },
  guardians: { label: 'Parents & guardians', fields: ['id','name','email','phone','whatsapp','preferredLanguage'], required: ['id','name','phone'], to: '/hub/admin/guardians' },
  classes: { label: 'Classes', fields: ['id','name','academicYearId','standard','room'], required: ['id','name','academicYearId','standard'], to: '/hub/admin/classes' },
  subjects: { label: 'Subjects', fields: ['id','name'], required: ['id','name'], to: '/hub/admin/subjects' },
  enrollments: { label: 'Pupil enrolments', fields: ['id','studentId','classId','startDate'], required: ['id','studentId','classId','startDate'], to: '/hub/admin/enrolments' },
  studentGuardianLinks: { label: 'Pupil–guardian relationships', fields: ['id','studentId','guardianId','relationship','isEmergencyContact','canCollect'], required: ['id','studentId','guardianId','relationship','isEmergencyContact','canCollect'], to: '/hub/admin/guardian-links' },
};
export function parseCSV(text) {
  if (typeof text !== 'string' || text.length > 1000000) throw new Error('Choose a CSV smaller than 1 MB.');
  text = text.replace(/^\uFEFF/, '');
  const rows=[]; let row=[], cell='', quoted=false, closed=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted) { if(c==='"') { if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;} }else cell+=c; }
    else if(c==='"' && !cell && !closed) quoted=true;
    else if(c===',' || c==='\n' || c==='\r') {
      row.push(cell.trim());cell='';closed=false;
      if(c!==','){ if(c==='\r'&&text[i+1]==='\n')i++; if(row.some(Boolean))rows.push(row);row=[]; }
    } else { if(closed || c==='"') throw new Error('Invalid CSV quoting. Save the spreadsheet as CSV again.'); cell+=c; }
  }
  if(quoted) throw new Error('A quoted CSV cell was not closed.');
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);
  if(rows.length<2) throw new Error('Include column headings and at least one record.');
  if(rows.length>501) throw new Error('Import at most 500 records at a time.');
  const headers=rows.shift();
  if(new Set(headers).size!==headers.length)throw new Error('Column headings must be unique.');
  return rows.map((values,i)=>{if(values.length!==headers.length)throw new Error(`Row ${i+2} has ${values.length} cells; expected ${headers.length}.`);return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));});
}
const active = r => r && (r.status || 'active') === 'active';
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
export function planImport(dataset, rows, context={}) {
  const spec=IMPORTS[dataset];if(!spec)throw new Error('Choose a supported dataset.');
  const existing=context[dataset]||[], errors=[], plan=[], ids=new Set(), unique=new Set();
  rows.forEach((row,i)=>{
    const fail=message=>errors.push({row:i+2,message});
    for(const key of Object.keys(row))if(!spec.fields.includes(key))fail(`Unknown column: ${key}. Use the supplied template.`);
    for(const key of spec.required)if(!row[key])fail(`${key} is required.`);
    if(!/^[A-Za-z0-9_-]{1,60}$/.test(row.id||''))fail('id must contain 1–60 letters, numbers, hyphens or underscores.');
    if(ids.has(row.id)||existing.some(r=>r.id===row.id))fail(`ID ${row.id} already exists. Edit existing records in their management screen.`);ids.add(row.id);
    if(row.name && row.name.length>(dataset==='subjects'?80:dataset==='classes'?60:120))fail('Name is too long.');
    if(row.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email))fail('Email is invalid.');
    for(const [key,max] of [['email',200],['phone',30],['position',80],['schoolName',80],['preferredName',60],['studentNumber',30],['room',80],['preferredLanguage',60]])if((row[key]||'').length>max)fail(`${key} is too long.`);
    for(const key of ['dateOfBirth','admissionDate','startDate'])if(row[key]&&!validDate(row[key]))fail(`${key} must be a real YYYY-MM-DD date.`);
    const uniqueField=dataset==='students'?'studentNumber':['staff','guardians'].includes(dataset)?'email':null;
    if(uniqueField && row[uniqueField]){const v=row[uniqueField].toLowerCase();if(unique.has(v)||existing.some(r=>String(r[uniqueField]||'').toLowerCase()===v))fail(`Duplicate ${uniqueField}: ${row[uniqueField]}.`);unique.add(v);}
    const {id,...fields}=row;const payload={...fields,status:'active'};
    if(['staff','guardians','students'].includes(dataset))payload.uid=null;
    if(dataset==='staff')payload.directoryVisible=false;
    if(dataset==='students'){payload.currentClassId=null;payload.currentStandard=null;}
    const blank=key=>!String(row[key]??'').trim();
    for(const key of spec.fields){
      if(CHOICES[key]){const [options,message]=CHOICES[key];payload[key]=blank(key)?null:parseChoice(options,row[key]);if(!blank(key)&&payload[key]===null)fail(message);}
      if(YES_NO.includes(key)){const answer=blank(key)?false:parseYesNo(row[key]);if(answer===null)fail(`${key} must be Yes or No.`);payload[key]=answer===true;}
      if(key==='startedAt'){payload[key]=blank(key)?null:row[key].trim();if(payload[key]&&!validMonth(payload[key]))fail('startedAt must be YYYY-MM.');}
      if(key==='schoolName')payload[key]=blank(key)?null:row[key].trim();
      if(key==='whatsapp'){payload[key]=blank(key)?null:normalisePhone(row[key]);if(!blank(key)&&!payload[key])fail('whatsapp must include the country code, for example +60123456789.');}
    }
    if(dataset==='subjects'&&!/^[a-z0-9-]{1,30}$/.test(id||''))fail('Subject ID must use lowercase letters, numbers or hyphens (up to 30).');
    if(dataset==='classes'){
      payload.standard=Number(row.standard);payload.classTeacherUid=null;
      if(!Number.isInteger(payload.standard)||payload.standard<1||payload.standard>6)fail('Standard must be 1 to 6.');
      if(!context.academicYears?.some(y=>y.id===row.academicYearId&&active(y)))fail('Academic year does not exist or is inactive.');
    }
    if(dataset==='enrollments'){
      const cls=context.classes?.find(c=>c.id===row.classId&&active(c));
      if(!cls)fail('Class does not exist or is inactive.');
      if(!context.students?.some(s=>s.id===row.studentId&&active(s)))fail('Pupil does not exist or is inactive.');
      const k=`${row.studentId}:${cls?.academicYearId}`;
      if(unique.has(k)||existing.some(e=>e.studentId===row.studentId&&e.academicYearId===cls?.academicYearId&&active(e)))fail('This pupil already has an active enrolment for this year.');unique.add(k);
      payload.academicYearId=cls?.academicYearId||'';payload.standard=cls?.standard||0;
    }
    if(dataset==='studentGuardianLinks'){
      const student=context.students?.find(s=>s.id===row.studentId&&active(s)), guardian=context.guardians?.find(g=>g.id===row.guardianId&&active(g));
      if(!student||!guardian)fail('Both the pupil and guardian must already exist and be active.');
      if(!['mother','father','legalGuardian','caregiver','emergencyContact','collectionPerson'].includes(row.relationship))fail('Use mother, father, legalGuardian, caregiver, emergencyContact or collectionPerson.');
      for(const key of ['isEmergencyContact','canCollect']){if(!['Yes','No'].includes(row[key]))fail(`${key} must be Yes or No.`);payload[key]=row[key]==='Yes';}
      const k=`${row.studentId}:${row.guardianId}`;if(unique.has(k)||existing.some(l=>active(l)&&l.studentId===row.studentId&&l.guardianId===row.guardianId))fail('This pupil–guardian relationship already exists.');unique.add(k);
      payload.guardianUid=guardian?.uid||null;payload.classId=student?.currentClassId||null;payload.hasPortalAccess=false;
    }
    plan.push({id,payload});
  });
  return {plan,errors};
}
