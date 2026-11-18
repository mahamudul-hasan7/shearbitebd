import { spawn } from "node:child_process";

export function runPostgresCommand(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", chunk => { output += chunk; });
    child.stderr.on("data", chunk => { output += chunk; });
    child.once("error", reject);
    child.once("exit", code => {
      // A detached PostgreSQL server can keep inherited pipe handles open on Windows.
      // Finish when pg_ctl exits and release our readers without stopping the server.
      child.stdout.destroy();
      child.stderr.destroy();
      if (code === 0) resolve(output);
      else reject(new Error(output || `PostgreSQL command failed (${code}).`));
    });
  });
}
