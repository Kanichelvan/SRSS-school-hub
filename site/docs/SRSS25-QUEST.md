# SRSS Quest implementation — 14 October 2026

SRSS25 is the first campaign in the existing SRSS Digital Hub. React routes use the existing AuthProvider, role matrix, SIS-derived scope, shared shell and portfolio. There is no separate application or staff engine.

## Delivered workflows

- Admin → Engagement: challenge studio, question/puzzle editors, student preview, reusable examples, campaigns, badges, release calendar, participation/review queue, authorised CSV exports and school settings.
- Draft → Review → Approved → Scheduled/Live → Closed → Archived. Only School Administrator, Leadership or Super Administrator can approve/release. Content editors prepare their own drafts; teachers prepare challenges for assigned classes. Approved definitions are locked; duplication creates a new editable draft.
- Student: SRSS25 Quest, My Challenges, My Badges, Buku NILAM, My Achievements, Leaderboard and My SRSS Journey. Existing class, notices, calendar, portfolio and achievements remain. Dashboard includes a compact Quest card.
- Teacher/non-teaching staff: `/hub/staff/quest`, available in existing hub navigation; private submissions, feedback, badges and staff passport. Dashboard card falls back to a passport link when no release is active. Participation is optional and creates no appraisal/HR record.
- Parent: linked-child reading journey, verified/provisional totals, milestones and achievements. Parent-assisted reading submissions require the school setting.
- Portfolio and SIS: Quest summary in Student 360° achievements and the existing family portfolio. An authorised reviewer can select approved work as an **internal** portfolio entry. Existing visibility, moderation and consent controls govern any later sharing. Creative media and private Workspace links are not automatically copied into public portfolio evidence.

## Challenge formats

Quick Quiz (MCQ), Fact or Fiction, Crack the Code, Word Scramble, Word Search, Picture Puzzle, Memory Match, Put It in Order, Spot the Difference and Creative Mission share one shell and server scorer.

Word Search uses an authored letter grid and the union of selected target-word cells. Picture Puzzle reconstructs image crops in row order using accessible tap controls. Memory Match proposes pairs with undo; the server verifies the submitted pairs. Spot the Difference uses author-marked comparison areas, including distractors. Creative work accepts text, controlled uploads and Google Workspace references, with review before rewards. These are intentionally simple initial formats; their controls and contracts can evolve independently.

Definitions include campaign/year, collection/category, difficulty, instructions, estimated duration, audiences, Standard/class restrictions, selected staff teams/users, opening/closing instants, attempt/time limits, score cap, completion threshold, badge, stamp, featured flag and publication status. Future campaigns reuse the engine and templates. Staff teams come from the school-managed `staff.teamIds` record; they are not self-selected by a participant.

## Scoring, rewards and privacy

All grading occurs in the `engagement` Cloud Function. The client submits answers, not an authoritative score. Quiz/puzzle percentage is the proportion of correct questions. Configured points = participation + eligible completion + anniversary + proportional accuracy bonus, capped at maxPoints. Creative review has no accuracy bonus. Completion requires the configured percentage or reviewer acceptance. No speed bonuses are issued in this version.

The first attempt can earn points. Replays only add the positive difference from the previous best score. A transaction protects attempt state, reward record, ledger, summary and badge. Repeated/concurrent submissions cannot issue duplicate points or badges. Attempt limits are serialised by participant state. Timers and release windows use server time; a save does not pause a timed activity. Explanations are returned only after submission. Answer keys and attempt snapshots cannot be read directly through Firestore, including by a publisher; the authorised CMS obtains keys through the callable.

Badges unlock on completed eligible challenges. Badge definitions must be active, match the campaign and match the participant audience. Creative awards require acceptance. Publishers can make reasoned points corrections and revoke the challenge badge through an idempotent correction transaction; the original award and correction remain auditable. Passport stamps are permanent completion memories, organised by academic year. Archiving hides a release from discovery while retaining the owner’s private result and attachments. Draft attachments can be removed before submission.

Human Excellence and Service & Sustainability categories always have zero competitive points. Observations remain in the existing Human Excellence system, separate from Quest scores. Individual student rankings default off. Staff individual rankings remain off. Class rankings divide campaign points by the full active class enrolment, including non-participants, so class size does not determine the winner. Campaign, Standard, class and period filters are available. If enabled, individual student rows contain campaign nicknames only. Equal points share a rank. Staff ledger entries are excluded from student rankings.

## Buku NILAM

Students save/edit drafts and submit a reading record. Linked parents may assist when enabled. Assigned teachers and publishers verify or return records with constructive feedback. Verified records cannot be edited by families. A transactional fingerprint prevents counting the same title, author and completion date twice for one child. Review screens flag pending duplicates and export only authorised records. Verified totals and milestones exclude drafts, submitted and returned records.

