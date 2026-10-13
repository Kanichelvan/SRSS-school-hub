// Fictional Quest fixtures. Can be called independently, or by the existing school emulator seed.
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { grade, validateDefinition, validateQuestions } from '../functions/quest-engine.js';
import { questionTemplate } from '../src/hub/quest-templates.js';
export async function seedQuest(db) {
  if (!/^demo-/.test(db.projectId) || !/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || '') || !/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIREBASE_AUTH_EMULATOR_HOST || '')) throw new Error('Quest demo content can only be seeded in local demo emulators.');
  const stamp = { createdBy: 'seed-script', createdAt: new Date(), updatedBy: 'seed-script', updatedAt: new Date() };
  const batch = db.batch();
  batch.set(db.doc('challengeCampaigns/srss25'), { name: 'SRSS25 · Silver Jubilee discoveries', description: 'Fictional development activities. School content must be reviewed before release.', academicYearId: 'ay2027', active: true, demoOnly: true, ...stamp });
  for (const [id, name, audiences] of [['srss-explorer', 'SRSS Explorer', ['students']], ['truth-seeker', 'Truth Seeker', ['students']], ['creative-spark', 'Creative Spark', ['students']], ['heritage-keeper', 'Heritage Keeper', ['staff']]]) batch.set(db.doc(`badgeDefinitions/${id}`), { name, description: 'Complete the designated development challenge.', category: 'Participation', campaignId: 'srss25', audiences, active: true, ...stamp });
  const sample = [
    ['quest-welcome', 'Welcome, young explorer', 'mcq', 'Our School', 'Discover', 'srss-explorer'],
    ['quest-fact-fiction', 'Fact or fiction: a shape discovery', 'trueFalse', 'Young Explorers', 'Aspire', 'truth-seeker'],
    ['quest-reading-quiz', 'A reading adventure', 'mcq', 'Reading Adventures', 'Read', ''],
    ['quest-scramble', 'The curious bookworm', 'wordScramble', 'Reading Adventures', 'Read', ''],
    ['quest-word-search', 'Words of discovery', 'wordSearch', 'Young Explorers', 'Discover', ''],
    ['quest-creative', 'A memory worth keeping', 'creative', 'SRSS25 Memories', 'Create', 'creative-spark'],
    ['quest-staff', 'A five-minute puzzle break', 'trueFalse', 'Fun & Fellowship', 'Discover', 'heritage-keeper'],
    ['quest-future', 'Another discovery is coming', 'sequence', 'Young Explorers', 'Celebrate', ''],
  ];
  for (const [challengeId, title, type, category, passport, badgeId] of sample) {
    const future = challengeId === 'quest-future';
    const definition = validateDefinition({ title, description: 'Development example — fictional learning content, not verified school history.', instructions: type === 'creative' ? 'Write, draw or photograph a learning memory. Ask a reviewer to check your contribution.' : 'Read each question and enjoy the discovery. Save your progress if you need a break.', type, category, campaignId: 'srss25', academicYearId: 'ay2027', collection: category, audiences: challengeId === 'quest-staff' ? ['allStaff'] : ['students'], standards: [], classIds: [], startAt: new Date(Date.now() + (future ? 7 * 86400000 : -86400000)).toISOString(), endAt: new Date(Date.now() + 30 * 86400000).toISOString(), durationMinutes: 5, attemptLimit: 3, completionPoints: 10, accuracyBonus: 10, maxPoints: 20, badgeId, stamp: passport, featured: challengeId === 'quest-welcome' || challengeId === 'quest-staff' });
    const questions = validateQuestions(type, type === 'creative' ? [] : [questionTemplate(type)]);
    batch.set(db.doc(`challengeDefinitions/${challengeId}`), { ...definition, status: future ? 'scheduled' : 'live', demoOnly: true, ...stamp });
    batch.set(db.doc(`challengeQuestions/${challengeId}`), { questions });
    batch.set(db.doc(`challengeReleases/${challengeId}`), { challengeId, title, campaignId: 'srss25', audiences: definition.audiences, startAt: definition.startAt, endAt: definition.endAt, status: future ? 'scheduled' : 'live', ...stamp });
  }
  batch.set(db.doc('settings/engagement'), { competitionEnabled: true, classLeaderboard: true, individualLeaderboard: false, staffLeaderboard: false, parentAssistedNilam: true, collectivePageGoal: 2500, readingMilestones: [{ name: 'First reading discovery (school demo)', books: 1 }, { name: 'Reading explorer (school demo)', books: 5 }], languages: ['Bahasa Melayu', 'English', 'Tamil', 'Chinese', 'Other'], materialTypes: ['Book', 'Article', 'Magazine', 'Digital material'], classifications: ['Fiction', 'Non-fiction'], ...stamp });
  await batch.commit();
  const studentSnap = (await db.collection('users').where('email', '==', 'student@demo.srss.test').get()).docs[0];
  if (studentSnap?.data().studentId) {
    const studentId = studentSnap.data().studentId; const student = (await db.doc(`students/${studentId}`).get()).data();
    await db.doc(`nilamRecords/quest-demo-draft-${studentId}`).set({ title: 'The imaginary garden', author: 'Demo Author', publisher: 'Fictional Press', language: 'English', materialType: 'Book', classification: 'Fiction', pages: 24, completionDate: '2026-10-01', summary: 'Children grow a garden together.', reflection: 'I noticed how patiently they helped one another.', takeaway: 'Small efforts can grow.', studentId, classId: student.currentClassId, academicYearId: 'ay2027', participantKind: 'student', source: 'studentHub', status: 'draft', ...stamp });
    // Development achievements use the same pure grader; acceptance tests exercise live reward transactions.
    const reward = await db.doc(`questRewards/${studentSnap.id}_quest-reading-quiz`).get();
    if (!reward.exists) {
      const definition = (await db.doc('challengeDefinitions/quest-reading-quiz').get()).data();
      const questions = (await db.doc('challengeQuestions/quest-reading-quiz').get()).data().questions;
      const score = grade(definition, questions, [1]);
      const attemptId = `demo-reading-${studentId}`;
      const at = new Date();
      const sample = db.batch();
      sample.set(db.doc(`challengeAttempts/${attemptId}`), { id: attemptId, uid: studentSnap.id, studentId, classId: student.currentClassId, standard: student.currentStandard, participantKind: 'student', challengeId: 'quest-reading-quiz', title: definition.title, campaignId: 'srss25', academicYearId: 'ay2027', definition, questions, answers: [1], ...score, status: 'completed', number: 1, startedAt: at.toISOString(), submittedAt: at.toISOString() });
      sample.set(db.doc(`questRewards/${studentSnap.id}_quest-reading-quiz`), { uid: studentSnap.id, studentId, challengeId: 'quest-reading-quiz', points: score.points, completed: true });
      sample.set(db.doc(`pointsLedger/${attemptId}`), { uid: studentSnap.id, studentId, classId: student.currentClassId, standard: student.currentStandard, participantKind: 'student', challengeId: 'quest-reading-quiz', campaignId: 'srss25', academicYearId: 'ay2027', delta: score.points, policy: 'development-fixture-validated-by-grade', at });
      sample.set(db.doc(`questParticipantState/${studentSnap.id}_quest-reading-quiz`), { count: 1, activeAttemptId: attemptId });
      sample.set(db.doc(`studentAchievementSummaries/${studentSnap.id}`), { uid: studentSnap.id, studentId, classId: student.currentClassId, participantKind: 'student', points: score.points, badges: [], completions: [{ challengeId: 'quest-reading-quiz', title: definition.title, campaignId: 'srss25', academicYearId: 'ay2027', stamp: 'Read', completedAt: at.toISOString() }] });
      await sample.commit();
    }
  }
  return { challenges: sample.length };
}
if (process.argv[1]?.endsWith('seed-quest-emulator.mjs')) {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'; process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
  const app = getApps()[0] || initializeApp({ projectId: 'demo-srss' });
  console.log(await seedQuest(getFirestore(app)));
}
