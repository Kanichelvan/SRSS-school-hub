# SRSS Digital Hub — Requirements Traceability

Maps the Developer PRD v1.0 requirements to code and tests. "Verified" means checked against the Firestore emulator with seeded data (rules tests and/or the running hub) on 9 Oct 2026.

| REQ-ID | Requirement | Implementation | Tests | Status |
|---|---|---|---|---|
| AUTH-001 | Firebase Auth; roles from the user profile; multi-role default to highest privilege with a role switcher; friendly auth errors | `src/auth/AuthProvider.jsx`, `src/hub/SignIn.jsx` (Google, email/password, email link, reset), role switcher in `src/hub/HubApp.jsx`, `src/auth/authErrors.js`; roles held as custom claims set by `functions/index.js → setUserRoles` | `tests/permissions.test.mjs` (hub order, error mapping) | Verified in browser (moderator switches Admin ↔ Teaching) |
| AUTH-002 | Parents see only linked children; unlinked URL shows access denied | `firestore.rules` (`isGuardianOf`, `familyCanSee`), `functions/scope.js` (childIds from `studentGuardianLinks`), Student 360 denied state | `tests/rules` "AUTH-002 …" | Verified (parent denied `stu-0031`; teacher denied out-of-class pupil) |
| PUB-001 | Homepage role gateway routes to sign-in or dashboard | Role router and Parent Hub links open `/hub/{role}`, which signs the visitor in first; `/login`, `/dashboard/{role}`, `/portal/{role}`, `/admin`, `/parent-hub` aliases in `src/hub/routes.js` | — | Verified (old addresses land on sign-in) |
| PUB-002 | CMS for news/events; Draft → Review → Published → Archived | `firestore.rules` (`pages`, `pageDrafts`, `newsPosts`, `events`, `contactMessages`); Content editor + Website inbox (`src/hub/screens/content.jsx`); public reads/forms via `src/lib/publicContent.js` | `tests/rules` "PUB-002 …" | Verified end to end (editor → review → Headmistress publishes → homepage updates; enquiry and contact forms land in Firestore) |
| SIS-001 | Academic Year → Term → Standard → Class → Subject → Teacher Assignment → Enrolment; history preserved | Collections + rules; `enrollments` authoritative, `students.currentClassId` cached by `refreshCurrentClass`; Academics screen | seed includes 2025 enrolments | Data model and read UI verified; admin create/edit forms next |
| SIS-002 | Student 360 with role-filtered tabs; restricted tabs hidden, not disabled | `src/hub/screens/records.jsx` (`Student360`), `STUDENT_360_TABS` | `tests/rules` (fees, medical, restricted incidents) | Verified (admin vs teacher tab sets) |
| ATT-001 | Teacher quick attendance, default Present, exceptions with reason/note | `src/hub/screens/attendance.jsx` (`TakeAttendance`) | `tests/rules` "ATT-001 …" | Verified end to end (submitted 4 Dedikasi, 2 Bakti) |
| ATT-002 | Session vs record; "missing" flag on admin dashboard | `attendanceSessions`; `attendanceByClass` in `src/hub/logic/dashboard.js`; admin dashboard + Daily attendance | `tests/dashboard.test.mjs` | Verified |
| POR-001 | Portfolio entry fields; no numeric Human Value scores; default internal | `firestore.rules` (`portfolioEntries`, `humanValuesObservations` key whitelist) | `tests/rules` "POR-001 / CON-002 …" | Rules verified; teacher entry form next |
| POR-002 | My SRSS Journey timeline by growth area, mobile-first | `src/hub/screens/family.jsx` (`Journey`) | — | Verified (parent and student) |
| CON-001 | Consent definitions; parent consent records with version; revision history | `consentDefinitions`, append-only `consentRecords`, derived `studentConsentStatus` (`recomputeConsentStatus`); Consent centre overview | `tests/rules` "CON-001 / CON-006" | Rules + overview verified; parent consent form next |
| CON-002 | Block public showcase without consent; moderator approves | `portfolioVisibilityOk` in rules; Showcase moderation screen | `tests/rules` | Verified end to end |
| DASH-001 | Parent Actions Required above announcements | `parentActions` + `ActionsRequired` component | `tests/dashboard.test.mjs` | Verified (form, payment, grouped consents) |
| DASH-002 | Targeted announcements; rules enforce audience | `audienceKeys` model, announcement composer (`src/hub/screens/comms.jsx`) | `tests/rules` "DASH-001 / DASH-002" | Verified |

