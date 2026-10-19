# About SRSS page network — 19 October 2026

The school’s 19 October brief replaces the long About experience with a directory and seven focused pages. The landing hero wording and photography remain. Existing Story, Vision & Mission, Educare and Leadership URLs remain stable; Human Excellence, Why SRSS and Our Educators have dedicated About URLs. Hosting permanently redirects `/join/why-srss` to `/about/why-srss`.

## Verification

- `npm test`: 65 passed, no failures. Four network tests cover unique pages, breadcrumbs, editing, Hosting redirects and legacy bookmarks.
- `npm run build`: passed. Public application 147.3 KiB gzip / 150 KiB budget; authenticated core 193.4 / 200 KiB.
- Independent read-only review: no remaining blocker. Fixed preservation of CMS title/intro/hero in append mode and migration of former Educare bookmarks.
- Browser checks at 1440×1000 and 390×844: About plus all seven pages render one main landmark and a visible heading, with zero horizontal overflow. No broken loaded images in phone checks; no console errors in interactive checks.
- Exercised Story identity selection; desktop Head/Heart/Hands content and photograph changes; mobile disclosure; values flower selection; mobile About menu; Principal welcome expansion with full 2027 greeting and retained original message; shared visit booking dialog without submitting a form.
- Browser verified `/about#mission`, old Educare `#five-values`, and former Join Why SRSS resolve to their current destinations.
- Motion is optional: existing intersection reveals and native disclosures work with reduced-motion CSS; gallery advances only on visitor input. No automatic slideshow or new external media added.

## Content boundaries

School-published additions retain title, intro, hero and body content. Append pages show their built-in content immediately while published additions load. Principal and academic leadership profiles reuse supplied school records; further portraits, qualifications and teacher statements await school publication. No historical photograph was supplied for 2002: the Story photo is explicitly captioned as the school community today. The six-year growth example is explicitly fictional and contains no pupil records. The existing prospectus remains unavailable; no download was invented.

Only frontend and Hosting configuration change. No database writes, notification replay, rules or Functions deployment are required.
