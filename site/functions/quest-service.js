import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { AUDIENCES, EDITORS, PUBLISHERS, STAFF, STAMPS, TEACHERS, availability, boundedAnswers, eligible, fail, grade, hasAny, ids, integer, publicQuestions, text, validateDefinition, validateQuestions, validateResources } from './quest-engine.js';

const stamp = (uid) => ({ updatedAt: FieldValue.serverTimestamp(), updatedBy: uid });
const hash = (value) => createHash('sha256').update(value).digest('hex');
const clean = (doc) => ({ id: doc.id, ...doc.data() });
const json = (value) => JSON.parse(JSON.stringify(value, function (key, v) { const original = this[key]; return original?.toDate ? original.toDate().toISOString() : v; }));
const readQuestions = (data) => data?.questionsJson ? JSON.parse(data.questionsJson) : data?.questions || [];
const readAttempt = (data) => ({ ...data, questions: readQuestions(data), answers: data.answersJson ? JSON.parse(data.answersJson) : data.answers || [] });
const storedAttempt = ({ questions, answers, ...rest }) => ({ ...rest, questionsJson: JSON.stringify(questions), answersJson: JSON.stringify(answers) });
const id = (value) => ids([value])[0];
const requireRole = (actor, roles) => { if (!hasAny(actor.roles, roles)) fail('Your role cannot make this change.', 'permission-denied'); };
const defaultSettings = { competitionEnabled: true, classLeaderboard: true, individualLeaderboard: false, staffLeaderboard: false, parentAssistedNilam: false, readingMilestones: [], languages: ['Bahasa Melayu', 'English', 'Tamil', 'Chinese', 'Other'], materialTypes: ['Book', 'Article', 'Magazine', 'Digital material'], classifications: ['Fiction', 'Non-fiction'], collectivePageGoal: 2500 };
const requireOpen = (c) => { if (availability(c) !== 'live') fail('This challenge is not open for participation.', 'failed-precondition'); };
const requireEligible = (c, actor) => { if (!eligible(c, actor)) fail('This challenge is outside your audience.', 'permission-denied'); };
// Reads fail explicitly at the bound instead of displaying incomplete authoritative totals.
async function rows(query) { const snap = await query.limit(1001).get(); if (snap.size > 1000) fail('This report exceeds 1,000 records. Narrow the selection before exporting.', 'resource-exhausted'); return snap.docs.map(clean); }
async function record(db, path) { const snap = await db.doc(path).get(); if (!snap.exists) fail('The record could not be found.', 'not-found'); return clean(snap); }
async function actorFor(db, request) {
  if (!request.auth) fail('Sign in first.', 'unauthenticated');
  const scope = (await db.doc(`users/${request.auth.uid}`).get()).data() || {};
  const roles = request.auth.token.roles || [];
  if (!roles.length || scope.status === 'disabled') fail('This account has no active hub access.', 'permission-denied');
  const student = roles.includes('student') && scope.studentId ? (await db.doc(`students/${scope.studentId}`).get()).data() : null;
  const staff = scope.staffId ? (await db.doc(`staff/${scope.staffId}`).get()).data() : null;
  const mode = request.data?.participationMode || (student ? 'student' : 'staff');
  if (!['student', 'staff'].includes(mode)) fail('Invalid participation mode.');
  return { uid: request.auth.uid, roles, scope, student, teamIds: staff?.teamIds || [], mode };
}
const participant = (actor) => actor.mode === 'student' && actor.roles.includes('student') && actor.student ? { studentId: actor.scope.studentId, classId: actor.student.currentClassId || '', standard: actor.student.currentStandard || null, participantKind: 'student' } : { studentId: '', classId: '', standard: null, participantKind: 'staff' };
const attemptView = ({ questions, definition, questionsJson, answersJson, ...safe }) => ({ ...safe, answers: answersJson ? JSON.parse(answersJson) : safe.answers || [] });
function mayReview(actor, row) {
  return hasAny(actor.roles, PUBLISHERS) || (row.participantKind !== 'staff' && row.studentId && hasAny(actor.roles, TEACHERS) && ((actor.scope.classIds || []).includes(row.classId) || (actor.scope.assignedStudentIds || []).includes(row.studentId)));
}
function mayReadChild(actor, studentId) {
  return (actor.roles.includes('student') && actor.scope.studentId === studentId) || (actor.roles.includes('parent') && (actor.scope.childIds || []).includes(studentId));
}
async function settings(db) { return { ...defaultSettings, ...(await db.doc('settings/engagement').get()).data() }; }
function audit(tx, db, actor, type, entityPath, extra = {}) { tx.set(db.collection('auditLogs').doc(), { actorUid: actor.uid, type, entityPath, path: entityPath, at: FieldValue.serverTimestamp(), ...extra }); }

