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
| Academics (P2) | `assessmentPeriods` · `assessments` · `assessmentComponents` · `studentResults` ✱ · `reportCards` ✱ |
| Learning (P2) | `curriculumPlans` · `lessonPlans` · `learningTasks` · `classUpdates` |
| Portfolio / Human Excellence | `portfolioEntries` ✱ · `portfolioMedia` · `humanValuesObservations` · `studentReflections` |
| Communication | `announcements` · `notificationRecords` · `messageThreads` (+ `messageItems` subcollection) |
| Calendar | `events` · `registrations` · `appointments` (P2) |
| Forms & consent | `formDefinitions` · `formSubmissions` · `workflowActions` · `consentDefinitions` · `consentRecords` ✱ (append-only) · `studentConsentStatus` (server-derived latest response per type) |
| Admissions | `admissionEnquiries` (public create) · `applications` · `applicationDocuments` · `applicationActions` |
| Finance-lite (P2) | `feeStructures` · `studentFeeAssignments` · `payments` ✱ · `concessions` ✱ (restricted) |
| Staff operations (P2) | `staffLeave` · `staffTraining` · `staffAppraisals` |
| Assets (P3) | `assets` ✱ · `assetAssignments` · `assetMaintenance` |
| Public website | `pages` (live copy) · `pageDrafts` (staff drafts) · `newsPosts` · `publicAchievements` · `mediaRegistry` (image library: `url`, `storagePath`, required `alt`, `containsPupils` + `consentChecked`, size and dimensions; files in Storage `media/public/**`) · `contactMessages` |
| Governance | `documents` · `auditLogs` (server-only) · `dataReviewTasks` · `settings` ✱ (`settings/school.currentAcademicYearId`) · `certificateVerifications` (public get, no list) |

Library collections are intentionally absent until the Library & Resource Centre module.

## Workflows encoded in the rules

| Record | States | Who moves it |
|---|---|---|
| Attendance session | `open` → `submitted` | Teacher of the class or school admin; `submittedBy` must be the user |
| Student result | `draft` → `submitted` → `reviewed` → `approved` → `published` → `locked` | Teacher (draft/submitted), Academic Coordinator (review/approve/publish), Leadership (any, incl. after publication) |
| Report card | `draft` → `submitted` → `reviewed` → `academicApproved` → `published` | Teacher → Academic Coordinator → Headmistress |
| Portfolio entry | `internal` → `family` → `showcaseCandidate` → `publicShowcase` | Teacher up to candidate; only Portfolio Moderator/Leadership to public, and only with public-showcase consent |
| CMS content | `draft` → `review` → `approved` → `published` → `archived` | Content Editor drafts/reviews; Leadership approves and publishes |
| Application | `started` → `submitted` → `documentsPending` → `underReview` → `interview` → `offer` → `accepted` → `enrolled` | Applicant (early stages), Admissions; `enrolled` only via the `enrolApplication` function |
| Consent | append-only records; latest per type is the status | Guardian creates; nobody overwrites (CON-006) |
| Incident (P2) | `reported` → … → `resolved` | Reporter/assigned staff/class teacher; restricted cases safeguarding lead only |

## Common record standard (PRD §48)

`status · createdAt · createdBy · updatedAt · updatedBy · academicYearId` (where applicable) · `archivedAt · archivedBy`. Sensitive records add `classification` (public / internal / confidential / restricted), `visibility` and `retentionClass`. Consent-sensitive media adds `consentStatus` and `consentRecordIds`. Relationships always use stable ids, never names.

## Files

Institutional documents and media live in Google Shared Drives; the hub stores metadata and Drive references (`evidenceUrl`, `driveFileId`). Firebase Storage (`storage.rules`) covers only public website media, register-backed documents, small portfolio uploads and admissions documents.

## Indexes

Composite indexes for the built screens are in [`firestore.indexes.json`](../firestore.indexes.json). Add new ones per screen → query → index as modules are built (srss PRD §20).
