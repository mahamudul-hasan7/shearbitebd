import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
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
    stdio: "inherit",
  });
  console.log("Git hooks configured: core.hooksPath=.githooks");
} catch (error) {
  console.log("Git hooks were created, but core.hooksPath could not be set automatically.");
  console.log("Run this once manually:");
  console.log("git config core.hooksPath .githooks");
  process.exitCode = 1;
}
