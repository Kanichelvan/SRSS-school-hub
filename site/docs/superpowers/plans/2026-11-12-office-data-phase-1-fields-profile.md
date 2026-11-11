# Office Data Phase 1 — Fields, School Profile and Import Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The office can record every column the School Data Request asks for (pupil gender, mother-tongue class, meals; staff name-in-school and type; guardian WhatsApp; office hours, parent phone, Headmistress and signatories) in the hub screens and through CSV import.

**Architecture:** One pure module, `functions/shared/fields.js`, defines the new fields' allowed values, labels and validators. The hub screens, the CSV import and (in later phases) the Sheet sync and Cloud Functions all import it, so a value is valid or invalid in exactly one place. Firestore rules repeat the same limits as the enforcement boundary. No Cloud Functions change in this phase.

**Tech Stack:** React 18 + Vite (hub), Firestore security rules, `node --test`, `@firebase/rules-unit-testing` against the emulator.

**Spec:** `site/docs/superpowers/specs/2026-11-12-office-data-sheet-letters-onboarding-design.md`, sections 5 and 11. Phases 2–6 have their own plans.

## Global Constraints

- All paths below are relative to `site/`. Run every command from `site/`.
- Work on branch `claude/office-data-phase-1` in a git worktree (superpowers:using-git-worktrees). Another session may be editing the main checkout; never switch its branch.
- Do not edit `src/App.jsx`, `src/SiteFooter.jsx` or any public page. The footer change in spec 5.2 is not approved and is not in this plan.
- Ignore files whose names end in ` 2` (iCloud duplicates, e.g. `people 2.jsx`). Never edit or stage them.
- Existing records that lack the new fields must stay readable and editable. No migration, no backfill.
- Import stays create-only and never accepts `roles`, `uid`, `hasPortalAccess` or any privilege from a file.
- Hub core bundle budget is 200 KiB and currently 198. `npm run build` must pass its budget check; nothing new may be imported into `HubApp.jsx` eagerly.
- Stored values (exact): `students.gender` ∈ `boy|girl`; `students.motherTongue` ∈ `tamil|chinese|telugu`; `students.meals`, `students.newThisYear` boolean; `staff.schoolName` text ≤ 80; `staff.staffType` ∈ `teaching|nonTeaching`; `staff.startedAt` `YYYY-MM`; `guardians.whatsapp` E.164 text (`+` then 8–15 digits); `settings/school`: `officeHours` ≤ 200, `parentPhone` ≤ 30, `schoolCode` ≤ 30, `headmistress {name ≤ 120, title ≤ 80}`, `signatories[]` of `{id, name ≤ 120, title ≤ 80, active}` with at most 10 entries.
- `settings/school` keeps its current writers (`schoolAdmin`, `technicalAdmin`, `superAdmin`). The spec's mention of `leadership` in 5.2 conflicts with its rule "no existing rule is loosened" (section 12); this plan follows section 12.
- `logoPath` and `letterheadPath` (upload and storage rule) move to the Phase 5 letters plan, where they are first used.
- Commit after each task. End each commit message with `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`. Do not push or deploy.

## Review Focus

1. **A record saved before this phase is edited afterwards.** Changing only a pupil's name must succeed when `gender`, `motherTongue` and the rest are absent. (Task 2 rules test.)
2. **Malaysian phone numbers typed the local way.** `012-345 6789` and `6012 345 6789` must both store as `+60123456789`; `12345` must be rejected, not stored. (Task 1 unit test.)
3. **CSV values written as a person writes them.** `Boy`, `girl `, `YES`, `Non-teaching` must be accepted and stored in the canonical form; `M`, `Maybe`, `Hindi` must fail the row with a message naming the allowed values. (Task 4 unit test.)
4. **A blank optional field.** Clearing "Mother-tongue class" in the form must store `null` and pass the rules, not store `""` and fail. (Task 2 rules test, Task 3 manual check.)
5. **A removed signatory.** Removing a signatory must mark it `active: false`, keeping its `id`, because letters in Phase 5 record the signatory by id. (Task 5 unit test.)

---

### Task 1: Shared field definitions

