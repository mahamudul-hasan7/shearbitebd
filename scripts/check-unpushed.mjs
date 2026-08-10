import { execFileSync } from "node:child_process";

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function safeRunGit(args) {
  try {
    return runGit(args);
  } catch (error) {
    return null;
  }
}

const branch = safeRunGit(["branch", "--show-current"]) || "detached HEAD";
const status = safeRunGit(["status", "--porcelain"]) || "";
const upstream = safeRunGit([
  "rev-parse",
  "--abbrev-ref",
  "--symbolic-full-name",
  "@{u}",
]);

console.log(`Branch: ${branch}`);

if (!upstream) {
  console.log("No upstream branch is configured yet.");
  if (status) {
    console.log("Working tree has uncommitted changes:");
    console.log(status);
    process.exitCode = 1;
    console.log("Tip: commit or stash these changes before pushing.");
  }
  process.exit(process.exitCode ? 1 : 0);
}

const aheadCount = Number(safeRunGit(["rev-list", "--count", `${upstream}..HEAD`]) || "0");
const behindCount = Number(safeRunGit(["rev-list", "--count", `HEAD..${upstream}`]) || "0");

if (status) {
  console.log("Working tree has uncommitted changes:");
  console.log(status);
}

if (aheadCount > 0) {
  console.log(`You have ${aheadCount} unpushed commit(s) on ${branch}.`);
  const commits = safeRunGit([
    "log",
    "--oneline",
    `${upstream}..HEAD`,
  ]);
  if (commits) {
    console.log("Unpushed commits:");
    console.log(commits);
  }
  console.log(`Push with: git push`);
  process.exitCode = 1;
}

if (behindCount > 0) {
  console.log(`Your branch is behind upstream by ${behindCount} commit(s).`);
  process.exitCode = 1;
}

if (!status && aheadCount === 0 && behindCount === 0) {
  console.log("Everything is synced. Nothing to push.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
