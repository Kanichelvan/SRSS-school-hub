# SRSS Digital Hub — Extended Platform Plan (Stages 1–8)

Status: audit and plan 13 Oct 2026; **Stage 1 implemented** (see "Stage 1 report" at the end). Follows the
extended brief (Google Workspace integration strategy, academic planning, assessments, reporting, Human
Excellence, admissions, staff, fees-lite, assets, forms, communication, CMS, documents). It builds on
[`architecture.md`](architecture.md) (planes, seam rules, decisions D1–D7), [`data-model.md`](data-model.md) and
[`requirements.md`](requirements.md). Where the brief and an earlier recorded user decision differ, the earlier
decision stands and the difference is listed under "Decisions to confirm".

Status vocabulary used here and in `requirements.md`: **Planned · Implemented · Tested · Ready for deployment · Deployed.**
Nothing in this repository is *Deployed* by this work; deployment needs the school steps in `HUB-SETUP.md`.

## 1. Existing modules to reuse

| Area | What exists | Reuse for |
|---|---|---|
| Identity & roles | Firebase Auth (Google for staff/students, email for parents), roles as custom claims via `setUserRoles`, multi-role hub switcher | All modules; no new auth |
| Authorisation | `src/auth/permissions.js` matrix (V/C/U/A/R × scope) mirrored in `firestore.rules`; server-derived scope `users/{uid}` (`functions/scope.js`) | Subject-level teaching scope added (`teachingKeys`) |
| Academic structure | `academicYears`, `terms`, `standards`, `classes`, `subjects`, `teacherAssignments` (with weekly slots), authoritative `enrollments` | Curriculum, lessons, tasks, marks |
| SIS & Student 360 | Register, role-filtered profile tabs, guardian links, restricted sub-documents | Results tab (Stage 2), admissions conversion |
| Attendance | Sessions vs records, teacher roster, admin overview, parent history, absence notifications | Attendance reporting (Stage 2) |
| Portfolio / Human Excellence | `portfolioEntries`, `humanValuesObservations` (no scores, rule-enforced), `studentReflections`, Journey timeline, showcase moderation with consent | Stage 3 builds forms on these |
| Consent | Built-in versioned consent form, append-only `consentRecords`, derived `studentConsentStatus`, paper entry, reminders | Showcase/media checks, Stage 6 forms |
| Admissions | Enquiry intake (public), applications pipeline, `enrolApplication` (no re-keying) | Stage 4 completes the pipeline |
| Communication | Targeted announcements (`audienceKeys`), calendar events, notifications, Actions Required | Task/assessment notifications |
| CMS | Drafts → review → publish, image library with consent-checked staging | Stage 8 SRSS25 content |
| Governance | Audit triggers (`auditLogs`), data classification, restricted records | Results, mark sheets, amendments |
| UI kit | `PageHeader`, `Section`, `DataTable` (search/filter/sort/CSV), `StatusBadge`, `StatCard`, `ChildSwitcher`, `ActionsRequired`, `hub-dialog` | Every new screen |
| Tests | `node --test` unit tests; rules tests on the Firestore/Storage emulators; fictional seed school | Extended for every module |

## 2. Missing functionality (by stage)

| Stage | Missing | Status after this change |
|---|---|---|
| 1 Academic operations | Curriculum plans, lesson planning, learning tasks & completion, assessment configuration, marks entry, approval workflow | **Implemented** (see report) |
| 2 Reporting | Report cards (PDF), class/subject summaries, attendance reports, dashboards with filters | Planned |
| 3 Human Excellence | Observation form, reflection prompts (text/photo/audio), Journey across Std 1–6, values library | Planned (data + rules exist) |
| 4 Admissions | Public application form, configurable pipeline steps, documents, interview scheduling, decision history | Planned (pipeline + enrolment exist) |
| 5 Workspace | `/hub/workspace` connection centre, per-user OAuth (drive.file), Drive Picker, Docs/Sheets creation via API, Calendar/Meet, Forms import, Gmail, Classroom | Planned — Stage 1 adds the shared `WorkspaceActionModal` with the link/create-in-Google fallback |
| 6 Communication & operations | Messages, meeting requests, notification preferences, staff leave/training, generic forms, document centre | Planned (rules exist for most) |
| 7 Additional operations | Fees-lite UI, assets, advanced reporting | Planned |
| 8 SRSS25 & launch | Anniversary/alumni content, security and mobile testing, performance, deployment | Planned |

