import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const gitDir = resolve(rootDir, ".git");

// If downloaded as ZIP or running without git repo, skip safely without failing npm install
if (!existsSync(gitDir)) {
  process.exit(0);
}

const hooksDir = resolve(rootDir, ".githooks");
const prePushHook = resolve(hooksDir, "pre-push");

if (!existsSync(hooksDir)) {
  mkdirSync(hooksDir, { recursive: true });
}

const hookContent = `#!/bin/sh
node scripts/check-unpushed.mjs
exit 0
`;

writeFileSync(prePushHook, hookContent, { encoding: "utf8" });

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: rootDir,
    stdio: "ignore",
  });
} catch {
  // Gracefully ignore failure so npm install always succeeds
}
