# Homepage sequence and cookie preferences — 15 October 2026

Implemented locally in the existing website. No deployment or new public route was created.

## Result

- Small moments uses the nine supplied documentary images first, in three consistent 3:2 frames on desktop, two on tablets and one on phones. Native swipe, keyboard, previous/next and manual pause remain available. Auto-advance pauses on hover/focus, when outside the viewport and when the browser tab is hidden; reduced motion disables it. There are no visible generic captions or blurred side fillers. Student Life Gallery retains the previous collection after the new pictures.
- A spacious white founder callout follows the gallery, with metallic gold lettering for the exact requested short quote, the supplied orange-robed illustration, attribution and Principal welcome link. No title or Principal portrait is shown here.
- Stories & Happenings contains the prominent SRSS25 invitation, blended local assembly film, reporting and its calendar. The separate homepage calendar and Our People segments have been removed. Begin the journey and the five-role router follow, with a compact contact disclosure; the collapsed FAQ is the final main section.
- A first-visit Cookie preferences dialog offers necessary-only, all optional and individually saved choices. Optional Maps/YouTube embeds and remembered hub storage start off. A non-identifying record expires after 180 days; both footers reopen preferences. Sign-in and necessary operational storage remain available. Schedule A of the existing Cookies Policy reflects the code.

## Verification

- `npm test`: 50 passed, zero failed.
- `npm run build`: passed; public application 147.1 KiB gzip / 150 KiB budget, authenticated shared core 192.4 KiB / 200 KiB.
- Ten source originals match their recorded SHA-256 hashes; every responsive export exists. No enlargement or reconstructed detail was introduced.
- Real browser: first-encounter dialog, necessary-only choice persisted across reload, individual media opt-in, map loaded after approval, immediate map removal on withdrawal.
- Isolated production preview: modal makes the application root inert; a recording opens preferences while YouTube remains unloaded, then requires a deliberate play click after permission; withdrawal removes its iframe. The same preferences reopen from the Hub sign-in footer. No console errors in the production preview.
- Carousel: nine supplied photos, no figcaptions; paused navigation advanced from 03 to 04 with one click and reversed one step correctly. Images fit consistent frames.
- Integrated calendar opens its month view and returns to the list. Final FAQ opens, reveals five question controls and expands an individual answer.
- 320-pixel local phone check: document width 320, gallery/quote/news frame widths 284 and no overflowing main section. Desktop checked at 1414 and the production preview’s default 1280. The browser’s viewport control did not apply to the isolated background tab; production screenshots retain its actual 1280-pixel viewport.

## Evidence

See `home-sequence-evidence/`: verified `gallery-desktop.png`, `quote-desktop.png`, `news-desktop.png`, `cookie-desktop.png`, `cookie-production-desktop.png`, and `news-phone-320.png`. The phone screenshot shows News & Events, not the founder quote. Existing browser tabs were preserved; the temporary production test tab was closed and viewport overrides reset.
