$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""C:\Users\rakib\Desktop\sharebite-bd-frontend\scripts\auto-daily-runner.ps1"""
$Trigger = New-ScheduledTaskTrigger -Daily -At "8:00PM"
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName "DailyGitHubStreakPusher" -Action $Action -Trigger $Trigger -Settings $Settings -Force
