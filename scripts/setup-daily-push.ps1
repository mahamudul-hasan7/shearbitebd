$ErrorActionPreference = "Stop"

$taskName = "ShareBiteBD-DailyCommitPush"
$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot "daily-push.config.json"
$runnerPath = Join-Path $PSScriptRoot "run-daily-push.ps1"

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot ".git") -PathType Container)) {
  throw "Expected a Git repository at $repoRoot"
}

$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$startAt = [DateTime]::ParseExact(
  "$($config.schedule.startDate) $($config.schedule.time)",
  "yyyy-MM-dd HH:mm",
  [Globalization.CultureInfo]::InvariantCulture
)

if ($startAt -le (Get-Date)) {
  throw "The configured first run must be in the future: $startAt"
}

$powerShellPath = (Get-Command powershell.exe -ErrorAction Stop).Source
$actionArguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runnerPath`""
$action = New-ScheduledTaskAction -Execute $powerShellPath -Argument $actionArguments -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -Daily -At $startAt
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable:$config.schedule.runMissed `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -MultipleInstances IgnoreNew
$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "Push a safe random batch of 15-20 queued ShareBite BD commits each day." `
  -Force | Out-Null

$task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
$info = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction Stop

Write-Output "Task registered: $($task.TaskName)"
Write-Output "State: $($task.State)"
Write-Output "Next run: $($info.NextRunTime)"
Write-Output "Missed runs start when available: $($config.schedule.runMissed)"
