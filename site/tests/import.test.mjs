import test from 'node:test';import assert from 'node:assert/strict';
import {parseCSV,planImport} from '../src/hub/logic/import.js';
test('CSV preserves quoted commas, escaped quotes, newlines and BOM',()=>{assert.deepEqual(parseCSV('\uFEFFid,name\r\nx,"A, ""B""\nC"'),[{id:'x',name:'A, "B"\nC'}]);});
test('CSV rejects duplicate headings, malformed quotes, widths and oversized batches',()=>{for(const s of ['id,id\nx,y','id,name\nx,"oops','id,name\nx,y,z','id\n'+Array(501).fill('a').join('\n')])assert.throws(()=>parseCSV(s));});
test('intake never accepts account privilege fields or overwrites IDs',()=>{const r=planImport('staff',[{id:'s1',name:'Teacher',email:'a@school.test',roles:'superAdmin'}],{staff:[{id:'s1'}]});assert.equal(r.errors.length,2);});
test('guardian links default portal access off and require valid verified references',()=>{const r=planImport('studentGuardianLinks',[{id:'link',studentId:'s',guardianId:'g',relationship:'mother',isEmergencyContact:'Yes',canCollect:'No'}],{students:[{id:'s',currentClassId:'c'}],guardians:[{id:'g',uid:'u'}]});assert.deepEqual(r.errors,[]);assert.equal(r.plan[0].payload.hasPortalAccess,false);assert.equal(r.plan[0].payload.guardianUid,'u');assert.equal(r.plan[0].payload.canCollect,false);});
test('enrolments reject duplicate active year placement',()=>{const r=planImport('enrollments',[{id:'e2',studentId:'s',classId:'c',startDate:'2027-01-04'}],{students:[{id:'s'}],classes:[{id:'c',academicYearId:'ay2027',standard:1}],enrollments:[{id:'e',studentId:'s',academicYearId:'ay2027'}]});assert.match(r.errors[0].message,/already has/);});
test('reject impossible dates and case-insensitive email duplication',()=>{assert.ok(planImport('students',[{id:'p',name:'Pupil',studentNumber:'1',dateOfBirth:'2020-02-30'}]).errors.length);assert.ok(planImport('staff',[{id:'a',name:'A',email:'A@school.test'},{id:'b',name:'B',email:'a@school.test'}]).errors.length);});
test('new columns accept what a person types and store the canonical value', () => {
  const s = planImport('students', [{ id: 'p1', name: 'Aarav', studentNumber: '2025-014', gender: 'Boy', motherTongue: ' tamil ', meals: 'YES', newThisYear: 'no' }]);
  assert.deepEqual(s.errors, []); assert.deepEqual([s.plan[0].payload.gender, s.plan[0].payload.motherTongue, s.plan[0].payload.meals, s.plan[0].payload.newThisYear], ['boy', 'tamil', true, false]);
  const t = planImport('staff', [{ id: 's1', name: 'K', email: 'k@school.test', schoolName: 'Teacher K', staffType: 'Non-teaching', startedAt: '2019-01' }]);
  assert.deepEqual(t.errors, []); assert.equal(t.plan[0].payload.staffType, 'nonTeaching');
  const g = planImport('guardians', [{ id: 'g1', name: 'P', phone: '0123456789', whatsapp: '012-345 6789' }]);
  assert.deepEqual(g.errors, []); assert.equal(g.plan[0].payload.whatsapp, '+60123456789');
});
test('empty optional columns become null or false, not empty strings', () => {
  const p = planImport('students', [{ id: 'p2', name: 'B', studentNumber: '2', gender: '', motherTongue: '', meals: '' }]).plan[0].payload;
  assert.deepEqual([p.gender, p.motherTongue, p.meals, p.newThisYear], [null, null, false, false]);
  const s = planImport('staff', [{ id: 's2', name: 'K', email: 'k2@school.test' }]).plan[0].payload;
  assert.deepEqual([s.schoolName, s.staffType, s.startedAt], [null, null, null]);
  assert.equal(planImport('guardians', [{ id: 'g2', name: 'P', phone: '1' }]).plan[0].payload.whatsapp, null);
});
test('bad values fail the row and name what is allowed', () => {
  const e = (ds, row) => planImport(ds, [row]).errors.map((x) => x.message).join(' | ');
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', gender: 'M' }), /gender must be Boy or Girl/);
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', motherTongue: 'Hindi' }), /Tamil, Chinese or Telugu/);
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', meals: 'Maybe' }), /meals must be Yes or No/);
  assert.match(e('staff', { id: 's', name: 'K', email: 'k@s.test', staffType: 'Admin' }), /staffType must be Teaching or Non-teaching/);
  assert.match(e('staff', { id: 's', name: 'K', email: 'k@s.test', startedAt: 'Jan 2019' }), /startedAt must be YYYY-MM/);
  assert.match(e('guardians', { id: 'g', name: 'P', phone: '1', whatsapp: '12345' }), /whatsapp must include the country code/);
  assert.ok(planImport('staff', [{ id: 's', name: 'K', email: 'k@s.test', roles: 'superAdmin' }]).errors.length, 'privilege columns still refused');
});
