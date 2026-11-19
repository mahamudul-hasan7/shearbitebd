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
    child.stdout.on("data", (c) => (output += c));
    child.stderr.on("data", (c) => (output += c));
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
    // Mirror the private local ownership marker without printing any credentials.
    const config = {
      user: decodeURIComponent(original.username),
      password: decodeURIComponent(original.password),
    };
    await writeFile(
      join(dir, ".local-postgres/credentials.json"),
      JSON.stringify(config),
    );
    const firstOutput = await run([runner, script], dir);
    assert.match(firstOutput, /Local admin created/);
    const file = join(dir, ".local-postgres/admin-access.json");
    const content = await readFile(file, "utf8");
    const access = JSON.parse(content);
    assert.equal(access.email, "admin@sharebite.local");
    assert.match(access.password, /^Admin1-[a-f0-9]{24}$/);
    if (process.platform !== "win32")
      assert.equal((await stat(file)).mode & 0o777, 0o600);
    const user = await db.user.findUniqueOrThrow({
      where: { email: access.email },
    });
    assert.equal(user.role, "ADMIN");
    assert.equal(user.password, access.password);
    const secondOutput = await run([runner, script], dir);
    assert.match(secondOutput, /already configured/);
    assert.doesNotMatch(secondOutput, /Password:/);
    assert.equal(await readFile(file, "utf8"), content);
    assert.equal(await db.user.count({ where: { role: "ADMIN" } }), 1);
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: user.id } })).password,
      user.password,
    );
    await writeFile(
      join(dir, ".local-postgres/credentials.json"),
      JSON.stringify({ ...config, password: "unrelated-database-marker" }),
    );
    assert.equal(
      await run([runner, script], dir),
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
