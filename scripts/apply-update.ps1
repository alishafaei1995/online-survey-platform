<#
  اجرای این اسکریپت روی سیستم آفلاین برای اعمال یک بسته آپدیت.
  ساده‌ترین روش: فایل update-vX.Y.Z.zip را روی آیکون apply-update.bat رها کنید (drag & drop).
#>
param(
  [string]$ZipPath
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Write-Step($msg) { Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host $msg -ForegroundColor Green }
function Write-Err($msg) { Write-Host $msg -ForegroundColor Red }

if (-not $ZipPath) {
  $ZipPath = Read-Host "مسیر فایل zip آپدیت را وارد کنید"
}
$ZipPath = $ZipPath.Trim('"')

if (-not (Test-Path $ZipPath)) {
  Write-Err "فایل پیدا نشد: $ZipPath"
  Read-Host "برای خروج Enter بزنید"
  exit 1
}

$tempExtract = Join-Path $env:TEMP "survey-update-$(Get-Random)"
Write-Step "در حال استخراج بسته آپدیت..."
Expand-Archive -Path $ZipPath -DestinationPath $tempExtract -Force

$newVersionFile = Join-Path $tempExtract "server\version.json"
if (-not (Test-Path $newVersionFile)) {
  Write-Err "بسته نامعتبر است (server\version.json پیدا نشد)."
  Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
  Read-Host "برای خروج Enter بزنید"
  exit 1
}

$newVersion = Get-Content $newVersionFile -Raw | ConvertFrom-Json
$currentVersionFile = Join-Path $root "server\version.json"
$currentVersion = if (Test-Path $currentVersionFile) { Get-Content $currentVersionFile -Raw | ConvertFrom-Json } else { $null }

Write-Host ""
Write-Host "======================================" -ForegroundColor Yellow
Write-Host "نسخه فعلی نصب‌شده : $(if ($currentVersion) { $currentVersion.version } else { 'نامشخص' })"
Write-Host "نسخه جدید در بسته  : $($newVersion.version)"
Write-Host "تاریخ انتشار       : $($newVersion.releaseDate)"
Write-Host "توضیحات این نسخه   : $($newVersion.notes)"
Write-Host "======================================" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "آیا مطمئن هستید که می‌خواهید این آپدیت را اعمال کنید؟ (Y/N)"
if ($confirm -notin @('Y', 'y')) {
  Write-Host "لغو شد."
  Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
  Read-Host "برای خروج Enter بزنید"
  exit 0
}

# توقف سرور در حال اجرا (در صورت روشن بودن)
$envFile = Join-Path $root "server\.env"
$port = "5000"
if (Test-Path $envFile) {
  $portLine = Get-Content $envFile | Where-Object { $_ -match '^PORT=' } | Select-Object -First 1
  if ($portLine) { $port = ($portLine -split '=', 2)[1].Trim() }
}
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  Write-Step "در حال متوقف کردن سرور در حال اجرا..."
  $conn | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 2
}

# بکاپ نسخه فعلی
$backupVersionLabel = if ($currentVersion) { $currentVersion.version } else { "unknown" }
$backupDir = Join-Path $root "backups\backup-$backupVersionLabel-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Step "در حال گرفتن نسخه پشتیبان در: $backupDir"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
if (Test-Path (Join-Path $root "server\src")) {
  Copy-Item (Join-Path $root "server\src") (Join-Path $backupDir "server-src") -Recurse -Force
}
if (Test-Path $currentVersionFile) {
  Copy-Item $currentVersionFile (Join-Path $backupDir "version.json") -Force
}
if (Test-Path (Join-Path $root "client\dist")) {
  Copy-Item (Join-Path $root "client\dist") (Join-Path $backupDir "client-dist") -Recurse -Force
}

# جایگزینی فایل‌های سرور
Write-Step "در حال جایگزینی فایل‌های سرور..."
if (Test-Path (Join-Path $root "server\src")) {
  Remove-Item (Join-Path $root "server\src") -Recurse -Force
}
Copy-Item (Join-Path $tempExtract "server\src") (Join-Path $root "server\src") -Recurse -Force
Copy-Item $newVersionFile $currentVersionFile -Force
if (Test-Path (Join-Path $tempExtract "server\package.json")) {
  Copy-Item (Join-Path $tempExtract "server\package.json") (Join-Path $root "server\package.json") -Force
}

# جایگزینی node_modules فقط در صورتی که بسته شامل آن باشد (یعنی وابستگی‌ها تغییر کرده‌اند)
if (Test-Path (Join-Path $tempExtract "server\node_modules")) {
  Write-Step "در حال جایگزینی node_modules سرور..."
  if (Test-Path (Join-Path $root "server\node_modules")) {
    Remove-Item (Join-Path $root "server\node_modules") -Recurse -Force
  }
  Copy-Item (Join-Path $tempExtract "server\node_modules") (Join-Path $root "server\node_modules") -Recurse -Force
}

# جایگزینی فرانت‌اند build‌شده
if (Test-Path (Join-Path $tempExtract "client\dist")) {
  Write-Step "در حال جایگزینی فرانت‌اند..."
  if (Test-Path (Join-Path $root "client\dist")) {
    Remove-Item (Join-Path $root "client\dist") -Recurse -Force
  }
  Copy-Item (Join-Path $tempExtract "client\dist") (Join-Path $root "client\dist") -Recurse -Force
}

# اجرای migration در صورت وجود
$migrateScript = Join-Path $tempExtract "server\migrate.cjs"
if (Test-Path $migrateScript) {
  Write-Step "در حال اجرای migration پایگاه‌داده..."
  Push-Location (Join-Path $root "server")
  node $migrateScript
  Pop-Location
}

Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Ok "======================================================"
Write-Ok "آپدیت با موفقیت به نسخه $($newVersion.version) اعمال شد."
Write-Ok "نسخه قبلی در این مسیر پشتیبان‌گیری شد:"
Write-Ok $backupDir
Write-Ok "======================================================"
Write-Host ""

$startNow = Read-Host "آیا می‌خواهید سامانه الان دوباره اجرا شود؟ (Y/N)"
if ($startNow -in @('Y', 'y')) {
  $serverPath = Join-Path $root "server"
  Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$serverPath`" && set NODE_ENV=production&& npm start"
  Write-Ok "سامانه در یک پنجره جدید در حال اجراست."
}

Read-Host "برای خروج Enter بزنید"

