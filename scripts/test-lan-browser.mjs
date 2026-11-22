import { spawn } from "node:child_process";
import { once } from "node:events";
import { networkInterfaces } from "node:os";

const host = process.env.TEST_LAN_HOST || Object.values(networkInterfaces())
  .flat().find((address) => address?.family === "IPv4" && !address.internal)?.address;
if (!host) throw new Error("A non-loopback IPv4 address is required for the LAN HTTP regression test.");
const journey = process.argv.includes("--journey");
const pattern = journey ? "browser (complete rescue journey|receipt recovery)" : "browser LAN HTTP";
const child = spawn(process.execPath, ["--test", `--test-name-pattern=${pattern}`, "tests/auth.integration.test.mjs"], {
  stdio: "inherit",
  windowsHide: true,
  env: {
    ...process.env,
    TEST_LAN_HOST: host,
    RUN_LAN_BROWSER: "1",
    ...(journey ? { RUN_JOURNEY_BROWSER: "1", TEST_DEMO_LAUNCHER: "1" } : {}),
    PLAYWRIGHT_CHANNEL: process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : ""),
  },
});
const [code] = await once(child, "exit");
process.exitCode = code ?? 1;
