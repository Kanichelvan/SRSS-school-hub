# Office data, Google Sheet, letters and onboarding — design

Date: 12 November 2026 · Status: awaiting review by Kani · Author: Claude with Kani

## 1. Purpose

The School office (Clerk, PIC Teacher, class teachers) keeps every school list up to date inside the hub, and the
same lists stay current in one Google Sheet that the office can also edit. Staff and parents are invited to sign in
on a fixed schedule, letters are produced on letterhead from templates, and pupils move up a Standard each year
without anyone having to run it.

Success means the School never sends Kani a spreadsheet to load: the office enters a change once, in the hub or
in the Sheet, and everything else follows.

## 2. What already exists (do not rebuild)

Merged to `main` on 11 November 2026 (`d6cb2bc`) and earlier:

| Need | Existing piece |
|---|---|
| Add, edit, archive pupils, guardians, staff, classes, subjects, enrolments, teacher assignments, guardian links | `RecordManager` screens under `/hub/admin/*` (`src/hub/manage.jsx`, `screens/people.jsx`, `screens/setup.jsx`) |
| Bulk CSV intake | `/hub/admin/import` (`screens/dataImport.jsx`, `logic/import.js`), create-only |
| Setup tasks and upkeep routines | `/hub/admin/operations` (`functions/operations-model.js`, `operations-service.js`) |
| Calendar, announcements and circulars, roles | `/hub/admin/calendar`, SRSS Connect, `/hub/admin/roles` |
| Account creation | `provisionAccount`, `setUserRoles`, `setAccountStatus` callables |
| Welcome packs | `/hub/welcome`, `/hub/admin/onboarding` |
| Promotion plan | `planPromotion` in `src/hub/logic/setup.js`, run by a button in the setup wizard |
| Email outbox | `forms-service.js` writes to the `mail` collection (Trigger Email extension format) |
| Printable page pattern | `/hub/consent/print/:studentId?` |

## 3. Decisions made by Kani (12 November 2026)

1. The Google Sheet is **editable both ways**. This replaces the read-only export in architecture decision D4 for
   the lists in section 6; record it as **D7** in `docs/architecture.md`. Applications, consent, medical, fees and
   safeguarding records stay hub-only, as D4 and seam rule 3 require.
2. Sheet edits are **mixed**: everyday columns apply to the hub within seconds; sensitive columns are locked in the
   Sheet and changed only in the hub.
3. Letters are produced **from the hub as print-ready pages with letterhead**, saved as PDF from the browser.
4. Onboarding:
   - One sign-in guardian email per pupil. The Pure Life Society guardian is one guardian record linked to every
     Pure Life pupil.
   - The Clerk enters parent email and WhatsApp numbers. The class teacher may also add or change them for pupils
     in their own class.
   - First parent invitations go out on **20 December 2026**. A reminder goes out on **4 January 2027** giving
     **5 days** to confirm.
   - From 4 January the class teacher's hub lists pupils with no confirmed guardian so the teacher can nudge them.
   - Staff are invited as the Clerk adds them; those who have not accepted are rechecked.
5. Year-end promotion is **fully automatic**.

## 4. Scope and build order

Six phases. Each is deployable alone and gets its own implementation plan. Phases 1 and 2 must be live, with pupil
and guardian data loaded, before 20 December 2026.

| Phase | Delivers | Needed by |
|---|---|---|
| 1 | New fields, school profile, import columns | Before data entry starts |
| 2 | Contact updates by teachers, invitations, reminder schedule, teacher nudge list | 20 December 2026 |
| 3 | Google Sheet two-way sync | As soon as phase 1 is live |
| 4 | Bell schedule and timetable views | 4 January 2027 |
| 5 | Letter templates and letters | January 2027 |
| 6 | Automatic promotion | Preview email December 2027; first run January 2028 |

Out of scope: WhatsApp sending through a gateway, SMS, Google Docs letters, editing consent or medical data from the
Sheet, results and report cards.

## 5. Phase 1 — fields and school profile

### 5.1 New fields

