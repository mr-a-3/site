@echo off
cd /d "%~dp0storefront"
"%~dp0tooling\node.exe" scripts/phone-access.mjs private
pause
