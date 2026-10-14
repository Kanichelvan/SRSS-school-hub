# SRSS Digital Hub — Requirements Traceability

Maps the Developer PRD v1.0 requirements to code and tests. "Verified" means checked against the Firestore emulator with seeded data (rules tests and/or the running hub) on 9 Oct 2026.

| REQ-ID | Requirement | Implementation | Tests | Status |
|---|---|---|---|---|
| AUTH-001 | Firebase Auth; roles from the user profile; multi-role default to highest privilege with a role switcher; friendly auth errors | `src/auth/AuthProvider.jsx`, `src/hub/SignIn.jsx` (Google, email/password, email link, reset), role switcher in `src/hub/HubApp.jsx`, `src/auth/authErrors.js`; roles held as custom claims set by `functions/index.js → setUserRoles` | `tests/permissions.test.mjs` (hub order, error mapping) | Verified in browser (moderator switches Admin ↔ Teaching) |
| AUTH-002 | Parents see only linked children; unlinked URL shows access denied | `firestore.rules` (`isGuardianOf`, `familyCanSee`), `functions/scope.js` (childIds from `studentGuardianLinks`), Student 360 denied state | `tests/rules` "AUTH-002 …" | Verified (parent denied `stu-0031`; teacher denied out-of-class pupil) |
| PUB-001 | Homepage role gateway routes to sign-in or dashboard | Role router and Parent Hub links open `/hub/{role}`, which signs the visitor in first; `/login`, `/dashboard/{role}`, `/portal/{role}`, `/admin`, `/parent-hub` aliases in `src/hub/routes.js` | — | Verified (old addresses land on sign-in) |
| PUB-002 | CMS for news/events; Draft → Review → Published → Archived | `firestore.rules` (`pages`, `pageDrafts`, `newsPosts`, `events`, `contactMessages`); Content editor + Website inbox (`src/hub/screens/content.jsx`); public reads/forms via `src/lib/publicContent.js` | `tests/rules` "PUB-002 …" | Verified end to end (editor → review → Headmistress publishes → homepage updates; enquiry and contact forms land in Firestore) |
| SIS-001 | Academic Year → Term → Standard → Class → Subject → Teacher Assignment → Enrolment; history preserved | Admin › School setup and Assignments screens (`src/hub/screens/setup.jsx`, `RecordManager` in `src/hub/manage.jsx`), School setup wizard (`wizard.jsx`, `logic/setup.js`); rules fix identity fields and forbid self-assignment | `tests/rules` "Academic structure …", `tests/hub.test.mjs`, `tests/e2e` | Verified end to end (14 Oct 2026), incl. a 2027 → 2028 roll-over |
| SIS-002 | Student 360 with role-filtered tabs; restricted tabs hidden, not disabled | `src/hub/screens/records.jsx` (`Student360`), `STUDENT_360_TABS` | `tests/rules` (fees, medical, restricted incidents) | Verified (admin vs teacher tab sets) |
| ATT-001 | Teacher quick attendance, default Present, exceptions with reason/note | `src/hub/screens/attendance.jsx` (`TakeAttendance`) | `tests/rules` "ATT-001 …" | Verified end to end (submitted 4 Dedikasi, 2 Bakti) |
| ATT-002 | Session vs record; "missing" flag on admin dashboard | `attendanceSessions`; `attendanceByClass` in `src/hub/logic/dashboard.js`; admin dashboard + Daily attendance | `tests/dashboard.test.mjs` | Verified |
| POR-001 | Portfolio entry fields; no numeric Human Value scores; default internal | Teacher › Portfolio entries (`teaching.jsx`); `firestore.rules` (`entryValid`, pupil-in-class and subject checks) | `tests/rules`, `tests/e2e` | Verified end to end (14 Oct 2026) |
| POR-002 | My SRSS Journey timeline by growth area, mobile-first | `src/hub/screens/family.jsx` (`Journey`) | — | Verified (parent and student) |
| CON-001 | Consent definitions; parent consent records with version; revision history | `consentDefinitions` editable in Settings › Consent questions (rewording raises that question's version), append-only `consentRecords`, derived `studentConsentStatus`; parent form `/hub/parent/consent` | `tests/rules` "CON-001 / CON-006", "Configuration and consent questions" | Verified |
| CON-002 | Block public showcase without consent; moderator approves | `portfolioVisibilityOk` in rules; Showcase moderation screen | `tests/rules` | Verified end to end |
| DASH-001 | Parent Actions Required above announcements | `parentActions` + `ActionsRequired` component | `tests/dashboard.test.mjs` | Verified (form, payment, grouped consents) |
| DASH-002 | Targeted announcements; rules enforce audience | `audienceKeys` model, announcement composer (`src/hub/screens/comms.jsx`) | `tests/rules` "DASH-001 / DASH-002" | Verified |

Additional PRD capabilities in place: audit trail triggers (§42), absence notifications to guardians (srss §8), admissions → SIS conversion without re-keying (`enrolApplication`, §33), data classification and restricted records (§49–50), WCAG-minded components with 48px touch targets (§54).

## Next build steps (Phase 1)

1. ~~Roles & access, account linking~~, ~~SIS editing and enrolment~~, ~~teacher portfolio entries~~ (done 14 Oct 2026 — see `docs/HUB-BUILD-REPORT.md`). Still to do: CSV import from cleaned master lists; Human Values observation form.
2. The generic Forms & Actions renderer.
5. ~~CMS editor and wiring public News/Events to Firestore; role router → `/sign-in`~~ (done 10 Oct 2026). Image library hardened 12 Oct 2026 (Content → Image library: browser-side resize to WebP, consent-checked staging registry, matching Storage object, anonymous read only after approval, picker on every image field). Next: publicAchievements editor.
6. Messages (threads), event registration, Google Calendar sync decision.

## SRSS Quest and Buku NILAM (14 Oct 2026)

The initial integrated engagement release is documented in `SRSS25-QUEST.md`, with verified checks in `SRSS25-QUEST-VALIDATION.md`. It adds the reusable ten-format engine, role/audience enforcement, CMS/release lifecycle, rewards, safe class/campaign rankings, student/staff passports, assigned-teacher creative and NILAM review, linked-parent reading and governed portfolio selection. Native Workspace Picker/Sheets synchronisation, collection/reading badge rules, optional staff rankings/gallery, advanced collective goals and large-report pagination remain extensions; do not mark those as delivered.