| Collection | Field | Type and values |
|---|---|---|
| `students` | `gender` | `boy` \| `girl` |
| `students` | `motherTongue` | `tamil` \| `chinese` \| `telugu` |
| `students` | `meals` | boolean |
| `students` | `newThisYear` | boolean, cleared by the promotion job |
| `students` | `promotionHold` | `null` \| `repeat` \| `leaving` (phase 6) |
| `staff` | `schoolName` | text ≤ 80, "Teacher Kavitha" |
| `staff` | `staffType` | `teaching` \| `nonTeaching` |
| `staff` | `startedAt` | `YYYY-MM` |
| `guardians` | `whatsapp` | E.164 text, optional |

Already present and reused: `students.preferredName`, `studentNumber`, `dateOfBirth`, `admissionDate`,
`currentStandard`; `staff.directoryVisible`, `position`, `email`, `phone`; `guardians.preferredLanguage`;
link fields `relationship`, `hasPortalAccess`, `isEmergencyContact`, `canCollect`. Remedial group stays in the
existing support-group records and is shown as a derived Yes/No. Staff extra responsibilities stay as roles
(`setUserRoles`) and are shown as a derived, read-only list.

Rules add validation for each new field. Existing records without them remain valid.

### 5.2 School profile (`settings/school`)

Add: `officeHours` (text ≤ 200), `parentPhone` (text), `schoolCode` (text), `headmistress` `{ name, title }`,
`signatories[]` `{ id, name, title, active }`, `logoPath`, `letterheadPath` (Storage paths under
`public/branding/`). Edited on a new **School profile** tab of `/hub/admin/settings` by `schoolAdmin`, `leadership`
and `superAdmin`. The public footer and contact page read `officeHours` and `parentPhone` when present; this is the
only public-site change and needs Kani's approval before `App.jsx` or `SiteFooter.jsx` is touched.

### 5.3 Import

`logic/import.js` gains the new columns for `staff`, `students` and `guardians`. Import stays create-only and never
accepts roles or hub access from a file.

## 6. Phase 3 — Google Sheet two-way sync

(Described before phase 2 because phase 2 writes through the same server paths.)

### 6.1 Shape

One spreadsheet in the School's Drive. Its ID is stored in `settings/sheetSync` `{ spreadsheetId, enabled,
lastFullSyncAt, lastError }`. The hub's Cloud Functions service account is an editor. Each tab has a hidden first
column `Hub ID` that keys a row to a hub record.

| Tab | One row per | Column headings (after `Hub ID`) |
|---|---|---|
| Staff | staff member | Full name · Name used in school · Position · Email 🔒 · Mobile number · Teaching or non-teaching · Class teacher of 🔒 · Subjects taught 🔒 · Extra responsibilities 🔒 · Show in staff directory · Start date at SRSS |
| Pupils | pupil | Pupil number · Full name · Name used in school · Gender · Date of birth · Standard in 2027 🔒 · Date joined SRSS · Mother-tongue class · School meals · Remedial group 🔒 · New in 2027 |
| Parents and guardians | guardian link | Pupil number 🔒 · Pupil full name 🔒 · Parent or guardian full name · Relationship · Email 🔒 · Mobile number · Preferred language · Hub access 🔒 · Emergency contact · May collect the child 🔒 |
| Classes | class | Standard 🔒 · Class name · Class teacher 🔒 · Classroom · Expected pupils |
| Subject allocation | teacher assignment | Standard 🔒 · Subject 🔒 · Teacher 🔒 |
| Timetable | lesson slot | Standard 🔒 · Day · Start · End · Subject 🔒 · Teacher 🔒 |
| Calendar | event | Date · End date · Event · Start time · End time · Venue · Who it is for · School closed · Show on public website 🔒 |
| School profile | setting | Detail 🔒 · Value |

🔒 = locked in the Sheet, changed only in the hub. The "Standard in 2027" and "New in 2027" headings carry the
current academic year and are rewritten when the year changes. Allergy and medication notes never appear.

### 6.2 Hub → Sheet

Firestore `onDocumentWritten` triggers on `staff`, `students`, `guardians`, `studentGuardianLinks`, `classes`,
`teacherAssignments`, `enrollments`, `events`, `studentSupportPlans` and `settings/school` mark the affected tab
dirty in `sheetSyncState/{tab}`. A single worker (`syncSheetTab`, Cloud Tasks, 5-second delay, one at a time per
tab) rebuilds the whole tab from Firestore and writes it in one `values.update` call. A whole-tab rewrite is
idempotent, and the lists are small (a few hundred rows at most). Writes made through the Sheets API do not fire
the Sheet's edit trigger, so there is no echo loop. The worker also reapplies protected ranges on locked columns
and the header row.

Archived records are omitted. A nightly full sync at 02:00 Asia/Kuala_Lumpur repairs any drift.

### 6.3 Sheet → hub

A script bound to the spreadsheet has an installable `onEdit` trigger. For each user edit it posts
`{ tab, hubId, column, oldValue, newValue, editorEmail, row }` to the HTTPS function `sheetEdit`, signed with an
HMAC secret held in Secret Manager and in the script's properties.

`sheetEdit`:

1. Verifies the signature and that `editorEmail` belongs to an active hub account holding `schoolAdmin`,
   `leadership` or `superAdmin`. Anyone else is refused.
2. Refuses locked columns and unknown tabs.
3. Validates the value with the same pure validators the hub screens use (shared module, section 11).
4. Applies the change with the Admin SDK, stamped `updatedBy` = that account, `source: "sheet"`. The existing
   audit triggers record it.
5. Returns `{ ok }` or `{ ok: false, reason }`.

On refusal the script restores `oldValue`, colours the cell red and adds the reason as a cell note. On success it
clears any note. If the hub is unreachable, the script restores the old value and shows "Not saved — try again".

**New rows.** A row with an empty `Hub ID` creates a record once its required columns are filled (Staff: full
name and position; Pupils: full name, date of birth; Calendar: date and event). Staff email, guardian email and
anything else locked is then added in the hub. Guardians cannot be created from the Sheet because a guardian
needs a verified link to a pupil.

**Deleting rows** does nothing: the row returns on the next sync. Archiving is done in the hub.

**Timetable rows.** `Hub ID` is `assignmentId#slotIndex`. Day, Start and End edit that slot. A new row is accepted
only when Standard, Subject and Teacher match an existing teacher assignment; otherwise it is refused with
"Add this subject allocation in the hub first".

