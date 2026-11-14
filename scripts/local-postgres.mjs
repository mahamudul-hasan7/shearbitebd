import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const root = path.resolve(".local-postgres");
const cluster = path.join(root, "cluster");
const credentialsFile = path.join(root, "credentials.json");
const command = process.argv[2] || "start";

function run(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => {
      child.stdout.destroy();
      child.stderr.destroy();
      if (code === 0) resolve(output);
      else reject(new Error(output || `PostgreSQL command failed (${code}).`));
    });
  });
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
  if (!running) await run(binaries.pg_ctl, ["-D", cluster, "-l", path.join(root, "postgres.log"), "-o", `-h 127.0.0.1 -p ${config.port}`, "-w", "start"]);
  const url = new URL(`postgresql://${config.user}:${config.password}@127.0.0.1:${config.port}/postgres`);
  const admin = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    const found = await admin.$queryRaw`SELECT 1 FROM pg_database WHERE datname = 'sharebite_bd'`;
    if (!found.length) await admin.$executeRawUnsafe('CREATE DATABASE "sharebite_bd"');
  } finally { await admin.$disconnect(); }
  url.pathname = "/sharebite_bd";
  const envFile = path.resolve(".env.local");
  const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  if (!/^DATABASE_URL\s*=/m.test(existing)) {
    fs.writeFileSync(envFile, `${existing.trimEnd()}\nDATABASE_URL="${url.href}?schema=public"\n`, { mode: 0o600 });
  }
  console.log(`Local PostgreSQL is ready on 127.0.0.1:${config.port}. Data stays in .local-postgres/cluster.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
