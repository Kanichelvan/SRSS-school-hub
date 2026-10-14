# Petal interaction colours — 15 October 2026

The five outcome file tabs keep saturated red, blue, purple, green and orange fills in every state. Selecting a tab adds a soft reflective accent to that tab alone. Selecting another transfers the accent; scrolling clears it without changing the selected explanation or keyboard tab semantics. Hover adds the same light sheen on devices that support hover.

The “I am a…” links use these metallic hover, focus-visible and pressed states:

| Role | Colour | Text |
| --- | --- | --- |
| Parent | Logo blue | White |
| Student | Existing purple metallic gradient | White |
| Teacher | Logo orange | Navy |
| Staff | Logo green | White |
| Prospective family | Inter-petal yellow | Navy |

Browser verification:

- Selecting Character Development and then Academic Excellence leaves only the current tab with decorative emphasis.
- Scrolling clears emphasis while keeping Academic Excellence selected and its explanation open.
- All five outcome tabs have full opacity and no dimming filter.
- Each role's keyboard focus state uses the assigned metallic gradient, readable labels and a visible focus outline. Hover and pressed states share the same styles.
- Desktop 1414 × 900 and phone 320 × 700 have no horizontal page overflow; phone role tiles preserve their stacked layout.
- Reduced-motion CSS suppresses tab sheen and role transitions. Hub destinations and authentication are unchanged.

Production build and both bundle budgets pass. Evidence lives in `petal-interaction-evidence/`. Changes are local and uncommitted.
