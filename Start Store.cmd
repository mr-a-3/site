@echo off
cd /d "%~dp0storefront"
set "PATH=%~dp0tooling;%PATH%"
node scripts/start-store.mjs
if errorlevel 1 pause