The school configures languages, material types, classifications and reading-record milestones. No official NILAM award thresholds are hard-coded. Current counting counts each verified reading record once and sums its page count; additional official counting policies need school confirmation before implementation. Reading milestones are derived from verified records, not competitive points. The collective reading goal exposes only aggregated verified pages and completion counts. This initial school goal is cumulative across records; campaign-specific goal windows are part of the remaining collective-mission extension.

## Firestore and Storage

New collections: `challengeCampaigns`, `challengeDefinitions`, `challengeQuestions`, `challengeAttempts`, `challengeSubmissions`, `challengeReleases`, `badgeDefinitions`, `studentBadges`, `pointsLedger`, `studentAchievementSummaries`, `nilamRecords`, `nilamVerifiedKeys`, `questParticipantState`, `questRewards`, `questCorrections`. Also reuses `settings/engagement`, `auditLogs`, `users`, `students`, `classes`, `staff` and `portfolioEntries`.

Question keys and attempt answers are encoded as JSON strings in private Firestore documents, because Firestore does not support nested arrays (memory pairs and multi-question puzzle answers). The callable decodes them into the common contract; the player receives no answer keys. All new domain collections deny direct client reads/writes. The callable derives roles from authenticated claims, reads server-owned scope and current SIS records, then checks ownership, audience, class/Standard, teacher assignment and parent-child access. Direct writes to `settings/engagement` are also denied; publishers configure it through the callable. Single-field query indexes suffice for the current bounded queries; no new composite indexes are needed.

Private uploads live at `quest/{uid}/{attemptId}/{file}` in Firebase Storage, never as document bytes. Only the owner and authorised reviewers can read them. Uploads require an active creative attempt, allowed MIME type and less than 10 MB; submitted files are immutable. The server confirms uploaded object metadata before submission. No public download URL is stored. Queries fail explicitly above 1,000 records rather than returning silently incomplete totals. Pagination/materialised reporting will be needed when the school outgrows that bound.

## Google Workspace

The repository did not contain `WorkspaceActionModal`. Added a shared accessible dialog for authorised Drive, Docs, Slides, Sheets and Forms **link attachments**. It stores metadata and leaves Google access permissions intact. Basic gameplay needs no Google account. Authorised reading/participation CSV exports can be imported into Sheets.

A native Google Picker, OAuth connection, document creation, direct Sheets export/import and optional Forms ingestion are **not implemented**. A link attachment does not establish that the reviewer has Google access, or alter a document's sharing. These integrations require the school's existing/approved Workspace connection to be configured.

## Local development and verification

`npm test` exercises the shared engine, validation and existing hub contracts. `npm run build` includes the existing public/shared-core bundle budgets. `npm run test:quest` starts a throwaway demo project on isolated ports from `firebase.quest-test.json`, then runs real signed-in callable acceptance tests and Quest Firestore/Storage rules tests. Java 21+ is required by the existing emulator tooling. `npm run test:rules` remains the full repository rule suite. `firebase.quest-preview.json` supplies separate local preview ports (Auth 9391, Firestore 8380, Functions 5301, Storage 9490); the Firebase clients accept optional `VITE_*_EMULATOR_PORT` overrides without changing their normal defaults.

`seed-quest-emulator.mjs` and the existing school seed create development-only fictional examples: three quizzes, two word puzzles, a creative mission, staff challenge, upcoming release, badges, reading draft and grader-derived achievements. Both require local `demo-*` emulators and refuse production. Production is never seeded automatically. No historical claim about the real school is asserted by those samples.

Validation results and browser evidence are recorded in `docs/SRSS25-QUEST-VALIDATION.md` after the final run.

## Remaining scope

- Bonus snakes-and-ladders scavenger hunt; true crossword/alternate staff formats; richer tile dragging and animated unlock countdowns.
- Optional staff team/recreational leaderboards and opt-in internal recognition gallery. Staff badges currently stay private; no permanent staff ranking is created.
- Badge rules for multi-challenge collections or reading counts; current automatic badges are assigned to a challenge, while reading milestones use configured verified-record counts. Stamps recognise seven passport themes. No formal employment or Human Values rating is created.
- Collective service/kindness/story goals with school-configured verification and consent; this release supplies the verified-page goal and aggregate activity count.
- Puzzle-authoring image selection currently uses approved bundled school assets under `/assets/`; an image-library picker and newly uploaded puzzle media are a later integration. Creative uploads already use controlled private Storage.
- Native Workspace Picker/OAuth/Docs creation/Sheets sync/controlled legacy import, described above.
- Reporting pagination/materialised snapshots beyond 1,000 rows, expanded official NILAM counting policies, and production deployment/configuration. This change has not been deployed to production.
