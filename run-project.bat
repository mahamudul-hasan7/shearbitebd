@echo off
title ShareBite BD - Smart Surplus Food Rescue Platform
color 0A

echo ============================================================
echo        ShareBite BD - Smart Surplus Food Rescue Platform
echo ============================================================
echo.

:: Navigate to project directory
if exist "%~dp0package.json" (
    cd /d "%~dp0"
) else (
    cd /d "C:\Users\rakib\Desktop\sharebite-bd-frontend"
)

echo [*] Working Directory: %CD%
echo [*] Launching browser at http://localhost:3000 ...
echo [*] Starting Next.js Development Server...
echo.

:: Automatically open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Start Next.js development server
npm run dev

pause
