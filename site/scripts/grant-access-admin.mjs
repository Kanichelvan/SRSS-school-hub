// Bootstraps the first Super Administrators on the REAL project (after that, they assign roles in the hub).
// Keep this to 1–2 people. Each person must have signed in to the hub once, so their account exists.
// Requires Application Default Credentials for the project:
//   gcloud auth application-default login
//   node scripts/grant-access-admin.mjs --project srssdigitalhub --email first@example.org,second@example.org --roles superAdmin
// Without --roles the person keeps their current roles and only gains the legacy `accessAdmin` claim.
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { ROLE_IDS } from "../functions/roles.js";
import { recomputeUserScope } from "../functions/scope.js";

const arg = (name) => { const index = process.argv.indexOf(`--${name}`); return index > -1 ? process.argv[index + 1] : undefined; };
const projectId = arg("project");
const emails = (arg("email") || "").split(",").map((email) => email.trim()).filter(Boolean);
const roles = (arg("roles") || "").split(",").filter(Boolean);
if (!projectId || !emails.length) { console.error("Usage: node scripts/grant-access-admin.mjs --project <id> --email <email>[,<email>] [--roles superAdmin]"); process.exit(1); }
if (roles.some((role) => !ROLE_IDS.includes(role))) { console.error(`Unknown role. Choose from: ${ROLE_IDS.join(", ")}`); process.exit(1); }

initializeApp({ projectId });
const auth = getAuth();
const db = getFirestore();
let failed = false;
for (const email of emails) {
  let user;
  try { user = await auth.getUserByEmail(email); }
  catch { console.error(`✗ ${email}: no account yet. Ask them to sign in to the hub once, then run this again.`); failed = true; continue; }
  const finalRoles = roles.length ? [...new Set([...(user.customClaims?.roles || []), ...roles])] : user.customClaims?.roles || [];
  const claims = { ...user.customClaims, accessAdmin: true, roles: finalRoles };
  await auth.setCustomUserClaims(user.uid, claims);
  // The hub's user record (roles, status and access scope) — normally written by the setUserRoles function.
  await db.doc(`users/${user.uid}`).set({ email: user.email, displayName: user.displayName || null, status: "active", roles: finalRoles }, { merge: true });
  await recomputeUserScope(db, user.uid, finalRoles);
  await db.collection("userRoles").add({ uid: user.uid, before: user.customClaims?.roles || [], after: finalRoles, reason: "Bootstrap Super Administrator", actorUid: "bootstrap-script", at: FieldValue.serverTimestamp() });
  await db.collection("auditLogs").add({ type: "accessAdmin.granted", targetUid: user.uid, after: claims, actorUid: "bootstrap-script", at: FieldValue.serverTimestamp() });
  console.log(`✓ ${email}: ${finalRoles.join(", ") || "accessAdmin"}. They must sign out and back in (or press Refresh access) for it to take effect.`);
}
if (failed) process.exitCode = 1;