## 3. Schema changes

Inspected against `data-model.md`; no duplicate collections. New collections are marked **new**.

| Collection | Change | Owner (writes) |
|---|---|---|
| `curriculumPlans` | Defined: one per year × Standard × subject; ordered `topics[]` with objectives, learning-standard codes (typed by the coordinator from official DSKP documents — none are pre-filled) and teaching weeks; `sourceRefs[]` (Workspace attachments) | Academic Coordinator |
| `lessonPlans` | Defined: year, term, Standard, class, subject, teacher, week, date, topic (optionally linked to a curriculum topic), objectives, activities, materials, assessment approach, Human Values, reflection, status `draft → ready → completed → reviewed`, `attachments[]`, `contentSource` (`hub` or `googleDoc`) | Owning teacher (assigned class & subject); coordinator reviews |
| `learningTasks` | Defined: class, subject, title, instructions, set/due dates, `attachments[]`, submission mode (`none`, `hub`, `classroom`), status `draft → published → closed` | Teacher of that class & subject |
| `learningTaskProgress` **new** | One per task × pupil: completion status, optional pupil submission (text/link), teacher feedback | Teacher; the pupil (own submission only) |
| `assessmentPeriods` | Defined: name, year, term, dates, entry deadline, status, `resultsVisibleToStudents` | Coordinator / School Admin |
| `assessments` | Defined: structure per period × Standard × subject — embedded `components[]` (type, max marks, weight), weighting mode, absent policy, grading bands | Coordinator / School Admin |
| `assessmentComponents` | **Removed from rules** (unused): components are embedded in `assessments` so weightage is validated atomically | — |
| `markSheets` **new** | One per period × assessment × class: workflow status, who/when for each step, return note | Workflow actors |
| `studentResults` | Defined: per pupil marks map, absent/exempt flags, computed percent and grade, comment, status mirrors its mark sheet, `studentVisible`, amendment reason/time | Teacher (draft) → coordinator → leadership |
| `users/{uid}` | Adds `teachingKeys` (`classId|subjectId`) so rules can stop teachers editing subjects they are not assigned | Server only |

Attachment shape (used in `lessonPlans`, `learningTasks`, `curriculumPlans`): `{ provider: "google", kind, fileId, title, url, addedBy, addedAt }`. Only the Drive file id and its canonical URL are stored; access to the file stays governed by Google Drive sharing, never by the hub hiding the link.

Planned for later stages (not created now): `reportCards` (exists), `applicationDocuments`/`applicationActions` (exist), `staffLeave`/`staffTraining` (exist), `meetingRequests` → reuse `appointments`, `workspaceConnections` (server-only metadata, never tokens in client-readable docs), `workspaceFileLinks` only if attachments outgrow embedding.

Indexes: Stage 1 queries are equality-only (served by single-field index merging) and sort client-side, so no new composite indexes are required.

## 4. Security requirements

- Rules remain the authority; every list query is constrained so each returned document is readable.
- Subject-level teaching scope: lesson plans, tasks, mark sheets and results are written only by a teacher assigned to that **class and subject** (`teachingKeys`); class teachers can read their class's sheets but not edit other subjects.
- Assessment workflow enforced per document: teacher `draft ↔ submitted`; Academic Coordinator `submitted → reviewed` or return to `draft` (cannot change marks); Leadership `reviewed → approved → published → locked`, or return to `draft`; amendments after publication need leadership plus a recorded reason; audit trigger records every change.
- Families read results only when `published`/`locked`; pupils only when the period allows it (`studentVisible`).
- Families and pupils see learning tasks only once published, and only for their own class; draft lesson plans and curriculum plans are staff-only.
- Workspace: no OAuth tokens or API secrets in client code, public env vars or client-readable Firestore; Stage 5 privileged calls go through Cloud Functions with minimum scopes (`drive.file`, `calendar.events`, …); revoked/expired connections fall back to the link flow.
- Permission tests added for: teacher on an unassigned subject, coordinator altering marks, teacher publishing, family reading unpublished results, pupil visibility switch, other family's tasks, unpublished tasks.