### 6.4 Failure handling

- Sheets API failure: the tab stays dirty, the task retries with backoff, and `settings/sheetSync.lastError` is
  shown on `/hub/admin/operations`.
- Sync disabled or Sheet unshared: the hub works normally; a banner on the operations screen says the Sheet is out
  of date.
- Concurrent edits to one record from hub and Sheet: last write wins; both are in the audit log.

### 6.5 Data protection

The Sheet holds pupil and parent names and contacts. It is shared only with named Google accounts, with link
sharing off; the setup guide says so and the nightly sync records the Sheet's sharing state in
`settings/sheetSync` and raises a warning on the operations screen if it is shared by link. Reading the sharing state needs the Drive API (read-only metadata scope) enabled for the service
account; if it is not, this check is skipped and the operations screen says so.

## 7. Phase 2 — contacts, invitations and reminders

### 7.1 Contact updates

New callable `familyContact` (server-written; rules for `guardians` and `studentGuardianLinks` stay office-only):

- `set`: `{ studentId, name, relationship, email?, whatsapp?, phone? }`. Allowed for `schoolAdmin`, `superAdmin`,
  and a teacher whose scope `homeroomClassIds` or `teachingClassIds` contains the pupil's current class.
- Finds or creates the guardian by lower-cased email (so siblings and the Pure Life guardian reuse one record),
  creates or updates the link, and marks that link the pupil's **sign-in guardian** (`isPortalGuardian: true`;
  one per pupil, enforced server-side). `hasPortalAccess` turns on when the invitation is accepted.
- Changing an existing sign-in email ends the old account's access to that pupil, queues a new invitation, and
  writes a `contactChanges` record (who, when, pupil, old and new address masked to the domain for teachers).
- The Clerk sees **Recent contact changes** on `/hub/admin/guardians`. Teachers get a **Family contacts** panel on
  the class dashboard.

### 7.2 Invitations

`invitations/{id}`: `personType` (`staff` \| `guardian`), `personId`, `email`, `status` (`queued` \| `sent` \|
`reminded` \| `accepted` \| `cancelled`), `queuedAt`, `sentAt`, `remindedAt`, `acceptedAt`, `confirmBy`, `batch`.
Server-written only.

- **Staff.** A trigger on `staff` queues and sends an invitation as soon as a staff record has an email and no
  accepted invitation. Teaching staff are provisioned with the `teacher` role. Non-teaching staff get an
  account with no hub role until a Super Administrator assigns one, as do all elevated roles.
