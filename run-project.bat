@echo off
title ShareBite BD - Smart Surplus Food Rescue Platform
color 0A

:: 1. Dynamically locate project folder (100% portable on any PC / drive)
set "PROJECT_DIR=%~dp0"

:: If run from outside, search current dir, subfolder, or user desktop
if not exist "%PROJECT_DIR%package.json" (
    if exist "%PROJECT_DIR%sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%PROJECT_DIR%sharebite-bd-frontend\"
    ) else if exist "%USERPROFILE%\Desktop\sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%USERPROFILE%\Desktop\sharebite-bd-frontend\"
    )
)

cd /d "%PROJECT_DIR%"

echo ============================================================
echo        ShareBite BD - Smart Surplus Food Rescue Platform
echo ============================================================
echo [*] Detected Project Folder: %CD%
echo.

:: 2. Check if Node.js is installed on this PC
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo Please install Node.js (LTS version) from: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 3. Auto-install dependencies if node_modules is missing (e.g. copied via pendrive)
if not exist "node_modules\" (
    echo [*] First-time setup detected on this PC!
    echo [*] Installing dependencies via npm install, please wait...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error. Please check your internet connection.
        pause
        exit /b
    )
    echo.
    echo [*] Dependencies installed successfully!
    echo.
)

:: 4. Auto-launch browser ONLY after server is ready and listening on port 3000
echo [*] Starting background listener to launch browser when server is ready...
start "" cmd /c "powershell -NoProfile -Command ""while (!(Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet)) { Start-Sleep -Milliseconds 800 }; Start-Process 'http://localhost:3000'"""

:: 5. Start Next.js Development Server
echo [*] Starting Next.js Server on http://localhost:3000 ...
echo [!] NOTE: Do NOT close this black CMD window while using the website!
echo.
npm run dev

pause