## 5. Google Workspace integration opportunities

| Module | Stage 1 (now) | Stage 5 (API, per-user OAuth) |
|---|---|---|
| Academics | Attach Drive file by link; create Doc/Sheet/Slides in Google then attach; lesson plan content can live in the attached Doc (`contentSource: googleDoc`) so there is one copy | Drive Picker (`drive.file`), create from a school template via Drive API |
| Learning tasks | Attach Drive/Forms resources; record that Google Classroom is the source of truth when `submissionMode = classroom` | Classroom coursework link/sync (if the edition allows) |
| Assessments | Export marks template (CSV opens in Sheets); controlled import by pasting from Sheets or uploading CSV, validated into **draft** only | Read a named range from an authorised Sheet server-side; still import-to-draft |
| Curriculum | Link approved DSKP/curriculum documents as source references | Shared Drive folder browser |

## 6. Dependencies

- School: confirm Workspace edition (D3), Workspace domain, curriculum source documents, grading bands per subject, who may publish results (see decisions).
- Technical: Stage 2 report PDFs need a print stylesheet (no paid service); Stage 5 needs a Google Cloud OAuth client (internal app in the Workspace domain avoids public verification) and Picker API key restricted by HTTP referrer.
- Ordering: report cards (Stage 2) depend on published results (Stage 1); Human Excellence forms (Stage 3) reuse the lesson-plan values tagging; admissions scheduling (Stage 4) reuses the Workspace modal.

## 7. Recommended implementation sequence

Matches the brief and the launch priority (academic planning → assessments → report cards → Human Excellence → admissions → Drive/Calendar): **1** academic operations → **2** reporting → **3** Human Excellence → **4** admissions → **5** consolidate Workspace (connection centre + OAuth adapters behind the existing modal) → **6** communication & operations → **7** fees-lite/assets → **8** SRSS25 & launch readiness. Basic Workspace actions ship with each module through the shared modal.

## Decisions to confirm

1. **Who publishes results.** Brief: "Authorised Admin approves and publishes". Implemented as **Leadership (Headmistress)**, matching the existing report-card approval chain; School Admin can configure assessments but not publish. Change `canPublishResults` in `src/hub/logic/academics.js` and the rules helper together if the school prefers otherwise.
2. **Absent marks.** Configurable per assessment: `exclude` (default; the component is left out of the percentage, like an exemption) or `zero`.
3. **Grading presets** are editable starting points (percentage bands, or marks only), not official KSSR descriptors.
4. **Routes.** `/hub/academics` and `/hub/assessments` are the new canonical staff routes; `/hub/teacher/teaching`, `/hub/teacher/assessments` and `/hub/admin/assessments` redirect to them.

## Stage 1 report — Academic operations (13 Oct 2026)

**Status: Implemented and Tested** (unit, security-rules and browser end-to-end tests against the emulators with fictional data). Not yet *Ready for deployment*: the school decisions above and a production rules/index deploy are outstanding. Not *Deployed*.

