# Assembly polish and registered-user workflows — 16 October 2026

## Implemented locally

The assembly page now uses one consistent serif reading hierarchy across prayers, national anthem, school anthem, Rukun Negara and school pledge. Body text has no first-line or isolated-word colour highlights. Gold foil remains on First Bell; vibrant petal gradients remain on selected controls and small principle markers. Collective prayer wording and official lyrics are preserved. The pledge reads in a single column; prayer tabs support arrows, Home and End.

Registered users have role-specific welcome packs with saved progress, printable quick-start and contact guides, and a recorded follow-up date. Parents can save communication needs and an optional private story. Checklists never substitute for consent or staff acknowledgements.

Teacher development uses five evidence domains, beginning/mid/end-year stages and three descriptive bands. Only leadership assesses; teachers can read their own review and write their own reflection. The ordinary office role cannot read appraisals. No numerical virtue scoring, automated appraisal or ranking is introduced.

Downloads / Forms contains ten reusable activity templates, private append-only submissions, printable forms and existing requested school forms. Medical details stay outside class feeds; safeguarding leads can read incident submissions. Office-managed downloads support governed document links and audience classification.

Teacher planning is connected to the class dashboard. Portfolio evidence supports private photo/PDF/audio/MP4 uploads (under 15 MB), subject/value/achievement views and class activity entries for selected pupils or a whole class. Batch writes use groups of eight and keep stable entry IDs for retries. File reads follow the actual portfolio entry's visibility; no public download token is stored. Existing showcase moderation and consent remain required.

Shared communication adds private school conversations, explicit notice acknowledgements, a monthly calendar with audience/type filters and escaped, UTF-8-folded ICS downloads. Messages are sent only by the person using the composer; nothing in this implementation sends external email or SMS automatically.

Subject results and report cards support preparation, academic review and publication. Families see published/locked records only. Admissions adds family applications, private supporting uploads, human-recorded merit-list positions, staff review, offers and applicant-only acceptance. Existing enrolment handles accepted applications. No automatic admissions decisions, grading thresholds, official transcripts or promotion criteria are invented.

## Validation

- Unit suite: 55 tests passed on the final source.
- Vite production compilation passed. Static public asset copying was omitted for verification because the default build stalled reading an unchanged iCloud photo. No public image was edited in this task.
- Bundle limits passed: public application 148.0 KiB gzip / 150; authenticated shared core 193.4 KiB / 200.
- An earlier full security suite passed 75 tests. The final additions include tests for first-use welcome records, own-child forms, review isolation, plan ownership, message participants, published academic records, offer acceptance, private selection notes, requested-form immutability and entry-bound media.
- A repeat full emulator run encountered a local emulator/process failure; do not describe that repeat as a passing run. Final targeted acceptance results are recorded below when complete.
- Browser: verified uniform prayer text at 1280 px with no horizontal overflow; closing collective wording and Home-key prayer selection; fictional parent login; first-use welcome rendering and saving; opening and submitting an activity form with participation declined; submitted item appeared in the parent's list.
- The first-use welcome read rule was repaired after browser testing. Reading one's own not-yet-created progress document is permitted without allowing another person's record.
- A temporary phone viewport override did not change the background renderer's measured 1280 px width and was reset. This is not a verified mobile browser pass.
- The browser proof is `assembly-community-evidence/prayer-desktop.png`.

## Release requirements

These changes are uncommitted and undeployed. Deployment must include Hosting, Firestore rules and indexes, Storage rules and Functions (new audit triggers). Deploying Hosting alone leaves new data flows unavailable. Use the explicit SRSS production project and approved deployment account; never the demo default alias. Private browser downloads require the deployed bucket's CORS configuration to permit the actual website origin; verify this in production before enabling file uploads for families.

The school must supply its actual onboarding dates/mentors, approved grading language, admissions selection criteria and actual review evidence. No welcome messages, offers or acceptance records were sent to real families during verification. All write tests used fictional local emulator data.

### Final acceptance result

The clean matching-project emulator run completed successfully: **16/16 targeted security and storage tests passed**, including the final first-use, requested-form, selection-note and media-visibility rules. The final unit run passed **55/55** tests. Production compilation and both bundle checks passed on the final implementation. The earlier mixed-project preview test failures were emulator failures; they are not counted as successful checks. Runtime browser checks cover the family paths listed above, not every new role screen.
