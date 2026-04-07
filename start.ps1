#!/usr/bin/env pwsh
param()

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path (Join-Path $PSScriptRoot "package.json"))) {
    throw "package.json not found"
}

Write-Host "[rocket-alpha-ui] Shared package only - no long-running service to start." -ForegroundColor Yellow
Write-Host "  Consumers: C:\rocket-alpha-admin-fe, C:\rocket-alpha-cus-fe" -ForegroundColor White
