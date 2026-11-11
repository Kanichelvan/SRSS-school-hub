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