| ACAD-001 | Curriculum structure: year × Standard × subject plans with topics, objectives and learning-standard codes from approved documents; coverage per class | `src/hub/screens/academics.jsx` (`CurriculumPlans`, `AcademicsOverview`), `curriculumCoverage` in `src/hub/logic/academics.js`, rules `curriculumPlans` | `tests/academics.test.mjs`, `tests/rules/academics.rules.test.mjs` | Tested (unit, rules, browser) |
| ACAD-002 | Lesson planning (fields, Human Values, Draft → Ready → Completed → Reviewed, plan content in a Google Doc without a second copy) | `LessonPlans`, `LessonPlanEditor`, `ReviewPanel`; rules `lessonPlans` (subject-level `teachingKeys`) | unit + rules + `tests/e2e/stage1.e2e.mjs` | Tested |
| ACAD-003 | Learning tasks: assign to a class, due dates, resources, completion, feedback; pupils hand in; families see published tasks | `LearningTasks`, `LearningTaskDetail`, `TaskProgress`, `FamilyTasks`; rules `learningTasks`, `learningTaskProgress` | unit + rules + e2e | Tested |
| ASMT-001 | Assessment configuration: periods, components, weightings (validated), maximum marks, grading bands, publication setting | `AssessmentSetup`, `validateAssessment`; rules `assessmentPeriods`, `assessments` | unit + rules | Tested |
| ASMT-002 | Spreadsheet-style marks entry: draft, absent/exempt, validation, Sheets template export and controlled import into draft | `MarkEntry`, `ImportDialog`, `importMarks`/`marksTemplateCsv`; rules `markSheets`, `studentResults` | unit + rules + e2e | Tested |
| ASMT-003 | Approval workflow Draft → Submitted → Reviewed → Approved → Published → Locked; families see published only; amendments with a reason; audit | `sheetActions`, workflow `move()`; rules; existing `auditResults` trigger | unit + rules + e2e | Tested |
| WS-001 | Shared Workspace modal returning structured metadata (attach by link, create Doc/Sheet/Slides/Form in Google then attach) | `src/hub/workspace.jsx`, `src/hub/logic/workspace.js` | unit + e2e | Tested (link flow). Drive Picker / API creation: Stage 5 |

Additional PRD capabilities in place: audit trail triggers (§42), absence notifications to guardians (srss §8), admissions → SIS conversion without re-keying (`enrolApplication`, §33), data classification and restricted records (§49–50), WCAG-minded components with 48px touch targets (§54).

## Next build steps (Phase 1)

1. Roles & access admin screen over `setUserRoles`, plus guardian/staff account linking.
2. SIS editing: student, guardian and link forms; class and enrolment setup; CSV import from cleaned master lists.
3. Parent consent form (versioned choices, revision/withdrawal) and the generic Forms & Actions renderer.
4. Teacher portfolio entry and Human Values observation forms (Drive evidence links).
5. ~~CMS editor and wiring public News/Events to Firestore; role router → `/sign-in`~~ (done 10 Oct 2026). Image library hardened 12 Oct 2026 (Content → Image library: browser-side resize to WebP, consent-checked staging registry, matching Storage object, anonymous read only after approval, picker on every image field). Next: publicAchievements editor.
6. Messages (threads), event registration, Google Calendar sync decision.
