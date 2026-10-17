import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLiveNotice, publicNotice, notificationFor } from '../functions/announcement-service.js';

const now = new Date('2026-10-16T02:00:00Z');
const notice = { title: 'School closure', body: 'The school is closed today.', status: 'published', audienceKeys: ['school'], expiresAt: '2026-10-19', publicListing: true, attachments: [{ url: 'https://private.example/record' }] };
test('only explicitly public whole-school notices produce a sanitized public record', () => {
  const result = publicNotice('n1', notice, now);
  assert.equal(result.title, notice.title);
  assert.equal(result.date, '2026-10-16');
  assert.equal('attachments' in result, false);
  assert.equal('audienceKeys' in result, false);
  assert.equal(publicNotice('n1', { ...notice, publicListing: false }, now), null);
  assert.equal(publicNotice('n1', { ...notice, audienceKeys: ['class:private'] }, now), null);
  assert.equal(publicNotice('n1', { ...notice, status: 'draft' }, now), null);
});
test('expiry includes the entire Malaysian school date', () => {
  assert.equal(isLiveNotice({ ...notice, expiresAt: '2026-10-16' }, new Date('2026-10-16T15:59:00Z')), true);
  assert.equal(isLiveNotice({ ...notice, expiresAt: '2026-10-16' }, new Date('2026-10-16T16:00:00Z')), false);
});
test('notification links stay in the hub and contain the source notice identity', () => {
  const result = notificationFor('n1', { ...notice, category: 'urgent' }, 'u1');
  assert.equal(result.recipientUid, 'u1');
  assert.equal(result.announcementId, 'n1');
  assert.equal(result.critical, true);
  assert.equal(result.link, '/hub/announcements');
});
