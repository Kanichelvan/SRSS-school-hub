import { readFile } from 'node:fs/promises';
import { before, after, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
let env;
const hp = (value) => { const [host, port] = value.split(':'); return { host, port: Number(port) }; };
before(async () => {
  env = await initializeTestEnvironment({ projectId: process.env.GCLOUD_PROJECT || 'demo-srss-tests', firestore: { ...hp(process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'), rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') }, storage: { ...hp(process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199'), rules: await readFile(new URL('../../storage.rules', import.meta.url), 'utf8') } });
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users/owner'), { studentId: 'pupil', classIds: [] });
    await setDoc(doc(ctx.firestore(), 'users/teacher'), { classIds: ['c4'] });
    await setDoc(doc(ctx.firestore(), 'users/stranger'), { classIds: ['c5'] });
    await setDoc(doc(ctx.firestore(), 'challengeAttempts/a1'), { uid: 'owner', studentId: 'pupil', classId: 'c4', participantKind: 'student', definition: { type: 'creative' }, status: 'started' });
    await setDoc(doc(ctx.firestore(), 'challengeQuestions/quiz'), { questions: [{ answer: 1 }] });
  });
});
after(() => env?.cleanup());
const as = (uid, roles) => env.authenticatedContext(uid, { roles });
test('answer keys and authoritative engagement writes are inaccessible even through direct SDK calls', async () => {
  for (const [uid, roles] of [['owner', ['student']], ['teacher', ['teacher']], ['publisher', ['schoolAdmin']]]) {
    await assertFails(getDoc(doc(as(uid, roles).firestore(), 'challengeQuestions/quiz')));
    for (const path of ['pointsLedger/fake', 'studentBadges/fake', 'nilamRecords/fake', 'studentAchievementSummaries/fake']) await assertFails(setDoc(doc(as(uid, roles).firestore(), path), { points: 9999, verified: true }));
  }
  await assertFails(setDoc(doc(as('tech', ['technicalAdmin']).firestore(), 'settings/engagement'), { individualLeaderboard: true }));
});
test('private creative uploads belong to an active attempt; only the owner and assigned reviewers can read', async () => {
  const path = 'quest/owner/a1/art.png'; const bytes = new Uint8Array([1, 2, 3]);
  await assertSucceeds(uploadBytes(ref(as('owner', ['student']).storage(), path), bytes, { contentType: 'image/png' }));
  await assertSucceeds(getBytes(ref(as('owner', ['student']).storage(), path)));
  await assertSucceeds(getBytes(ref(as('teacher', ['teacher']).storage(), path)));
  await assertFails(getBytes(ref(as('stranger', ['teacher']).storage(), path)));
  await assertFails(getBytes(ref(as('parent', ['parent']).storage(), path)));
  await assertFails(uploadBytes(ref(as('stranger', ['student']).storage(), 'quest/owner/a1/other.png'), bytes, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(as('owner', ['student']).storage(), 'quest/owner/a1/script.html'), bytes, { contentType: 'text/html' }));
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'challengeAttempts/a1'), { status: 'pendingReview' }, { merge: true }));
  await assertFails(uploadBytes(ref(as('owner', ['student']).storage(), 'quest/owner/a1/late.png'), bytes, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(as('owner', ['student']).storage(), path), bytes, { contentType: 'image/png' }));
});
