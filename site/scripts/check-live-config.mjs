// Stops a build that would talk to the local test database from being deployed.
// A build made without site/.env.production.local (it is not in git, so a fresh checkout or worktree lacks it)
// silently falls back to the emulator settings: the live site then cannot sign anyone in. Run by `npm run build`.
// For a deliberate local-preview build, set ALLOW_EMULATOR_BUILD=1.
import { readdirSync, readFileSync } from "node:fs";

export function emulatorMarkers(source) {
  return ["demo-srss", "demo-api-key"].filter((marker) => source.includes(marker));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = new URL("../dist/assets/", import.meta.url);
  const hits = readdirSync(dir).filter((name) => name.endsWith(".js")).filter((name) => emulatorMarkers(readFileSync(new URL(name, dir), "utf8")).length);
  if (hits.length && process.env.ALLOW_EMULATOR_BUILD !== "1") {
    console.error(`FAIL This build points at the local test database (${hits.length} file(s), e.g. ${hits[0]}).\n     Copy site/.env.production.local into this folder and build again. Do not deploy this build.`);
    process.exit(1);
  }
  console.log(hits.length ? "WARN Local-preview build (ALLOW_EMULATOR_BUILD=1): not for deployment." : "PASS Build is configured for the live project.");
}
