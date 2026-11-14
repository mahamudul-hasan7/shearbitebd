import { spawn } from "node:child_process";
import { once } from "node:events";
const child = spawn(process.execPath, ["--test", "--test-name-pattern=browser (donor publishing|demo review)", "tests/auth.integration.test.mjs"], {
  stdio: "inherit", windowsHide: true,
  env: { ...process.env, RUN_DONATION_BROWSER: "1", PLAYWRIGHT_CHANNEL: process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : "") },
});
const [code] = await once(child, "exit");
process.exitCode = code ?? 1;
