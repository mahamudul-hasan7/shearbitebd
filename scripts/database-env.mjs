import fs from "node:fs";
import { parseEnv } from "node:util";

const inheritedEnvironment = { ...process.env };

export function loadDatabaseEnv() {
  // Match Next's local precedence without printing credentials.
  const configured = {};
  for (const file of [".env", ".env.local"]) {
    if (fs.existsSync(file)) Object.assign(configured, parseEnv(fs.readFileSync(file, "utf8")));
  }
  for (const [key, value] of Object.entries(configured)) {
    if (inheritedEnvironment[key] === undefined) process.env[key] = value;
  }
}
