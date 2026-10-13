# SRSS Digital Hub — Firestore Data Model

Follows the PRD Firestore domain model (Master PRD §47, revised §18). Access rules: [`firestore.rules`](../firestore.rules). Role/module matrix: [`src/auth/permissions.js`](../src/auth/permissions.js). Demo data for every launch collection: [`scripts/seed-emulator.mjs`](../scripts/seed-emulator.mjs).

## How access works

1. **Role** — the `roles` custom claim (e.g. `["teacher","classTeacher"]`), set only by the `setUserRoles` Cloud Function.
2. **Context** — `users/{uid}` is a scope document derived by `functions/scope.js` from the source-of-truth collections. Clients can never write it.

| Scope field | Derived from |
|---|---|
| `childIds` | `studentGuardianLinks` where `guardianUid` = user, `hasPortalAccess`, active |
| `studentId` / `guardianId` / `staffId` | the person record whose `uid` field is this account |
| `teachingClassIds`, `homeroomClassIds`, `classIds` | `teacherAssignments` (current year) and `classes.classTeacherUid` |
| `teachingKeys` | `classId|subjectId` pairs from `teacherAssignments` (current year): rules let a teacher write lesson plans, tasks and marks only for subjects they teach |
| `assignedStudentIds` | active `studentSupportPlans.assignedStaffUids` |
| `familyClassIds` | children's (or own) `students.currentClassId` |
| `audienceKeys` | `school`, `role:*`, `class:*`, `standard:*`, `user:*` — used to target announcements, events and forms |
| `publishKeys` | the `class:*` keys a teacher may publish to |

3. **Records** — every per-child record carries `studentId` and `classId` (the enrolment class at the time), so rules check scope without extra reads. Queries must be constrained the same way: Firestore rejects a query unless every document it could return is readable.

Triggers keep scope current whenever links, assignments, classes, support plans or enrolments change.

## Collections

Launch phase (1) unless marked. ✱ = audited by the `audit*` triggers (PRD §42).

| Domain | Collections |
|---|---|
| Identity | `users` ✱ (server-derived scope) · `roles` · `userRoles` (role-change history) · `staff` ✱ (+ `staff/{id}/private` for employment data) · `guardians` · `studentGuardianLinks` ✱ |
| Academic structure | `academicYears` · `terms` · `standards` · `classes` · `subjects` · `classSubjects` · `teacherAssignments` (with weekly `slots` until the timetable module) · `enrollments` ✱ |
| Students | `students` ✱ (+ `students/{id}/restricted` for medical data) · `studentDocuments` · `studentAchievements` · `studentSupportPlans` (P2) · `studentSupportSessions` (P2) · `studentIncidents` ✱ (P2; `classification: restricted` for safeguarding) |
| Attendance | `attendanceSessions` (one per class/date/session — "not submitted" vs "all present", ATT-002) · `attendanceRecords` ✱ |
| Assessments (Stage 1) | `assessmentPeriods` (name, term, dates, marks deadline, status, `resultsVisibleToStudents`) · `assessments` (one per period × Standard × subject; embedded `components[]` with type, `maxMarks`, `weight`; `weighting` weighted/rawTotal; `absentPolicy` exclude/zero; `grading.bands[]`) · `markSheets` (one per period × assessment × class, id `{periodId}_{assessmentId}_{classId}`: workflow status, `progress`, who/when for each step, `returnNote`) · `studentResults` ✱ (id `{sheetId}_{studentId}`: `marks`/`flags` maps, `percent`, `grade`, `comment`, status mirrors its sheet, `studentVisible`, `amendmentReason`/`amendedBy`/`amendedAt`) · `reportCards` ✱ (Stage 2). `assessmentComponents` is not used: components are embedded so weightings validate together. |
| Academic planning (Stage 1) | `curriculumPlans` (year × Standard × subject; ordered `topics[]` with objectives, learning-standard codes typed from the approved source, weeks; `sourceRefs[]`) · `lessonPlans` (class, subject, `ownerUid`, term, week, date, `topicId`, topic, objectives, activities, materials, assessment approach, `humanValues[]`, reflection, `contentSource` hub/googleDoc with `primaryDoc`, `attachments[]`, review fields) · `learningTasks` (class, subject, instructions, set/due dates, `submissionMode` none/hub/classroom, `classroomUrl`, `attachments[]`) · `learningTaskProgress` (id `{taskId}_{studentId}`: status, teacher `feedback`, pupil `submissionText`/`submissionUrl`) · `classUpdates` |
| Portfolio / Human Excellence | `portfolioEntries` ✱ · `portfolioMedia` · `humanValuesObservations` · `studentReflections` |
| Communication | `announcements` · `notificationRecords` · `messageThreads` (+ `messageItems` subcollection) |
| Calendar | `events` · `registrations` · `appointments` (P2) |
| Forms & consent | `formDefinitions` · `formSubmissions` · `workflowActions` · `consentDefinitions` (dated audit copy; the live form is built into `src/hub/consentForm.js`) · `consentRecords` ✱ (append-only; `source` is `parentPortal` or `paperForm`, paper entries carry `guardianName` and `recordedBy`) · `studentConsentStatus` (server-derived latest response and form version per type) · `consentReminders` (server-written: last reminder per pupil) · `policyAcknowledgements` (one per staff member, versioned confidentiality and acceptable-use acknowledgement) |
| Admissions | `admissionEnquiries` (public create) · `applications` · `applicationDocuments` · `applicationActions` |
| Finance-lite (P2) | `feeStructures` · `studentFeeAssignments` · `payments` ✱ · `concessions` ✱ (restricted) |
| Staff operations (P2) | `staffLeave` · `staffTraining` · `staffAppraisals` |
| Assets (P3) | `assets` ✱ · `assetAssignments` · `assetMaintenance` |
| Public website | `pages` (live copy) · `pageDrafts` (staff drafts) · `newsPosts` · `publicAchievements` · `mediaRegistry` (image library: staged → approved/archived; `url`, `storagePath`, required `alt`, `containsPupils` + `consentChecked`, size and dimensions; Storage reads consult the matching registry record) · `contactMessages` |
| Governance | `documents` · `auditLogs` (server-only) · `dataReviewTasks` · `settings` ✱ (`settings/school.currentAcademicYearId`) · `certificateVerifications` (public get, no list) |