**Files:**
- Create: `functions/shared/fields.js`
- Test: `tests/fields.test.mjs`

**Interfaces:**
- Produces (all named exports, plain ES module, no imports):
  - `GENDERS: [value, label][]` = `[["boy","Boy"],["girl","Girl"]]`
  - `MOTHER_TONGUES` = `[["tamil","Tamil"],["chinese","Chinese"],["telugu","Telugu"]]`
  - `STAFF_TYPES` = `[["teaching","Teaching"],["nonTeaching","Non-teaching"]]`
  - `normalisePhone(input: string) -> string | null` — E.164 or `null`
  - `parseChoice(options: [value,label][], input: string) -> string | null` — matches value or label, trimmed, case-insensitive
  - `parseYesNo(input: string) -> boolean | null` — `yes/no/true/false/y/n`, trimmed, case-insensitive
  - `validMonth(input: string) -> boolean` — `YYYY-MM`, month 01–12
  - `sanitiseSignatories(list: any[]) -> {id,name,title,active}[]` — trims, drops entries with no name, keeps `id`, generates `sig-<n>` for a missing id using the next free number, caps at 10
  - `removeSignatory(list, id) -> list` — sets `active:false` on that entry; never deletes

- [ ] **Step 1: Write the failing tests** in `tests/fields.test.mjs`

```js
import test from 'node:test'; import assert from 'node:assert/strict';
import { GENDERS, MOTHER_TONGUES, STAFF_TYPES, normalisePhone, parseChoice, parseYesNo, validMonth, sanitiseSignatories, removeSignatory } from '../functions/shared/fields.js';

test('phones typed the local way become E.164', () => {
  assert.equal(normalisePhone('012-345 6789'), '+60123456789');
  assert.equal(normalisePhone('6012 345 6789'), '+60123456789');
  assert.equal(normalisePhone('+60 12-345 6789'), '+60123456789');
  assert.equal(normalisePhone('+44 20 7946 0958'), '+442079460958');
  for (const bad of ['12345', 'abc', '', '+6012']) assert.equal(normalisePhone(bad), null);
});
test('choices accept labels and values in any case', () => {
  assert.equal(parseChoice(GENDERS, ' Boy '), 'boy');
  assert.equal(parseChoice(STAFF_TYPES, 'non-teaching'), 'nonTeaching');
  assert.equal(parseChoice(STAFF_TYPES, 'nonTeaching'), 'nonTeaching');
  assert.equal(parseChoice(MOTHER_TONGUES, 'Hindi'), null);
  assert.equal(parseChoice(GENDERS, 'M'), null);
});
test('yes/no', () => {
  for (const y of ['Yes', 'YES', 'y', 'true']) assert.equal(parseYesNo(y), true);
  for (const n of ['No', 'n', 'FALSE']) assert.equal(parseYesNo(n), false);
  assert.equal(parseYesNo('Maybe'), null);
});
test('month', () => { assert.ok(validMonth('2019-01')); for (const bad of ['2019-13', '2019-1', 'Jan 2019', '']) assert.ok(!validMonth(bad)); });
test('signatories keep ids, drop blanks, cap at ten, and are retired not deleted', () => {
  const clean = sanitiseSignatories([{ id: 'sig-1', name: ' A ', title: ' Headmistress ', active: true }, { name: 'B', title: '' }, { name: '  ' }]);
  assert.deepEqual(clean, [{ id: 'sig-1', name: 'A', title: 'Headmistress', active: true }, { id: 'sig-2', name: 'B', title: '', active: true }]);
  assert.equal(sanitiseSignatories(Array.from({ length: 12 }, (_, i) => ({ name: `P${i}` }))).length, 10);
  assert.deepEqual(removeSignatory(clean, 'sig-1').map((s) => [s.id, s.active]), [['sig-1', false], ['sig-2', true]]);
});
```

- [ ] **Step 2: Run** `node --test tests/fields.test.mjs` — expected: FAIL, cannot find module `functions/shared/fields.js`.

- [ ] **Step 3: Implement `functions/shared/fields.js`** with the exports above. `normalisePhone`: strip everything except digits and a leading `+`; a leading `0` becomes `+60`; a bare leading `60` gets `+`; any other number must already start with `+`; accept only `^\+\d{8,15}$`. `parseChoice` compares against both value and label with spaces and hyphens removed, lower-cased.

