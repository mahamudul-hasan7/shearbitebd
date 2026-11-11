import { spawn, exec } from "node:child_process";

console.log("\n============================================================");
console.log("   🚀 Launching ShareBite BD Server & Auto-Opening Browser...");
console.log("============================================================\n");
console.log("[*] Starting Next.js engine on http://localhost:3000 ...");
console.log("[*] Please wait a moment, browser will open automatically once ready...\n");

const isWindows = process.platform === "win32";
const nextCmd = isWindows ? "npx.cmd" : "npx";

const child = spawn(nextCmd, ["next", "dev", "-p", "3000"], {
  stdio: "inherit",
});

let opened = false;

async function checkAndOpen() {
  const maxAttempts = 60;
  let attempts = 0;

  while (!opened && attempts < maxAttempts) {
    attempts++;
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await fetch("http://localhost:3000");
      if (res.status === 200 || res.status === 304 || res.status === 404) {
        opened = true;
        console.log("\n============================================================");
        console.log("  ✨ SERVER IS READY! Opening browser at http://localhost:3000");
        console.log("============================================================\n");
        const openCmd = isWindows ? 'start "" "http://localhost:3000"' : 'open "http://localhost:3000"';
        exec(openCmd);
        break;
      }
    } catch {
      // Waiting for Next.js server to bind to port 3000
    }
  }
}

checkAndOpen();

child.on("exit", (code) => {
  process.exit(code || 0);
});