// All reward reads happen before writes. One best-score record per user/challenge + append-only deltas.
async function prepareReward(tx, db, attempt, points, completed) {
  const rewardRef = db.doc(`questRewards/${attempt.uid}_${attempt.challengeId}`);
  const summaryRef = db.doc(`studentAchievementSummaries/${attempt.uid}`);
  const badgeRef = attempt.definition.badgeId ? db.doc(`studentBadges/${attempt.uid}_${attempt.definition.badgeId}`) : null;
  const badgeDefinitionRef = attempt.definition.badgeId ? db.doc(`badgeDefinitions/${attempt.definition.badgeId}`) : null;
  const reads = await Promise.all([tx.get(rewardRef), tx.get(summaryRef), badgeRef ? tx.get(badgeRef) : null, badgeDefinitionRef ? tx.get(badgeDefinitionRef) : null]);
  return { rewardRef, summaryRef, badgeRef, old: reads[0].data() || {}, summary: reads[1].data() || {}, badge: reads[2], badgeDefinition: reads[3]?.data(), points, completed };
}
function issueReward(tx, db, actor, attempt, prepared) {
  const { rewardRef, summaryRef, badgeRef, old, summary, badge, badgeDefinition, points, completed } = prepared;
  const delta = Math.max(0, points - (old.points || 0));
  const firstCompletion = completed && !old.completed;
  const canBadge = completed && badgeDefinition?.active === true && badgeDefinition.campaignId === attempt.campaignId && (badgeDefinition.audiences || []).includes(attempt.participantKind === 'student' ? 'students' : 'staff');
  tx.set(rewardRef, { uid: attempt.uid, challengeId: attempt.challengeId, studentId: attempt.studentId, points: Math.max(points, old.points || 0), completed: completed || !!old.completed, ...stamp(actor.uid) });
  if (delta) tx.set(db.doc(`pointsLedger/${attempt.id}`), { uid: attempt.uid, studentId: attempt.studentId, classId: attempt.classId, standard: attempt.standard, participantKind: attempt.participantKind, challengeId: attempt.challengeId, campaignId: attempt.campaignId, academicYearId: attempt.academicYearId, delta, policy: 'best-score-top-up', at: FieldValue.serverTimestamp() });
  const earnedBadges = [...(summary.badges || [])];
  if (canBadge && !badge.exists) {
    const award = { badgeId: attempt.definition.badgeId, name: badgeDefinition.name, description: badgeDefinition.description, campaignId: attempt.campaignId, uid: attempt.uid, studentId: attempt.studentId, participantKind: attempt.participantKind, sourceAttemptId: attempt.id, awardedAt: FieldValue.serverTimestamp() };
    tx.set(badgeRef, award);
    earnedBadges.push({ badgeId: award.badgeId, name: award.name, campaignId: award.campaignId });
  }
  const completions = [...(summary.completions || [])];
  if (firstCompletion) completions.push({ challengeId: attempt.challengeId, title: attempt.title, campaignId: attempt.campaignId, academicYearId: attempt.academicYearId, stamp: attempt.definition.stamp, completedAt: new Date().toISOString() });
  tx.set(summaryRef, { uid: attempt.uid, ...participantFromAttempt(attempt), points: (summary.points || 0) + delta, badges: earnedBadges, completions, ...stamp(actor.uid) }, { merge: true });
  audit(tx, db, actor, 'quest.reward', rewardRef.path, { attemptId: attempt.id, delta, firstCompletion });
}
const participantFromAttempt = (a) => ({ studentId: a.studentId, classId: a.classId, participantKind: a.participantKind });

