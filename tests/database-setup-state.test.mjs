import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("Windows launcher reruns setup for legacy markers and changed migrations", async () => {
  const root = await mkdtemp(join(tmpdir(), "sharebite setup state "));
  const script = resolve("scripts/database-setup-state.mjs");
  const run = (command) =>
    spawnSync(process.execPath, [script, command], {
      cwd: root,
      encoding: "utf8",
    });
  try {
    for (const path of [
      "prisma/migrations/001",
      "scripts",
      ".local-postgres/cluster",
      "node_modules/.prisma/client",
    ])
      await mkdir(join(root, path), { recursive: true });
    for (const path of [
      "prisma/schema.prisma",
      "prisma/migrations/001/migration.sql",
      "scripts/setup-database.mjs",
      "scripts/setup-local-admin.ts",
      ".env.local",
      ".local-postgres/cluster/PG_VERSION",
      "node_modules/.prisma/client/schema.prisma",
    ])
      await writeFile(join(root, path), "fixture");
    assert.equal(run("check").status, 1);
    await writeFile(join(root, ".local-postgres/launcher-setup-complete"), "");
    assert.equal(
      run("check").status,
      1,
      "Former empty marker must run the new migrations",
    );
    assert.equal(run("mark").status, 0);
    assert.equal(run("check").status, 0);
    await writeFile(
      join(root, "prisma/migrations/001/migration.sql"),
      "new migration",
    );
    assert.equal(run("check").status, 1);
    assert.equal(run("mark").status, 0);
    assert.equal(run("check").status, 0);
    await rm(join(root, "node_modules/.prisma/client/schema.prisma"));
    assert.equal(run("check").status, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
