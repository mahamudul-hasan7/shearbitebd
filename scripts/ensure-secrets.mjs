import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { loadDatabaseEnv } from "./database-env.mjs";

loadDatabaseEnv();
if (!process.env.OTP_SECRET) {
  const file = ".env.local";
  const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (/^OTP_SECRET\s*=/m.test(source)) throw new Error("Set OTP_SECRET to a nonempty random secret in .env.local.");
  fs.appendFileSync(file, `\nOTP_SECRET="${randomBytes(32).toString("hex")}"\n`, { mode: 0o600 });
  console.log("Local OTP signing secret configured.");
}