- **Parents.** Invitations are queued when a sign-in guardian email is set, and sent by the schedule below. After
  the first campaign date has passed, new ones (mid-term admissions, changed emails) are sent immediately.
- **Sending.** One document in the `mail` outbox per invitation: the School's name, what the hub is, the sign-in
  address, and that they sign in with this exact email (Google or email link). No pupil names in the email.
- **Acceptance.** On first authenticated hub load the client calls `onboarding({ action: "accept" })`; the server
  matches the verified token email to the invitation, sets `accepted`, links the account to the person record and,
  for guardians, turns on `hasPortalAccess` for their sign-in links.

### 7.3 Schedule

`settings/onboarding` `{ parentFirstInviteDate: "2026-12-20", parentReminderDate: "2027-01-04", confirmDays: 5,
staffReminderDays: 7 }`, editable by `superAdmin`. A daily job `runOnboardingSchedule` (08:00 Asia/Kuala_Lumpur):

- On `parentFirstInviteDate`: sends every queued guardian invitation.
- On `parentReminderDate`: sends a reminder to every guardian invitation not accepted, with
  `confirmBy` = reminder date + `confirmDays` (9 January 2027 with the values above).
- Every day: reminds staff whose invitation is older than `staffReminderDays` and not accepted, once.

Each send is recorded on the invitation, so re-running the job on the same day sends nothing twice.

### 7.4 Teacher nudge list

From `parentReminderDate`, the class dashboard's Family contacts panel lists each pupil in the class as
**Confirmed**, **Invited, not accepted** (with the date) or **No email on file**. Each unconfirmed row has
**Add or change email** (opens `familyContact`) and, when a WhatsApp number is on file, **Message on WhatsApp**,
a `https://wa.me/<number>?text=…` link with a ready-written message. The hub does not send WhatsApp messages.

The Clerk gets the same list for the whole school on `/hub/admin/onboarding` (new **Invitations** tab), with
**Resend** per person and **Not yet signed in** for staff.

## 8. Phase 4 — timetable

- `settings/bellSchedule` `{ default: { 1..5: [{ label, start, end, kind }] }, standard1?: {…} }`, `kind` =
  `lesson` \| `assembly` \| `recess` \| `dismissal`. Edited on `/hub/admin/timetable` by `schoolAdmin`,
  `academicCoordinator`, `superAdmin`.
- Lessons stay where they are: `teacherAssignments.slots` `[{ day, time, end? }]`. `end` is added; when absent it is
  taken from the bell schedule.
- One `TimetableGrid` component renders a class week or a teacher week. Screens: `/hub/admin/timetable` (any class,
  with clash warnings for a teacher in two places), `/hub/teacher/timetable` (own week), and the class timetable on
  the parent and pupil dashboards.

## 9. Phase 5 — letters

- `letterTemplates/{id}` `{ name, audience: "pupil" | "staff" | "general", subject, body, signatoryId, status }`.
  `body` is plain paragraphs with merge fields: `{{pupil.name}}`, `{{pupil.class}}`, `{{guardian.name}}`,
  `{{staff.name}}`, `{{staff.position}}`, `{{date}}`, `{{school.name}}`, `{{reference}}`, and free fields the
  office fills at generation time (`{{field:Amount due}}`). Unknown fields block saving the template.
- Seeded templates: confirmation of enrolment, fee reminder, leave approval, general letter to parents.
- `letters/{id}` records each generated letter: template, version, subject person, merged text, signatory name and
  title at that time, reference `SRSS-LTR-2027-0001`, who generated it. Letters are immutable; a correction is a
  new letter.
- `/hub/admin/letters`: pick template, pick person (or several pupils for a batch), fill free fields, preview.
- `/hub/letters/print/:letterId`: a print-styled A4 page with the letterhead image, date, reference, body and
  signature block. The office uses the browser's Print → Save as PDF. No PDF library is added, which keeps the hub
  bundle inside its 200 KiB budget.
- Access: `schoolAdmin`, `leadership`, `superAdmin` create letters and templates; `financeOfficer` may generate fee
  reminders only.

## 10. Phase 6 — automatic promotion

Scheduled job `runYearRollover`, daily at 00:30 Asia/Kuala_Lumpur.

