# Daily Commit Push Automation

This repository queues real local commits and can publish a random prefix of 15-20 commits each day without rewriting the remote branch.

## Selected configuration

- Branch: `segmented/16-commits`
- Remote: `origin`
- Daily batch: random 15-20 commits
- First run: 2026-08-12 at 10:00 PM (Asia/Dhaka workstation time)
- Missed run: start when the computer is next available
- Safety: require a clean working tree, stop on divergence, then run lint, typecheck, and production build

Change future batch or schedule values in `daily-push.config.json`, then rerun `npm run git:daily:setup` when schedule values change.

## Commands

```powershell
npm.cmd run git:daily:status
npm.cmd run git:daily:push
npm.cmd run git:daily:push -- --count=18 --force
npm.cmd run git:daily:setup
npm.cmd run git:daily:remove
```

`git:daily:status` fetches the configured remote and previews the random batch without tests or a push. `--count=N` overrides the random count for a manual run. `--force` allows another successful run on the same Dhaka calendar day.

## Safety behavior

The scheduled run stops without pushing when:

- the current branch is not the configured branch;
- the working tree contains uncommitted or untracked changes;
- GitHub fetch or authentication fails;
- the remote branch is not an ancestor of local `HEAD`;
- lint, typecheck, or build fails;
- the remote branch changes while checks are running;
- another daily push process already holds the automation lock.

Logs and run state are kept outside the repository under `%LOCALAPPDATA%\ShareBiteBD`. The script pushes only the selected ancestor commit to the configured remote branch; later queued commits remain local.

GitHub attributes contributions according to commit metadata and its default-branch rules, not merely the time a batch is pushed.
