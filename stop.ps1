#!/usr/bin/env pwsh
param()

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "[rocket-alpha-ui] No running service to stop." -ForegroundColor Yellow
