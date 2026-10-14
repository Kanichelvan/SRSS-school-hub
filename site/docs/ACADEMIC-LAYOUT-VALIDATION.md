# Academic and co-curricular layout — 15 October 2026

The Learning Experience theme tabs have been replaced with `AcademicOverview`: academic copy on the left, the existing microscope photograph on the right, and an open information strip below. The following `ActiveBodies` section places the existing football photograph on the left and co-curricular copy on the right. Both components are shared by the homepage and Learning page; the Values Garden remains separate.

The content follows the school's supplied details:

- Standard 1 uses KP2027 from 2027: Alam dan Manusia, Mathematics, Malay and English.
- Standards 2–6 use KSSR, with core/non-core classifications and History specified for Standards 4–6.
- The six Standard names are Prema, Sathya, Dharma, Shanti, Ahimsa and Ananda.
- All cohorts start at 7.40 am Monday–Friday. Finishing times distinguish Standard 1's Wednesday 12.30 pm from Standards 2–6's 1.00 pm, with the other supplied times retained.
- Tamil, Chinese, Telugu, SSEHV and ICT appear in Beyond the core. Occasional weekend enrichment is noted.
- Language copy describes DLP English teaching and Bahasa Malaysia terminology, consistent with the existing medium-of-instruction FAQ.
- The school confirmed boys' and girls' state football titles “last year”; the copy uses 2025 relative to the client's 15 October 2026 date. Chess participation is described without inventing a placing or award.

The older contact summary now links to the cohort timetable from a 7.40 am school start. The anniversary summary refers to the national curriculum, avoiding a blanket KSSR label for all six Standards. Default curriculum and subjects FAQs reflect the new school-provided content; no remote CMS records were changed.

Verification:

- Academic photograph is right of its copy at desktop widths; football photograph is left of its copy. ActiveBodies immediately follows AcademicOverview on the homepage.
- At 320 pixels the timetable fits its 276-pixel content column without horizontal scrolling. At 900 pixels the academic layout stacks, with a two-column essentials strip; at 1024 and 1414 pixels the main layout uses two columns. No page overflow was observed at these widths.
- All six Standard names and four timetable rows match the supplied data. The timetable uses a caption and row/column headers.
- `/learning/curriculum` opens the shared academic overview; `/learning/enrichment` targets `#active-bodies`. The Learning page has one academic overview, one sports section, one Values Garden and no former Learning tabs.
- `npm test`: all 48 tests pass. Production build and public/shared-core bundle budgets pass. `git diff --check` passes.

Previews are in `academic-layout-evidence/`: `academics-desktop.png`, `active-bodies-desktop.png`, and `timetable-mobile.png`. These changes are local and uncommitted.
