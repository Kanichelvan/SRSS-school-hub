// Storage security rules for the website image library. Run with `npm run test:rules`.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadBytes } from "firebase/storage";

let env;
const [firestoreHost, firestorePort = "8080"] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080").split(":");
const [storageHost, storagePort = "9199"] = (process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199").split(":");
const bytes = (size) => new Uint8Array(size);
const as = (uid, roles) => env.authenticatedContext(uid, { roles }).storage();
const register = (id, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), `mediaRegistry/${id}`), {
  classification: "public", status: "staging", storagePath: `media/public/${id}`, uploadedBy: "editor", containsPupils: false, consentChecked: false, ...data,
}));

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-tests", firestore: { rules: await readFile(new URL("../../firestore.rules", import.meta.url), "utf8"), host: firestoreHost, port: Number(firestorePort) }, storage: { rules: await readFile(new URL("../../storage.rules", import.meta.url), "utf8"), host: storageHost, port: Number(storagePort) } });
});
after(() => env?.cleanup());
beforeEach(async () => { await env.clearFirestore(); await env.clearStorage(); });

describe("Website image library storage", () => {
  test("content staff upload website images; others cannot", async () => {
    await register("a", {});
    await register("b", { uploadedBy: "principal" });
    await register("c", {});
    await register("d", {});
    await assertSucceeds(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/a"), bytes(1024), { contentType: "image/webp" }));
    await assertSucceeds(uploadBytes(ref(as("principal", ["leadership"]), "media/public/b"), bytes(1024), { contentType: "image/jpeg" }));
    await assertFails(uploadBytes(ref(as("teacher", ["teacher"]), "media/public/c"), bytes(1024), { contentType: "image/webp" }));
    await assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(), "media/public/d"), bytes(1024), { contentType: "image/webp" }));
  });
  test("only images or PDFs under 10 MB are accepted", async () => {
    await register("e", {});
    await register("f", {});
    await assertFails(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/e"), bytes(1024), { contentType: "image/svg+xml" }));
    await assertFails(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/f"), bytes(11 * 1024 * 1024), { contentType: "image/webp" }));
  });
  test("public reads begin only after the registry is approved", async () => {
    await register("g", {});
    await env.withSecurityRulesDisabled((ctx) => uploadBytes(ref(ctx.storage(), "media/public/g"), bytes(16), { contentType: "image/webp" }));
    await assertFails(getBytes(ref(env.unauthenticatedContext().storage(), "media/public/g")));
    await register("g", { status: "approved", url: "https://example.test/g" });
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), "media/public/g")));
  });
});
