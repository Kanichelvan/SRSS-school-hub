# Public landing branding — 16 October 2026

Shared `landing-brand.css` brings PageHero (Learning, Student Life, Join, Admissions, Resources, Governance and managed content), Our People, FAQ, Jubilee and the assembly hero into the same navy tonal family. Typography, spacing and gold foil rules are consistent. Existing About and homepage art direction is retained. Legal page headings receive a small gold rule while retaining their document layout.

Cutouts retain natural alpha edges with a softened lower edge. Rectangular photos and video posters/frames receive intersecting horizontal/vertical edge masks; playback controls are not masked. Original files are unchanged. Videos retain their existing playback and reduced-motion behavior.

Verified at 1280px in the live browser: Learning, Student Life, Our People, Admissions, Jubilee, Resources, FAQ, assembly and Educare. Checked each for horizontal overflow; none found. Screenshot evidence in `landing-brand-evidence/`. Browser console has no errors. Phone layouts stack at 900px and use smaller headings at 540px, but phone rendering has not been visually verified in this pass.

Production source build passed (public directory recopy disabled because of existing iCloud asset-read stalls). Public JS 148.0 KiB gzip / 150 budget; shared hub 193.4 / 200. Vite reports the existing advisory about chunks above 500 kB uncompressed.

Local and uncommitted; not deployed.