- [ ] **Step 4: Run** `node --test tests/fields.test.mjs` — expected: 5 pass.

- [ ] **Step 5: Commit** `git add functions/shared/fields.js tests/fields.test.mjs && git commit -m "Add shared field definitions for office data"`

---

### Task 2: Firestore rules for the new fields

**Files:**
- Modify: `firestore.rules` — helpers near line 58–62; `match /staff/{staffId}` (~98); `match /guardians/{guardianId}` (~110); `match /students/{studentId}` (~195); `match /settings/{id}` (~812)
- Test: `tests/rules/office-data.rules.test.mjs` (new; copy the harness header from `tests/rules/operations.rules.test.mjs`, project id `demo-srss-office-rules`)
- Modify: `scripts/test-rules.mjs` only if it lists test files explicitly (if it globs `tests/rules/*.test.mjs`, leave it)

**Interfaces:**
- Consumes: the exact stored values in Global Constraints.
- Produces: rules helpers `optionalIn(field, list)`, `optionalBool(field)`, `optionalMatch(field, regex)`; functions `studentExtras()`, `staffExtras()`, `guardianExtras()`, `schoolProfileValid()` each `&&`-ed into the existing create and update conditions for its collection.

- [ ] **Step 1: Write the failing tests.** Seed with `env.withSecurityRulesDisabled`. A valid write must carry the stamp fields the existing rules require (`updatedBy` = uid, `updatedAt: serverTimestamp()`, plus `createdBy`/`createdAt` on create, `status`, and `uid: null`).

```js
test('pupil extras: valid values accepted, bad values refused', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'Aarav', status: 'active', uid: null, currentClassId: null, createdBy: 'o', createdAt: serverTimestamp(), updatedBy: 'o', updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(d, 'students/a'), { ...base, gender: 'boy', motherTongue: 'tamil', meals: true, newThisYear: false }));
  await assertSucceeds(setDoc(doc(d, 'students/b'), { ...base, gender: null, motherTongue: null }));
  for (const bad of [{ gender: 'M' }, { motherTongue: 'hindi' }, { meals: 'Yes' }, { newThisYear: 1 }, { gender: '' }]) await assertFails(setDoc(doc(d, 'students/x'), { ...base, ...bad }));
});
test('a pupil saved before this phase can still be edited', async () => {
  await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), 'students/old'), { name: 'Old', status: 'active', uid: null, currentClassId: null, createdBy: 'z', createdAt: new Date() }));
  await assertSucceeds(updateDoc(doc(db('o', ['schoolAdmin']), 'students/old'), { name: 'Old Name', updatedBy: 'o', updatedAt: serverTimestamp() }));
});
test('staff extras', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'K', status: 'active', uid: null, createdBy: 'o', createdAt: serverTimestamp(), updatedBy: 'o', updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(d, 'staff/a'), { ...base, schoolName: 'Teacher K', staffType: 'nonTeaching', startedAt: '2019-01' }));
  for (const bad of [{ staffType: 'admin' }, { startedAt: 'Jan 2019' }, { startedAt: '2019-13' }, { schoolName: 'x'.repeat(81) }]) await assertFails(setDoc(doc(d, 'staff/x'), { ...base, ...bad }));
});
test('guardian whatsapp must be E.164', async () => {
  const d = db('o', ['schoolAdmin']); const base = { name: 'P', status: 'active', uid: null, createdBy: 'o', createdAt: serverTimestamp(), updatedBy: 'o', updatedAt: serverTimestamp() };
  await assertSucceeds(setDoc(doc(d, 'guardians/a'), { ...base, whatsapp: '+60123456789' }));
  await assertSucceeds(setDoc(doc(d, 'guardians/b'), { ...base, whatsapp: null }));
  for (const bad of ['0123456789', '+60 12 345', 'abc']) await assertFails(setDoc(doc(d, 'guardians/x'), { ...base, whatsapp: bad }));
});
test('school profile limits; other settings documents unaffected', async () => {
  const d = db('o', ['schoolAdmin']);
  await assertSucceeds(setDoc(doc(d, 'settings/school'), { officeHours: 'Mon–Fri 7.30 am–2.30 pm', parentPhone: '+60126001926', schoolCode: 'X1', headmistress: { name: 'A', title: 'Headmistress' }, signatories: [{ id: 'sig-1', name: 'A', title: 'Headmistress', active: true }] }, { merge: true }));
  for (const bad of [{ officeHours: 'x'.repeat(201) }, { headmistress: 'A' }, { headmistress: { name: 'x'.repeat(121), title: '' } }, { signatories: Array(11).fill({ id: 's', name: 'n', title: '', active: true }) }, { signatories: 'A' }]) await assertFails(setDoc(doc(d, 'settings/school'), bad, { merge: true }));
  await assertSucceeds(setDoc(doc(d, 'settings/other'), { anything: 'x'.repeat(500) }));
  await assertFails(setDoc(doc(db('l', ['leadership']), 'settings/school'), { officeHours: 'x' }, { merge: true }));
});
```

