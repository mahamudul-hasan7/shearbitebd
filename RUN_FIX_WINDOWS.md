# Windows Run Fix

## Requirements
- Node.js 20.9 or newer
- npm included with Node.js

## Clean install
Open the project folder in VS Code, then run in its terminal:

```powershell
node -v
npm -v
npm config set registry https://registry.npmjs.org/
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm cache verify
npm install
npm run dev
```

Open: http://localhost:3000

## If PowerShell blocks npm scripts
Run PowerShell as Administrator once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then close and reopen VS Code.
