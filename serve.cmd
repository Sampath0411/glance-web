@echo off
rem Double-click to preview the site at http://localhost:3000/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" %*
if errorlevel 1 pause
