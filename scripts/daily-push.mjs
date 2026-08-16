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
const windowsCommandShell = process.env.ComSpec || "cmd.exe";

mkdirSync(automationDir, { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function dateParts(date = new Date(), timeZone = config.dateMode?.timeZone || "Asia/Dhaka") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values;
}

function localDate() {
  const values = dateParts();
  return `${values.year}-${values.month}-${values.day}`;
}

function localIsoDate(date = new Date()) {
  const values = dateParts(date);
  const offset = values.timeZoneName === "GMT" ? "+00:00" : values.timeZoneName.replace(/^GMT/, "");
  if (!/^[+-]\d{2}:\d{2}$/.test(offset)) throw new Error(`Unable to resolve the ${config.dateMode.timeZone} UTC offset.`);
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}${offset}`;
}

function backupTimestamp(date = new Date()) {
  const values = dateParts(date);
  return `${values.year}${values.month}${values.day}-${values.hour}${values.minute}${values.second}`;
}

function log(message) {
  const line = `[${timestamp()}] ${message}`;
  console.log(line);
  appendFileSync(logPath, `${line}\n`, "utf8");
}

function run(command, commandArgs, { quiet = false, input, env = {} } = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, ...env },
    input,
  });
  const processError = result.error ? `${result.error.name}: ${result.error.message}` : "";
  const stdout = result.stdout || "";
  const output = `${stdout}${result.stderr || ""}${processError ? `\n${processError}` : ""}`.trim();
  if (output && (!quiet || result.status !== 0 || result.error)) appendFileSync(logPath, `${output}\n`, "utf8");
  if (!quiet && output) console.log(output);
  return { status: result.status ?? 1, output, stdout };
}

function git(commandArgs, options) {
  return run("git", commandArgs, options);
}

function npmRun(scriptName, options) {
  if (!/^[a-zA-Z0-9:_-]+$/.test(scriptName)) throw new Error(`Unsafe npm script name: ${scriptName}`);
  if (process.platform === "win32") {
    return run(windowsCommandShell, ["/d", "/s", "/c", `npm.cmd run ${scriptName}`], options);
  }
  return run("npm", ["run", scriptName], options);
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
  if (config.dateMode?.enabled) {
    if (!config.dateMode.timeZone || !config.dateMode.backupBranchPrefix) throw new Error("Daily date mode requires a time zone and backup branch prefix.");
    new Intl.DateTimeFormat("en-CA", { timeZone: config.dateMode.timeZone }).format(new Date());
    const candidateRef = `refs/heads/${config.dateMode.backupBranchPrefix}-20000101-000000-1`;
    if (git(["check-ref-format", candidateRef], { quiet: true }).status !== 0) throw new Error("Daily date mode backup branch prefix is invalid.");
  }
}

function readCommit(commit) {
  const identity = requireSuccess(
    git(["show", "-s", "--format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B", commit], { quiet: true }),
    `Unable to read queued commit ${commit}.`,
  );
  const [authorName, authorEmail, authorDate, committerName, committerEmail, committerDate] = identity.split("\0");
  const rawCommit = git(["cat-file", "commit", commit], { quiet: true });
  requireSuccess(rawCommit, `Unable to read the message for queued commit ${commit}.`);
  const messageOffset = rawCommit.stdout.indexOf("\n\n");
  if (messageOffset === -1) throw new Error(`Queued commit ${commit} has an invalid commit object.`);
  const message = rawCommit.stdout.slice(messageOffset + 2);
  const tree = requireSuccess(git(["show", "-s", "--format=%T", commit], { quiet: true }), `Unable to read the tree for ${commit}.`);
  const ancestry = requireSuccess(git(["rev-list", "--parents", "-n", "1", commit], { quiet: true }), `Unable to read the parent for ${commit}.`).split(/\s+/);
  return { authorName, authorEmail, authorDate, committerName, committerEmail, committerDate, message, tree, parents: ancestry.slice(1) };
}

function rewritePendingDates(pendingCommits, pushCount, remoteCommit) {
  const oldHead = requireSuccess(git(["rev-parse", "HEAD"], { quiet: true }), "Unable to read local HEAD before date rewrite.");
  if (pendingCommits.at(-1) !== oldHead) throw new Error("Queued history is not a simple prefix ending at local HEAD; date rewrite stopped.");

  const backupBranch = `${config.dateMode.backupBranchPrefix}-${backupTimestamp()}-${process.pid}`;
  const backupRef = `refs/heads/${backupBranch}`;
  requireSuccess(git(["update-ref", backupRef, oldHead], { quiet: true }), "Unable to create the pre-rewrite backup branch.");
  log(`Daily date mode backup created: ${backupBranch} (${oldHead}).`);

  const selectedDate = localIsoDate();
  let expectedOldParent = remoteCommit;
  let newParent = remoteCommit;
  let newTarget;

  for (const [index, oldCommit] of pendingCommits.entries()) {
    const metadata = readCommit(oldCommit);
    if (metadata.parents.length !== 1 || metadata.parents[0] !== expectedOldParent) {
      throw new Error(`Queued commit ${oldCommit} is not part of a linear chain; local HEAD was not changed and backup ${backupBranch} was kept.`);
    }

    const useDailyDate = index < pushCount;
    const authorDate = useDailyDate ? selectedDate : metadata.authorDate;
    const committerDate = useDailyDate ? selectedDate : metadata.committerDate;
    const newCommit = requireSuccess(
      git(["commit-tree", metadata.tree, "-p", newParent], {
        quiet: true,
        input: metadata.message,
        env: {
          GIT_AUTHOR_NAME: metadata.authorName,
          GIT_AUTHOR_EMAIL: metadata.authorEmail,
          GIT_AUTHOR_DATE: authorDate,
          GIT_COMMITTER_NAME: metadata.committerName,
          GIT_COMMITTER_EMAIL: metadata.committerEmail,
          GIT_COMMITTER_DATE: committerDate,
        },
      }),
      `Unable to reconstruct queued commit ${oldCommit}; local HEAD was not changed and backup ${backupBranch} was kept.`,
    );

    if (index === pushCount - 1) newTarget = newCommit;
    expectedOldParent = oldCommit;
    newParent = newCommit;
  }

  const oldTree = requireSuccess(git(["rev-parse", `${oldHead}^{tree}`], { quiet: true }), "Unable to verify the pre-rewrite tree.");
  const newTree = requireSuccess(git(["rev-parse", `${newParent}^{tree}`], { quiet: true }), "Unable to verify the reconstructed tree.");
  if (newTree !== oldTree) throw new Error(`Reconstructed tree did not match local HEAD; local HEAD was not changed and backup ${backupBranch} was kept.`);

  const branchRef = `refs/heads/${config.branch}`;
  requireSuccess(git(["update-ref", branchRef, newParent, oldHead], { quiet: true }), `Local branch changed during date rewrite; backup ${backupBranch} was kept.`);
  const status = requireSuccess(git(["status", "--porcelain"], { quiet: true }), "Unable to verify the working tree after date rewrite.");
  if (status) throw new Error(`Working tree changed unexpectedly after date rewrite. Nothing was pushed; recover from ${backupBranch}.`);

  log(`Daily date mode applied ${selectedDate} to ${pushCount} selected commit(s); remaining commit dates were preserved.`);
  return { targetCommit: newTarget, backupBranch };
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
  let targetCommit = pendingCommits[pushCount - 1];
  log(`Queue has ${pendingCommits.length} commit(s); selected ${pushCount} for this run (daily draw: ${dailyLimit}).`);

  if (dryRun) {
    log(`Dry run target: ${targetCommit}. ${config.dateMode?.enabled ? `Daily date mode would date the selected commits as ${today} (${config.dateMode.timeZone}). ` : ""}No tests, history rewrite, or push were executed.`);
    return;
  }

  for (const check of config.safety.checks) {
    log(`Running safety check: npm run ${check}`);
    requireSuccess(npmRun(check, { quiet: true }), `Safety check failed: npm run ${check}. Nothing was pushed.`);
    log(`Safety check passed: ${check}`);
  }

  requireSuccess(git(["fetch", "--quiet", "--no-tags", config.remote, `+refs/heads/${config.branch}:${remoteRef}`], { quiet: true }), "Final fetch failed. Nothing was pushed.");
  const remoteAfter = requireSuccess(git(["rev-parse", remoteRef], { quiet: true }), "Unable to re-read the remote branch.");
  if (remoteAfter !== remoteBefore) throw new Error("Remote branch changed during safety checks. This run stopped to prevent a race.");

  let backupBranch;
  if (config.dateMode?.enabled) {
    const rewrite = rewritePendingDates(pendingCommits, pushCount, remoteBefore);
    targetCommit = rewrite.targetCommit;
    backupBranch = rewrite.backupBranch;
  }

  requireSuccess(
    git(["push", "--porcelain", config.remote, `${targetCommit}:refs/heads/${config.branch}`], { quiet: true }),
    `GitHub push failed.${backupBranch ? ` Rewritten local history is preserved; pre-rewrite backup: ${backupBranch}.` : ""}`,
  );
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