- [ ] **Step 2: Run** `npm run test:rules` — expected: the new file's "bad value" assertions FAIL (writes currently succeed). All existing rules tests still pass.

- [ ] **Step 3: Implement in `firestore.rules`.** Add the three helpers beside `optionalText`; each treats a missing key and `null` as valid. `optionalMatch` uses `string.matches()`: month `^[0-9]{4}-(0[1-9]|1[0-2])$`, phone `^\\+[0-9]{8,15}$`. `schoolProfileValid()` applies only inside `match /settings/{id}` when `id == 'school'` and checks `headmistress is map` with only keys `name`,`title`, and `signatories is list && size() <= 10`. Rules cannot iterate a list, so per-entry signatory limits are enforced by `sanitiseSignatories` on the client (Task 5) and, from Phase 5, on the server.

- [ ] **Step 4: Run** `npm run test:rules` — expected: all pass, including the 5 new tests.

- [ ] **Step 5: Commit** `git add firestore.rules tests/rules/office-data.rules.test.mjs && git commit -m "Validate new pupil, staff, guardian and school profile fields in rules"`

---

### Task 3: People screens

**Files:**
- Modify: `src/hub/screens/people.jsx` — `StudentsAdmin` fields (~68–74), columns (~93–97), filters (~99); `Guardians` fields (~115–119), columns (~124); `StaffAdmin` fields (~142–146), columns (~151–152)
- Test: `tests/people-fields.test.mjs` (new)

**Interfaces:**
- Consumes: `GENDERS`, `MOTHER_TONGUES`, `STAFF_TYPES`, `normalisePhone` from `../../../functions/shared/fields.js` (relative import; no Vite alias).
- Produces: exported constants from `people.jsx` so they can be tested without rendering: `STUDENT_FIELDS`, `STAFF_FIELDS`, `GUARDIAN_FIELDS` (the arrays now passed inline to `RecordManager`), and `prepareGuardian(payload) -> payload` which replaces `whatsapp` with `normalisePhone(whatsapp)` and throws `Error("Enter the WhatsApp number with its country code, for example +60 12-345 6789.")` when a non-empty value does not normalise.

- [ ] **Step 1: Write the failing test.** `people.jsx` imports React and Firebase, so the test must not import it. First move the three field arrays and `prepareGuardian` into a new plain module `src/hub/logic/peopleFields.js` (no React, no Firebase imports) and re-export from `people.jsx`; the test imports `src/hub/logic/peopleFields.js`.

