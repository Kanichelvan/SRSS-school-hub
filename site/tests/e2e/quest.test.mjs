// Real callable, sign-in, Firestore persistence and rules. Emulator fixtures are fictional and isolated.
import assert from 'node:assert/strict';
import { questionTemplate } from '../../src/hub/quest-templates.js';
import { after, before, test } from 'node:test';
import { initializeApp as initAdmin, deleteApp as deleteAdmin } from 'firebase-admin/app';
import { getAuth as adminAuth } from 'firebase-admin/auth';
import { getFirestore as adminDb } from 'firebase-admin/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { connectFirestoreEmulator, getDoc, doc, initializeFirestore, setDoc, terminate } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
const RUN = `q-test-${Date.now()}`;
const STUDENT_ID = `${RUN}-student`; const CLASS_ID = `${RUN}-class4`; const OTHER_CLASS_ID = `${RUN}-class5`;
const PROJECT = process.env.GCLOUD_PROJECT || 'demo-srss-quest-test';
if (!PROJECT.startsWith('demo-') || !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Quest tests require local demo emulators.');
const hostPort = (s) => { const [host, port] = s.split(':'); return [host, Number(port)]; };
const admin = initAdmin({ projectId: PROJECT }, 'quest-e2e'); const db = adminDb(admin); const sessions = [];
let office, student, teacher, otherTeacher, staff, parent, otherParent, editor;
async function session(key, roles, scope = {}) {
  const uid = `quest-test-${RUN}-${key}`;
  await adminAuth(admin).createUser({ uid, email: `${RUN}-${key}@quest-e2e.test`, password: 'quest-test-only' });
  await adminAuth(admin).setCustomUserClaims(uid, { roles });
  await db.doc(`users/${uid}`).set({ roles, status: 'active', academicYearId: 'ay2027', ...scope });
  const app = initializeApp({ projectId: PROJECT, apiKey: 'demo-key', authDomain: `${PROJECT}.firebaseapp.com` }, key);
  const auth = getAuth(app); connectAuthEmulator(auth, `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
  const clientDb = initializeFirestore(app, { experimentalForceLongPolling: true }); connectFirestoreEmulator(clientDb, ...hostPort(process.env.FIRESTORE_EMULATOR_HOST));
  const fns = getFunctions(app, 'asia-southeast1'); connectFunctionsEmulator(fns, ...hostPort(process.env.QUEST_FUNCTIONS_EMULATOR_HOST || '127.0.0.1:5001'));
  await signInWithEmailAndPassword(auth, `${RUN}-${key}@quest-e2e.test`, 'quest-test-only');
  const s = { app, db: clientDb, uid, call: (action, payload = {}) => httpsCallable(fns, 'engagement')({ action, ...payload }).then((r) => r.data) }; sessions.push(s); return s;
}
const question = { prompt: 'What is 2 + 3?', options: ['4', '5', '6'], answer: 1, explanation: 'Two plus three makes five.' };
const definition = (extra = {}) => ({ title: 'A fictional discovery', instructions: 'Choose your answer.', category: 'Our School', campaignId: RUN, academicYearId: 'ay2027', type: 'mcq', audiences: ['students'], standards: [4], classIds: [CLASS_ID], durationMinutes: 5, attemptLimit: 3, startAt: new Date(Date.now() - 60000).toISOString(), endAt: new Date(Date.now() + 86400000).toISOString(), completionPoints: 10, accuracyBonus: 10, maxPoints: 20, passPercent: 50, badgeId: 'q-explorer', stamp: 'Discover', ...extra });
async function publish(c, q = [question], scheduled = false) {
  const { challengeId } = await office.call('saveChallenge', { challenge: c, questions: q });
  for (const status of ['review', 'approved', scheduled ? 'scheduled' : 'live']) await office.call('transition', { challengeId, status });
  return challengeId;
}
const denied = (promise) => assert.rejects(promise, (e) => /permission-denied/.test(e.code || '') || /permission|denied|outside|cannot|Only|authorised/i.test(e.message));
const ids = {};
before(async () => {
  office = await session('office', ['schoolAdmin']);
  student = await session('student', ['student'], { studentId: STUDENT_ID });
  teacher = await session('teacher', ['teacher'], { classIds: [CLASS_ID] });
  otherTeacher = await session('other-teacher', ['teacher'], { classIds: [OTHER_CLASS_ID] });
  staff = await session('staff', ['financeOfficer']);
  parent = await session('parent', ['parent'], { childIds: [STUDENT_ID] });
  otherParent = await session('other-parent', ['parent'], { childIds: [] });
  editor = await session('editor', ['contentEditor']);
  await db.doc(`classes/${CLASS_ID}`).set({ name: '4 Demo', standard: 4, status: 'active', academicYearId: 'ay2027' });
  // No uid field: avoids unrelated SIS account triggers; scope was seeded server-side above.
  await db.doc(`students/${STUDENT_ID}`).set({ name: 'Fictional pupil', currentClassId: CLASS_ID, currentStandard: 4, status: 'active', uid: student.uid });
  await db.doc(`students/${RUN}-peer`).set({ currentClassId: CLASS_ID, currentStandard: 4, status: 'active' });
  await office.call('saveCampaign', { campaign: { id: RUN, name: 'Fictional test campaign', academicYearId: 'ay2027', active: true } });
  await office.call('saveBadge', { badge: { id: 'q-explorer', name: 'Test Explorer', description: 'Completes a test discovery.', category: 'Discovery', campaignId: RUN, audiences: ['students', 'staff'], active: true } });
});
after(async () => { await Promise.all(sessions.map(async (s) => { await terminate(s.db); await deleteApp(s.app); })); await deleteAdmin(admin); });
test('Stage A: admin creates, approves, publishes; student resumes and receives a server-validated score', async () => {
  ids.quiz = await publish(definition());
  const catalog = await student.call('catalog'); assert.ok(catalog.challenges.some((c) => c.id === ids.quiz));
  assert.equal(JSON.stringify(catalog).includes('"answer":'), false);
  const attempt = await student.call('start', { challengeId: ids.quiz }); ids.attempt = attempt.id;
  assert.equal('answer' in attempt.questions[0], false);
  await student.call('saveProgress', { attemptId: attempt.id, answers: [1] });
  assert.deepEqual((await student.call('start', { challengeId: ids.quiz })).answers, [1]);
  const result = await student.call('submit', { attemptId: attempt.id, answers: [1], points: 999999, percentage: 0 });
  assert.equal(result.percentage, 100); assert.equal(result.points, 20); assert.equal(result.status, 'completed');
  const summary = await student.call('summary'); assert.equal(summary.points, 20); assert.equal(summary.badges.length, 1); assert.equal(summary.completions.length, 1);
  assert.equal((await db.doc(`pointsLedger/${attempt.id}`).get()).data().delta, 20);
});
test('transactional idempotency: repeated and concurrent submissions cannot farm points or badges', async () => {
  await Promise.all([student.call('submit', { attemptId: ids.attempt, answers: [1] }), student.call('submit', { attemptId: ids.attempt, answers: [0] })]);
  const next = await student.call('start', { challengeId: ids.quiz }); await student.call('submit', { attemptId: next.id, answers: [1] });
  assert.equal((await student.call('summary')).points, 20);
  assert.equal((await db.collection('studentBadges').where('uid', '==', student.uid).get()).size, 1);
  assert.equal((await db.collection('pointsLedger').where('uid', '==', student.uid).get()).size, 1);
});
test('audience, class, publication and server-time boundaries are enforced', async () => {
  ids.staff = await publish(definition({ audiences: ['allStaff'], standards: [], classIds: [], title: 'Staff puzzle' }));
  await denied(student.call('start', { challengeId: ids.staff }));
  assert.equal((await student.call('catalog')).challenges.some((c) => c.id === ids.staff), false);
  const a = await staff.call('start', { challengeId: ids.staff }); await staff.call('submit', { attemptId: a.id, answers: [1] });
  const t = await teacher.call('start', { challengeId: ids.staff }); await teacher.call('submit', { attemptId: t.id, answers: [1] });
  assert.equal((await staff.call('summary')).badges.length, 1);
  const future = await publish(definition({ startAt: new Date(Date.now() + 3600000).toISOString(), title: 'Future release' }), [question], true);
  assert.equal((await student.call('catalog')).challenges.find((c) => c.id === future).availability, 'comingSoon');
  await assert.rejects(student.call('start', { challengeId: future, clientNow: '2099-01-01' }), /not open/);
  const wrongClass = await publish(definition({ classIds: [OTHER_CLASS_ID], standards: [5] })); await denied(student.call('start', { challengeId: wrongClass }));
  const draft = await editor.call('saveChallenge', { challenge: definition({ audiences: ['allStaff'], standards: [], classIds: [] }), questions: [question] });
  await denied(editor.call('transition', { challengeId: draft.challengeId, status: 'live' }));
  await denied(student.call('start', { challengeId: draft.challengeId }));
});
test('creative review is restricted to assigned teachers and awards only after acceptance', async () => {
  const challengeId = await publish(definition({ type: 'creative', category: 'Human Excellence', title: 'Kindness reflection' }), []);
  const a = await student.call('start', { challengeId });
  await student.call('submit', { attemptId: a.id, reflection: 'I helped a classmate understand a story.' });
  assert.equal((await db.doc(`challengeAttempts/${a.id}`).get()).data().status, 'pendingReview');
  await denied(otherTeacher.call('reviewSubmission', { attemptId: a.id, decision: 'accepted' }));
  await denied(parent.call('reviewSubmission', { attemptId: a.id, decision: 'accepted' }));
  await teacher.call('reviewSubmission', { attemptId: a.id, decision: 'returned', feedback: 'Tell us what you learned.' });
  const resumed = await student.call('start', { challengeId }); assert.equal(resumed.id, a.id);
  await student.call('submit', { attemptId: a.id, reflection: 'Helping others takes patience.' });
  await teacher.call('reviewSubmission', { attemptId: a.id, decision: 'accepted', feedback: 'Thank you for reflecting.' });
  assert.equal((await db.doc(`challengeAttempts/${a.id}`).get()).data().points, 0);
  await teacher.call('portfolioCandidate', { kind: 'quest', sourceId: a.id });
  const portfolio = (await db.doc(`portfolioEntries/engagement-quest-${a.id}`).get()).data(); assert.equal(portfolio.visibility, 'internal'); assert.deepEqual(portfolio.humanValues, []);
});
test('NILAM draft, parent assistance, assigned-teacher verification, duplicates and milestones persist', async () => {
  const config = (await office.call('cms')).settings;
  await office.call('saveSettings', { settings: { ...config, parentAssistedNilam: true, readingMilestones: [{ name: 'First discovery', books: 1 }] } });
  const r = { title: 'A fictional story', author: 'Demo Author', language: 'English', materialType: 'Book', classification: 'Fiction', pages: 32, completionDate: '2026-10-01', summary: 'A story about a shared garden.', reflection: 'Everyone can help.', takeaway: 'Be patient.' };
  const saved = await student.call('saveNilam', { record: r });
  await student.call('saveNilam', { recordId: saved.recordId, record: r, submit: true });
  await denied(otherParent.call('nilam', { studentId: STUDENT_ID }));
  await denied(otherTeacher.call('reviewNilam', { recordId: saved.recordId, decision: 'verified' }));
  await teacher.call('reviewNilam', { recordId: saved.recordId, decision: 'verified', feedback: 'Well read.' });
  const reading = await parent.call('nilam', { studentId: STUDENT_ID }); assert.equal(reading.verifiedPages, 32); assert.equal(reading.verifiedBooks, 1); assert.match(reading.records.find((r) => r.status === 'verified').verificationDate, /^20\d\d-/); assert.equal(reading.milestones[0].reached, true);
  await assert.rejects(student.call('saveNilam', { recordId: saved.recordId, record: { ...r, pages: 999 }, submit: true }), /drafts|returned/);
  const duplicate = await parent.call('saveNilam', { studentId: STUDENT_ID, record: r, submit: true });
  await assert.rejects(teacher.call('reviewNilam', { recordId: duplicate.recordId, decision: 'verified' }), /already verified/);
  assert.equal((await student.call('nilam')).verifiedPages, 32);
  assert.ok((await parent.call('summary', { studentId: STUDENT_ID })).completions.length);
  await denied(otherParent.call('summary', { studentId: STUDENT_ID }));
});
test('privacy-safe leaderboard excludes staff and normalises class size; direct writes and keys are denied', async () => {
  const board = await student.call('leaderboard', { campaignId: RUN });
  const recent = await student.call('leaderboard', { campaignId: RUN, since: new Date(Date.now() - 86400000).toISOString() }); assert.equal(recent.rows[0].points, 10); assert.equal(board.individualEnabled, false); assert.equal(board.rows[0].points, 10); assert.equal(board.rows[0].classSize, 2);
  assert.equal(JSON.stringify(board).includes(student.uid), false); assert.equal(JSON.stringify(board).includes('Fictional pupil'), false);
  assert.equal((await student.call('leaderboard', { campaignId: RUN, mode: 'individual' })).enabled, false);
  for (const path of [`challengeQuestions/${ids.quiz}`, `challengeAttempts/${ids.attempt}`, `studentBadges/${student.uid}_q-explorer`, `pointsLedger/${ids.attempt}`, 'nilamRecords/forged']) {
    await denied(getDoc(doc(student.db, path)));
    await denied(setDoc(doc(student.db, path), { uid: student.uid, points: 99999, status: 'verified' }));
  }
  await denied(student.call('submit', { attemptId: (await staff.call('catalog')).attempts[0].id, answers: [1] }));
});
test('administrative corrections require a publisher and a reason and are idempotent', async () => {
  const correction = { attemptId: ids.attempt, correctionId: `fix-${RUN}`, delta: -3, revokeBadge: true, reason: 'Fictional test correction.' };
  await denied(student.call('correctReward', correction));
  await assert.rejects(office.call('correctReward', { ...correction, reason: '' }), /reason/);
  await office.call('correctReward', correction); await office.call('correctReward', correction);
  const summary = await student.call('summary'); assert.equal(summary.points, 17); assert.equal(summary.badges.length, 0);
  assert.equal((await db.doc(`pointsLedger/correction-fix-${RUN}`).get()).data().delta, -3);
  assert.equal((await db.doc(`studentBadges/${student.uid}_q-explorer`).get()).data().reason, correction.reason);
});
test('server timers and attempt limits cannot be bypassed using client time', async () => {
  const challengeId = await publish(definition({ attemptLimit: 2, timeLimitSeconds: 1, badgeId: '', title: 'Timed test' }));
  const first = await student.call('start', { challengeId });
  await db.doc(`challengeAttempts/${first.id}`).update({ startedAt: new Date(Date.now() - 10000).toISOString() });
  await assert.rejects(student.call('submit', { attemptId: first.id, answers: [1], startedAt: new Date().toISOString() }), /time limit/);
  assert.equal((await student.call('start', { challengeId })).status, 'expired');
  const second = await student.call('start', { challengeId }); assert.notEqual(first.id, second.id);
  await db.doc(`challengeAttempts/${second.id}`).update({ startedAt: new Date(Date.now() - 10000).toISOString() });
  await student.call('start', { challengeId });
  await assert.rejects(student.call('start', { challengeId }), /used the available attempts/);
});

test('each puzzle format uses the shared callable and authoritative grading', async () => {
  for (const type of ['trueFalse', 'decode', 'wordScramble', 'wordSearch', 'picturePuzzle', 'memoryMatch', 'sequence', 'spotDifference']) {
    const question = questionTemplate(type);
    const challengeId = await publish(definition({ type, badgeId: '', title: `Fictional ${type} test` }), [question]).catch((e) => { throw new Error(`Publishing ${type}: ${e.message}`, { cause: e }); });
    const a = await student.call('start', { challengeId }).catch((e) => { throw new Error(`Starting ${type}: ${e.message}`, { cause: e }); });
    assert.equal('answer' in a.questions[0], false);
    await student.call('saveProgress', { attemptId: a.id, answers: [question.answer] });
    assert.deepEqual((await student.call('start', { challengeId })).answers, [question.answer]);
    const result = await student.call('submit', { attemptId: a.id, answers: [question.answer] }).catch((e) => { throw new Error(`Submitting ${type}: ${e.message}`, { cause: e }); });
    assert.equal(result.percentage, 100, type); assert.equal(result.points, 20, type);
  }
});
