# SRSS header video treatment

The supplied Hailuo clips are integrated into existing pages through `src/components/HeroVideo.jsx`:

| Source clip ID | Placement | Subject |
| --- | --- | --- |
| 555093935726632960 | Homepage Silver Jubilee band, below Our People | Pupils gathered for assembly |
| 555096310273126401 | Student Life header | Malaysian flag raising |
| 555115340165939202 | Silver Jubilee header | School flag raising |

The logo reveal `SRSS25_closure_03.mov` is excluded. Headers use quiet, silent loops; no soundtrack autoplays. These are illustrative scenes, without claims about actual pupils, event dates or recorded school activities. The user authorised using the three clips as site headers on 14 October 2026.

## Media preparation

Original files remain unchanged at the supplied paths. `public/assets/video/manifest.json` records source filenames/SHA-256 hashes and derived media. Each clip is trimmed gently, interpolated with motion compensation, slowed to approximately 64.5% speed, resampled to 30 fps and joined back to its opening with a 1.2-second dissolve. Loops last approximately 16.87, 16.87 and 20.17 seconds. H.264 MP4 files use fast-start metadata and contain no audio stream. Desktop files are 1280 × 732; phone files are 640 × 366. Actual encoded byte sizes are recorded in the manifest. Posters are extracted from the prepared opening frame.

Regenerate using trusted local FFmpeg:

```sh
python3 scripts/prepare-hero-videos.py --ffmpeg /path/to/ffmpeg '/path/to/assembly.mp4' '/path/to/malaysian-flag.mp4' '/path/to/school-flag.mp4'
```

Encoding happens in a temporary directory and derivatives replace their destination atomically, avoiding overwrite errors in a synced workspace. This tool does not upload source footage.

## Playback and layout

The homepage Jubilee loop starts automatically while at least 10% of its media area and the browser tab are visible, gated by reduced-motion, data-saving and slow-connection preferences. It plays muted and inline at 0.65× the already slowed source (approximately 42% of original speed). Pause remains available and persists when scrolling away and back. Other page-header clips start paused with their poster visible and use visitor-started playback at 0.8× (approximately 51.6% of original speed). All placements use `preload="none"`, pause offscreen or in a hidden browser tab, and retain a still poster on media error. Phone sources are selected at 620 px and below.

The homepage opens with a genuinely transparent teacher/pupil picture and recognisable school sketch on navy. The assembly loop belongs in the later Silver Jubilee band, enlarged and blended into its navy background without a bordered card. This follows the user's feedback that the opening hero should be calm while the lower celebration section can play a slow scene as it enters view. Current evidence is in `OUTCOMES-AND-JUBILEE-VALIDATION.md`. The full desktop navigation changes to its existing drawer below 1400 px to prevent overflow on laptops.

## Earlier video verification

The checks below describe the initial video integration. The updated photo, disclosure and visitor-started treatment is documented in `HOME-POLISH-VALIDATION.md`.

- Homepage widths 320, 390, 620, 768, 900, 1024, 1280 and 1440 px: document width equals viewport width. Up to 900 px the video begins after the copy. The 640 px source is selected at phone widths.
- Student Life and Silver Jubilee checked at 320 px and 1440 px with their respective flag clips. Phone media stays within the page and has a 240 px minimum displayed height.
- Browser playback, muted state, Pause, Play and offscreen suspension verified through visible controls and media properties. Phone page-header controls stay on the left, clear of the floating quick-actions button.
- Reduced-motion/data-saving gates inspected in the shared component; no operating-system preference was changed for testing.
- All six final MP4 variants decode cleanly. Source and built video/poster/manifest SHA-256 hashes match.
- `npm test`: 48 passed. `npm run build`: passed; public application 142.8 / 150 KiB gzip, authenticated core 192.3 / 200 KiB gzip. Source whitespace check passed.
- Local preview only; production deployment is pending.