```js
import test from 'node:test'; import assert from 'node:assert/strict';
import { STUDENT_FIELDS, STAFF_FIELDS, GUARDIAN_FIELDS, prepareGuardian } from '../src/hub/logic/peopleFields.js';
const keys = (fields) => fields.map((f) => f.key);
test('forms carry every column the data request asks for', () => {
  for (const k of ['gender', 'motherTongue', 'meals', 'newThisYear']) assert.ok(keys(STUDENT_FIELDS).includes(k), k);
  for (const k of ['schoolName', 'staffType', 'startedAt']) assert.ok(keys(STAFF_FIELDS).includes(k), k);
  assert.ok(keys(GUARDIAN_FIELDS).includes('whatsapp'));
  for (const f of [...STUDENT_FIELDS, ...STAFF_FIELDS, ...GUARDIAN_FIELDS].filter((f) => ['gender', 'motherTongue', 'staffType'].includes(f.key))) assert.ok(!f.required && f.placeholder, `${f.key} is optional with a blank choice`);
});
test('guardian whatsapp is normalised or refused before saving', () => {
  assert.equal(prepareGuardian({ name: 'P', whatsapp: '012-345 6789' }).whatsapp, '+60123456789');
  assert.equal(prepareGuardian({ name: 'P', whatsapp: '' }).whatsapp, null);
  assert.throws(() => prepareGuardian({ name: 'P', whatsapp: '12345' }), /country code/);
});
```

- [ ] **Step 2: Run** `node --test tests/people-fields.test.mjs` — expected: FAIL, module not found.

- [ ] **Step 3: Implement.** Create `src/hub/logic/peopleFields.js`; move the existing field arrays into it unchanged where a field's `options` or `show` is a plain function of `(lookups)`/`(draft, lookups, editing)`. `enrolClassId` uses `classOptions` from `people.jsx`: keep that one field appended in `people.jsx` (`[...STUDENT_FIELDS, enrolField]`). Add the new fields:
  - Students: `gender` (select, `GENDERS`, placeholder "Not recorded"), `motherTongue` (select, `MOTHER_TONGUES`, placeholder "Not recorded", label "Mother-tongue class"), `meals` (checkbox, "Takes school meals"), `newThisYear` (checkbox, "New to SRSS this year").
  - Staff: `schoolName` (text, max 80, label "Name used in school", placeholder "Teacher Kavitha"), `staffType` (select, `STAFF_TYPES`, placeholder "Not recorded"), `startedAt` (`type: "month"`, label "Started at SRSS"). If `RecordManager` in `src/hub/manage.jsx` has no `month` input type, add it there as an `<input type="month">` case beside `date`.
  - Guardians: `whatsapp` (tel, max 30, label "WhatsApp number", help "With country code. Used by the class teacher to message the family.").
  - Pass `prepareGuardian` to the Guardians `RecordManager` through the same hook `StudentsAdmin` uses to shape its payload before saving (read `manage.jsx` for the prop name; `StudentsAdmin` passes it at ~line 76–90).
  - Table columns: Students gain "Mother tongue" and a `motherTongue` filter; Staff gain "Type". CSV export picks these up from the column definitions.

- [ ] **Step 4: Run** `node --test tests/people-fields.test.mjs && npm test` — expected: all pass.

- [ ] **Step 5: Verify in the browser.** Start the emulators and seed (`npm run emulators`, `npm run seed`, see `docs/HUB-SETUP.md` for the JDK path), start the dev server with preview_start, sign in as the seeded office account, then: add a pupil with gender and mother tongue; edit them and clear mother tongue (must save, Review Focus 4); add a guardian with WhatsApp `012-345 6789` and confirm it shows `+60123456789`; enter `12345` and confirm the error message appears and nothing saves.

- [ ] **Step 6: Run** `npm run build` — expected: build succeeds and the bundle budget check passes.

- [ ] **Step 7: Commit** `git add src/hub/logic/peopleFields.js src/hub/screens/people.jsx src/hub/manage.jsx tests/people-fields.test.mjs && git commit -m "Add data-request fields to pupil, staff and guardian screens"`

---

### Task 4: Import columns

**Files:**
- Modify: `src/hub/logic/import.js` — `IMPORTS` (lines 2–10) and `planImport` (34–78)
- Modify: `src/hub/screens/dataImport.jsx` only if the template download hard-codes column lists instead of reading `IMPORTS[dataset].fields`
- Test: `tests/import.test.mjs` (append)

