import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export function dataFile(name: string) {
  if (process.env.SHAREBITE_DATA_DIR) return path.join(/*turbopackIgnore: true*/ process.env.SHAREBITE_DATA_DIR, name);
  return path.join(process.cwd(), "data", name);
}

// Transitional local storage. PostgreSQL will replace this in the database phase.
// Write failures must reach the caller; never report a successful unsaved account.
export function writeJsonFile(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
