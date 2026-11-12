import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGN_IN_AUDIENCES, SIGN_IN_HELP, audienceFromSearch, signInHref, DEFAULT_SIGN_IN_INTRO } from '../src/hub/logic/signIn.js';
import { emulatorMarkers } from '../scripts/check-live-config.mjs';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('each kind of visitor gets a sign-in line written for them; anything else gets the general one', () => {
  for (const key of ['parent', 'student', 'teacher', 'staff']) { assert.equal(audienceFromSearch(`?for=${key}`).key, key); assert.equal(signInHref(key), `/login?for=${key}`); }
  for (const search of ['', '?for=', '?for=admin', '?for=__proto__', '?for=constructor']) assert.equal(audienceFromSearch(search), null, search);
  assert.equal(signInHref('nobody'), '/login');
  assert.match(SIGN_IN_AUDIENCES.parent.intro, /email address you gave the school/);
});
test('sign-in wording matches how access works: by the email on record, with no sign-up and no password to issue', () => {
  const page = read('../src/hub/SignIn.jsx'), words = [DEFAULT_SIGN_IN_INTRO, ...Object.values(SIGN_IN_AUDIENCES).map((a) => a.intro), ...SIGN_IN_HELP.flat(2)].join(' ');
  assert.doesNotMatch(page + words, /no self-registration|Accounts are issued by the school office|school Google account/);
  assert.doesNotMatch(page, /<h2>/, 'one way in for everyone: no separate sections per kind of user');
  assert.ok(SIGN_IN_HELP.some(([question]) => /new email/i.test(question)) && SIGN_IN_HELP.some(([question]) => /not recognised/i.test(question)));
});
test('developer test accounts can only appear in a local preview with its test service running', () => {
  const page = read('../src/hub/SignIn.jsx');
  assert.match(page, /const LOCAL_PREVIEW = import\.meta\.env\.DEV && usingEmulators;/);
  assert.match(page, /\{localService === "running" && <details className="hub-demo">/);
});
test('the homepage role cards and the phone header lead to sign-in', () => {
  const app = read('../src/App.jsx');
  for (const key of ['parent', 'student', 'teacher', 'staff']) assert.ok(app.includes(`"/login?for=${key}"`), key);
  assert.ok(app.includes('className="icon-action mobile-signin" href={signInLink.href}'));
});
test('a build that points at the local test database is recognised', () => {
  assert.deepEqual(emulatorMarkers('projectId:"demo-srss"'), ['demo-srss']);
  assert.deepEqual(emulatorMarkers('projectId:"srssdigitalhub"'), []);
});
