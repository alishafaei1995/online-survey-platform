<#
  اجرای این اسکریپت روی سیستم توسعه (اینجا) برای ساخت یک بسته آپدیت قابل انتقال با فلش/USB.
  مثال اجرا:
    .\scripts\build-update-package.ps1 -Notes "رفع باگ گزارش‌گیری"
    .\scripts\build-update-package.ps1 -Version 2.0.0 -Notes "افزودن ماژول جدید" -IncludeNodeModules
#>
param(
  [string]$Version,
  [string]$Notes = "",
  [switch]$IncludeNodeModules
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$serverDir = Join-Path $root "server"
$clientDir = Join-Path $root "client"
$packagesDir = Join-Path $root "dist-packages"

$currentVersionFile = Join-Path $serverDir "version.json"
$current = Get-Content $currentVersionFile -Raw | ConvertFrom-Json

if (-not $Version) {
  $parts = $current.version.Split('.')
  $parts[2] = [string]([int]$parts[2] + 1)
  $Version = $parts -join '.'
}

Write-Host "ساخت بسته آپدیت نسخه $Version (نسخه فعلی: $($current.version))..." -ForegroundColor Cyan

$newVersionInfo = @{
  version     = $Version
  releaseDate = (Get-Date -Format "yyyy-MM-dd")
  notes       = $Notes
} | ConvertTo-Json
# UTF-8 بدون BOM تا JSON.parse سمت Node.js با کاراکتر اضافه خطا ندهد
[System.IO.File]::WriteAllText($currentVersionFile, $newVersionInfo, [System.Text.UTF8Encoding]::new($false))

Write-Host "در حال build گرفتن از فرانت‌اند..." -ForegroundColor Cyan
Push-Location $clientDir
npm run build
if ($LASTEXITCODE -ne 0) { throw "build فرانت‌اند شکست خورد" }
Pop-Location

$stage = Join-Path $packagesDir "staging-v$Version"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path "$stage\server" | Out-Null
New-Item -ItemType Directory -Force -Path "$stage\client" | Out-Null

Copy-Item (Join-Path $serverDir "src") (Join-Path $stage "server\src") -Recurse
Copy-Item (Join-Path $serverDir "package.json") (Join-Path $stage "server\package.json")
if (Test-Path (Join-Path $serverDir "package-lock.json")) {
  Copy-Item (Join-Path $serverDir "package-lock.json") (Join-Path $stage "server\package-lock.json")
}
Copy-Item $currentVersionFile (Join-Path $stage "server\version.json")
if (Test-Path (Join-Path $serverDir "migrate.cjs")) {
  Copy-Item (Join-Path $serverDir "migrate.cjs") (Join-Path $stage "server\migrate.cjs")
}
Copy-Item (Join-Path $clientDir "dist") (Join-Path $stage "client\dist") -Recurse

if ($IncludeNodeModules) {
  Write-Host "در حال کپی node_modules سرور (ممکن است چند دقیقه طول بکشد)..." -ForegroundColor Yellow
  Copy-Item (Join-Path $serverDir "node_modules") (Join-Path $stage "server\node_modules") -Recurse
}

# اسکریپت‌های اعمال آپدیت هم داخل بسته قرار می‌گیرند تا بسته خودکفا باشد
Copy-Item (Join-Path $PSScriptRoot "apply-update.ps1") (Join-Path $stage "apply-update.ps1")
Copy-Item (Join-Path $PSScriptRoot "apply-update.bat") (Join-Path $stage "apply-update.bat")

New-Item -ItemType Directory -Force -Path $packagesDir | Out-Null
$zipPath = Join-Path $packagesDir "update-v$Version.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$stage\*" -DestinationPath $zipPath
Remove-Item $stage -Recurse -Force

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "بسته آپدیت با موفقیت ساخته شد:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Green
Write-Host "این فایل را روی فلش کپی کرده و به سیستم مقصد منتقل کنید." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