- **Seven days before** the next academic year's `startDate`: emails the Clerk and Super Administrators the plan
  (who moves where, who completes Standard 6, who is held, and anything unmatched).
- **On `startDate`:**
  1. Preconditions: the next `academicYears` record exists, has one class per Standard still needed, and
     `promotionRunAt` is empty. If not met, nothing changes and the Clerk and Super Administrators are emailed
     what is missing; the job tries again the next day.
  2. For each pupil with an active enrolment in the previous year: `promotionHold: "repeat"` → enrolled in the same
     Standard's new class; `"leaving"` → enrolment `withdrawn`, status `withdrawn`; Standard 6 → enrolment
     `completed`, status `graduated`; everyone else → previous enrolment `completed`, new enrolment one Standard up.
  3. Clears `promotionHold` and `newThisYear`, sets `settings/school.currentAcademicYearId`, and stamps
     `promotionRunAt`. Existing scope triggers then end access for guardians with no remaining child.
  4. Emails a summary and writes an audit log entry.
- Writes are batched under the rules' read limits, as the wizard's promotion already does, and the run is
  idempotent: a pupil who already has an enrolment in the new year is skipped.
- `planPromotion` moves to a module shared by the wizard and the job (section 11). The wizard keeps its button for
  manual correction.
- The office sets `promotionHold` on the pupil screen. It is hub-only, not in the Sheet.

## 11. Shared structure

- `functions/shared/` holds pure modules used by both the hub client and the functions: field validators, the Sheet
  tab definitions (columns, lock flags, record ↔ row mapping), letter merge, promotion plan, invitation schedule.
  The client imports them through a Vite alias; a unit test asserts both sides resolve the same file (the pattern
  already used for role parity).
- New functions files: `sheet-sync.js`, `onboarding-service.js`, `letters-service.js`, `rollover-service.js`.
  `index.js` only wires exports.
- New screens are lazy-loaded so the hub core bundle stays under budget.
- New dependency: `@googleapis/sheets` in `functions/` only.

## 12. Security rules

- `invitations`, `contactChanges`, `sheetSyncState`, `letters`: server-written; read by office and leadership
  (`invitations` also by the teacher of the pupil's class, without the email address).
- `letterTemplates`, `settings/bellSchedule`, `settings/onboarding`, `settings/sheetSync`: role-limited writes with
  field validation.
- No existing rule is loosened. Teacher contact updates go through the `familyContact` callable only.

## 13. Testing

- Unit: validators, Sheet row mapping both directions, locked-column refusal, letter merge, promotion plan with
  holds, schedule date logic (including re-run on the same day).
- Rules: each new collection, and that a teacher cannot write `guardians` or links directly.
- Emulator end-to-end: Clerk adds staff → invitation in outbox → accept → access; teacher sets a parent email →
  invitation → accept → parent sees only that child; changed email ends the old access; rollover with a held
  pupil, a leaver and a Standard 6 pupil; `sheetEdit` accept and refuse paths with a fake Sheets client.
- Sheet sync against the real API is checked once on a test spreadsheet before production.

## 14. What is needed from Kani and the School

1. Confirm the Trigger Email extension is installed on `srssdigitalhub` with a working sender. The code writes to
   the `mail` outbox, but this session did not confirm the extension is live. Without it no invitation is sent.
2. Create the Google Sheet in the School's Drive, share it with the functions service account as editor, and paste
   in the supplied script (about ten minutes, with a written guide).
3. Supply the logo and letterhead image.
4. Confirm the reminder deadline: 4 January + 5 days is Saturday 9 January 2027.
5. Approve the public footer change in 5.2, or leave the public site untouched.

## 15. Risks

- **Automatic promotion with no confirmation.** A missing hold moves a pupil wrongly. Mitigations: the seven-day
  preview email, the hold tick, and the wizard's manual correction.
- **Two-way Sheet.** The Sheet is a second copy of personal data. Mitigations: locked columns enforced on the
  server, named-account sharing, the sharing check, audit of every Sheet edit.
- **Teachers changing sign-in emails.** A wrong address gives a stranger an invitation to a child's records.
  Mitigations: class-scoped permission, the contact-change list reviewed by the Clerk, old access ended at once.
- **Dates.** Phases 1 and 2 plus loaded data are needed in about five weeks.
