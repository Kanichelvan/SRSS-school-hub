# Floating quick links — 15 October 2026

The public website's quick-actions button now opens a vertical stack of metallic circular icons with individual translucent labels. Four links enter the existing Parent, Student, Teacher and Administration Hub routes; their existing authentication and access checks apply. Learning, News & Events, Arrange a visit and Contact complete the stack. The visit button opens the existing form.

Browser checks passed:

- Tap to open, second tap to close, outside tap to close.
- Keyboard opening focuses the first link; Tab advances to Student Hub; Escape closes and restores focus to the toggle.
- The visit shortcut opens the existing labelled visit dialog.
- At 320 × 568, the stack scrolls and stays below the sticky header, with no horizontal page overflow.
- At 390 × 844 and 1414 × 900, the stack fits and the page has no horizontal overflow.
- All seven link destinations match existing routes. Hub access was not changed.

`npm run build` passes, including the public and authenticated shared-core bundle budgets. `git diff --check` passes. Reduced-motion styling suppresses entrance animations and transitions. No production deployment or Git commit was performed for this change.

Screenshots: `quick-actions-evidence/mobile.png` and `quick-actions-evidence/desktop.png`.
