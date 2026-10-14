# Five outcomes and blended Jubilee video — 15 October 2026

The welcome callout is followed by five file-shaped tabs in the SRSS25 red, blue, purple, green and orange palette. `OutcomeTabs.jsx` replaces the two overlapping homepage disclosures. One explanation appears at a time: Academic Excellence, Character Development, Civic Stewardship (including altruistic responsibility), Holistic Empowerment (Head, Heart & Hands) and Human Values (all five values). Academic Excellence is selected initially. The tabs sit below the callout, support Left/Right/Home/End keys, and scroll horizontally within their own tray on phones.

The detailed school sketch remains behind the people, with slightly stronger visibility: 25% on desktop and 18% on phone/tablet. Original artwork and foreground people remain unchanged.

The homepage Silver Jubilee video is now a large scene blended directly into the navy section. There is no bordered video card. The media spans the section, fading to solid navy by 76% of its desktop width; phones use a vertical fade. Controls and the illustrative-scene label remain above the blend. The school motto is in the text area.

The Jubilee loop starts muted while at least 10% of the media area and the browser tab are visible. Runtime rate is 0.65× the already slowed source, approximately 42% of original speed. It pauses offscreen and in a hidden browser tab. A visitor's manual Pause persists when scrolling away and back. Reduced-motion, data-saving and slow-connection gates remain in the shared player; explicit Play remains available. Student Life and SRSS25 flag clips retain visitor-started playback.

## Verification

- Clicked all five outcomes and checked the matching heading and explanation. Human Values includes Truth, Right Conduct, Peace, Love and Nonviolence. Home/End navigation selects and focuses the corresponding tab.
- Phone taps and keyboard selection verified after refreshing the development preview. The selected tab and explanation match; colours are loaded. The horizontal tray scrolls without widening the page.
- Widths 320, 390, 620, 768, 900, 1024 and 1414 px: document width equals viewport width. Outcome tabs stay below the callout. The video spans the section on phones.
- Actual muted playback at 0.65 verified with desktop and phone sources. Offscreen pause, visible resume and persistent manual pause verified in the browser. Preference gates inspected; no system settings were changed.
- All 48 existing tests pass. Production build and public/shared-core bundle budgets pass. Source whitespace check passes.
- Evidence: `outcome-tabs-evidence/outcomes-desktop.png`, `outcomes-mobile.png`, `jubilee-blended-desktop.png`, `jubilee-blended-mobile.png` and `hero-recognisable-building.png`.

Local preview only; these refinements have not been committed or deployed.
