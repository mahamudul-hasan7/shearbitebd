# Auto Daily GitHub Streak Pusher Script
$LogPath = "C:\Users\rakib\Desktop\daily-push.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Write-Log($msg) {
    $line = "[$Timestamp] $msg"
    Add-Content -Path $LogPath -Value $line
    Write-Output $line
}

Write-Log "Starting daily automated GitHub push run..."

$SharebitePath = "C:\Users\rakib\Desktop\sharebite-bd-frontend"
$TrackerPath = "C:\Users\rakib\Desktop\daily-coding-tracker"

try {
    Set-Location -Path $SharebitePath
    $status = git status --porcelain

    if ($status -match "src/app/\(auth\)") {
        Write-Log "Found uncommitted Auth pages. Executing Batch 2..."
        git add "src/app/(auth)/splash/page.tsx" "src/app/(auth)/role-selection/page.tsx" "src/app/(auth)/login/page.tsx"
        git commit -m "feat(auth-pages): polish auth onboarding, role selection, and login portals"
        git push origin segmented/16-commits
        Write-Log "Batch 2 successfully pushed to GitHub!"
        $notificationText = "Batch 2 (Auth Portal Pages) pushed to GitHub!"
    }
    elseif ($status -match "src/app/page\.tsx") {
        Write-Log "Found uncommitted Landing page. Executing Batch 3..."
        git add "next-env.d.ts" "src/app/page.tsx"
        git commit -m "feat(home): modernize public landing page with rich feature sections"
        git push origin segmented/16-commits
        Write-Log "Batch 3 successfully pushed to GitHub!"
        $notificationText = "Batch 3 (Landing Page) pushed to GitHub!"
    }
    else {
        Write-Log "ShareBite completed. Updating Daily Coding Tracker..."
        Set-Location -Path $TrackerPath
        $todayDate = Get-Date -Format "yyyy-MM-dd"
        $trackerLog = Join-Path $TrackerPath "DAILY_STREAK.md"
        Add-Content -Path $trackerLog -Value "- [x] Active Daily Coding Session recorded on $todayDate ($Timestamp)"
        git add .
        git commit -m "chore(streak): record daily coding habit session for $todayDate"
        git push origin main
        Write-Log "Daily Coding Tracker successfully updated and pushed!"
        $notificationText = "Daily Coding Tracker updated! Streak maintained."
    }

    # Show Windows Toast / Popup Notification
    Add-Type -AssemblyName System.Windows.Forms
    $global:balloon = New-Object System.Windows.Forms.NotifyIcon
    $path = (Get-Process -id $pid).Path
    $balloon.Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
    $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
    $balloon.BalloonTipText = $notificationText
    $balloon.BalloonTipTitle = "GitHub Streak Auto-Pushed! 🚀"
    $balloon.Visible = $true
    $balloon.ShowBalloonTip(4000)

} catch {
    Write-Log "ERROR occurred during push: $_"
}
