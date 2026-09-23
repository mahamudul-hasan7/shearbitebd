$ErrorActionPreference = "Stop"

$taskName = "ShareBiteBD-DailyCommitPush"
$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $repoRoot "daily-push.config.json"
$runnerPath = Join-Path $PSScriptRoot "run-daily-push.ps1"

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot ".git") -PathType Container)) {
  throw "Expected a Git repository at $repoRoot"
}

$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$times = @($config.schedule.times)
if ($times.Count -ne 3) { throw "Exactly three daily schedule times are required." }
$triggers = foreach ($time in $times) {
  $startAt = [DateTime]::ParseExact(
    "$($config.schedule.startDate) $time",
    "yyyy-MM-dd HH:mm",
    [Globalization.CultureInfo]::InvariantCulture
  )
  New-ScheduledTaskTrigger -Daily -At $startAt
}

$powerShellPath = (Get-Command powershell.exe -ErrorAction Stop).Source
$actionArguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runnerPath`""
$action = New-ScheduledTaskAction -Execute $powerShellPath -Argument $actionArguments -WorkingDirectory $repoRoot
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable:$config.schedule.runMissed `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -MultipleInstances Queue
$userId = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $triggers `
  -Settings $settings `
  -Principal $principal `
  -Description "Push 5 verified ShareBite BD commits at 17:00, 21:00, and 23:00 each day." `
  -Force | Out-Null

$task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
$info = Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction Stop

Write-Output "Task registered: $($task.TaskName)"
Write-Output "State: $($task.State)"
Write-Output "Daily runs: $($times -join ', ')"
Write-Output "Commits per run: $($config.schedule.commitsPerRun)"
Write-Output "Next run: $($info.NextRunTime)"
Write-Output "Missed runs start when available: $($config.schedule.runMissed)"
