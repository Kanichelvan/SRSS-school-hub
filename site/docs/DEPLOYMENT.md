# Deploying the website

## Automatic (GitHub Actions)

`.github/workflows/deploy-site.yml` publishes the website to Firebase Hosting (project `srssdigitalhub`, live channel) every time a change under `site/` reaches `main`, for example when a pull request is merged. It installs dependencies, runs the tests, writes `site/.env.production.local` from a secret, runs `npm run build` (bundle budgets and the live-config check) and deploys. If any step fails, nothing is published and the live site stays as it was.

It deploys **hosting only**. Firestore and Storage rules, indexes and Cloud Functions are still deployed by hand (below).

To run it without a new merge (for example after adding the secrets), open the repository's **Actions** tab, choose **Deploy website**, then **Run workflow** on `main`.

### One-time setup: two repository secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

1. **`ENV_PRODUCTION_LOCAL`**: open `site/.env.production.local` on the computer you deploy from and paste its whole contents as the value.
2. **`FIREBASE_SERVICE_ACCOUNT_SRSSDIGITALHUB`**: a key for a service account that may deploy hosting.
   1. Open Google Cloud console → **IAM & Admin → Service accounts**, with project **srssdigitalhub** selected.
   2. **Create service account**, name it `github-website-deploy`, and give it the role **Firebase Hosting Admin**.
   3. Open the new account → **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
   4. Paste the whole contents of that file as the secret's value, then delete the downloaded file.

The key lets anyone holding it publish the website, so keep it only in the GitHub secret. If the first run stops at the deploy step with a permission error, the message names the missing permission; add that role to the same service account and run the workflow again.

## By hand

From the `site` folder, with `.env.production.local` present:

```bash
npm ci && npm run build
npx firebase deploy --project production --only hosting
```

Rules, indexes and functions: `npx firebase deploy --project production --only firestore,storage,functions`.
