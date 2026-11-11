import test, { before, after, beforeEach } from 'node:test'; import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
// Office data fields (spec 2026-11-12, phase 1): limits enforced by the rules for pupils, staff, guardians and the school profile.
let env;
const [host, port = '8080'] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-srss-office-rules', firestore: { host, port: Number(port), rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') } }); });
beforeEach(() => env.clearFirestore());
after(() => env.cleanup());
const db = (uid, roles) => env.authenticatedContext(uid, { roles }).firestore();
const stamp = () => ({ status: 'active', uid: null, createdBy: 'o', createdAt: serverTimestamp(), updatedBy: 'o', updatedAt: serverTimestamp() });

test('pupil extras: valid values accepted, bad values refused', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'Aarav', currentClassId: null, ...stamp() };
  await assertSucceeds(setDoc(doc(d, 'students/a'), { ...base, gender: 'boy', motherTongue: 'tamil', meals: true, newThisYear: false }));
  await assertSucceeds(setDoc(doc(d, 'students/b'), { ...base, gender: null, motherTongue: null }));
  for (const bad of [{ gender: 'M' }, { motherTongue: 'hindi' }, { meals: 'Yes' }, { newThisYear: 1 }, { gender: '' }]) await assertFails(setDoc(doc(d, 'students/x'), { ...base, ...bad }));
});
test('a pupil saved before this phase can still be edited', async () => {
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'students/old'), { name: 'Old', status: 'active', uid: null, currentClassId: null, createdBy: 'z', createdAt: new Date() }));
  await assertSucceeds(updateDoc(doc(db('o', ['schoolAdmin']), 'students/old'), { name: 'Old Name', updatedBy: 'o', updatedAt: serverTimestamp() }));
});
test('staff extras', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'K', ...stamp() };
  await assertSucceeds(setDoc(doc(d, 'staff/a'), { ...base, schoolName: 'Teacher K', staffType: 'nonTeaching', startedAt: '2019-01' }));
  for (const bad of [{ staffType: 'admin' }, { startedAt: 'Jan 2019' }, { startedAt: '2019-13' }, { schoolName: 'x'.repeat(81) }]) await assertFails(setDoc(doc(d, 'staff/x'), { ...base, ...bad }));
});
test('guardian whatsapp must be E.164', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'P', ...stamp() };
  await assertSucceeds(setDoc(doc(d, 'guardians/a'), { ...base, whatsapp: '+60123456789' }));
  await assertSucceeds(setDoc(doc(d, 'guardians/b'), { ...base, whatsapp: null }));
  for (const bad of ['0123456789', '+60 12 345', 'abc']) await assertFails(setDoc(doc(d, 'guardians/x'), { ...base, whatsapp: bad }));
});
test('school profile limits; other settings documents unaffected', async () => {
  const d = db('o', ['schoolAdmin']);
  await assertSucceeds(setDoc(doc(d, 'settings/school'), { officeHours: 'Mon–Fri 7.30 am–2.30 pm', parentPhone: '+60126001926', schoolCode: 'X1', headmistress: { name: 'A', title: 'Headmistress' }, signatories: [{ id: 'sig-1', name: 'A', title: 'Headmistress', active: true }] }, { merge: true }));
  for (const bad of [{ officeHours: 'x'.repeat(201) }, { headmistress: 'A' }, { headmistress: { name: 'x'.repeat(121), title: '' } }, { headmistress: { name: 'A', title: 'T', extra: 1 } }, { signatories: Array(51).fill({ id: 's', name: 'n', title: '', active: true }) }, { signatories: 'A' }]) await assertFails(setDoc(doc(d, 'settings/school'), bad, { merge: true }));
  await assertSucceeds(setDoc(doc(d, 'settings/other'), { anything: 'x'.repeat(500) }));
  await assertFails(setDoc(doc(db('l', ['leadership']), 'settings/school'), { officeHours: 'x' }, { merge: true }));
});
