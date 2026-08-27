# Daily Commit Push Automation

This repository queues real local commits and publishes a safe prefix without rewriting the remote branch. It currently has a five-push-day maintenance campaign.

## Selected configuration

- Branch: `segmented/16-commits`
- Remote: `origin`
- Campaign batches: 15 + 15 + 15 + 15 + 16 = 76 real commits
- First eligible run: 2026-08-20 at 7:00 PM (Asia/Dhaka workstation time)
- Pattern: push for at most two consecutive successful days, then keep one rest day
- Expected dates when the PC is available: August 20, 21, 23, 24, and 26, 2026
- Missed run: start when the computer is next available
- Daily date mode: selected commits receive that Dhaka calendar day's author and committer date
- Safety: require a clean working tree, stop on divergence, then run lint, typecheck, and production build

The campaign advances only after a successful push. If the PC is unavailable, the next login catches up that missed batch and the two-on/one-rest pattern continues from the actual successful date. Change future campaign or schedule values in `daily-push.config.json`, then rerun `npm run git:daily:setup` when the Windows task time changes.

## Commands

```powershell
npm.cmd run git:daily:status
npm.cmd run git:daily:push
npm.cmd run git:daily:push -- --count=18 --force
npm.cmd run git:daily:setup
npm.cmd run git:daily:remove
```

`git:daily:status` fetches the configured remote and previews the eligible campaign batch without tests or a push. While a campaign is active, its exact batch count takes priority over `--count=N`. Outside a campaign, `--count=N` overrides the random count and `--force` allows another successful run on the same Dhaka calendar day.

## Safety behavior

The scheduled run stops without pushing when:

- the current branch is not the configured branch;
- the working tree contains uncommitted or untracked changes;
- GitHub fetch or authentication fails;
- the remote branch is not an ancestor of local `HEAD`;
- lint, typecheck, or build fails;
- the remote branch changes while checks are running;
- another daily push process already holds the automation lock.
- the active campaign has not reached its next eligible date;
- the queue does not contain enough commits for the campaign's exact next batch.

Logs and run state are kept outside the repository under `%LOCALAPPDATA%\ShareBiteBD`. The script pushes only the selected ancestor commit to the configured remote branch; later queued commits remain local.

After all five successful push days, the campaign marks itself complete and future scheduled runs leave any later work untouched. To start another campaign, use a new campaign `id`, start date, and batch list.

When daily date mode is enabled, the script rewrites only the unpushed linear queue after all safety checks pass. The selected prefix gets the current `Asia/Dhaka` date, while later queued commits retain their existing dates. Because changing an ancestor changes descendant hashes, the entire unpushed queue is reconstructed with the same trees, messages, and identities. A timestamped `backup/daily-date-*` branch is created before local `HEAD` moves. Already-pushed remote commits are never rewritten.

GitHub attributes contributions according to commit metadata and its default-branch rules, not merely the time a batch is pushed.