**Interfaces:**
- Consumes: `GENDERS`, `MOTHER_TONGUES`, `STAFF_TYPES`, `parseChoice`, `parseYesNo`, `validMonth`, `normalisePhone` from `functions/shared/fields.js`.
- Produces: `IMPORTS.staff.fields` += `schoolName, staffType, startedAt`; `IMPORTS.students.fields` += `gender, motherTongue, meals, newThisYear`; `IMPORTS.guardians.fields` += `whatsapp`. `planImport` payloads carry canonical stored values; absent or empty optional columns become `null` (booleans default `false`).

- [ ] **Step 1: Append the failing tests**

```js
test('new columns accept what a person types and store the canonical value', () => {
  const s = planImport('students', [{ id: 'p1', name: 'Aarav', studentNumber: '2025-014', gender: 'Boy', motherTongue: ' tamil ', meals: 'YES', newThisYear: 'no' }]);
  assert.deepEqual(s.errors, []); assert.deepEqual([s.plan[0].payload.gender, s.plan[0].payload.motherTongue, s.plan[0].payload.meals, s.plan[0].payload.newThisYear], ['boy', 'tamil', true, false]);
  const t = planImport('staff', [{ id: 's1', name: 'K', email: 'k@school.test', schoolName: 'Teacher K', staffType: 'Non-teaching', startedAt: '2019-01' }]);
  assert.deepEqual(t.errors, []); assert.equal(t.plan[0].payload.staffType, 'nonTeaching');
  const g = planImport('guardians', [{ id: 'g1', name: 'P', phone: '0123456789', whatsapp: '012-345 6789' }]);
  assert.deepEqual(g.errors, []); assert.equal(g.plan[0].payload.whatsapp, '+60123456789');
});
test('empty optional columns become null or false, not empty strings', () => {
  const p = planImport('students', [{ id: 'p2', name: 'B', studentNumber: '2', gender: '', motherTongue: '', meals: '' }]).plan[0].payload;
  assert.deepEqual([p.gender, p.motherTongue, p.meals, p.newThisYear], [null, null, false, false]);
});
test('bad values fail the row and name what is allowed', () => {
  const e = (ds, row) => planImport(ds, [row]).errors.map((x) => x.message).join(' | ');
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', gender: 'M' }), /gender must be Boy or Girl/);
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', motherTongue: 'Hindi' }), /Tamil, Chinese or Telugu/);
  assert.match(e('students', { id: 'p', name: 'A', studentNumber: '1', meals: 'Maybe' }), /meals must be Yes or No/);
  assert.match(e('staff', { id: 's', name: 'K', email: 'k@s.test', startedAt: 'Jan 2019' }), /startedAt must be YYYY-MM/);
  assert.match(e('guardians', { id: 'g', name: 'P', phone: '1', whatsapp: '12345' }), /whatsapp must include the country code/);
  assert.ok(planImport('staff', [{ id: 's', name: 'K', email: 'k@s.test', roles: 'superAdmin' }]).errors.length, 'privilege columns still refused');
});
```

- [ ] **Step 2: Run** `node --test tests/import.test.mjs` — expected: the three new tests FAIL with "Unknown column".

- [ ] **Step 3: Implement** in `import.js`: extend the three `fields` lists; in `planImport`, after the existing length checks, convert each new column with the shared parsers, calling `fail(...)` with exactly the messages the tests match (`gender must be Boy or Girl.`, `motherTongue must be Tamil, Chinese or Telugu.`, `<key> must be Yes or No.`, `staffType must be Teaching or Non-teaching.`, `startedAt must be YYYY-MM.`, `whatsapp must include the country code, for example +60123456789.`); add `schoolName` (80) to the max-length table.

- [ ] **Step 4: Run** `npm test` — expected: all pass.

- [ ] **Step 5: Commit** `git add src/hub/logic/import.js tests/import.test.mjs && git commit -m "Accept the new pupil, staff and guardian columns in CSV import"` (add `dataImport.jsx` if changed)

---

### Task 5: School profile

**Files:**
- Modify: `src/hub/screens/system.jsx` — `SchoolInformation` (~56–90)
- Create: `src/hub/logic/schoolProfile.js`
- Test: `tests/school-profile.test.mjs`

