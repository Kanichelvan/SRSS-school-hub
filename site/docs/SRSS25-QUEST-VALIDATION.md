# SRSS Quest verification — 14 October 2026

## Final checks

| Check | Result |
| --- | --- |
| `npm test` | 48 passed, 0 failed |
| `npm run test:quest` | 12 passed, 0 failed; real Auth/Firestore/Functions/Storage emulators |
| Full `tests/rules/*.test.mjs` suite | 64 passed, 0 failed; isolated `demo-srss-tests` project with Firestore/Storage |
| `npm run test:e2e` | 26 passed, 0 failed; signed-in school and Quest journeys on isolated ports |
| `npm run build` | Passed, including both bundle budgets |
| Public application bundle | 141.7 KiB gzip / 150 KiB budget |
| Authenticated shared core | 192.3 KiB gzip / 200 KiB budget |
| `git diff --check` | Passed |

The full rules suite was run with `firebase.quest-test.json` on isolated ports, using `emulators:exec --only firestore,storage` and project `demo-srss-tests`. This avoids conflicts with another local emulator instance. Java 21 was used. Functions tests used the installed Node 24 runtime; production is configured for Node 22 and has not been deployed or validated against a production instance. Vite retains its existing large-chunk advisory; the enforced gzip budgets pass.

The twelve Quest checks cover:

1. Admin creates questions, badge and campaign, approves/publishes; student starts, saves/resumes and obtains a validated result and badge.
2. Concurrent/repeated submissions and replays cannot duplicate rewards.
3. Staff/class/audience targeting, future releases and unauthorised publication are enforced on the server.
4. Creative work is returned/revised/accepted by an assigned teacher; Human Excellence points remain zero; portfolio selection remains internal.
5. NILAM drafts, parent assistance, verification, duplicate rejection, verified-only totals and configured school milestones persist. The review queue returns authorised SIS names; another class's teacher receives no records.
6. Class leaderboard uses points per active enrolled pupil, filters timestamps correctly and excludes staff. Individual rankings default off. Direct answer-key/score/badge/verified-record access is refused.
7. Publisher corrections require a reason, remain auditable and are idempotent. Values/service categories also reject competitive points corrections.
8. Client time cannot bypass server timers or attempt limits.
9. All eight additional auto-graded puzzle formats (alongside the Stage A MCQ test) create, save/resume nested answers and submit through the same callable. Keys are absent from player responses.
10. Direct authoritative collection writes and answer-key reads are denied, including publisher SDK access; technical administrators cannot bypass engagement settings permissions.
11. Private creative files can be uploaded/read by their owner and read by assigned reviewers; strangers and parents are refused; submitted files cannot be replaced.
12. Archived releases retain the owner’s private results and achievements while refusing new gameplay.

## Browser verification

Using only fictional local school accounts:

- Student completed a quiz, saved progress, reloaded, resumed the selected answer and submitted. The result showed 100%, 20 Quest points, SRSS Explorer and the Discover passport stamp. The consolidated journey retained the separate reading-demo completion and Read stamp.
- Admin created “Browser check · fictional discovery”, configured explanation, badge and passport stamp, saved a draft, submitted for approval, approved and scheduled the release. The persisted challenge appeared in the release calendar.
- Staff Quest displayed only the staff release, optional-participation wording and the private passport link.
- Student submitted “The imaginary garden” from a saved NILAM draft. Its provisional count was one; verified count/pages remained zero.
- The assigned Standard 4 teacher verified it with feedback. The teacher history displayed the SIS pupil name/class, one verified record and 24 verified pages.
- The linked parent saw one verified record, 24 pages, the school-configured first-reading milestone, the reflection/teacher feedback and the child's Quest achievements. Verification time displayed in Asia/Kuala_Lumpur. The parent's other child remained a separate selection.
- Student Quest was inspected at 466 px and 1280 px. Document width matched the viewport at both sizes; no horizontal page overflow. The temporary viewport override was reset. No browser console errors were present in the final parent-view check.

## Evidence

- [Student Quest desktop](quest-evidence/student-quest-desktop.jpg)
- [Student passport](quest-evidence/student-passport-mobile.jpg)
- [Admin release calendar](quest-evidence/admin-release-calendar.jpg)
- [Linked parent verified reading](quest-evidence/parent-reading-verified.jpg)

These screenshots show fictional development records, not real pupils or production achievements. The implementation scope, collection contract, scoring rules, permissions, Workspace link capabilities and remaining extensions are in [SRSS25-QUEST.md](SRSS25-QUEST.md).
