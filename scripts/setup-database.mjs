import { spawn } from "node:child_process";
import { once } from "node:events";

for (const args of [
  ["scripts/ensure-secrets.mjs"],
  ["node_modules/prisma/build/index.js", "generate"],
  ["scripts/local-postgres.mjs", "start"],
  ["scripts/db-command.mjs", "migrate", "deploy"],
  ["node_modules/tsx/dist/cli.mjs", "scripts/import-legacy-data.ts"],
  ["node_modules/tsx/dist/cli.mjs", "scripts/restore-account-reviews.ts"],
  ["node_modules/tsx/dist/cli.mjs", "scripts/setup-local-admin.ts"],
]) {
  const child = spawn(process.execPath, args, { stdio: "inherit", windowsHide: true });
  const [code] = await once(child, "exit");
  if (code !== 0) { process.exitCode = code ?? 1; break; }
}
