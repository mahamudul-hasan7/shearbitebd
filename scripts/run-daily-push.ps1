$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$runnerPath = Join-Path $PSScriptRoot "daily-push.mjs"
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source

Set-Location -LiteralPath $repoRoot
& $nodePath $runnerPath
exit $LASTEXITCODE
