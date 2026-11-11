import test from 'node:test'; import assert from 'node:assert/strict';
import { profilePatch } from '../src/hub/logic/schoolProfile.js';
test('profile patch trims, nulls blanks and normalises the parent phone', () => {
  assert.deepEqual(profilePatch({ officeHours: ' Mon–Fri 7.30 am–2.30 pm ', parentPhone: '012-600 1926', schoolCode: '', headmistress: { name: ' A ', title: ' Headmistress ' }, signatories: [{ name: 'B', title: 'Senior Assistant' }] }),
    { officeHours: 'Mon–Fri 7.30 am–2.30 pm', parentPhone: '+60126001926', schoolCode: null, headmistress: { name: 'A', title: 'Headmistress' }, signatories: [{ id: 'sig-1', name: 'B', title: 'Senior Assistant', active: true }] });
  assert.equal(profilePatch({ headmistress: { name: '', title: '' } }).headmistress, null);
  assert.throws(() => profilePatch({ parentPhone: '12345' }), /country code/);
});
test('a school profile saved before this phase produces an empty, valid patch', () => {
  assert.deepEqual(profilePatch({ name: 'Sekolah Rendah Sathya Sai' }), { officeHours: null, parentPhone: null, schoolCode: null, headmistress: null, signatories: [] });
});
test('a retired signatory is kept in the saved list', () => {
  const saved = profilePatch({ signatories: [{ id: 'sig-1', name: 'A', title: 'Headmistress', active: false }, { id: 'sig-2', name: 'B', title: '', active: true }] }).signatories;
  assert.deepEqual(saved.map((s) => [s.id, s.active]), [['sig-1', false], ['sig-2', true]]);
});
