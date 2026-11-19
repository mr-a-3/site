@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0storefront\scripts\stop-store.ps1"
if errorlevel 1 pause
