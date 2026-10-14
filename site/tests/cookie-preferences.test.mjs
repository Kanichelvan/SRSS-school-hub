import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePreferences, preferenceRecord, COOKIE_PREFERENCES_AGE } from '../src/lib/cookiePreferences.js';
const now = 1792000000000;
test('optional services require explicit boolean permission', () => {
  const record = preferenceRecord({ functional: 'true', externalMedia: 1 }, now);
  assert.equal(record.functional, false); assert.equal(record.externalMedia, false);
  assert.equal(parsePreferences(JSON.stringify(record), now + 1).externalMedia, false);
  assert.equal(parsePreferences(JSON.stringify(preferenceRecord({ externalMedia: true }, now)), now + 1).externalMedia, true);
});
test('expired, malformed, unsupported and future consent never authorizes optional services', () => {
  const record = preferenceRecord({ functional: true, externalMedia: true }, now);
  for (const raw of [null, '', 'bad json', JSON.stringify({ ...record, version: 2 }), JSON.stringify({ ...record, externalMedia: 'true' }), JSON.stringify({ ...record, expiresAt: record.expiresAt + 1 })]) assert.equal(parsePreferences(raw, now), null);
  assert.equal(parsePreferences(JSON.stringify(record), now - 1), null);
  assert.equal(parsePreferences(JSON.stringify(record), now + COOKIE_PREFERENCES_AGE), null);
  assert.equal(parsePreferences(JSON.stringify(record), now + COOKIE_PREFERENCES_AGE - 1).functional, true);
});
