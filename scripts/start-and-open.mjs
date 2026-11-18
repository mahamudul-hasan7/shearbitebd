import { execFile, spawn } from "node:child_process";
import { createInterface } from "node:readline";

console.log("[*] Starting ShareBite BD. The browser will open when Next.js is ready.");

const child = spawn("npm run dev", { shell: true, stdio: ["inherit", "pipe", "inherit"] });
const output = createInterface({ input: child.stdout });
let localUrl;
let ready = false;
let opened = false;

output.on("line", (line) => {
  console.log(line);
  const message = line.replace(/\x1b\[[0-9;]*m/g, "");
  const match = message.match(/^\s*- Local:\s+(http:\/\/localhost:\d+)\s*$/);
  if (match) localUrl = match[1];
  if (/\bReady in\b/.test(message)) ready = true;
  if (!localUrl || !ready || opened) return;

  opened = true;
  const platform = process.platform;
  const command = platform === "win32" ? "rundll32.exe" : platform === "darwin" ? "open" : "xdg-open";
  const args = platform === "win32" ? ["url.dll,FileProtocolHandler", localUrl] : [localUrl];
  execFile(command, args, (error) => {
    if (error) console.log(`[*] Open ${localUrl} in your browser.`);
  });
});

child.on("error", (error) => {
  console.error(`[ERROR] Could not start Next.js: ${error.message}`);
  process.exitCode = 1;
});
child.on("close", (code, signal) => {
  process.exitCode = signal === "SIGINT" ? 0 : (code ?? 1);
});
