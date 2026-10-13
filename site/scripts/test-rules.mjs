// Runs the Firestore and Storage rules tests against the emulators (`npm run test:rules`).
//
// The Storage emulator evaluates `firestore.get()` in storage.rules by calling the Firestore emulator
// over HTTP with firebase-tools' own client. That client sends every request through HTTPS_PROXY /
// HTTP_PROXY when either is set and ignores NO_PROXY, even for 127.0.0.1, and the Storage emulator
// reports any failed lookup as "document not found". Behind a proxy (cloud containers, some CI) the
// mediaRegistry lookups therefore come back null and the image-library tests fail. So: download any
// missing emulator through the proxy first, then run the emulators with the proxy variables removed.
// Extra arguments go to the firebase CLI, e.g. `npm run test:rules -- --config other.json`.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const proxyVariables = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"];

if (proxyVariables.some((name) => process.env[name])) {
  const { downloadIfNecessary } = require("firebase-tools/lib/emulator/downloadableEmulators.js");
  await downloadIfNecessary("firestore");
  await downloadIfNecessary("storage");
}

const env = { ...process.env };
for (const name of proxyVariables) delete env[name];
const { status, error } = spawnSync(process.execPath, [require.resolve("firebase-tools/lib/bin/firebase.js"), ...process.argv.slice(2),
  "--project", "demo-srss-tests", "emulators:exec", "--only", "firestore,storage",
  "node --test --test-concurrency=1 tests/rules/*.test.mjs"], { stdio: "inherit", env });
if (error) throw error;
process.exitCode = status ?? 1;
