@echo off
title ShareBite BD - Smart Surplus Food Rescue Platform
color 0A

:: 1. Dynamically locate project folder (100% portable on any PC / drive)
set "PROJECT_DIR=%~dp0"

if not exist "%PROJECT_DIR%package.json" (
    if exist "%PROJECT_DIR%sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%PROJECT_DIR%sharebite-bd-frontend\"
    ) else if exist "%USERPROFILE%\Desktop\sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%USERPROFILE%\Desktop\sharebite-bd-frontend\"
    )
)

cd /d "%PROJECT_DIR%"

:: 2. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo Please install Node.js (LTS version) from: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 3. Auto-install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [*] First-time setup detected on this PC!
    echo [*] Installing dependencies via npm install, please wait...
    echo.
    call npm install --ignore-scripts
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b
    )
    echo.
    echo [*] Dependencies installed successfully!
    echo.
)

:: 4. Start Server and Auto-Open Browser when 100% Ready
echo [*] Launching ShareBite BD engine...
node scripts/start-and-open.mjs
if %errorlevel% neq 0 (
    echo [*] Fallback mode: Starting Next.js directly...
    start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"
    call npm run dev
)

pause
