# Mobile and hub release verification — 14 October 2026

The public ticker and navigation share a sticky header. A ResizeObserver measures its height for anchor and secondary sticky offsets. The homepage hero uses normal-flow copy and photography at widths up to 900 px, preserving the people in the photograph. Gold foil and purple metallic accents use shared CSS tokens; the main navigation and hero remain navy.

## Browser evidence

- Homepage checked at 320, 375, 390, 430, 768, 900, 1024 and 1440 px; document width equals viewport width at each size. Mobile copy ends before the photograph begins.
- About, Learning, Student Life, Admissions, Silver Jubilee, FAQ and Privacy checked at 320 px; no horizontal document overflow or console errors observed.
- At 320 × 640 px, the expanded mobile drawer scrolls within its body. The visit dialog stays inside the viewport and scrolls to its remaining fields and actions.
- Sticky header remains at viewport top after scrolling. Subnavigation and editorial sticky panels use the measured header offset.
- Screenshot: `quest-evidence/mobile-homepage-fixed.jpg` (390 × 1000 px).

## Release review repairs

Offline attendance writes now wait for each preceding server acknowledgement. Rejection of a pupil batch prevents the final register submission; four asynchronous regression tests cover pending, rejection and success paths. The Attendance Manager has explicit SIS and attendance reads, with negative tests for confidential learning records. Attendance code/status pairs and late minutes are validated coherently by the rules. Office late sign-ins validate the same permitted range before writing. The role is eligible for optional staff quests.

## Verification

`npm test`: 48 passed. Full isolated Firestore/Storage rules suite: 64 passed. `npm run test:e2e`: 26 passed, including ten Quest workflow tests. `npm run test:quest`: 12 passed earlier in this release verification; its two rule tests are also included in the final full rules run. Build and both enforced bundle budgets passed (public 141.7 / 150 KiB gzip; authenticated core 192.3 / 200 KiB). `git diff --check` passed.

Tests use Java 21 and installed Node 24. Functions production configuration remains Node 22. Verification uses fictional local data. Production deployment is outside this commit/push/merge request.
