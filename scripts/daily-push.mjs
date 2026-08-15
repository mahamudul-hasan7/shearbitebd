import { randomInt } from "node:crypto";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const configPath = resolve(rootDir, "daily-push.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const forceToday = args.has("--force");
const countArgument = process.argv.slice(2).find((value) => value.startsWith("--count="));
const requestedCount = countArgument ? Number(countArgument.slice("--count=".length)) : undefined;
const localDataRoot = process.env.LOCALAPPDATA || join(homedir(), ".sharebite-bd");
const automationDir = join(localDataRoot, "ShareBiteBD");
const logPath = join(automationDir, "daily-push.log");
const statePath = join(automationDir, "daily-push-state.json");
const lockPath = join(automationDir, "daily-push.lock");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

mkdirSync(automationDir, { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function localDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function log(message) {
  const line = `[${timestamp()}] ${message}`;
  console.log(line);
  appendFileSync(logPath, `${line}\n`, "utf8");
}

function run(command, commandArgs, { quiet = false } = {}) {
  const result = spawnSync(command, commandArgs, { cwd: rootDir, encoding: "utf8", windowsHide: true, env: process.env });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (output) appendFileSync(logPath, `${output}\n`, "utf8");
  if (!quiet && output) console.log(output);
  return { status: result.status ?? 1, output };
}

function git(commandArgs, options) {
  return run("git", commandArgs, options);
}

function requireSuccess(result, message) {
  if (result.status !== 0) throw new Error(message);
  return result.output.trim();
}

function readState() {
  try { return JSON.parse(readFileSync(statePath, "utf8")); }
  catch { return {}; }
}

function acquireLock() {
  if (existsSync(lockPath)) {
    const ageMs = Date.now() - statSync(lockPath).mtimeMs;
    if (ageMs > 6 * 60 * 60 * 1_000) unlinkSync(lockPath);
  }
  try {
    const descriptor = openSync(lockPath, "wx");
    writeFileSync(descriptor, `${process.pid}\n${timestamp()}\n`, "utf8");
    closeSync(descriptor);
  } catch {
    log("Another daily push process is already running; this run is skipped.");
    process.exit(0);
  }
}

function validateConfig() {
  if (!config.remote || !config.branch) throw new Error("Configure both remote and branch.");
  if (!Number.isInteger(config.minCommits) || !Number.isInteger(config.maxCommits) || config.minCommits < 1 || config.maxCommits < config.minCommits) {
    throw new Error("Commit limits in daily-push.config.json are invalid.");
  }
  if (requestedCount !== undefined && (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 100)) {
    throw new Error("--count must be an integer between 1 and 100.");
  }
}

function main() {
  validateConfig();
  acquireLock();
  const today = localDate();
  const state = readState();
  log(`Daily push started${dryRun ? " in dry-run mode" : ""}.`);
  if (!dryRun && !forceToday && state.lastSuccessfulDate === today) {
    log(`A successful push already ran on ${today}; use --force to run again.`);
    return;
  }

  const repositoryRoot = requireSuccess(git(["rev-parse", "--show-toplevel"], { quiet: true }), "This folder is not a Git repository.");
  if (resolve(repositoryRoot).toLowerCase() !== rootDir.toLowerCase()) throw new Error("The automation resolved an unexpected repository root.");
  const currentBranch = requireSuccess(git(["branch", "--show-current"], { quiet: true }), "Unable to read the current branch.");
  if (currentBranch !== config.branch) throw new Error(`Expected branch ${config.branch}, found ${currentBranch || "detached HEAD"}.`);

  if (config.safety.requireCleanTree) {
    const status = requireSuccess(git(["status", "--porcelain"], { quiet: true }), "Unable to inspect the working tree.");
    if (status) throw new Error("Working tree is not clean. Commit or stash changes before the scheduled push.");
  }

  const remoteRef = `refs/remotes/${config.remote}/${config.branch}`;
  requireSuccess(git(["fetch", "--quiet", "--no-tags", config.remote, `+refs/heads/${config.branch}:${remoteRef}`], { quiet: true }), "Fetch failed. Check network access and GitHub authentication.");
  const remoteBefore = requireSuccess(git(["rev-parse", remoteRef], { quiet: true }), "The configured remote branch does not exist.");
  if (config.safety.stopOnDivergence) {
    const ancestorCheck = git(["merge-base", "--is-ancestor", remoteRef, "HEAD"], { quiet: true });
    if (ancestorCheck.status !== 0) throw new Error("Local and remote history diverged. Scheduled push stopped without changing either branch.");
  }

  const pendingOutput = requireSuccess(git(["rev-list", "--reverse", `${remoteRef}..HEAD`], { quiet: true }), "Unable to calculate the queued commits.");
  const pendingCommits = pendingOutput ? pendingOutput.split(/\r?\n/).filter(Boolean) : [];
  if (pendingCommits.length === 0) {
    log("Queue is empty; nothing to push.");
    return;
  }

  const dailyLimit = requestedCount ?? randomInt(config.minCommits, config.maxCommits + 1);
  const pushCount = Math.min(dailyLimit, pendingCommits.length);
  const targetCommit = pendingCommits[pushCount - 1];
  log(`Queue has ${pendingCommits.length} commit(s); selected ${pushCount} for this run (daily draw: ${dailyLimit}).`);

  if (dryRun) {
    log(`Dry run target: ${targetCommit}. No tests or push were executed.`);
    return;
  }

  for (const check of config.safety.checks) {
    log(`Running safety check: npm run ${check}`);
    requireSuccess(run(npmCommand, ["run", check], { quiet: true }), `Safety check failed: npm run ${check}. Nothing was pushed.`);
    log(`Safety check passed: ${check}`);
  }

  requireSuccess(git(["fetch", "--quiet", "--no-tags", config.remote, `+refs/heads/${config.branch}:${remoteRef}`], { quiet: true }), "Final fetch failed. Nothing was pushed.");
  const remoteAfter = requireSuccess(git(["rev-parse", remoteRef], { quiet: true }), "Unable to re-read the remote branch.");
  if (remoteAfter !== remoteBefore) throw new Error("Remote branch changed during safety checks. This run stopped to prevent a race.");

  requireSuccess(git(["push", "--porcelain", config.remote, `${targetCommit}:refs/heads/${config.branch}`], { quiet: true }), "GitHub push failed. No local history was changed.");
  writeFileSync(statePath, JSON.stringify({ lastSuccessfulDate: today, pushedAt: timestamp(), pushedCount: pushCount, targetCommit }, null, 2), "utf8");
  log(`Successfully pushed ${pushCount} commit(s). ${pendingCommits.length - pushCount} remain queued.`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown automation error.";
  log(`STOPPED: ${message}`);
  process.exitCode = 1;
} finally {
  try { if (existsSync(lockPath)) unlinkSync(lockPath); } catch { /* A stale lock expires automatically after six hours. */ }
}
