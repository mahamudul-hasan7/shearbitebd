import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";

const project = fileURLToPath(new URL("../", import.meta.url));

async function run(workspace, script, ...args) {
  const env = { ...process.env };
  delete env.DATABASE_URL;
  delete env.OTP_SECRET;
  const child = spawn(process.execPath, [path.join("scripts", script), ...args], {
    cwd: workspace,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  const [code] = await once(child, "close");
  return { code, output };
}

test("local PostgreSQL handles occupied ports, restarts with saved data and reports startup logs", { timeout: 180_000 }, async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "sharebite database test "));
  const databaseDir = path.join(workspace, ".local-postgres");
  const blocker = net.createServer(socket => socket.destroy());
  try {
    await fs.mkdir(databaseDir);
    await fs.mkdir(path.join(workspace, "scripts"));
    await fs.symlink(await fs.realpath(path.join(project, "node_modules")), path.join(workspace, "node_modules"), "junction");
    for (const name of ["local-postgres.mjs", "postgres-command.mjs", "ensure-database.mjs", "database-env.mjs", "ensure-secrets.mjs"]) {
      await fs.copyFile(path.join(project, "scripts", name), path.join(workspace, "scripts", name));
    }
    blocker.listen({ host: "127.0.0.1", port: 0 });
    await once(blocker, "listening");
    const originalPort = blocker.address().port;
    const password = randomBytes(24).toString("hex");
    const credentials = path.join(databaseDir, "credentials.json");
    await fs.writeFile(credentials, JSON.stringify({ user: "sharebite", password, port: originalPort }));
    const originalUrl = new URL(`postgresql://sharebite:${password}@127.0.0.1:${originalPort}/sharebite_bd?schema=public&connection_limit=1`);
    const envFile = path.join(workspace, ".env.local");
    const secret = randomBytes(32).toString("hex");
    await fs.writeFile(envFile, `OTP_SECRET="${secret}"\nDATABASE_URL="${originalUrl.href}"\nOTHER_SETTING=keep\n`);

    const started = await run(workspace, "local-postgres.mjs", "start");
    assert.equal(started.code, 0, started.output);
    assert.match(started.output, /is busy. Using port/);
    const config = JSON.parse(await fs.readFile(credentials, "utf8"));
    assert.notEqual(config.port, originalPort);
    const updated = await fs.readFile(envFile, "utf8");
    const databaseUrl = new URL(updated.match(/^DATABASE_URL="(.*)"$/m)[1]);
    assert.equal(databaseUrl.port, String(config.port));
    assert.equal(databaseUrl.searchParams.get("connection_limit"), "1");
    assert.ok(updated.includes(`OTP_SECRET="${secret}"`));
    assert.ok(updated.includes("OTHER_SETTING=keep"));

    // Simulate an interrupted launch leaving the stored port behind the running server.
    await fs.writeFile(credentials, JSON.stringify({ ...config, port: originalPort }));
    await fs.writeFile(envFile, updated.replace(databaseUrl.href, originalUrl.href));
    const recovered = await run(workspace, "local-postgres.mjs", "start");
    assert.equal(recovered.code, 0, recovered.output);
    assert.equal(JSON.parse(await fs.readFile(credentials, "utf8")).port, config.port);
    assert.ok((await fs.readFile(envFile, "utf8")).includes(databaseUrl.href));

    const client = new PrismaClient({ datasources: { db: { url: databaseUrl.href } } });
    try {
      await client.$executeRawUnsafe("CREATE TABLE launcher_marker (value TEXT)");
      await client.$executeRawUnsafe("INSERT INTO launcher_marker VALUES ('preserved')");
    } finally { await client.$disconnect(); }
    const stopped = await run(workspace, "local-postgres.mjs", "stop");
    assert.equal(stopped.code, 0, stopped.output);

    const restarted = await run(workspace, "ensure-database.mjs");
    assert.equal(restarted.code, 0, restarted.output);
    assert.match(restarted.output, /Local PostgreSQL is ready/);
    const restored = new PrismaClient({ datasources: { db: { url: databaseUrl.href } } });
    try {
      assert.deepEqual(await restored.$queryRawUnsafe("SELECT value FROM launcher_marker"), [{ value: "preserved" }]);
    } finally { await restored.$disconnect(); }
    assert.equal((await run(workspace, "local-postgres.mjs", "stop")).code, 0);

    const externalEnv = 'DATABASE_URL="postgresql://external:example@127.0.0.1:5433/custom_database?schema=custom"\n';
    await fs.writeFile(envFile, externalEnv);
    const externalStart = await run(workspace, "local-postgres.mjs", "start");
    assert.equal(externalStart.code, 0, externalStart.output);
    assert.equal(await fs.readFile(envFile, "utf8"), externalEnv);
    assert.equal((await run(workspace, "local-postgres.mjs", "stop")).code, 0);
    assert.equal((await run(workspace, "ensure-database.mjs")).code, 0);
    assert.notEqual((await run(workspace, "local-postgres.mjs", "status")).code, 0);

    await fs.writeFile(path.join(databaseDir, "cluster", "postgresql.auto.conf"), "launcher_invalid_setting = on\n");
    const failed = await run(workspace, "local-postgres.mjs", "start");
    assert.notEqual(failed.code, 0);
    assert.match(failed.output, /PostgreSQL startup log/);
    assert.match(failed.output, /launcher_invalid_setting/);
  } finally {
    await run(workspace, "local-postgres.mjs", "stop").catch(() => {});
    if (blocker.listening) await new Promise(resolve => blocker.close(resolve));
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
