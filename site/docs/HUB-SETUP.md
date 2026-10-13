# SRSS Digital Hub — Setup Runbook

How the hub is built, how to run it locally, and the account-level steps the school must take before launch.

Sources: *SRSS Digital Hub Master PRD & Developer PRD v1.0*, *SRSS25 Digital Hub PRD*, *SRSS Full Permission Matrix*, *Proposed Sitemap and Google Services Integration Blueprint*, *Document Register, Migration Roadmap and Tech Stack*. Platform architecture: [`architecture.md`](architecture.md). Information architecture: [`SITEMAP.md`](../SITEMAP.md). Data model: [`data-model.md`](data-model.md). Requirement status: [`requirements.md`](requirements.md).

## Architecture

| Layer | Choice |
|---|---|
| Front end | React + Vite (the PRD names Next.js/TypeScript; React + Vite was kept to match the existing public site — a TypeScript move can happen file by file) |
| Identity | Firebase Authentication — school Google accounts for staff/students; email + password or email link for parents (no SMS) |
| Data | Cloud Firestore; access enforced by `firestore.rules` and server-derived scope (`functions/scope.js`) |
| Server logic | Cloud Functions (`functions/`): role assignment, scope derivation, consent status, absence notifications, admissions → SIS enrolment, audit trail |
| Files | Google Shared Drives for documents and media (the hub stores metadata and links); Firebase Storage only for narrow cases (`storage.rules`) |
| Hosting | Firebase Hosting (`firebase.json`) for both the public site and the hub; `server.mjs` only previews a local `dist/` build |

The public site and the hub share one codebase. `src/main.jsx` loads the hub (and Firebase) only on `/sign-in`, `/hub`, `/login`, `/dashboard`, `/portal` and retired prototype aliases. Hub screen groups are loaded lazily from `src/hub/HubApp.jsx`.

### Where things live

| Path | Purpose |
|---|---|
| `src/auth/permissions.js` | Roles, modules and the access matrix (single source of truth) |
| `src/auth/AuthProvider.jsx`, `src/hub/SignIn.jsx` | Sign-in, claims, scope, role switcher |
| `src/hub/routes.js` | Hub routes: label, module, phase, Google services, screen |
| `src/hub/screens/*` | Dashboards, SIS, attendance, family, communications, admin screens |
| `src/hub/logic/dashboard.js` | Pure dashboard logic (unit-tested) |
| `src/hub/ui.jsx`, `src/hub/hub.css` | Shared components (data table, stat card, Actions Required, child switcher…) |
| `firestore.rules`, `storage.rules`, `firestore.indexes.json` | Data-layer access control and indexes |
| `functions/` | Cloud Functions |
| `scripts/seed-emulator.mjs` | Fictional demo school for local testing |
| `scripts/import-legacy-content.mjs` | Moves the old JSON website content into the Firestore CMS |
| `src/lib/publicContent.js` | Public pages ↔ Firestore REST (published content, enquiry and contact forms) |
| `scripts/grant-access-admin.mjs` | One-time bootstrap of the first access administrator |
| `tests/` | Unit tests (`npm test`) and rules tests (`npm run test:rules`) |

## Run it locally

No Firebase account is needed; everything runs against the offline `demo-srss` project.

1. **Java 21+** for the emulators. A portable JDK is at `~/.local/jdk-21`; put it on the path for the session:
   ```bash
   export JAVA_HOME="$HOME/.local/jdk-21/Contents/Home" PATH="$HOME/.local/jdk-21/Contents/Home/bin:$PATH"
   ```
