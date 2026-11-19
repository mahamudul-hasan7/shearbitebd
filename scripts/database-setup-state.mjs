import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
const root = ".local-postgres";
const files = [
  "prisma/schema.prisma",
  "scripts/setup-database.mjs",
  "scripts/setup-local-admin.ts",
  ...readdirSync("prisma/migrations")
    .sort()
    .map((name) => join("prisma/migrations", name, "migration.sql"))
    .filter(existsSync),
];
const fingerprint = createHash("sha256");
for (const file of files)
  fingerprint.update(file).update("\0").update(readFileSync(file)).update("\0");
const expected = fingerprint.digest("hex");
const marker = join(root, "launcher-setup-complete");
if (process.argv[2] === "mark") {
  mkdirSync(root, { recursive: true });
  writeFileSync(marker, expected + "\n");
} else {
  const ready = [
    join(root, "cluster/PG_VERSION"),
    ".env.local",
    "node_modules/.prisma/client/schema.prisma",
    marker,
  ].every(existsSync);
  process.exitCode =
    ready && readFileSync(marker, "utf8").trim() === expected ? 0 : 1;
}
