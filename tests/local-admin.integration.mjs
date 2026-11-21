import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  stat,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";

export async function runLocalAdminChecks({ prisma }) {
  const { loadDatabaseEnv } = await import("../scripts/database-env.mjs");
  loadDatabaseEnv();
  const original = new URL(process.env.DATABASE_URL);
  const schema = "admin_setup_test_" + randomUUID().replaceAll("-", "");
  const url = new URL(original);
  url.searchParams.set("schema", schema);
  const db = new PrismaClient({ datasources: { db: { url: url.href } } });
  const dir = await mkdtemp(join(tmpdir(), "sharebite admin setup "));
  const runner = resolve("node_modules/tsx/dist/cli.mjs");
  const script = resolve("scripts/setup-local-admin.ts");
  async function run(args, cwd) {
    const child = spawn(process.execPath, args, {
      cwd,
      env: { ...process.env, DATABASE_URL: url.href },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    const [code] = await once(child, "exit");
    assert.equal(code, 0, "Local admin command must succeed");
    return output;
  }
  try {
    await run(
      [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
      process.cwd(),
    );
    await mkdir(join(dir, ".local-postgres"));
    const config = {
      user: decodeURIComponent(original.username),
      password: decodeURIComponent(original.password),
    };
    await writeFile(
      join(dir, ".local-postgres/credentials.json"),
      JSON.stringify(config),
    );
    // An unrelated existing administrator must keep its own credentials.
    const custom = await db.user.create({
      data: {
        email: "owner@example.test",
        password: "OwnerPassword1",
        displayName: "Owner",
        role: "ADMIN",
      },
    });
    const firstOutput = await run([runner, script], dir);
    assert.match(firstOutput, /Local admin created/);
    const file = join(dir, ".local-postgres/admin-access.json");
    const content = await readFile(file, "utf8");
    const access = JSON.parse(content);
    assert.deepEqual(access, {
      username: "admin",
      email: "admin@sharebite.local",
      password: "admin123",
    });
    if (process.platform !== "win32")
      assert.equal((await stat(file)).mode & 0o777, 0o600);
    const user = await db.user.findUniqueOrThrow({
      where: { username: "admin" },
    });
    assert.equal(user.role, "ADMIN");
    assert.equal(user.password, "admin123");
    const secondOutput = await run([runner, script], dir);
    assert.match(secondOutput, /already configured/);
    assert.doesNotMatch(secondOutput, /Password:/);
    assert.equal(await readFile(file, "utf8"), content);
    assert.equal(await db.user.count({ where: { role: "ADMIN" } }), 2);
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: custom.id } })).password,
      "OwnerPassword1",
    );

    // Upgrade the previous random-password local account in place.
    await db.user.update({
      where: { id: user.id },
      data: { username: null, password: "Admin1-previous-random-password" },
    });
    await writeFile(
      file,
      JSON.stringify({
        email: user.email,
        password: "Admin1-previous-random-password",
      }),
    );
    await db.authSession.create({
      data: {
        tokenHash: "old-admin-session",
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    assert.match(await run([runner, script], dir), /Local admin updated/);
    const upgraded = await db.user.findUniqueOrThrow({
      where: { username: "admin" },
    });
    assert.equal(upgraded.id, user.id);
    assert.equal(upgraded.password, "admin123");
    assert.equal(await db.authSession.count({ where: { userId: user.id } }), 0);
    assert.equal(await db.user.count(), 2);

    // Routine setup preserves a later operator change, while --reset is explicit.
    await db.user.update({
      where: { id: user.id },
      data: { password: "ChangedPassword1" },
    });
    await run([runner, script], dir);
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: user.id } })).password,
      "ChangedPassword1",
    );
    await run([runner, script, "--reset"], dir);
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: user.id } })).password,
      "admin123",
    );
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: custom.id } })).password,
      "OwnerPassword1",
    );

    // A donor occupying the old email is never promoted or overwritten.
    await db.user.delete({ where: { id: user.id } });
    const donor = await db.user.create({
      data: {
        email: "admin@sharebite.local",
        password: "DonorPassword1",
        displayName: "Donor",
        role: "DONOR",
      },
    });
    await run([runner, script], dir);
    const replacement = await db.user.findUniqueOrThrow({
      where: { username: "admin" },
    });
    assert.notEqual(replacement.id, donor.id);
    assert.notEqual(replacement.email, donor.email);
    assert.equal(replacement.password, "admin123");
    const originalDonor = await db.user.findUniqueOrThrow({
      where: { id: donor.id },
    });
    assert.equal(originalDonor.role, "DONOR");
    assert.equal(originalDonor.password, "DonorPassword1");

    await writeFile(
      join(dir, ".local-postgres/credentials.json"),
      JSON.stringify({ ...config, password: "unrelated-database-marker" }),
    );
    assert.equal(
      await run([runner, script, "--reset"], dir),
      "",
      "An unowned database must not be changed",
    );
  } finally {
    assert.match(schema, /^admin_setup_test_[a-f0-9]{32}$/);
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await db.$disconnect();
    await rm(dir, { recursive: true, force: true });
  }
}
