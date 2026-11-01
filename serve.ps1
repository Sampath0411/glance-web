# Starts the Next.js development server and opens the site.
# Usage: powershell -ExecutionPolicy Bypass -File .\serve.ps1 [-Port 3000] [-NoBrowser]

param(
  [int]$Port = 3000,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host "Node.js and npm were not found on PATH." -ForegroundColor Red
  Write-Host "Install Node.js 22 or newer, then run npm install."
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host "Starting Glance Next.js development server in $root"
Write-Host "URL: $url  (Ctrl+C to stop)" -ForegroundColor Green

if (-not $NoBrowser) {
  Start-Process $url
}

& $npm.Source run dev -- --hostname 127.0.0.1 --port $Port
