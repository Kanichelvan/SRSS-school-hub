# SRSS Digital Hub — Build report, 14 October 2026

Scope: role-based application, school master data, the Admin, Teacher, Parent and Student hubs, attendance, announcements, portfolios, calendar, the School Setup Wizard, development demo data and end-to-end testing.

“Functional” below means the feature loads authorised data, performs its actions, persists them in Firestore, is enforced by the security rules or server functions, handles errors, and passes tests. Everything was verified against the Firebase emulators (Auth, Firestore, Functions); **nothing in this report has been deployed to the real `srssdigitalhub` project yet.**

## Test results (on the combined working tree)

| Suite | Command | Result |
|---|---|---|
| Unit (permissions, consent versions, audiences, portfolio rules, setup wizard plans, routes, site map, dashboards) | `npm test` | 33 / 33 pass |
| Firestore and Storage security rules | `npm run test:rules` | 56 / 56 pass |
| End-to-end journey with real rules, functions and sign-in | `npm run test:e2e` | 16 / 16 pass |
| Production build and bundle budgets | `vite build` | Public 145 KiB (budget 150) · Hub core 198 KiB (budget 200) |
| Browser walk-through with demo data | — | Every admin, teacher, parent and student page loads; flows below exercised in the UI |

The rules tests found a real defect, now fixed: the rules looked up linked records (year, class, guardian, pupil) by a malformed path, so those checks always failed. The browser walk-through found and fixed three more:
- The hub used UTC dates, so in Malaysia before 8 am “today” was yesterday.
- Large saves broke the rules' limit of 20 document reads per batch. Attendance for a class of more than about 18 pupils, and promoting a whole school, would have failed.
- Admin pages crashed for a moment while their reference data was loading.

## Stage 1 — Role-based application

1. **Features.**
   - **Roles:** six main roles: `superAdmin`, `schoolAdmin`, `teacher`, `parent`, `student`, `contentEditor`. A person can hold several, and specialised roles are added as extra responsibilities. A Super Administrator holds the combined rights of the office, leadership and technical administration.
   - **Contextual permissions:** these come from:
     - teacher assignments and class-teacher roles, current academic year only, and active ones only;
     - class membership;
     - subject assignments (`assignmentKeys`);
     - guardian–student links;
     - content publishing (Leadership publishes; editors draft);
     - portfolio moderation (Portfolio Moderator or Leadership).
   - **Shell:** one shared shell with role-aware navigation. The Admin hub menu is grouped; pupils see one short list. After sign-in, each person lands on their own dashboard.
   - **Accounts:** only server functions create accounts or change roles. The office can grant family and teacher roles; every other role needs a Super Administrator. Nobody can change their own roles.
