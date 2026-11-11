import { spawn, exec } from "node:child_process";

console.log("\n============================================================");
console.log("   🚀 Launching ShareBite BD Development Server...");
console.log("============================================================\n");
console.log("[*] Initializing Next.js engine on http://localhost:3000 ...");
console.log("[*] Browser will open automatically once the server is ready...\n");

const isWindows = process.platform === "win32";
const child = spawn(isWindows ? "npm.cmd" : "npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
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
        console.log("  ✨ SERVER READY! Opening browser at http://localhost:3000");
        console.log("============================================================\n");
        const openCmd = isWindows ? 'start "" "http://localhost:3000"' : 'open "http://localhost:3000"';
        exec(openCmd);
        break;
      }
    } catch {
      // Waiting for server to initialize
    }
  }
}

checkAndOpen();

child.on("exit", (code) => {
  process.exit(code || 0);
});
