import test from 'node:test'; import assert from 'node:assert/strict';
import { BOARD, OFFICE, SENIOR_TEAM, TEACHERS } from '../src/data/people.js';
test('Our People lists the School team by name and role only', () => {
  const everyone = [...BOARD, ...SENIOR_TEAM, ...TEACHERS, ...OFFICE];
  assert.deepEqual([BOARD.length, SENIOR_TEAM.length, TEACHERS.length, OFFICE.length], [6, 2, 15, 1]);
  assert.equal(new Set(everyone.map((p) => p.name)).size, everyone.length, 'no one is listed twice');
  for (const person of everyone) {
    assert.deepEqual(Object.keys(person).sort(), ['name', 'role']);
    assert.ok(!/@|\d{6,}|test/i.test(person.name + person.role), `${person.name}: no contact details, identity numbers or test entries on a public page`);
  }
});
