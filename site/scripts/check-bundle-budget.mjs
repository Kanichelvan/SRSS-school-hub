import { gzipSync } from "node:zlib";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const assetDirectory = fileURLToPath(new URL("../dist/assets/", import.meta.url));
const files = await readdir(assetDirectory);

const budgets = [
  { label: "Public application", pattern: /^index-[\w-]+\.js$/, maximumKiB: 150 },
  { label: "Authenticated shared core", pattern: /^HubApp-[\w-]+\.js$/, maximumKiB: 200 },
];

let failed = false;
for (const budget of budgets) {
  const file = files.find((name) => budget.pattern.test(name));
  if (!file) throw new Error(`Could not find the ${budget.label} bundle in dist/assets.`);
  const bytes = gzipSync(await readFile(join(assetDirectory, file))).byteLength;
  const kib = bytes / 1024;
  const status = kib <= budget.maximumKiB ? "PASS" : "FAIL";
  console.log(`${status} ${budget.label}: ${kib.toFixed(1)} KiB gzip (budget ${budget.maximumKiB} KiB)`);
  failed ||= status === "FAIL";
}

if (failed) process.exitCode = 1;
