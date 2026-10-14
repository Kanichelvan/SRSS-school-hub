# Two-step cookie prompt — 15 October 2026

The first encounter now uses a non-modal bottom-left card: 440 × 301 px at the production preview's 1280 × 720 viewport, without a backdrop, page scroll lock or inert application root. Accept and Decline save immediately; Manage preferences opens the detailed panel. At phone widths the first card fits within 12 px side margins and uses scrollable height limits.

The second step is 480 × 536 px at that viewport, with essential services always on, real optional hub-memory and external-media switches, Accept, Decline, Save preferences and a close icon. Only this panel locks background focus. Footer and blocked-media links open the detailed step directly. Closing an unanswered prompt saves necessary-only; closing a previously saved preference editor preserves the existing choices.

Verification: production build passed (public 148.0 KiB gzip / 150 KiB; shared authenticated core 192.4 KiB / 200 KiB); all 50 unit tests passed. Real browser checks confirmed first prompt was non-modal, Manage activated modal focus isolation, first close survived reload with optional embeds absent, individual media permission loaded a map, and Decline removed it immediately. No production console errors. Temporary preview tab closed; original user tabs preserved.

Screenshots: `compact-cookie-evidence/first-prompt.png`, `compact-cookie-evidence/manage-preferences.png`.
