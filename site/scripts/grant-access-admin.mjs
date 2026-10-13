// Grants the `accessAdmin` claim (permission to assign hub roles) to one trusted account on the REAL project.
// Keep this to 1–2 people. Requires Application Default Credentials for the project:
//   gcloud auth application-default login
//   node scripts/grant-access-admin.mjs --project <project-id> --email <name@srss.edu.my> [--roles adminStaff,leadership]
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const arg = (name) => { const index = process.argv.indexOf(`--${name}`); return index > -1 ? process.argv[index + 1] : undefined; };
const projectId = arg("project");
const email = arg("email");
const roles = (arg("roles") || "").split(",").filter(Boolean);
if (!projectId || !email) { console.error("Usage: node scripts/grant-access-admin.mjs --project <id> --email <email> [--roles a,b]"); process.exit(1); }

initializeApp({ projectId });
const user = await getAuth().getUserByEmail(email);
const claims = { ...user.customClaims, accessAdmin: true, ...(roles.length ? { roles } : {}) };
await getAuth().setCustomUserClaims(user.uid, claims);
await getFirestore().collection("auditLogs").add({ type: "accessAdmin.granted", targetUid: user.uid, after: claims, actorUid: "bootstrap-script", at: FieldValue.serverTimestamp() });
console.log(`Granted accessAdmin to ${email}. They must sign out and back in for it to take effect.`);
