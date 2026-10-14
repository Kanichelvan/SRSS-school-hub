One-line: the SRSS masthead — crest lockup left, nav right, search + Parent Hub + gold-outlined "Admissions & Visits".

```jsx
<SiteHeader active="Values" crestSrc="assets/logo-srss-crest.png"
  onNavigate={setSection} />
```

Always on `--navy-800`, 104px tall (76 with `compact`). The active item carries a 2px gold underline. Put `UpdatesTicker` directly above it. The only gold-outlined button on the page lives here.

The bar never wraps. Past **five** nav items it switches itself to a dense mode — 48px crest, `lockup="name"` (tagline dropped), 15px nav, 16px gaps and the short `denseCtaLabel` ("Admissions") — so the lockup cannot spill over the ticker and the 32px gutter survives at 1280px. Pass `compact` to force that mode at any nav count.
