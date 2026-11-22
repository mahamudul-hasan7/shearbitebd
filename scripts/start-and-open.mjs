import { execFile, spawn } from "node:child_process";
import { once } from "node:events";
import { networkInterfaces } from "node:os";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const demo = process.argv.includes("--demo");
const openBrowser = !process.argv.includes("--no-open");
let activeChild;
let stopping = false;

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopping = true;
    activeChild?.kill(signal);
  });
}

async function main() {
  // Match the dev preparation hooks without an intermediate npm/cmd server process.
  for (const script of ["scripts/setup-pdf-worker.mjs", "scripts/ensure-database.mjs"]) {
    if (stopping) return;
    activeChild = spawn(process.execPath, [script], { cwd: root, stdio: "inherit", windowsHide: true });
    const [code] = await once(activeChild, "exit");
    if (stopping) return;
    if (code !== 0) throw new Error("Project preparation failed. See the message above.");
  }
  if (stopping) return;
  console.log(`[*] Starting ShareBite BD in ${demo ? "presentation" : "development"} mode.`);
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", demo ? "start" : "dev", "--hostname", "0.0.0.0"], {
    cwd: root, stdio: ["inherit", "pipe", "inherit"], windowsHide: true,
  });
  activeChild = child;
  const output = createInterface({ input: child.stdout });
  let localUrl;
  let ready = false;
  let announced = false;
  output.on("line", (line) => {
    console.log(line);
    const message = line.replace(/\x1b\[[0-9;]*m/g, "");
    const match = message.match(/^\s*- Local:\s+(https?:\/\/\S+)\s*$/);
    if (match) {
      localUrl = new URL(match[1]);
      localUrl.hostname = "localhost";
    }
    if (/\bReady in\b/.test(message)) ready = true;
    if (!localUrl || !ready || announced) return;
    announced = true;
    console.log(`\n[READY] This computer: ${localUrl.href}`);
    for (const [name, addresses] of Object.entries(networkInterfaces())) {
      for (const address of addresses || []) {
        if (address.family !== "IPv4" || address.internal || address.address.startsWith("169.254.")) continue;
        const lanUrl = new URL(localUrl);
        lanUrl.hostname = address.address;
        console.log(`[LAN] ${name}: ${lanUrl.origin}`);
      }
    }
    console.log("[*] On another device, use this computer's Wi-Fi/Ethernet LAN address and port.");
    console.log("[*] Keep this window open. Press Ctrl+C to stop ShareBite BD.\n");
    if (!openBrowser || stopping) return;
    const command = process.platform === "win32" ? "rundll32.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["url.dll,FileProtocolHandler", localUrl.href] : [localUrl.href];
    execFile(command, args, (error) => {
      if (error) console.log(`[*] Open ${localUrl.href} in your browser.`);
    });
  });
  child.on("error", (error) => {
    console.error(`[ERROR] Could not start Next.js: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("close", (code) => {
    process.exitCode = stopping ? 0 : (code ?? 1);
  });
}

main().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exitCode = 1;
});
