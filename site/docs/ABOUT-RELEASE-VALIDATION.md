# About and public-site validation — 17 October 2026

The final school brief is implemented: Principal welcome without a years statistic; 60/40 welcome cards; full-width framework dropdown; three navy statement cards; Mission's Head/Heart/Hands panels with eleven commitments distributed 6/2/3; the shared values artwork with unique instance IDs; four FAQ tabs and seventeen FAQPage entries; supplied community quotations; and the closing invitation. The prospectus remains unavailable until its PDF is supplied.

## Checks

- 61 unit tests passed, including commitment uniqueness and all six testimonial audiences.
- 81 Firestore/Storage emulator tests passed, including publication gating, sanitized public copies, withdrawal, expiry, audience matching and retry-safe notification creation.
- Production build passed: public application 146.4 KiB gzip (150 KiB budget), authenticated shared core 193.4 KiB (200 KiB budget).
- Independent read-only review found no remaining important issues after fixing lazy About anchor scrolling and readiness.
- Browser: direct Principal anchor aligns below the measured header; framework spans the welcome grid and contains eleven commitments; the full 2027/2002 welcome expands in place; desktop Mission panels are equal width; both flowers can be mounted without duplicate IDs; FAQ allows one open answer; visit actions open the existing form.
- At 320 px there is no horizontal overflow. Mission becomes stacked accordions. The Peace petal shows the supplied explanation. Parents displays Ms Gauri's supplied quote.
- At 390 px the first-visit cookie sheet has a 12 px gap below the floating quick-link control. Saved choices suppress the prompt on reload. No analytics tracker was added; the row reads Not in use. Existing media and hub-memory choices remain optional.

## Announcement recovery

The announcement backend and rules were deployed to `srssdigitalhub`. The explicitly approved recovery of “School Closure on the 16th of October 2026” created five notification records and a sanitized published public copy. The recovery reported exactly five new notifications and five total.