export async function handleQuest(db, request) {
  const actor = await actorFor(db, request);
  const input = request.data || {};
  const action = input.action;
  let result;
  switch (action) {
    case 'catalog': {
      const definitions = await rows(db.collection('challengeDefinitions'));
      result = { serverNow: new Date().toISOString(), challenges: definitions.filter((c) => eligible(c, actor) && availability(c) !== 'unpublished' && c.status !== 'archived').map((c) => ({ ...c, availability: availability(c) })), campaigns: await rows(db.collection('challengeCampaigns').where('active', '==', true)), attempts: (await rows(db.collection('challengeAttempts').where('uid', '==', actor.uid))).map(attemptView) };
      break;
    }
    case 'start': {
      const challengeId = id(input.challengeId);
      const stateRef = db.doc(`questParticipantState/${actor.uid}_${challengeId}`);
      result = await db.runTransaction(async (tx) => {
        const ref = db.doc(`challengeDefinitions/${challengeId}`);
        const [definitionSnap, keysSnap, stateSnap] = await Promise.all([tx.get(ref), tx.get(db.doc(`challengeQuestions/${challengeId}`)), tx.get(stateRef)]);
        if (!definitionSnap.exists) fail('Challenge not found.', 'not-found');
        const c = definitionSnap.data(); requireEligible(c, actor); requireOpen(c);
        const state = stateSnap.data() || { count: 0 };
        if (state.activeAttemptId) {
          const previous = await tx.get(db.doc(`challengeAttempts/${state.activeAttemptId}`));
          const a = previous.exists ? readAttempt(previous.data()) : null;
          if (a && ['started', 'returned'].includes(a.status)) {
            if (a.definition.timeLimitSeconds && Date.now() > Date.parse(a.startedAt) + a.definition.timeLimitSeconds * 1000) {
              tx.update(previous.ref, { status: 'expired' });
              return { ...attemptView({ id: previous.id, ...a }), status: 'expired', questions: [], challenge: a.definition, serverNow: new Date().toISOString() };
            }
            return { ...attemptView({ id: previous.id, ...a }), questions: publicQuestions(a.questions), challenge: a.definition, serverNow: new Date().toISOString() };
          }
        }
        if (state.count >= c.attemptLimit) fail('You have used the available attempts. Your achievements are saved.', 'failed-precondition');
        const attemptRef = db.collection('challengeAttempts').doc();
        const attempt = { id: attemptRef.id, uid: actor.uid, challengeId, title: c.title, campaignId: c.campaignId, academicYearId: c.academicYearId, ...participant(actor), status: 'started', number: state.count + 1, startedAt: new Date().toISOString(), answers: [], resources: [], questions: readQuestions(keysSnap.data()), definition: c };
        tx.set(attemptRef, storedAttempt(attempt)); tx.set(stateRef, { count: state.count + 1, activeAttemptId: attemptRef.id });
        return { ...attemptView(attempt), questions: publicQuestions(attempt.questions), challenge: c, serverNow: new Date().toISOString() };
      });
      break;
    }
    case 'saveProgress': case 'submit': {
      const attemptId = id(input.attemptId);
      const ref = db.doc(`challengeAttempts/${attemptId}`);
      // Storage paths are verified against real objects before the transaction; never accept download URLs.
      const media = input.media || [];
      if (!Array.isArray(media) || media.length > 4) fail('Attach at most four files.');
      for (const path of media) {
        if (typeof path !== 'string' || !path.startsWith(`quest/${actor.uid}/${attemptId}/`) || path.includes('..')) fail('Invalid private attachment.');
        const [metadata] = await getStorage().bucket().file(path).getMetadata();
        if (Number(metadata.size) > 10 * 1024 * 1024 || !/^(image\/(jpeg|png|webp)|application\/pdf|audio\/(mpeg|mp4))$/.test(metadata.contentType)) fail('This attachment is not an approved size or file type.');
      }
      result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref); if (!snap.exists) fail('Attempt not found.', 'not-found');
        const a = { id: snap.id, ...readAttempt(snap.data()) };
        if (a.uid !== actor.uid) fail('This is not your attempt.', 'permission-denied');
        if (!['started', 'returned'].includes(a.status)) return attemptView(a); // idempotent retry
        const current = await tx.get(db.doc(`challengeDefinitions/${a.challengeId}`));
        if (!current.exists) fail('Challenge is unavailable.', 'failed-precondition');
        requireEligible(current.data(), { ...actor, mode: a.participantKind }); requireOpen(current.data());
        if (a.definition.timeLimitSeconds && Date.now() > Date.parse(a.startedAt) + a.definition.timeLimitSeconds * 1000) fail('The time limit has ended.', 'deadline-exceeded');
        const answers = boundedAnswers(input.answers || []);
        if (answers.length > a.questions.length) fail('Too many answers.');
        const reflection = text(input.reflection || '', 'response', 10000, false);
        const resources = validateResources(input.resources || []);
        if (action === 'saveProgress') {
          tx.update(ref, { answersJson: JSON.stringify(answers), reflection, resources, media, ...stamp(actor.uid) });
          return { ...attemptView(a), answers, reflection, resources, media };
        }
        if (a.definition.type === 'creative') {
          if (!reflection && !resources.length && !media.length) fail('Add your response or an approved attachment.');
          tx.update(ref, { answersJson: JSON.stringify(answers), reflection, resources, media, status: 'pendingReview', submittedAt: FieldValue.serverTimestamp(), ...stamp(actor.uid) });
          tx.set(db.doc(`challengeSubmissions/${attemptId}`), { attemptId, uid: actor.uid, ...participantFromAttempt(a), challengeId: a.challengeId, title: a.title, reflection, resources, media, status: 'pendingReview', submittedAt: FieldValue.serverTimestamp() });
          audit(tx, db, actor, 'quest.submitted', ref.path);
          return { ...attemptView(a), status: 'pendingReview', reflection, resources, media };
        }
        const score = grade(a.definition, a.questions, answers);
        const prepared = await prepareReward(tx, db, a, score.points, score.completed);
        const finished = { ...score, status: score.completed ? 'completed' : 'submitted', answers, submittedAt: new Date().toISOString() };
        const { answers: finishedAnswers, ...savedResult } = finished;
        tx.update(ref, { ...savedResult, answersJson: JSON.stringify(finishedAnswers), ...stamp(actor.uid) });
        issueReward(tx, db, actor, a, prepared);
        return { ...attemptView(a), ...finished };
      });
      break;
    }
    case 'cms': {
      requireRole(actor, EDITORS);
      const publisher = hasAny(actor.roles, PUBLISHERS);
      const challenges = await rows(publisher ? db.collection('challengeDefinitions') : db.collection('challengeDefinitions').where('createdBy', '==', actor.uid));
      const keys = await Promise.all(challenges.map((c) => db.doc(`challengeQuestions/${c.id}`).get()));
      result = { challenges: challenges.map((c, i) => ({ ...c, questions: readQuestions(keys[i].data()), availability: availability(c) })), campaigns: await rows(db.collection('challengeCampaigns')), badges: await rows(db.collection('badgeDefinitions')), classes: hasAny(actor.roles, TEACHERS) && !publisher ? (await rows(db.collection('classes'))).filter((c) => (actor.scope.classIds || []).includes(c.id)) : await rows(db.collection('classes')), settings: await settings(db), publisher };
      break;
    }
    case 'saveChallenge': {
      requireRole(actor, EDITORS);
      const c = validateDefinition(input.challenge);
      const questions = validateQuestions(c.type, input.questions);
      const challengeId = input.challengeId ? id(input.challengeId) : db.collection('challengeDefinitions').doc().id;
      if (hasAny(actor.roles, TEACHERS) && !hasAny(actor.roles, [...PUBLISHERS, 'contentEditor'])) {
        if (!c.audiences.every((a) => a === 'classes') || c.classIds.some((classId) => !(actor.scope.classIds || []).includes(classId))) fail('Teachers may prepare challenges for their assigned classes.', 'permission-denied');
      }
      const campaign = await record(db, `challengeCampaigns/${id(c.campaignId)}`);
      if (campaign.academicYearId !== c.academicYearId) fail('The campaign and challenge academic years must match.');
      if (c.badgeId) {
        const badge = await record(db, `badgeDefinitions/${c.badgeId}`);
        if (!badge.active || badge.campaignId !== c.campaignId) fail('Select an active badge in this campaign.');
      }
      await db.runTransaction(async (tx) => {
        const ref = db.doc(`challengeDefinitions/${challengeId}`); const snap = await tx.get(ref); const old = snap.data();
        if (old && old.createdBy !== actor.uid && !hasAny(actor.roles, PUBLISHERS)) fail('You may edit only your own drafts.', 'permission-denied');
        if (old && !['draft', 'review'].includes(old.status)) fail('Approved challenges are locked. Duplicate as a new draft to change content.', 'failed-precondition');
        tx.set(ref, { ...c, status: 'draft', createdBy: old?.createdBy || actor.uid, createdAt: old?.createdAt || FieldValue.serverTimestamp(), ...stamp(actor.uid) });
        tx.set(db.doc(`challengeQuestions/${challengeId}`), { questionsJson: JSON.stringify(questions) });
        audit(tx, db, actor, 'quest.draftSaved', ref.path);
      });
      result = { challengeId }; break;
    }
    case 'transition': {
      requireRole(actor, EDITORS);
      const challengeId = id(input.challengeId); const target = input.status;
      await db.runTransaction(async (tx) => {
        const ref = db.doc(`challengeDefinitions/${challengeId}`); const snap = await tx.get(ref); const c = snap.data();
        if (!c) fail('Challenge not found.', 'not-found');
        if (target === 'review') {
          if (c.status !== 'draft' || (c.createdBy !== actor.uid && !hasAny(actor.roles, PUBLISHERS))) fail('Only an authorised author can submit a draft for review.', 'permission-denied');
        } else {
          requireRole(actor, PUBLISHERS);
          const previous = { draft: ['review'], approved: ['review'], scheduled: ['approved'], live: ['approved', 'scheduled'], closed: ['live', 'scheduled'], archived: ['draft', 'review', 'approved', 'closed'] };
          if (!previous[target]?.includes(c.status)) fail('That status change is not allowed.', 'failed-precondition');
          if (target === 'live' && (Date.now() < Date.parse(c.startAt) || Date.now() >= Date.parse(c.endAt))) fail('Publish within the opening dates, or schedule the release.');
          if (target === 'scheduled' && Date.now() >= Date.parse(c.endAt)) fail('The closing date has already passed.');
        }
        tx.update(ref, { status: target, ...stamp(actor.uid) });
        tx.set(db.doc(`challengeReleases/${challengeId}`), { challengeId, title: c.title, campaignId: c.campaignId, audiences: c.audiences, startAt: c.startAt, endAt: c.endAt, status: target, featured: c.featured, ...stamp(actor.uid) });
        audit(tx, db, actor, `quest.${target}`, ref.path);
      }); result = { status: target }; break;
    }
    case 'saveCampaign': case 'saveBadge': case 'saveSettings': {
      requireRole(actor, PUBLISHERS);
      let path; let data;
      if (action === 'saveCampaign') {
        const c = input.campaign;
        path = `challengeCampaigns/${id(c.id)}`;
        data = { name: text(c.name, 'campaign name', 120), academicYearId: text(c.academicYearId, 'academic year', 40), description: text(c.description || '', 'description', 1000, false), active: c.active === true };
      } else if (action === 'saveBadge') {
        const b = input.badge;
        await record(db, `challengeCampaigns/${id(b.campaignId)}`);
        if (!Array.isArray(b.audiences) || !b.audiences.length || b.audiences.some((a) => !['students', 'staff'].includes(a))) fail('Select students and/or staff for this badge.');
        path = `badgeDefinitions/${id(b.id)}`;
        data = { name: text(b.name, 'badge name', 80), description: text(b.description, 'badge description', 600), campaignId: b.campaignId, category: text(b.category || 'Participation', 'badge category', 80), audiences: b.audiences, active: b.active === true, unlockRule: 'Complete an eligible assigned challenge' };
      } else {
        const s = input.settings;
        if (!Array.isArray(s.readingMilestones) || s.readingMilestones.length > 20) fail('Configure at most twenty school reading milestones.');
        path = 'settings/engagement';
        data = { competitionEnabled: s.competitionEnabled === true, classLeaderboard: s.classLeaderboard === true, individualLeaderboard: s.individualLeaderboard === true, staffLeaderboard: false, parentAssistedNilam: s.parentAssistedNilam === true, collectivePageGoal: integer(s.collectivePageGoal, 'collective page goal', 1, 1000000), readingMilestones: s.readingMilestones.map((m) => ({ name: text(m.name, 'milestone name', 80), books: integer(m.books, 'verified books', 1, 10000) })) };
        for (const field of ['languages', 'materialTypes', 'classifications']) {
          if (!Array.isArray(s[field]) || !s[field].length || s[field].length > 30) fail(`Configure ${field}.`);
          data[field] = s[field].map((v) => text(v, field, 80));
        }
      }
      await db.runTransaction(async (tx) => { tx.set(db.doc(path), { ...data, ...stamp(actor.uid) }, { merge: true }); audit(tx, db, actor, 'engagement.configuration', path); });
      result = { saved: true }; break;
    }
    case 'reviewQueue': {
      requireRole(actor, [...PUBLISHERS, ...TEACHERS]);
      const submissions = (await rows(db.collection('challengeSubmissions').where('status', '==', 'pendingReview'))).filter((r) => mayReview(actor, r));
      const nilamHistory = (await rows(db.collection('nilamRecords'))).filter((r) => mayReview(actor, r));
      const nilam = nilamHistory.filter((r) => r.status === 'submitted');
      const participation = (await rows(db.collection('challengeAttempts'))).filter((r) => mayReview(actor, r)).map(attemptView);
      const verified = nilamHistory.filter((r) => r.status === 'verified');
      result = { submissions, nilam, nilamHistory, verifiedBooks: verified.length, verifiedPages: verified.reduce((n, r) => n + r.pages, 0), participation }; break;
    }
    case 'reviewSubmission': {
      const ref = db.doc(`challengeAttempts/${id(input.attemptId)}`);
      const decision = input.decision;
      if (!['accepted', 'returned'].includes(decision)) fail('Choose accept or return.');
      const feedback = text(input.feedback || '', 'constructive feedback', 2000, decision === 'returned');
      result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref); if (!snap.exists) fail('Submission not found.', 'not-found');
        const a = { id: snap.id, ...readAttempt(snap.data()) };
        if (!mayReview(actor, a)) fail('You cannot review this participant.', 'permission-denied');
        if (a.status !== 'pendingReview') fail('This submission is already reviewed.', 'failed-precondition');
        const score = grade(a.definition, [], []);
        const prepared = decision === 'accepted' ? await prepareReward(tx, db, a, score.points, true) : null;
        tx.update(ref, { status: decision === 'accepted' ? 'completed' : 'returned', feedback, reviewedBy: actor.uid, reviewedAt: FieldValue.serverTimestamp(), ...(prepared ? { points: score.points, completed: true } : {}) });
        tx.update(db.doc(`challengeSubmissions/${a.id}`), { status: decision, feedback, reviewedBy: actor.uid, reviewedAt: FieldValue.serverTimestamp() });
        if (prepared) issueReward(tx, db, actor, a, prepared);
        audit(tx, db, actor, `quest.review.${decision}`, ref.path);
        return { status: decision };
      }); break;
    }
    case 'summary': {
      const studentId = input.studentId ? id(input.studentId) : actor.mode === 'student' ? actor.scope.studentId : null;
      let uid = actor.uid;
      if (studentId) {
        const student = await record(db, `students/${studentId}`);
        if (!mayReadChild(actor, studentId) && !mayReview(actor, { studentId, classId: student.currentClassId }) && !hasAny(actor.roles, ['academicCoordinator'])) fail('This child is outside your access.', 'permission-denied');
        uid = student.uid;
      }
      const summary = uid ? (await db.doc(`studentAchievementSummaries/${uid}`).get()).data() || {} : {};
      // Child summary has achievements only; never includes attempts or private reflections.
      result = { ...summary, studentId: studentId || '', points: summary.points || 0, badges: summary.badges || [], completions: summary.completions || [], stamps: STAMPS, staffOptional: !studentId }; break;
    }
    case 'correctReward': {
      requireRole(actor, PUBLISHERS);
      const attemptId = id(input.attemptId);
      const correctionId = id(input.correctionId);
      const reason = text(input.reason, 'correction reason', 1000);
      const delta = integer(input.delta, 'points correction', -4000, 4000);
      await db.runTransaction(async (tx) => {
        const correctionRef = db.doc(`questCorrections/${correctionId}`);
        const [already, attemptSnap] = await Promise.all([tx.get(correctionRef), tx.get(db.doc(`challengeAttempts/${attemptId}`))]);
        if (already.exists) {
          if (already.data().actorUid !== actor.uid || already.data().attemptId !== attemptId) fail('This correction identifier is already in use.', 'already-exists');
          return;
        }
        const a = attemptSnap.data();
        if (!a || a.status !== 'completed') fail('Select a completed attempt for correction.');
        const summaryRef = db.doc(`studentAchievementSummaries/${a.uid}`);
        const summary = (await tx.get(summaryRef)).data();
        if (!summary || summary.points + delta < 0) fail('The correction cannot make the points total negative.');
        const badgeRef = a.definition.badgeId ? db.doc(`studentBadges/${a.uid}_${a.definition.badgeId}`) : null;
        const badge = badgeRef ? await tx.get(badgeRef) : null;
        if (input.revokeBadge && !badge?.exists) fail('This participant does not hold the challenge badge.');
        if (delta) tx.set(db.doc(`pointsLedger/correction-${correctionId}`), { uid: a.uid, ...participantFromAttempt(a), standard: a.standard, challengeId: a.challengeId, campaignId: a.campaignId, academicYearId: a.academicYearId, delta, policy: 'administrative-correction', reason, actorUid: actor.uid, at: FieldValue.serverTimestamp() });
        tx.update(summaryRef, { points: summary.points + delta, badges: input.revokeBadge ? summary.badges.filter((b) => b.badgeId !== a.definition.badgeId) : summary.badges, ...stamp(actor.uid) });
        if (input.revokeBadge) tx.update(badgeRef, { revokedAt: FieldValue.serverTimestamp(), revokedBy: actor.uid, reason });
        tx.set(correctionRef, { attemptId, delta, revokeBadge: input.revokeBadge === true, reason, actorUid: actor.uid, at: FieldValue.serverTimestamp() });
        audit(tx, db, actor, 'quest.corrected', summaryRef.path, { attemptId, delta, reason });
      }); result = { corrected: true }; break;
    }
    case 'nilam': {
      const studentId = id(input.studentId || actor.scope.studentId);
      const student = await record(db, `students/${studentId}`);
      if (!mayReadChild(actor, studentId) && !mayReview(actor, { studentId, classId: student.currentClassId })) fail('This child is outside your access.', 'permission-denied');
      const records = await rows(db.collection('nilamRecords').where('studentId', '==', studentId));
      const verified = records.filter((r) => r.status === 'verified');
      const config = await settings(db);
      result = { records, verifiedBooks: verified.length, verifiedPages: verified.reduce((n, r) => n + r.pages, 0), provisionalBooks: records.filter((r) => ['submitted', 'draft', 'returned'].includes(r.status)).length, milestones: config.readingMilestones.map((m) => ({ ...m, reached: verified.length >= m.books })), config }; break;
    }
    case 'saveNilam': {
      const studentId = id(input.studentId || actor.scope.studentId);
      if (!mayReadChild(actor, studentId)) fail('You may submit only for yourself or a linked child.', 'permission-denied');
      const config = await settings(db);
      if (actor.scope.studentId !== studentId && !config.parentAssistedNilam) fail('Parent-assisted reading submissions are not enabled.', 'permission-denied');
      const student = await record(db, `students/${studentId}`);
      const r = input.record || {};
      const data = { title: text(r.title, 'material title', 200), author: text(r.author || '', 'author', 160, false), publisher: text(r.publisher || '', 'publisher', 160, false), language: text(r.language, 'language', 80), materialType: text(r.materialType, 'material type', 80), classification: text(r.classification, 'classification', 80), pages: integer(r.pages ?? 0, 'page count', 0, 100000), completionDate: text(r.completionDate, 'completion date', 10), summary: text(r.summary || '', 'summary', 2000, false), reflection: text(r.reflection || '', 'reflection', 2000, false), takeaway: text(r.takeaway || '', 'learning takeaway', 1000, false) };
      const schoolDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date());
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.completionDate) || !Number.isFinite(Date.parse(`${data.completionDate}T00:00:00Z`)) || new Date(`${data.completionDate}T00:00:00Z`).toISOString().slice(0, 10) !== data.completionDate || data.completionDate > schoolDate) fail('Enter a valid completion date, up to today.');
      if (!config.languages.includes(data.language) || !config.materialTypes.includes(data.materialType) || !config.classifications.includes(data.classification)) fail('Choose the school-configured reading classifications.');
      const status = input.submit === true ? 'submitted' : 'draft';
      if (status === 'submitted' && !data.summary && !data.reflection) fail('Add a summary or reflection before submitting.');
      const recordId = input.recordId ? id(input.recordId) : db.collection('nilamRecords').doc().id;
      await db.runTransaction(async (tx) => {
        const ref = db.doc(`nilamRecords/${recordId}`); const old = (await tx.get(ref)).data();
        if (old && (old.studentId !== studentId || !['draft', 'returned'].includes(old.status))) fail('Only drafts or returned records may be edited.', 'failed-precondition');
        tx.set(ref, { ...data, studentId, classId: student.currentClassId || '', academicYearId: actor.scope.academicYearId || '', participantKind: 'student', status, fingerprint: hash(`${studentId}|${data.title.toLowerCase()}|${data.author.toLowerCase()}|${data.completionDate}`), source: actor.scope.studentId === studentId ? 'studentHub' : 'parentAssisted', createdBy: old?.createdBy || actor.uid, createdAt: old?.createdAt || FieldValue.serverTimestamp(), ...stamp(actor.uid) });
        audit(tx, db, actor, `nilam.${status}`, ref.path);
      }); result = { recordId, status }; break;
    }
    case 'reviewNilam': {
      const ref = db.doc(`nilamRecords/${id(input.recordId)}`);
      const decision = input.decision;
      if (!['verified', 'returned'].includes(decision)) fail('Choose verify or return.');
      const feedback = text(input.feedback || '', 'feedback', 2000, decision === 'returned');
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref); const r = snap.data();
        if (!r || !mayReview(actor, r)) fail('This record is outside your assigned students.', 'permission-denied');
        if (r.status !== 'submitted') fail('This record has already been reviewed.', 'failed-precondition');
        const duplicateRef = db.doc(`nilamVerifiedKeys/${r.fingerprint}`);
        const duplicate = await tx.get(duplicateRef);
        if (decision === 'verified' && duplicate.exists && duplicate.data().recordId !== snap.id) fail('This book and completion date are already verified for this child. Return the duplicate.', 'already-exists');
        tx.update(ref, { status: decision, feedback, verifiedBy: decision === 'verified' ? actor.uid : null, verificationDate: decision === 'verified' ? FieldValue.serverTimestamp() : null, ...stamp(actor.uid) });
        if (decision === 'verified') tx.set(duplicateRef, { recordId: snap.id, studentId: r.studentId });
        audit(tx, db, actor, `nilam.${decision}`, ref.path);
      }); result = { status: decision }; break;
    }
    case 'portfolioCandidate': {
      const source = input.kind === 'nilam' ? await record(db, `nilamRecords/${id(input.sourceId)}`) : await record(db, `challengeAttempts/${id(input.sourceId)}`);
      if (!source.studentId || !mayReview(actor, source)) fail('An authorised teacher or publisher must select the portfolio entry.', 'permission-denied');
      if (!['verified', 'completed'].includes(source.status)) fail('Only approved work may become a portfolio entry.');
      const portfolioId = `engagement-${input.kind === 'nilam' ? 'nilam' : 'quest'}-${source.id}`;
      await db.runTransaction(async (tx) => {
        const ref = db.doc(`portfolioEntries/${portfolioId}`); const old = await tx.get(ref);
        if (old.exists) return;
        tx.set(ref, { studentId: source.studentId, classId: source.classId, academicYearId: source.academicYearId, title: source.title, category: 'reflections', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }).format(new Date()), description: source.reflection || source.summary || 'Completed learning challenge', visibility: 'internal', status: 'active', humanValues: [], source: input.kind === 'nilam' ? 'nilam' : 'quest', sourceId: source.id, mediaReferences: [], createdBy: actor.uid, createdAt: FieldValue.serverTimestamp(), ...stamp(actor.uid) });
        audit(tx, db, actor, 'engagement.portfolioSelected', ref.path);
      }); result = { portfolioId }; break;
    }
    case 'leaderboard': {
      const config = await settings(db);
      if (!config.competitionEnabled) { result = { enabled: false, rows: [], individualEnabled: false }; break; }
      const mode = input.mode || 'class';
      if (!['class', 'individual'].includes(mode)) fail('Unsupported leaderboard.');
      if (mode === 'individual' && !config.individualLeaderboard || mode === 'class' && !config.classLeaderboard) { result = { enabled: false, rows: [], individualEnabled: config.individualLeaderboard }; break; }
      const campaignId = id(input.campaignId);
      const ledger = (await rows(db.collection('pointsLedger').where('campaignId', '==', campaignId))).filter((r) => r.participantKind === 'student' && (!input.standard || r.standard === integer(input.standard, 'Standard', 1, 6)) && (!input.classId || r.classId === id(input.classId)) && (!input.since || Date.parse(json(r.at)) >= Date.parse(input.since)));
      const groups = new Map();
      for (const entry of ledger) { const key = mode === 'class' ? entry.classId : entry.uid; const g = groups.get(key) || { points: 0, participants: new Set(), classId: entry.classId }; g.points += entry.delta; g.participants.add(entry.uid); groups.set(key, g); }
      const [students, classes] = await Promise.all([rows(db.collection('students').where('status', '==', 'active')), rows(db.collection('classes'))]);
      const ranked = [...groups].map(([key, g]) => {
        const size = students.filter((s) => s.currentClassId === g.classId).length;
        return { label: mode === 'class' ? classes.find((c) => c.id === key)?.name || 'Class' : `Explorer ${hash(`${campaignId}:${key}`).slice(0, 6).toUpperCase()}`, points: mode === 'class' ? Math.round(g.points / Math.max(size, 1) * 100) / 100 : g.points, participants: g.participants.size, ...(mode === 'class' ? { classSize: size } : {}) };
      }).sort((a, b) => b.points - a.points || a.label.localeCompare(b.label));
      result = { enabled: true, individualEnabled: config.individualLeaderboard, rows: ranked, policy: mode === 'class' ? 'Points per enrolled pupil; equal scores share a rank.' : 'Campaign nicknames; equal scores share a rank.' }; break;
    }
    case 'collective': {
      const config = await settings(db);
      const verified = await rows(db.collection('nilamRecords').where('status', '==', 'verified'));
      const rewards = await rows(db.collection('questRewards').where('completed', '==', true));
      result = { verifiedPages: verified.reduce((n, r) => n + r.pages, 0), pageGoal: config.collectivePageGoal, completedActivities: rewards.length }; break;
    }
    default: fail('Unknown engagement action.');
  }
  return json(result);
}
