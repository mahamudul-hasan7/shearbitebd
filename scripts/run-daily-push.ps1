$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runnerPath = Join-Path $PSScriptRoot "daily-push.mjs"
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$config = Get-Content -Raw -LiteralPath (Join-Path $repoRoot "daily-push.config.json") | ConvertFrom-Json
$commitCount = [int]$config.schedule.commitsPerRun

Set-Location -LiteralPath $repoRoot
& $nodePath $runnerPath --force "--count=$commitCount"
exit $LASTEXITCODE
