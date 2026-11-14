import { spawn } from "node:child_process";
import { loadDatabaseEnv } from "./database-env.mjs";

loadDatabaseEnv();
const child = spawn(process.execPath, ["node_modules/prisma/build/index.js", ...process.argv.slice(2)], {
  stdio: "inherit", env: process.env, windowsHide: true,
});
child.on("exit", (code) => { process.exitCode = code ?? 1; });
