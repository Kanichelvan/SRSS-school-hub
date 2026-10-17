import assert from 'node:assert/strict';
import { before, after, beforeEach, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { readFile } from 'node:fs/promises';
import { syncAnnouncement } from '../../functions/announcement-service.js';

if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('These tests require the local Firestore emulator.');
const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
const db = new Firestore({ projectId: 'demo-srss-tests' });
const options = { now: new Date('2026-10-16T02:00:00Z'), stamp: () => FieldValue.serverTimestamp() };
const notice = { title: 'Fictional closure', body: 'Local acceptance test only.', status: 'published', audienceKeys: ['school'], expiresAt: '2026-10-19', createdBy: 'office', publicListing: false };
let env;
before(async () => { env = await initializeTestEnvironment({ projectId: 'demo-srss-tests', firestore: { host, port: Number(port), rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') } }); });
after(async () => { await env.cleanup(); await db.terminate(); });
beforeEach(async () => {
  await env.clearFirestore();
  await Promise.all([
    db.doc('users/parent').set({ roles: ['parent'], status: 'active', audienceKeys: ['school', 'class:a'] }),
    db.doc('users/teacher').set({ roles: ['teacher'], status: 'active', audienceKeys: ['school', 'class:b'], publishKeys: ['class:b'] }),
    db.doc('users/disabled').set({ roles: ['parent'], status: 'disabled', audienceKeys: ['school', 'class:a'] }),
    db.doc('users/office').set({ roles: ['schoolAdmin'], audienceKeys: ['school'] }),
    db.doc('announcements/n1').set(notice),
  ]);
});
test('publication delivers once to active audience members and retries preserve read receipts', async () => {
  await db.doc('announcements/n1').update({ audienceKeys: ['class:a'] });
  assert.equal((await syncAnnouncement(db, 'n1', options)).notified, 1);
  const receipt = db.doc('notificationRecords/announcement_n1_parent');
  await receipt.update({ readAt: 'read' });
  const results = await Promise.all([syncAnnouncement(db, 'n1', options), syncAnnouncement(db, 'n1', options)]);
  assert.equal(results.reduce((sum, result) => sum + result.notified, 0), 0);
  assert.equal((await receipt.get()).data().readAt, 'read');
  assert.equal((await db.collection('notificationRecords').get()).size, 1);
});
test('private notices stay private; approved public copies are sanitized and withdrawn with the notice', async () => {
  await syncAnnouncement(db, 'n1', options);
  const anonymous = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonymous, 'announcements/n1')));
  assert.equal((await db.doc('publicAnnouncements/n1').get()).exists, false);
  await db.doc('announcements/n1').update({ publicListing: true, attachments: [{ url: 'https://private.example' }] });
  await syncAnnouncement(db, 'n1', options);
  const publicRecord = await assertSucceeds(getDoc(doc(anonymous, 'publicAnnouncements/n1')));
  assert.equal(publicRecord.data().title, notice.title);
  assert.equal('attachments' in publicRecord.data(), false);
  await assertFails(setDoc(doc(env.authenticatedContext('office', { roles: ['schoolAdmin'] }).firestore(), 'publicAnnouncements/forged'), { status: 'published' }));
  await db.doc('announcements/n1').update({ status: 'archived' });
  await syncAnnouncement(db, 'n1', options);
  assert.equal((await db.doc('publicAnnouncements/n1').get()).exists, false);
});
test('making an existing notice public does not replay messages without an explicit delivery request', async () => {
  await db.doc('announcements/n1').update({ publicListing: true });
  assert.equal((await syncAnnouncement(db, 'n1', { ...options, notify: false })).notified, 0);
  assert.equal((await db.doc('publicAnnouncements/n1').get()).exists, true);
  assert.equal((await db.collection('notificationRecords').get()).size, 0);
});
test('teachers cannot make class notices public; office must choose the whole-school audience', async () => {
  const teacher = env.authenticatedContext('teacher', { roles: ['teacher'] }).firestore();
  await assertFails(setDoc(doc(teacher, 'announcements/teacher-public'), { ...notice, createdBy: 'teacher', category: 'class', audienceKeys: ['class:b'], publicListing: true }));
  const office = env.authenticatedContext('office', { roles: ['schoolAdmin'] }).firestore();
  await assertFails(setDoc(doc(office, 'announcements/office-class-public'), { ...notice, audienceKeys: ['class:a'], publicListing: true }));
  await assertSucceeds(setDoc(doc(office, 'announcements/office-public'), { ...notice, publicListing: true }));
});
