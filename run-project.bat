@echo off
setlocal
title ShareBite BD - Smart Surplus Food Rescue Platform
color 0A

set "PROJECT_DIR=%~dp0"
if not exist "%PROJECT_DIR%package.json" (
    if exist "%PROJECT_DIR%sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%PROJECT_DIR%sharebite-bd-frontend\"
    ) else if exist "%USERPROFILE%\Desktop\sharebite-bd-frontend\package.json" (
        set "PROJECT_DIR=%USERPROFILE%\Desktop\sharebite-bd-frontend\"
    )
)

if not exist "%PROJECT_DIR%package.json" (
    echo [ERROR] Could not find the ShareBite BD project.
    goto fail
)
cd /d "%PROJECT_DIR%" || goto fail

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ShareBite BD requires Node.js 22 or newer.
    echo Download Node.js LTS from https://nodejs.org
    goto fail
)

if not exist "node_modules\.package-lock.json" (
    echo [*] Installing dependencies...
    call npm ci
    if errorlevel 1 goto fail
)

node scripts/database-setup-state.mjs check
if errorlevel 1 goto setup
goto launch

:setup
echo [*] Setting up the local database...
call npm run db:setup
if errorlevel 1 goto fail
node scripts/database-setup-state.mjs mark
if errorlevel 1 goto fail

:launch
node scripts/start-and-open.mjs
if errorlevel 1 goto fail
exit /b 0

:fail
echo [ERROR] ShareBite BD could not start. See the message above.
pause
exit /b 1
