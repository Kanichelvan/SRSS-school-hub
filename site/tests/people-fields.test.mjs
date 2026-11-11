import test from 'node:test'; import assert from 'node:assert/strict';
import { STUDENT_FIELDS, STAFF_FIELDS, GUARDIAN_FIELDS, prepareGuardian } from '../src/hub/logic/peopleFields.js';
const keys = (fields) => fields.map((f) => f.key);
test('forms carry every column the data request asks for', () => {
  for (const k of ['gender', 'motherTongue', 'meals', 'newThisYear']) assert.ok(keys(STUDENT_FIELDS).includes(k), k);
  for (const k of ['schoolName', 'staffType', 'startedAt']) assert.ok(keys(STAFF_FIELDS).includes(k), k);
  assert.ok(keys(GUARDIAN_FIELDS).includes('whatsapp'));
  for (const f of [...STUDENT_FIELDS, ...STAFF_FIELDS, ...GUARDIAN_FIELDS].filter((f) => ['gender', 'motherTongue', 'staffType'].includes(f.key))) assert.ok(!f.required && f.placeholder, `${f.key} is optional with a blank choice`);
});
test('existing form fields are all still present', () => {
  for (const k of ['name', 'preferredName', 'studentNumber', 'dateOfBirth', 'admissionDate', 'status']) assert.ok(keys(STUDENT_FIELDS).includes(k), k);
  for (const k of ['name', 'position', 'email', 'phone', 'directoryVisible']) assert.ok(keys(STAFF_FIELDS).includes(k), k);
  for (const k of ['name', 'email', 'phone', 'preferredLanguage', 'address']) assert.ok(keys(GUARDIAN_FIELDS).includes(k), k);
});
test('guardian whatsapp is normalised or refused before saving', () => {
  assert.equal(prepareGuardian({ name: 'P', whatsapp: '012-345 6789' }).whatsapp, '+60123456789');
  assert.equal(prepareGuardian({ name: 'P', whatsapp: '' }).whatsapp, null);
  assert.equal(prepareGuardian({ name: 'P', whatsapp: null }).whatsapp, null);
  assert.throws(() => prepareGuardian({ name: 'P', whatsapp: '12345' }), /country code/);
});
test('staff start month is checked before saving (browsers without a month picker show a text box)', async () => {
  const { startedAtError } = await import('../src/hub/logic/peopleFields.js');
  assert.equal(startedAtError('2019-01'), null); assert.equal(startedAtError(''), null); assert.equal(startedAtError(null), null);
  assert.match(startedAtError('Jan 2019'), /2019-01/);
});
