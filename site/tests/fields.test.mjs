import test from 'node:test'; import assert from 'node:assert/strict';
import { GENDERS, MOTHER_TONGUES, STAFF_TYPES, normalisePhone, parseChoice, parseYesNo, validMonth, sanitiseSignatories, removeSignatory } from '../functions/shared/fields.js';

test('phones typed the local way become E.164', () => {
  assert.equal(normalisePhone('012-345 6789'), '+60123456789');
  assert.equal(normalisePhone('6012 345 6789'), '+60123456789');
  assert.equal(normalisePhone('+60 12-345 6789'), '+60123456789');
  assert.equal(normalisePhone('+44 20 7946 0958'), '+442079460958');
  for (const bad of ['12345', 'abc', '', '+6012']) assert.equal(normalisePhone(bad), null);
});
test('choices accept labels and values in any case', () => {
  assert.equal(parseChoice(GENDERS, ' Boy '), 'boy');
  assert.equal(parseChoice(STAFF_TYPES, 'non-teaching'), 'nonTeaching');
  assert.equal(parseChoice(STAFF_TYPES, 'nonTeaching'), 'nonTeaching');
  assert.equal(parseChoice(MOTHER_TONGUES, 'Hindi'), null);
  assert.equal(parseChoice(GENDERS, 'M'), null);
});
test('yes/no', () => {
  for (const y of ['Yes', 'YES', 'y', 'true']) assert.equal(parseYesNo(y), true);
  for (const n of ['No', 'n', 'FALSE']) assert.equal(parseYesNo(n), false);
  assert.equal(parseYesNo('Maybe'), null);
});
test('month', () => { assert.ok(validMonth('2019-01')); for (const bad of ['2019-13', '2019-1', 'Jan 2019', '']) assert.ok(!validMonth(bad)); });
test('signatories keep ids, drop blanks, cap at ten, and are retired not deleted', () => {
  const clean = sanitiseSignatories([{ id: 'sig-1', name: ' A ', title: ' Headmistress ', active: true }, { name: 'B', title: '' }, { name: '  ' }]);
  assert.deepEqual(clean, [{ id: 'sig-1', name: 'A', title: 'Headmistress', active: true }, { id: 'sig-2', name: 'B', title: '', active: true }]);
  assert.equal(sanitiseSignatories(Array.from({ length: 12 }, (_, i) => ({ name: `P${i}` }))).length, 10);
  assert.deepEqual(removeSignatory(clean, 'sig-1').map((s) => [s.id, s.active]), [['sig-1', false], ['sig-2', true]]);
});
// --- Review fixes (12 Nov 2026) ---
test('phone: common slips are corrected or refused, never stored wrong', () => {
  assert.equal(normalisePhone('+60 012-345 6789'), '+60123456789', 'trunk 0 after +60 dropped');
  assert.equal(normalisePhone('0060123456789'), '+60123456789', '00 international prefix');
  assert.equal(normalisePhone('0065 9123 4567'), '+6591234567');
  assert.equal(normalisePhone('03-9133 5000'), '+60391335000', 'landline');
  assert.equal(normalisePhone('(012) 345.6789'), '+60123456789');
  for (const bad of ['6.01123E+11', '0123456', '+0123456789', '012-345 6789 ext 12', '012345678901234']) assert.equal(normalisePhone(bad), null, bad);
});
test('signatories: a saved one whose name is cleared is retired, and its id is never reused', () => {
  const out = sanitiseSignatories([{ id: 'sig-1', name: '', title: 'x', active: true }, { id: 'sig-2', name: 'B', title: '', active: true }, { id: '', name: 'New', title: '' }]);
  assert.deepEqual(out.map((s) => [s.id, s.name, s.active]), [['sig-1', '', false], ['sig-2', 'B', true], ['sig-3', 'New', true]]);
});
test('signatories: retired ones do not use up the ten active places', () => {
  const retired = Array.from({ length: 10 }, (_, i) => ({ id: `sig-${i + 1}`, name: `Old ${i}`, title: '', active: false }));
  const out = sanitiseSignatories([...retired, ...Array.from({ length: 12 }, (_, i) => ({ name: `New ${i}` }))]);
  assert.equal(out.filter((s) => !s.active).length, 10);
  assert.equal(out.filter((s) => s.active).length, 10);
  assert.equal(new Set(out.map((s) => s.id)).size, 20);
});