| Item | Detail |
|---|---|
| Modules completed | Curriculum plans and coverage; lesson planning with Human Values and coordinator review; learning tasks with completion, feedback and pupil hand-in; assessment periods and structures; spreadsheet-style marks entry; approval workflow with amendments; families' and pupils' published results and tasks; teacher/admin dashboard widgets; shared Workspace modal |
| Screens added | `/hub/academics` (overview & coverage), `/hub/academics/curriculum`, `/hub/academics/lessons`, `/hub/academics/lessons/:lessonId`, `/hub/academics/tasks`, `/hub/academics/tasks/:taskId`, `/hub/assessments` (mark sheets, review queue, entry progress), `/hub/assessments/setup`, `/hub/assessments/marks/:periodId/:assessmentId/:classId`; built-out `/hub/parent/tasks`, `/hub/parent/progress`, `/hub/student/learning`, `/hub/student/progress` |
| Files | New: `src/hub/logic/academics.js`, `src/hub/logic/workspace.js`, `src/hub/workspace.jsx`, `src/hub/academicContext.js`, `src/hub/screens/academics.jsx`, `src/hub/screens/assessments.jsx`, `tests/academics.test.mjs`, `tests/rules/academics.rules.test.mjs`, `tests/e2e/stage1.e2e.mjs`. Changed: `firestore.rules`, `functions/scope.js`, `src/auth/permissions.js`, `src/hub/routes.js`, `src/hub/HubApp.jsx`, `src/hub/hub.css`, `src/hub/screens/dashboards.jsx`, `src/hub/screens/attendance.jsx`, `scripts/seed-emulator.mjs`, `scripts/check-bundle-budget.mjs`, docs |
| Collections | Defined/enforced: `curriculumPlans`, `lessonPlans`, `learningTasks`, `assessmentPeriods`, `assessments`, `studentResults`. New: `markSheets`, `learningTaskProgress`. Removed from rules: `assessmentComponents` (unused). `users.teachingKeys` added to server-derived scope |
| Security rules | Subject-level teaching scope; per-document workflow transitions with who/when stamps; coordinator cannot change marks or publish; leadership-only approval, publication, locking and reasoned amendment; family/pupil visibility of published results and published tasks only; pupil hand-in limited to own work on hub-submission tasks; key whitelists on results, sheets and task progress |
| Google APIs integrated | None called yet. Stage 1 uses Google's official create addresses (docs/sheets/slides/forms `…/create`) and canonical Drive/Docs links; Sheets interchange is CSV/clipboard. No credentials, no tokens |
| OAuth scopes required | None for Stage 1. Planned for Stage 5: `drive.file` (Picker, create from template), `calendar.events` (meetings), Sheets read of a named range for import, optional Classroom coursework scopes if the edition allows |
| Tests executed | `npm test`: 36/36 (14 new). `npm run test:rules`: 52/54 — all 19 new and all existing Firestore tests pass; the 2 failures are pre-existing Storage image-library tests that fail identically on the unchanged baseline (queued separately). `npm run test:e2e`: 17/17 workflows (teacher → coordinator → leadership → parent/student, including mobile, validation, unauthorised access and the Sheets import). `npm run build`: passes; budgets 136.7 KiB public / 192.5 KiB shared core; new screen chunks 13.9 KiB and 11.8 KiB gzip |
| Bugs found and fixed while testing | (1) Attendance submit failed for classes of ~20+ pupils (Firestore allows ~20 rule lookups per batch) — records are now written in chunks with the session last. (2) A portalled modal's submit bubbled into the caller's form. (3) Amendment change-detection was key-order sensitive. (4) Budget script measured a 66-byte shared chunk instead of the public bundle |
| Known limitations | Percent/grade are computed in the browser and stored; rules check shape and range, not the arithmetic (a server recompute can be added with Stage 2). Structures can be edited after marks exist (the editor warns). Drive Picker, API document creation and Classroom sync wait for Stage 5. Functions emulator could not run in the cloud sandbox (its outbound calls are blocked), so audit triggers were not exercised here; they are unchanged. Existing `today()` uses UTC, so before 8 am Malaysia time some existing screens show yesterday's date (new Stage 1 screens use school time) |
| Remaining work | Stage 2 report cards and reporting dashboards build on published results; school decisions listed above |
| Deployment requirements | `firebase deploy --only firestore:rules,functions` (rules and the `teachingKeys` scope change go together; after deploying functions, re-save teacher assignments or re-run scope derivation so existing teachers receive `teachingKeys`), then hosting. No new indexes. No new paid services |
