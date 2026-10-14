# Homepage and header refinement — 14 October 2026

The opening homepage now uses a transparent teacher/pupil picture on a subtle navy gradient. The supplied school-building sketch is softly blended behind the people. The assembly video moved to the later Silver Jubilee band. All three supplied clips remain integrated; they open as still posters and play only when chosen. Playback is muted at 0.8× the already slowed files, approximately 51.6% of original speed. The logo-reveal clip remains excluded.

## Pictures and layout

`HeroPhoto` uses real asset alpha with natural hair/fabric edges and responsive WebP exports. No CSS image mask is used for these pictures. The homepage keeps content-height copy followed by normal-flow media at widths up to 900 px. Desktop media sits beside the copy. The book and all four subjects remain in frame. Page headers use the science lesson or pupil group, and the Sathya Sai Education header uses a transparent illustration. Custom administrator-selected About imagery is preserved.

Original assets are unchanged. Full transparent PNGs, 640/960/large WebPs, source hashes, dimensions, classification and derivative status are catalogued in `public/assets/photos/hero/manifest.json`. The exact built-in imagegen prompts are in `HERO-PHOTO-PROMPTS.json`. The founder treatment is an adapted illustration, not a documentary photograph. These derivatives are for local review; publication approval is pending.

## Information and motion

- The homepage opening message synthesises going beyond grades, values, character and Head, Heart & Hands in one concise paragraph. The Head, Heart & Hands disclosure is below the hero in the welcome section.
- The four educational promises appear when their disclosure is opened.
- Learning themes use restrained purple metallic segmented tabs with gold detail. Left/Right/Home/End keys select and focus a tab; the panel is labelled by the selected tab.
- Warm ivory reading surfaces, the existing metallic gold actions and small anniversary artwork retain the SRSS palette.
- Soft image arrival, panel fades and disclosure unfolding accompany interactions. Native disclosure height animation is progressively enhanced where supported; native disclosures remain usable elsewhere. Reduced-motion rules remove these animations and transitions.
- The existing FAQ, news and calendar progressive controls remain available. Navigation and announcement ticker remain sticky together.

## Verification

- Homepage at 320, 390, 620, 768, 900, 1024, 1280 and 1440 px: document width equals viewport width. At phone/tablet widths the photo starts after the copy; no video remains in the opening hero.
- Both homepage disclosures opened/closed successfully. At 320 px, expanded explanations and all four promises fit without horizontal overflow. Native height interpolation returned to 0 px on close.
- Learning theme click and ArrowRight selection/focus verified through visible controls and panel text.
- About, Admissions, Sathya Sai Education, Student Life and Silver Jubilee checked at 320 and 1440 px; no horizontal overflow. Learning and Join photo headers also checked on desktop and phone layouts.
- All video placements were paused on initial page entry. Homepage assembly Play/Pause verified on desktop and phone; the phone selected its mobile file. Runtime playback rate was 0.8 and muted state was true.
- `npm test`: 48 passed. Production build and bundle budgets passed: public application 143.3/150 KiB gzip; authenticated shared core 192.3/200 KiB gzip. Source whitespace check passed.
- Evidence: `home-polish-evidence/home-desktop.png`, `home-mobile.png` and `jubilee-video.png`.

Local preview is available at `http://127.0.0.1:5173/`. This refinement has not been committed or deployed.

## School sketch follow-up — 15 October 2026

The user's original sketch is preserved byte-for-byte in `public/assets/heritage/originals/`. The built-in imagegen adaptation has real transparency, soft edges and a quiet blue treatment; its exact prompt is saved in `SCHOOL-SKETCH-PROMPT.json`. `public/assets/heritage/manifest.json` records source provenance, hashes and responsive exports. Decorative architecture is hidden from assistive technology and cannot receive pointer input. Web usage selects 640/960 px derivatives at low fetch priority; the larger derivative is retained.

Thirty-one decorative ArrowRight icons were removed from public primary/text action buttons, including the prefooter. JSX inspection confirms none remain in these styled buttons. Link destinations and button handlers are unchanged.

The homepage was checked at 320, 390, 620, 768, 900, 1024 and 1414 px without horizontal overflow. There is no disclosure inside the hero. The moved Head, Heart & Hands disclosure opens and closes correctly; its three columns become one on phones. Built heritage exports match source bytes. All 48 tests and the production build pass; both bundle budgets remain within limits.

Current proof: `home-polish-evidence/hero-sketch-desktop.png` and `hero-sketch-mobile.png`.

## Detailed building backdrop — 15 October 2026

The reattached school sketch now uses a more faithful, detailed alpha adaptation, `hero-school-sketch-v2`. Actual native output is 1536 × 1024, with 640/960/1536 px WebP derivatives and the full PNG preserved. The building retains its recognisable tower, facade, rooflines, palms and entrance instead of the earlier indistinct atmospheric treatment. Opacity is restrained to 18% on desktop and 14% on phone/tablet layouts. The layer remains behind the foreground people; copy stays above both layers. A failed decorative-image load hides the background layer without showing a placeholder.

The original reattached file and its hash are recorded under `current_version` in `public/assets/heritage/manifest.json`. The exact built-in imagegen prompt is in `SCHOOL-SKETCH-HD-PROMPT.json`.

Browser verification at 320, 390, 768, 900, 1280 and 1414 px: no horizontal overflow; mobile photo starts after the copy; background loads and remains behind the people. The production build and both bundle budgets pass. All three built backdrop variants match source bytes. Current evidence is `home-polish-evidence/hero-building-hd-desktop.png` and `hero-building-hd-mobile.png`. This update remains local and uncommitted.
