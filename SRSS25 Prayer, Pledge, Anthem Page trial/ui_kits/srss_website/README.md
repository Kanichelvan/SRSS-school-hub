# UI kit — SRSS website

A click-through recreation of the Sekolah Rendah Sathya Sai public site, built
entirely from the design system's own components.

## Source of truth
No codebase or Figma file was supplied. This kit was reconstructed from the two
rendered reference captures the brand owner provided:

- `assets/reference-homepage.png` — homepage above and below the fold
  (masthead, updates ticker, hero, three-pillar band, photo triptych, audience router)
- `assets/reference-hero-character.png` — "The End of Education is **Character**" hero

Those captures are the ONLY evidence of the real layout; anything not visible in
them (admissions form, jubilee timeline, story index) is composed from the same
vocabulary rather than copied, and is flagged as such in the root readme.

## Screens
| File | Screen | Notes |
|---|---|---|
| `HomeScreen.jsx` | Home | Closest to the reference capture: hero with right-hand photo + navy scrim, pillar row, photo triptych, audience router, jubilee band, closing quote |
| `ValuesScreen.jsx` | Values | The five Human Values with crest-colour rails; filterable |
| `JubileeScreen.jsx` | Silver Jubilee | SRSS25 emblem, silver-foil headline, 25-year timeline |
| `AdmissionsScreen.jsx` | Admissions & Visits | Three-step process plus a working visit-request form |
| `StoriesScreen.jsx` | Community · Stories | Tag-filtered story index with staff interviews |
| `SongsPrayersScreen.jsx` | Resources · Songs, Pledge & Prayers | Assembly order rail, a working 2-minute silent-sitting timer, Negaraku with an embedded recording, the SRSS anthem with a Bahasa/English toggle, Rukun Negara in value colours, the five-value pledge, and the four prayers as a tabbed reader. Also served standalone as `songs-and-prayers.html`. All text supplied verbatim by the school; the anthem's English text is an unofficial reading for meaning only |

`Shell.jsx` provides the rotating `UpdatesTicker`, `SiteHeader`, `SiteFooter`
and the shared `Band` section wrapper.

## Running it
Open `index.html`. Nav items route as: About → Home, Values → Values,
Learning/School Life/Community → Stories, the masthead CTA → Admissions, and the
homepage jubilee band → Silver Jubilee.