2. Terminal 1: `npm run emulators` (Auth, Firestore, Functions, Storage; UI at http://localhost:4000).
3. Terminal 2: `npm run seed` — 13 demo accounts (one per role), 36 fictional pupils, a week of attendance, consents, portfolio, admissions.
4. Terminal 3: `npm run dev`, open `/sign-in` and use **Local demo accounts**.
5. Tests: `npm test` (unit) and `npm run test:rules` (security rules against an isolated `demo-srss-tests` emulator project; the rule tests run sequentially because Storage rules consult Firestore media-registry records). `scripts/test-rules.mjs` runs the emulators with `HTTPS_PROXY`/`HTTP_PROXY` removed, because firebase-tools would otherwise send the Storage emulator's registry lookups to the Firestore emulator through the proxy (it ignores `NO_PROXY`) and treat the failure as a missing record.

### This Mac: iCloud "Optimize Mac Storage"

`Documents` is synced to iCloud and the disk is nearly full, so macOS offloads files. That broke builds when `node_modules` was offloaded. Current mitigations:

- `node_modules` and `functions/node_modules` carry the `com.apple.fileprovider.ignore#P` attribute so iCloud leaves them alone. **npm recreates the folder on install and drops the attribute** — after any `npm install`, re-run:
  ```bash
  xattr -w 'com.apple.fileprovider.ignore#P' 1 node_modules
  ```
- `.npmrc` points npm's cache at `site/.npm-cache`, which iCloud has also offloaded. Installs work with `--cache "$HOME/Library/Caches/srss-npm"`; consider moving the `cache=` line to a folder outside Documents.
- Photos in `public/assets` are offloaded too, so a production build waits while they download. Freeing disk space (or moving the project out of `Documents`) removes the problem.

## Launch checklist — steps only the school can do

### A. Google Workspace for Education

1. Confirm the Workspace edition with the school (decision D3 in [`architecture.md`](architecture.md)). Google for Nonprofits excludes schools themselves; **Google Workspace for Education Fundamentals** (no licence cost for qualifying schools, includes Classroom and Vault) is the usual school edition. A separate SRSS foundation or alumni trust could hold a Nonprofits account for fundraising.
2. Organizational units: `/Students/Std1`–`/Students/Std6`, `/Staff/Teachers`, `/Staff/Support`, `/Staff/Admin`, `/Staff/Leadership`, `/System/Admins`, with student-safe service settings.
3. Groups: `all-students@`, `std1@`–`std6@`, class groups, `all-teachers@`, `homeroom-teachers@`, `specialist-teachers@`, `admissions@`, `operations@`, `leadership@`, `safeguarding-restricted@`, `content-editors@`, `std1-parents@`–`std6-parents@`, `alumni@`, `donors-supporters@`.
4. Shared Drives following the PRD structure (separate public-website assets from operational records), shared to groups, not individuals.
5. Super Admin limited to 1–2 people; delegate narrowly. Enforce 2-Step Verification for admin, finance, leadership and safeguarding accounts (PRD §11 Staff MFA).

### B. Firebase project

The production project is **SRSSDigitalHub** (project ID `srssdigitalhub`, number 181411841169), created 13 Oct 2026. `.firebaserc` keeps `demo-srss` as the default so local emulators never touch it; production commands add `--project production`.

1. Set the Firestore and Storage location to `asia-southeast1`; Blaze plan (Cloud Functions require it; school-scale usage stays within free allowances — set a budget alert).
2. Authentication: enable Google, Email/Password and Email link; add the production domain to Authorized domains.
3. Register a Web app; copy its config into `.env.local` (see `.env.example`), set `VITE_USE_EMULATORS=false` and `VITE_WORKSPACE_DOMAIN`.
4. Deploy: `npx firebase deploy --project production --only firestore,storage,functions,hosting`. Move the existing website content in once: `node scripts/import-legacy-content.mjs --project srssdigitalhub`.
5. Bootstrap the first access administrator: `gcloud auth application-default login`, then `node scripts/grant-access-admin.mjs --project srssdigitalhub --email <office-lead@domain> --roles schoolAdmin`.
6. Create `settings/school` with `currentAcademicYearId`, then academic years, terms, standards, classes, subjects and teacher assignments.
7. Schedule daily Firestore exports to Cloud Storage and test a restore each term.
8. Consider App Check for the web app (PRD §46).

### C. Data and governance (Phase 0)

Clean and assign IDs to student, guardian and staff master lists; define guardian ↔ student links with relationship and portal access; confirm the consent definitions and versions; name an owner and review cycle for every content area and integration (PRD §51, §62).