2. **Files.** `src/auth/permissions.js`, `functions/roles.js`, `functions/index.js` (`setUserRoles`, `provisionAccount`, `setAccountStatus`), `functions/scope.js`, `src/hub/HubApp.jsx`, `src/hub/routes.js`, `firestore.rules`.
3. **Routes.** `/hub` (redirects to the person's dashboard), `/hub/admin`, `/hub/teacher`, `/hub/parent`, `/hub/student`; `/hub/admin/roles`, `/hub/admin/accounts`.
4. **Collections.** `users` (server-derived scope), `userRoles` (role-change history), `auditLogs`.
5. **Security rules.**
   - `superAdmin` sits alongside the office and leadership roles throughout.
   - `users` and `userRoles` can't be written by any client.
   - Scope fields are server-derived.
6. **Tests.**
   - Unit: role parity between the app and the server, who may assign which roles, Super Administrator rights.
   - Rules: "Roles: Super Administrator and the office".
   - End-to-end: "unauthorised role assignment is denied", "account deactivation".
7. **Limitations.**
   - Role changes take effect at the person's next token refresh (sign-in, or "Refresh access").
   - The first Super Administrator must be bootstrapped with `scripts/grant-access-admin.mjs`.
8. **Mock-data dependencies.** None: the screens read live Firestore.
9. **Deployment.** Deploy the functions and Firestore rules, then bootstrap a Super Administrator.

## Stage 2 — School master data

1. **Features.** Search, filters, create, edit, archive and restore, field validation, empty, loading and error states, and "created / last updated by" lines with change history. These cover academic years, terms, Standards 1–6, classes, subjects, teacher assignments, student enrolments, students, guardians, staff, user accounts and guardian–student links.
   - **Configuration:** announcement categories, portfolio categories, achievement tags, download categories and consent questions.
   - **Stable IDs:** for example `ay2027`, `ay2027-4-amanah`, `std4`, and subject codes.
   - **History is kept:**
     - moving class ends one enrolment and starts another;
     - a change of teacher means archiving the old assignment and adding a new one;
     - a record's year, class, teacher and subject can't be rewritten.
   - **Protections:**
     - guardians can't link themselves;
     - nobody assigns themselves to a class or makes themselves class teacher;
     - links copy the guardian's account and the pupil's class, so they can't point elsewhere;
     - sign-in accounts are linked to person records by the server only.
   - **Consent questions:** rewording a question raises its version, so families are asked that question again.
2. **Files.** `src/hub/manage.jsx` (`RecordManager`), `src/hub/screens/setup.jsx`, `people.jsx`, `system.jsx`, `src/hub/audience.js`, `src/hub/consentForm.js`, `src/hub/data.js`, `src/hub/ui.jsx`, `src/hub/hub.css`.
3. **Routes.**
   - Setup: `/hub/admin/academic-years`, `/terms`, `/standards`, `/classes`, `/subjects`.
   - People: `/students`, `/guardians`, `/staff`, `/accounts`.
   - Assignments: `/enrolments`, `/teacher-assignments`, `/guardian-links`.
   - Settings: `/settings`, with tabs for the configuration lists and consent questions.
4. **Collections.** `academicYears`, `terms`, `standards`, `classes`, `subjects`, `teacherAssignments`, `enrollments`, `students`, `guardians`, `staff`, `users`, `studentGuardianLinks`, `announcementCategories`, `portfolioCategories`, `portfolioTags`, `downloadCategories`, `consentDefinitions`, `settings`.
5. **Security rules.**
   - Writes must carry the writer's stamp (`updatedBy`, and `updatedAt` equal to the request time).
   - Field validation on every record.
   - Identity fields are immutable; no self-assignment.
   - Enrolments must match their class's year and Standard.
   - Rewording a consent question requires a version increase.
   - No deletes anywhere.
6. **Tests.** Rules: "Academic structure", "People", "Configuration and consent questions". Unit: consent versions and audiences.
7. **Limitations.**
   - No CSV import yet.
   - Subjects aren't yet linked to a timetable.
   - Staff employment details are out of scope (Phase 2 HR).
8. **Mock-data dependencies.** None.
9. **Deployment.** Rules, functions (audit triggers for the new collections) and indexes.

## Stage 3 — Admin hub

1. **Features.**
   - **Dashboard:**
     - active students, staff and classes;
     - attendance today, counting submitted registers only, with a five-day trend;
     - recent announcements, recent portfolio activity and upcoming events;
     - pending actions: registers not submitted, moderation, admissions, inbox, consent gaps, pupils not enrolled and incomplete records.
   - **School setup, people and assignments:** the screens from Stage 2.
   - **Content & communication:** announcements, calendar and portfolio moderation, plus the existing website content and inbox.
   - **System:** roles & permissions matrix with role-holder counts, settings, and audit history.
2. **Files.** `src/hub/screens/dashboards.jsx`, `system.jsx`, `admin.jsx`, `wizard.jsx`.
3. **Routes.** The grouped `/hub/admin/*` set listed in `src/hub/routes.js`.
4. **Collections.** All of the above, plus `attendanceSessions`, `portfolioEntries`, `announcements`, `events` and `auditLogs`.
5. **Security rules.** As in Stages 1–2. Moderation stays with Portfolio Moderator or Leadership; the school office can't approve public showcase.
6. **Tests.** End-to-end: "dashboard figures reflect the day's work".
7. **Limitations.** Assessments, fees, assets and reports remain Phase 2/3 placeholders.
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 4 — Teacher hub

1. **Features.**
   - Dashboard (next lesson and today's lessons, from this year's active assignments only).
   - My classes, class dashboard and class roster: attendance rate, photo and showcase consent, and family contacts for the class teacher.
   - Attendance, portfolio entries, class notices and class events.
   - Workflow: sign in → classes → roster → attendance → portfolio entry → notice → saved records.
2. **Files.** `src/hub/screens/teaching.jsx`, `attendance.jsx`, `dashboards.jsx`, `src/hub/portfolio.js`.
3. **Routes.** `/hub/teacher/classes`, `/classes/:classId`, `/classes/:classId/roster`, `/attendance`, `/attendance/:classId?date=`, `/announcements`, `/portfolios`, `/events`.
4. **Collections.** `classes`, `students`, `attendanceSessions`, `attendanceRecords`, `portfolioEntries`, `announcements`, `events`, `studentConsentStatus`, `studentGuardianLinks`, `guardians`.
5. **Security rules.**
   - Class scope comes from the server-derived `classIds`.
   - Portfolio entries are allowed only for pupils actually in the class, and for subjects the teacher is assigned there.
   - Teachers can't mark an entry approved.
   - Notices and events go to the teacher's own classes only, never urgent, pinned, school-wide or public.
6. **Tests.**
   - Rules: "Teacher, parent and student scope", "Portfolio", "Announcements and calendar".
   - End-to-end: "Teacher manages the class", "cross-class teacher access is denied".
7. **Limitations.**
   - One morning register per day; no per-lesson attendance yet.
   - Media references are Google Drive links, not uploads.
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 5 — Parent hub

1. **Features.**
   - Dashboard: child switcher, Actions Required, attendance, portfolio highlight, Human Excellence, events and notices.
   - My children, child profile, attendance, My SRSS Journey (new portfolio categories, values, media links), announcements, calendar and consent.
2. **Files.** `dashboards.jsx`, `family.jsx`, `records.jsx`, `attendance.jsx`, `comms.jsx`.
3. **Routes.** `/hub/parent`, `/children`, `/attendance`, `/portfolio`, `/consent`; `/hub/students/:studentId`, `/hub/announcements`, `/hub/calendar`.
4. **Collections.** `students`, `attendanceRecords`, `portfolioEntries`, `announcements`, `events`, `studentConsentStatus`.
5. **Security rules.**
   - `isGuardianOf` uses the server-derived `childIds`.
   - Internal portfolio entries are never readable by families; archived ones are hidden in the app.
6. **Tests.**
   - Rules: "a parent never reads another family's records".
   - End-to-end: "Parent follows their child", "cross-family access is denied".
7. **Limitations.** Progress, reports, fees and meetings are Phase 2.
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 6 — Student hub

1. **Features.** Age-appropriate large cards:
   - **Today:** notices, my class, my portfolio, my achievements, coming up.
   - **My class:** class teacher, my teachers and lessons, class notices, my attendance in simple words.
   - My portfolio, My achievements, Notices, Calendar.
2. **Files.** `src/hub/screens/student.jsx`, `family.jsx` (Journey), `comms.jsx`.
3. **Routes.** `/hub/student`, `/class`, `/portfolio`, `/achievements`, `/announcements`, `/calendar`.
4. **Collections.** Own `students` record, `teacherAssignments` for their class, `staff` (directory-visible only), `portfolioEntries`, `studentAchievements`, `announcements`, `events`.
5. **Security rules.** A pupil reads only their own record and who teaches their class.
6. **Tests.** Rules: "a pupil reads only their own record and who teaches their class".
7. **Limitations.** Pupil self-submitted portfolio work isn't in the student UI yet (the rules allow it).
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

**Note:** while this work was paused, another session added an SRSS25 Quest / Buku NILAM feature to the Student hub and other hub files. That code isn't part of this report.

## Stage 7 — Attendance

1. **Features.**
   - Workflow: select class → select date (no future dates) → roster loads → mark Present / Absent / Late / Excused (everyone starts Present in the unsaved form) → submit → confirm → saved confirmation.
   - Unsubmitted registers never count: dashboards and rates use submitted sessions only. Marks are saved first and the register is marked submitted last.
   - **Corrections:**
     - require a reason;
     - record who made them and the previous status;
     - count corrections on the register;
     - appear in the audit trail.
   - Admins can open any class's register to correct it.
2. **Files.** `src/hub/screens/attendance.jsx`, `src/hub/data.js` (`commitInChunks`, local dates), `firestore.rules`.
3. **Routes.** `/hub/teacher/attendance`, `/hub/teacher/attendance/:classId`, `/hub/admin/attendance`, `/hub/admin/attendance/:classId`.
4. **Collections.** `attendanceSessions`, `attendanceRecords`, `auditLogs`.
5. **Security rules.** Status changes need `correctionReason`, `correctedBy` and `correctedAt`; class and pupil can't be rewritten; scope is the teacher's own classes.
6. **Tests.** Rules: "attendance identity …" and corrections. End-to-end: "marks attendance, submits, and corrects it with a reason", including the audit entry.
7. **Limitations.** Morning register only; no bulk "mark all absent".
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 8 — Announcements

1. **Features.**
   - **Categories:** School-wide, Class, Academic, Event, Reminder and Urgent (configurable).
   - **Audiences:** everyone, parents, teachers, staff, students, one or more Standards, one or more classes, selected people.
   - **Publishing:** draft, published, scheduled (published within 15 minutes, or at once by "Publish due notices now"), archived, and expiry dates.
   - **Display:** pinned notices stay at the top; attachments are Google Drive links.
   - **Who posts:** admins and leadership publish anything; teachers post routine notices to their own classes.
   - Public website news stays in the separate `newsPosts` system.
2. **Files.** `system.jsx` (`AnnouncementsAdmin`), `teaching.jsx` (`TeacherAnnouncements`), `comms.jsx`, `audience.js`, `functions/index.js` (`publishScheduledAnnouncements`, `runAnnouncementSchedule`).
3. **Routes.** `/hub/admin/communications`, `/hub/teacher/announcements`, `/hub/announcements`, `/hub/student/announcements`.
4. **Collections.** `announcements`, `announcementCategories`.
5. **Security rules.**
   - Notices are read only when published and addressed to the reader.
   - Teachers are limited to their own classes and to routine categories, never pinned.
   - Field validation on every notice.
6. **Tests.** Rules: "Announcements and calendar". End-to-end: the teacher's notice reaches the parent.
7. **Limitations.**
   - Attachments are links, not uploaded files.
   - Scheduled publishing needs Cloud Scheduler in production; the emulator doesn't run it automatically.
8. **Mock-data dependencies.** None.
9. **Deployment.** Functions, including the scheduled one, which uses Cloud Scheduler.

## Stage 9 — Portfolios

1. **Features.**
   - **Categories:** Academic Learning, Human Values, Co-curricular, Achievements, Reflections & Growth.
   - **Each entry records:** student, academic year, class, subject, category, title, description, learning objective, Human Value tags, achievement tags, teacher observation, student reflection, media references, visibility, consent status and moderation status.
   - **Visibility:** Internal / Parent-visible / Showcase candidate / Public showcase.
   - **Who writes:** teachers create entries for pupils in their classes.
   - **Who sees what:** parents see permitted entries for their own children only.
   - **Going public:** needs the family's public-showcase consent plus a moderator's approval. The public then sees only a server-made copy in `showcaseItems`, with first name, Standard and text, and no media or surname. Portfolio entries themselves are never publicly readable.
2. **Files.** `teaching.jsx` (`TeacherPortfolio`), `admin.jsx` (moderation), `family.jsx`, `src/hub/portfolio.js`, `functions/index.js` (`showcaseOnModeration`).
3. **Routes.** `/hub/teacher/portfolios`, `/hub/admin/showcase`, `/hub/parent/portfolio`, `/hub/student/portfolio`.
4. **Collections.** `portfolioEntries`, `showcaseItems`, `portfolioCategories`, `portfolioTags`, `studentConsentStatus`.
5. **Security rules.** `entryValid`, pupil-in-class and subject checks, moderator-only approval, consent-gated public visibility, no public read of entries or media, `showcaseItems` written by the server only.
6. **Tests.** Rules: "Portfolio". End-to-end: "portfolio visibility" and "public showcase needs consent and a moderator".
7. **Limitations.**
   - No public showcase web page reads `showcaseItems` yet.
   - Media upload to Storage isn't included (Drive links only).
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 10 — Calendar

1. **Features.**
   - **Event types:** school, class, academic, holiday, meeting.
   - **Each event records:** title, description, start and end dates, times or all-day, location, audience, category, attachment links, and an optional listing on the public website.
   - Each person sees the events addressed to them, with a type filter; multi-day events still show while they're running.
   - Teachers add class events for their own classes.
2. **Files.** `system.jsx` (`CalendarAdmin`), `teaching.jsx` (`TeacherEvents`), `comms.jsx` (`Calendar`), `data.js` (`eventsFor`).
3. **Routes.** `/hub/admin/calendar`, `/hub/teacher/events`, `/hub/calendar`, `/hub/student/calendar`.
4. **Collections.** `events`.
5. **Security rules.** `eventValid`; teachers' events go to their own class only and are never public; audience-matched reading.
6. **Tests.** Rules: "teachers add class events for their own class; never public ones".
7. **Limitations.** No Google Calendar sync (a separate decision).
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 11 — School Setup Wizard

1. **Features.** Nine steps, each with a status worked out from real records:
   1. School information
   2. Academic year & terms
   3. Standards & classes
   4. Subjects
   5. Staff & teachers
   6. Teacher assignments
   7. Student enrolment
   8. Parent/guardian linking
   9. Review & activate

   The annual roll-over:
   - copy last year's classes;
   - carry teacher assignments forward (skipping the administrator's own);
   - promote pupils one Standard; Standard 6 pupils graduate;
   - activate the year: the server moves every pupil's current class and every account's access to the new year.

   Verified in the browser by preparing and activating 2028 on the demo school.
2. **Files.** `src/hub/screens/wizard.jsx`, `src/hub/logic/setup.js`, `functions/index.js` (`scopeOnSchoolYear`).
3. **Routes.** `/hub/admin/setup`.
4. **Collections.** All of the academic-structure and people collections, plus `settings`.
5. **Security rules.** The same rules as the individual screens. The wizard is a guided client with no extra privileges.
6. **Tests.** Unit: "setup wizard" (status, class copy, assignment copy, promotion).
7. **Limitations.**
   - Promotion matches classes by Standard and position; changes of stream are made afterwards in Student enrolments.
   - Class teachers aren't copied (they usually change).
8. **Mock-data dependencies.** None.
9. **Deployment.** As above.

## Stage 12 — Development demo data

- **Dataset:** `scripts/demo-data/school-2027.mjs`, a fictional school:
  - academic year 2027 (with 2026 as history), three terms, Standards 1–6 and classes for both years;
  - 8 subjects, 13 staff, 7 teacher assignments plus last year's;
  - 36 pupils, guardians and links (two families with accounts);
  - announcements of every kind, a week of attendance including a correction, portfolio entries across all visibilities, and calendar events of every type.
- **Running it:** `npm run seed` is repeatable (fixed IDs); `-- --reset` wipes the emulators first. The script refuses anything but the local emulators and a `demo-*` project. Every name is invented and marked "(demo)".

## Stage 13 — End-to-end testing

`tests/e2e/journey.test.mjs` (`npm run test:e2e`) runs against the Auth, Firestore and Functions emulators:

- **Admin:**
  - creates a class and a teacher, gives the teacher an account and assigns them;
  - creates a pupil and enrols them;
  - creates a guardian, gives them an account and links them to the pupil.
- **Teacher:** signs in, sees the class and roster, marks attendance, corrects it with a reason, creates a portfolio entry and publishes a class notice.
- **Parent:** signs in, sees the child, the attendance, the entry and the notice.
- **Admin:** sees the dashboard figures.
- **Denials tested:**
  - cross-family access;
  - cross-class teacher access;
  - unauthorised role assignment;
  - portfolio visibility;
  - the public-showcase consent requirement;
  - attendance correction without a reason;
  - account deactivation.

Accounts are created without passwords, as in real use. For the test only, the Admin SDK gives each one an emulator password so the test can sign in as that person.

## Deployment requirements (not yet done)

1. Rules and indexes: `npx firebase deploy --project production --only firestore:rules,firestore:indexes`.
2. Functions (now 48, including the scheduled announcement publisher, which uses Cloud Scheduler on the Blaze plan): `npx firebase deploy --project production --only functions`.
3. Bootstrap the first Super Administrator with `scripts/grant-access-admin.mjs --roles superAdmin`.
4. Enter the real school setup through the wizard. Don't run the demo seed against production; it refuses to anyway.
5. Hosting stays undeployed until the legal pages are approved.
6. Storage rules still wait on Storage being set up.
