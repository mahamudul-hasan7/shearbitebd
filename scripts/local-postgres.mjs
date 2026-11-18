import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import net from "node:net";
import { parseEnv } from "node:util";
import { PrismaClient } from "@prisma/client";
import { runPostgresCommand as run } from "./postgres-command.mjs";

const root = path.resolve(".local-postgres");
const cluster = path.join(root, "cluster");
const credentialsFile = path.join(root, "credentials.json");
const logFile = path.join(root, "postgres.log");
const command = process.argv[2] || "start";

function availablePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", (error) => {
      if (preferredPort && ["EADDRINUSE", "EACCES"].includes(error.code)) {
        availablePort(0).then(resolve, reject);
      } else reject(error);
    });
    probe.listen({ host: "127.0.0.1", port: preferredPort, exclusive: true }, () => {
      const port = probe.address().port;
      probe.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

function saveDatabaseUrl(url, config) {
  const envFile = path.resolve(".env.local");
  const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  const configured = parseEnv(existing);
  if (configured.DATABASE_URL) {
    const current = new URL(configured.DATABASE_URL);
    const owned = current.hostname === "127.0.0.1"
      && decodeURIComponent(current.username) === config.user
      && decodeURIComponent(current.password) === config.password
      && current.pathname === "/sharebite_bd";
    if (!owned) return;
    // Keep the selected schema and other options when our local port changes.
    current.port = url.port;
    url = current;
  }
  const line = `DATABASE_URL="${url.href}"`;
  const updated = /^DATABASE_URL\s*=/m.test(existing)
    ? existing.replace(/^DATABASE_URL\s*=.*$/m, line)
    : `${existing.trimEnd()}\n${line}\n`;
  fs.writeFileSync(envFile, updated, { mode: 0o600 });
}

async function main() {
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const binaries = await import(`@embedded-postgres/${platform}-${process.arch}`);
  fs.mkdirSync(root, { recursive: true });
  if (!fs.existsSync(credentialsFile)) {
    fs.writeFileSync(credentialsFile, JSON.stringify({ user: "sharebite", password: randomBytes(24).toString("hex"), port: 5433 }), { mode: 0o600, flag: "wx" });
  }
  const config = JSON.parse(fs.readFileSync(credentialsFile, "utf8"));
  if (["stop", "status"].includes(command)) {
    console.log((await run(binaries.pg_ctl, ["-D", cluster, command === "stop" ? "stop" : "status", ...(command === "stop" ? ["-m", "fast", "-w"] : [])])).trim());
    return;
  }
  if (!fs.existsSync(path.join(cluster, "PG_VERSION"))) {
    const passwordFile = path.join(root, "init-password.tmp");
    fs.writeFileSync(passwordFile, config.password + "\n", { mode: 0o600 });
    try {
      await run(binaries.initdb, ["-D", cluster, "-U", config.user, "--pwfile", passwordFile, "--auth=scram-sha-256", "--encoding=UTF8", "--locale=C"]);
    } finally { fs.unlinkSync(passwordFile); }
  }
  let running = false;
  try { await run(binaries.pg_ctl, ["-D", cluster, "status"]); running = true; } catch { /* Start our own cluster only. */ }
  if (running) {
    // Recover the actual port if an earlier launch stopped before saving its config.
    const actualPort = Number(fs.readFileSync(path.join(cluster, "postmaster.pid"), "utf8").split(/\r?\n/)[3]);
    if (!Number.isInteger(actualPort) || actualPort < 1 || actualPort > 65535) {
      throw new Error("Could not read the running local database port.");
    }
    config.port = actualPort;
  } else {
    const port = await availablePort(config.port);
    if (port !== config.port) {
      console.log(`Local database port ${config.port} is busy. Using port ${port}.`);
    }
    config.port = port;
    console.log("Starting local PostgreSQL...");
    try {
      await run(binaries.pg_ctl, ["-D", cluster, "-l", logFile, "-o", `-h 127.0.0.1 -p ${config.port}`, "-t", "120", "-w", "start"]);
    } catch (error) {
      console.error(`PostgreSQL startup log: ${logFile}`);
      if (fs.existsSync(logFile) && fs.statSync(logFile).isFile()) {
        const recent = fs.readFileSync(logFile, "utf8").trimEnd().split(/\r?\n/).slice(-20).join("\n");
        console.error(recent);
      }
      throw error;
    }
  }
  fs.writeFileSync(credentialsFile, JSON.stringify(config), { mode: 0o600 });
  const url = new URL(`postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/postgres`);
  const admin = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    const found = await admin.$queryRaw`SELECT 1 FROM pg_database WHERE datname = 'sharebite_bd'`;
    if (!found.length) await admin.$executeRawUnsafe('CREATE DATABASE "sharebite_bd"');
  } finally { await admin.$disconnect(); }
  url.pathname = "/sharebite_bd";
  saveDatabaseUrl(new URL(`${url.href}?schema=public`), config);
  console.log(`Local PostgreSQL is ready on 127.0.0.1:${config.port}. Data stays in .local-postgres/cluster.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
