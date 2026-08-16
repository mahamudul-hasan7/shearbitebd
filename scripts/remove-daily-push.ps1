$ErrorActionPreference = "Stop"

$taskName = "ShareBiteBD-DailyCommitPush"
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
  Write-Output "Removed scheduled task: $taskName"
} else {
  Write-Output "Scheduled task is not installed: $taskName"
}
