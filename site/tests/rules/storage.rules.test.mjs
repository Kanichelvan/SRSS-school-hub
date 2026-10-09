// Storage security rules for the website image library. Run with `npm run test:rules`.
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { getBytes, ref, uploadBytes } from "firebase/storage";

let env;
const bytes = (size) => new Uint8Array(size);
const as = (uid, roles) => env.authenticatedContext(uid, { roles }).storage();

before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-srss-storage", storage: { rules: await readFile(new URL("../../storage.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 9199 } });
});
after(() => env?.cleanup());
beforeEach(() => env.clearStorage());

describe("Website image library storage", () => {
  test("content staff upload website images; others cannot", async () => {
    await assertSucceeds(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/a.webp"), bytes(1024), { contentType: "image/webp" }));
    await assertSucceeds(uploadBytes(ref(as("principal", ["leadership"]), "media/public/b.jpg"), bytes(1024), { contentType: "image/jpeg" }));
    await assertFails(uploadBytes(ref(as("teacher", ["teacher"]), "media/public/c.webp"), bytes(1024), { contentType: "image/webp" }));
    await assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(), "media/public/d.webp"), bytes(1024), { contentType: "image/webp" }));
  });
  test("only images or PDFs under 10 MB are accepted", async () => {
    await assertFails(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/e.svg"), bytes(1024), { contentType: "image/svg+xml" }));
    await assertFails(uploadBytes(ref(as("editor", ["contentEditor"]), "media/public/f.webp"), bytes(11 * 1024 * 1024), { contentType: "image/webp" }));
  });
  test("anyone can view a published library image", async () => {
    await env.withSecurityRulesDisabled((ctx) => uploadBytes(ref(ctx.storage(), "media/public/g.webp"), bytes(16), { contentType: "image/webp" }));
    await assertSucceeds(getBytes(ref(env.unauthenticatedContext().storage(), "media/public/g.webp")));
  });
});
