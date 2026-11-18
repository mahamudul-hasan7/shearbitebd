import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { runPostgresCommand } from "../scripts/postgres-command.mjs";

test("PostgreSQL commands finish when their child server inherits output pipes", { timeout: 10_000 }, async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "sharebite output test "));
  const pidFile = path.join(workspace, "server.pid");
  const fixture = path.join(workspace, "pg-ctl-fixture.mjs");
  let timer;
  try {
    await fs.writeFile(fixture, `
      import { spawn } from "node:child_process";
      import fs from "node:fs";
      const server = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], {
        stdio: ["ignore", "inherit", "inherit"],
      });
      fs.writeFileSync(process.argv[2], String(server.pid));
      server.unref();
      console.log("server started");
      process.exit(0);
    `);
    const output = await Promise.race([
      runPostgresCommand(process.execPath, [fixture, pidFile]),
      new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error("Still waiting for the server's inherited pipes after pg_ctl exited")), 3000);
      }),
    ]);
    assert.match(output, /server started/);
    const pid = Number(await fs.readFile(pidFile, "utf8"));
    assert.doesNotThrow(() => process.kill(pid, 0), "The database server should still be running");
  } finally {
    clearTimeout(timer);
    const pid = await fs.readFile(pidFile, "utf8").catch(() => "");
    if (pid) {
      try { process.kill(Number(pid)); } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test("PostgreSQL command failures preserve their diagnostic output", async () => {
  await assert.rejects(
    runPostgresCommand(process.execPath, ["-e", 'console.error("known startup failure"); process.exitCode = 17;']),
    /known startup failure/,
  );
});