Library collections are intentionally absent until the Library & Resource Centre module.

## Workflows encoded in the rules

| Record | States | Who moves it |
|---|---|---|
| Attendance session | `open` → `submitted` | Teacher of the class or school admin; `submittedBy` must be the user |
| Mark sheet and its results | `draft` → `submitted` → `reviewed` → `approved` → `published` → `locked` (any of submitted/reviewed/approved may return to `draft` with a note) | Teacher of that class **and subject** (draft, submit); Academic Coordinator (review or return — never changes marks); Leadership (approve, publish, lock, return; amend a published result only with a recorded reason) |
| Lesson plan | `draft` → `ready` → `completed` → `reviewed` | Owning teacher (draft/ready/completed); Academic Coordinator reviews or reopens (never their own plan) |
| Learning task | `draft` → `published` → `closed`; per pupil `submitted` / `completed` / `incomplete` / `excused` | Teacher of the class and subject; a pupil hands in their own work when `submissionMode` is `hub` |
| Report card | `draft` → `submitted` → `reviewed` → `academicApproved` → `published` | Teacher → Academic Coordinator → Headmistress |
| Portfolio entry | `internal` → `family` → `showcaseCandidate` → `publicShowcase` | Teacher up to candidate; only Portfolio Moderator/Leadership to public, and only with public-showcase consent |
| CMS content | `draft` → `review` → `approved` → `published` → `archived` | Content Editor drafts/reviews; Leadership approves and publishes |
| Application | `started` → `submitted` → `documentsPending` → `underReview` → `interview` → `offer` → `accepted` → `enrolled` | Applicant (early stages), Admissions; `enrolled` only via the `enrolApplication` function |
| Consent | append-only records; latest per type is the status | Guardian creates (or the office enters a signed paper form); nobody overwrites (CON-006). No approval step. |
| Incident (P2) | `reported` → … → `resolved` | Reporter/assigned staff/class teacher; restricted cases safeguarding lead only |

## Common record standard (PRD §48)

`status · createdAt · createdBy · updatedAt · updatedBy · academicYearId` (where applicable) · `archivedAt · archivedBy`. Sensitive records add `classification` (public / internal / confidential / restricted), `visibility` and `retentionClass`. Consent-sensitive media adds `consentStatus` and `consentRecordIds`. Relationships always use stable ids, never names.

## Files

Institutional documents and media live in Google Shared Drives; the hub stores metadata and Drive references (`evidenceUrl`, `driveFileId`). Workspace attachments share one shape — `{ provider: "google", kind, fileId, title, url, addedBy, addedAt }` (`src/hub/logic/workspace.js`) — and access to the file is always governed by Drive sharing. Firebase Storage (`storage.rules`) covers only public website media, register-backed documents, small portfolio uploads and admissions documents.

## Indexes

Composite indexes for the built screens are in [`firestore.indexes.json`](../firestore.indexes.json). Add new ones per screen → query → index as modules are built (srss PRD §20).