**Interfaces:**
- Consumes: `sanitiseSignatories`, `removeSignatory`, `normalisePhone` from `functions/shared/fields.js`.
- Produces: `profilePatch(values) -> { officeHours, parentPhone, schoolCode, headmistress: {name,title} | null, signatories }` — trims, turns blanks to `null`, normalises `parentPhone` (throws `Error("Enter the phone number with its country code.")` when non-empty and invalid), returns `headmistress: null` when both parts are blank, and passes signatories through `sanitiseSignatories`.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test'; import assert from 'node:assert/strict';
import { profilePatch } from '../src/hub/logic/schoolProfile.js';
test('profile patch trims, nulls blanks and normalises the parent phone', () => {
  assert.deepEqual(profilePatch({ officeHours: ' Mon–Fri 7.30 am–2.30 pm ', parentPhone: '012-600 1926', schoolCode: '', headmistress: { name: ' A ', title: ' Headmistress ' }, signatories: [{ name: 'B', title: 'Senior Assistant' }] }),
    { officeHours: 'Mon–Fri 7.30 am–2.30 pm', parentPhone: '+60126001926', schoolCode: null, headmistress: { name: 'A', title: 'Headmistress' }, signatories: [{ id: 'sig-1', name: 'B', title: 'Senior Assistant', active: true }] });
  assert.equal(profilePatch({ headmistress: { name: '', title: '' } }).headmistress, null);
  assert.throws(() => profilePatch({ parentPhone: '12345' }), /country code/);
});
```

- [ ] **Step 2: Run** `node --test tests/school-profile.test.mjs` — expected: FAIL, module not found.

- [ ] **Step 3: Implement `profilePatch`** in `src/hub/logic/schoolProfile.js`.

- [ ] **Step 4: Extend `SchoolInformation`** with a "For parents and letters" group: Office opening hours (text, max 200), Best phone number for parents (tel), School code (text, max 30), Headmistress name and title (two inputs), and a signatories list — one row per active signatory (name, title, Remove) plus "Add signatory", capped at 10. Remove calls `removeSignatory`; retired signatories are hidden from the list but kept in the saved array. Save merges `profilePatch(values)` into the existing `setDoc(doc(db, "settings", "school"), …, { merge: true })` call at ~line 72 and shows `profilePatch`'s error in the form's existing error slot.

- [ ] **Step 5: Run** `npm test && npm run test:rules && npm run build` — expected: all pass, bundle budget passes.

- [ ] **Step 6: Verify in the browser** (emulators and dev server as in Task 3): open `/hub/admin/settings`, fill every new field, save, reload and confirm the values persist; add two signatories, remove one, reload and confirm one shows; sign in as a teacher and confirm the settings page is not reachable.

- [ ] **Step 7: Commit** `git add src/hub/logic/schoolProfile.js src/hub/screens/system.jsx tests/school-profile.test.mjs && git commit -m "Add office hours, parent phone, Headmistress and signatories to the school profile"`

---

### Task 6: Documentation and final check

**Files:**
- Modify: `docs/data-model.md` — add a dated section "Office data fields (November 2026)" listing the fields and limits from Global Constraints and naming `functions/shared/fields.js` as their single definition
- Modify: `docs/architecture.md` — add decision row **D7** under Decisions: "Google Sheet for school lists is editable both ways (Kani, 12 Nov 2026), with sensitive columns locked; replaces D4's read-only export for those lists only. See the spec."
- Modify: `functions/operations-model.js` — in `SETUP_TASKS`, the `school` task's fields list gains `'Office hours and parent phone'` and `'Headmistress and signatories'`; the `staff`, `pupils` and `families` tasks' field lists gain the new column names. Text only; no logic.

- [ ] **Step 1: Make the three edits.**
- [ ] **Step 2: Run** `npm test && npm run test:rules && npm run test:e2e && npm run build` — expected: every suite passes (`tests/operations.test.mjs` may assert on `SETUP_TASKS`; update its expectations only where they list those field names).
- [ ] **Step 3: Commit** `git add docs/data-model.md docs/architecture.md functions/operations-model.js tests/operations.test.mjs && git commit -m "Document office data fields and Sheet decision D7"`
- [ ] **Step 4: Stop.** Do not merge, push or deploy. Report the branch name and test results; deployment (rules + hosting together) is Kani's call.
