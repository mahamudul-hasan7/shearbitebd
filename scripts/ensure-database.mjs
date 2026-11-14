import fs from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { loadDatabaseEnv } from "./database-env.mjs";
import "./ensure-secrets.mjs";

loadDatabaseEnv();
if (fs.existsSync(".local-postgres/credentials.json") && process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  if (url.hostname === "127.0.0.1" && url.port === "5433") {
    const child = spawn(process.execPath, ["scripts/local-postgres.mjs", "start"], { stdio: "inherit", windowsHide: true });
    const [code] = await once(child, "exit");
    process.exitCode = code ?? 1;
  }
}
