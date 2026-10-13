import assert from 'node:assert/strict';
import { test } from 'node:test';
import { availability, eligible, grade, publicQuestions, validateDefinition, validateQuestions, validateResources } from '../functions/quest-engine.js';
import { questionTemplate } from '../src/hub/quest-templates.js';
const base = { title: 'Discovery', description: '', instructions: 'Try this.', type: 'mcq', category: 'Our School', campaignId: 'srss25', academicYearId: 'ay2027', audiences: ['students'], standards: [], classIds: [], teamIds: [], userIds: [], startAt: '2027-01-01T00:00:00+08:00', endAt: '2028-01-01T00:00:00+08:00', participationPoints: 2, completionPoints: 10, accuracyBonus: 8, maxPoints: 20, passPercent: 50 };
const student = { uid: 's', roles: ['student'], scope: { studentId: 'stu' }, student: { currentClassId: 'c4', currentStandard: 4 } };
test('server eligibility covers all audiences and conjunctive Standard/class limits', () => {
  const c = validateDefinition(base);
  assert.equal(eligible(c, student), true);
  assert.equal(eligible({ ...c, standards: [5] }, student), false);
  assert.equal(eligible({ ...c, classIds: ['c5'] }, student), false);
  const teacher = { uid: 't', roles: ['teacher', 'contentEditor'], scope: {}, teamIds: ['team-a'] };
  const staff = { uid: 'f', roles: ['financeOfficer'], scope: {}, teamIds: ['team-a'] };
  for (const audience of ['teachers', 'allStaff', 'wholeSchool', 'staffTeams', 'users']) assert.equal(eligible({ ...c, audiences: [audience], teamIds: ['team-a'], userIds: ['t'] }, teacher), true, audience);
  assert.equal(eligible({ ...c, audiences: ['nonTeachingStaff'] }, teacher), false);
  assert.equal(eligible({ ...c, audiences: ['nonTeachingStaff'] }, staff), true);
  assert.equal(eligible({ ...c, audiences: ['allStaff'] }, student), false);
  assert.equal(eligible({ ...c, audiences: ['wholeSchool'] }, { uid: 'p', roles: ['parent'], scope: { childIds: ['stu'] } }), false);
});
test('opening and closing are validated with server instants and exclusive close boundary', () => {
  const c = { ...validateDefinition(base), status: 'scheduled' };
  assert.equal(availability(c, Date.parse(c.startAt) - 1), 'comingSoon');
  assert.equal(availability(c, Date.parse(c.startAt)), 'live');
  assert.equal(availability(c, Date.parse(c.endAt)), 'closed');
  assert.equal(availability({ ...c, status: 'draft' }, Date.parse(c.startAt)), 'unpublished');
  assert.throws(() => validateDefinition({ ...base, startAt: '2027-01-01T10:00' }), /timezone/);
});
test('ten challenge formats validate and grade on the server; keys and explanations are removed', () => {
  for (const type of ['mcq', 'trueFalse', 'decode', 'wordScramble', 'wordSearch', 'picturePuzzle', 'memoryMatch', 'sequence', 'spotDifference']) {
    const c = validateDefinition({ ...base, type });
    const questions = validateQuestions(type, [questionTemplate(type)]);
    assert.equal(grade(c, questions, [questions[0].answer]).percentage, 100, type);
    assert.throws(() => grade(c, questions, [null]), undefined, type);
    assert.equal(grade(c, questions, [questions[0].answer]).points, 20, type);
    assert.equal('answer' in publicQuestions(questions)[0], false);
    assert.equal('explanation' in publicQuestions(questions)[0], false);
  }
  assert.deepEqual(validateQuestions('creative', []), []);
});
test('word answers normalise case and whitespace; selection duplicates cannot spoof a solution', () => {
  const c = validateDefinition({ ...base, type: 'wordScramble' }); const q = validateQuestions(c.type, [questionTemplate(c.type)]);
  assert.equal(grade(c, q, ['  book  ']).percentage, 100);
  const w = validateQuestions('wordSearch', [questionTemplate('wordSearch')]);
  assert.throws(() => grade({ ...c, type: 'wordSearch' }, w, [[...w[0].answer, w[0].answer[0]]]), /valid puzzle answer/);
  assert.throws(() => grade(c, q, []), /every question/);
});
test('Human Excellence and service cannot receive competitive scores', () => {
  for (const category of ['Human Excellence', 'Service & Sustainability']) {
    const c = validateDefinition({ ...base, category, participationPoints: 1000, anniversaryPoints: 1000 });
    assert.equal(grade(c, validateQuestions('mcq', [questionTemplate('mcq')]), [1]).points, 0);
  }
});
test('Workspace links are metadata only and restricted to genuine Google hosts', () => {
  assert.equal(validateResources([{ label: 'Reflection', url: 'https://docs.google.com/document/d/abc/edit' }])[0].provider, 'googleWorkspace');
  for (const url of ['https://docs.google.com.evil.test/a', 'javascript:alert(1)', 'https://evil.test', 'https://user:password@docs.google.com/a']) assert.throws(() => validateResources([{ label: 'Link', url }]));
});

test('a participation completion threshold cannot reward unanswered or incomplete payloads', () => {
  const c = validateDefinition({ ...base, passPercent: 0 });
  assert.throws(() => grade(c, validateQuestions('mcq', [questionTemplate('mcq')]), [99]), /Choose an answer/);
  const sequence = validateQuestions('sequence', [questionTemplate('sequence')]);
  assert.throws(() => grade({ ...c, type: 'sequence' }, sequence, [['choose']]), /every puzzle piece/);
  const mixed = { ...student, roles: ['student', 'teacher'], mode: 'student' };
  assert.equal(eligible({ ...c, audiences: ['allStaff'] }, mixed), false);
  assert.equal(eligible({ ...c, audiences: ['allStaff'] }, { ...mixed, mode: 'staff' }), true);
});
