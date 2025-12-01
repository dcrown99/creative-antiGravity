<#
.SYNOPSIS
    Antigravity Ultimate Edition - Master Launch Script (v2.0)
    全9コンテナの環境設定、依存チェック、ビルド、起動、DB初期化を一括で行います。
#>

$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "Antigravity Launch Control"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   🚀 ANTIGRAVITY GOD MODE - LAUNCH SEQUENCE   " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# ---------------------------------------------------------
# 0. Pre-flight Checks (Infrastructure)
# ---------------------------------------------------------
Write-Host "`n[0/5] 🛡️ Checking Infrastructure..." -ForegroundColor Yellow

# Check for Google Drive (Crucial for Auto-Clipper)
if (-not (Test-Path "G:\")) {
    Write-Warning "⚠️  Google Drive (G:\) not found!"
    Write-Warning "   'Auto Clipper' and 'My Kindle' may not access remote files."
    # Automated environment: Skip prompt if running in non-interactive mode or assume yes if we can't prompt
    # $confirm = Read-Host "   Continue anyway? (y/n)"
    # if ($confirm -ne 'y') { exit }
    Write-Warning "   Continuing without Google Drive..."
}
else {
    Write-Host "   ✅ Google Drive mount detected." -ForegroundColor Green
}

# ---------------------------------------------------------
# 1. Environment Setup (Auto-Generate .env if missing)
# ---------------------------------------------------------
Write-Host "`n[1/5] 🔧 Verifying Environment Configuration..." -ForegroundColor Yellow

function Ensure-EnvFile ($path, $content) {
    if (-not (Test-Path $path)) {
        Write-Warning "   Directory not found: $path (Skipping .env creation)"
        return
    }
    $envPath = Join-Path $path ".env"
    if (-not (Test-Path $envPath)) {
        Write-Host "   + Creating default .env for: $path" -ForegroundColor Gray
        $content | Out-File -FilePath $envPath -Encoding UTF8
    }
    else {
        Write-Host "   ok: .env exists for $path" -ForegroundColor DarkGray
    }
}

# Define defaults (Optimized for Windows/Docker)
$envMoney = @"
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
NODE_ENV="development"
WATCHPACK_POLLING=true
"@

$envKindle = @"
NEXT_PUBLIC_BASE_URL="http://localhost:3002"
MANGA_DIR="/app/library"
NODE_ENV="development"
WATCHPACK_POLLING=true
"@

$envClipperWeb = @"
NEXT_PUBLIC_API_URL="http://localhost:8000"
NODE_ENV="development"
WATCHPACK_POLLING=true
"@

$envClipperApi = @"
FINAL_OUTPUT_DIR="/app/output"
REDIS_URL="redis://redis:6379/0"
WATCHFILES_FORCE_POLLING=true
IMAGEMAGICK_BINARY="/usr/bin/convert"
"@

$envMarket = @"
PORTFOLIO_DB_PATH="/data/dev.db"
VOICEVOX_URL="http://voicevox:50021"
GEMINI_API_KEY=""
"@

# Apply defaults
Ensure-EnvFile "apps/money-master" $envMoney
Ensure-EnvFile "apps/my-kindle" $envKindle
Ensure-EnvFile "apps/auto-clipper-web" $envClipperWeb
Ensure-EnvFile "apps/auto-clipper-api" $envClipperApi
Ensure-EnvFile "apps/market-watcher" $envMarket

# ---------------------------------------------------------
# 2. File System Preparation
# ---------------------------------------------------------
Write-Host "`n[2/5] 📂 Preparing Directories & Files..." -ForegroundColor Yellow

$clipperPath = "apps/auto-clipper-api"
if (Test-Path $clipperPath) {
    if (-not (Test-Path "$clipperPath/cookies.txt")) { 
        New-Item -ItemType File -Force -Path "$clipperPath/cookies.txt" | Out-Null 
        Write-Host "   + Created placeholder: $clipperPath/cookies.txt" -ForegroundColor Gray
    }
    New-Item -ItemType Directory -Force -Path "$clipperPath/output" | Out-Null
    New-Item -ItemType Directory -Force -Path "$clipperPath/temp" | Out-Null
}

# ---------------------------------------------------------
# 3. Cleanup & Install
# ---------------------------------------------------------
Write-Host "`n[3/5] 🧹 Cleaning & Installing Dependencies..." -ForegroundColor Yellow

# Remove Legacy Root Container
if (Test-Path "docker-compose.yml") {
    Write-Host "   - Removing legacy root containers..." -ForegroundColor Gray
    docker compose -f docker-compose.yml down --remove-orphans 2>$null
}

# Install Root Dependencies
Write-Host "   - Running pnpm install..." -ForegroundColor Gray
pnpm install

# ---------------------------------------------------------
# 4. Container Launch (The 9 Units)
# ---------------------------------------------------------
Write-Host "`n[4/5] 🚀 Launching 9 Containers..." -ForegroundColor Green

function Launch-Compose ($path, $name) {
    if (Test-Path $path) {
        Write-Host "   > Starting $name..." -ForegroundColor Cyan
        docker compose -f $path up -d --build --remove-orphans
    }
    else {
        Write-Warning "   ⚠️  Skipping $name (File not found: $path)"
    }
}

Launch-Compose "apps/money-master/docker-compose.yml" "Core: Money Master & Dozzle"
Launch-Compose "apps/auto-clipper-api/docker-compose.yml" "Backend: Clipper API, Worker & Redis"
Launch-Compose "apps/market-watcher/docker-compose.yml" "AI: Market Watcher & Voicevox"
Launch-Compose "apps/my-kindle/docker-compose.yml" "App: My Kindle"
Launch-Compose "apps/auto-clipper-web/docker-compose.yml" "App: Clipper Web"

# ---------------------------------------------------------
# 5. Database Initialization
# ---------------------------------------------------------
Write-Host "`n[5/5] 🗄️  Finalizing Database..." -ForegroundColor Yellow
Write-Host "   - Waiting for DB container stability..." -ForegroundColor Gray
Start-Sleep -Seconds 10

if (Test-Path "apps/money-master/docker-compose.yml") {
    Write-Host "   - Applying migrations..." -ForegroundColor Gray
    # Using docker exec directly for robustness as per previous learnings
    docker exec money-master npx prisma generate
    docker exec money-master npx prisma migrate deploy
}

# ---------------------------------------------------------
# Completion Report
# ---------------------------------------------------------
Write-Host "`n✅ SYSTEM ONLINE - GOD MODE ACTIVATED" -ForegroundColor Green -BackgroundColor Black
Write-Host "==============================================" -ForegroundColor Green
Write-Host "   💰 Money Master:   http://localhost:3001"
Write-Host "   📚 My Kindle:      http://localhost:3002"
Write-Host "   🎬 Auto Clipper:   http://localhost:3003"
Write-Host "   ⚙️ Clipper API:    http://localhost:8000/docs"
Write-Host "   📈 Market Watcher: http://localhost:8001/docs"
Write-Host "   📊 System Logs:    http://localhost:8888"
Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "   ⚠️  ACTION REQUIRED:" -ForegroundColor Yellow
Write-Host "   1. Edit 'apps/market-watcher/.env' to set GEMINI_API_KEY for AI features."
Write-Host "   2. Ensure 'apps/auto-clipper-api/cookies.txt' has valid YouTube cookies."
Write-Host "==============================================" -ForegroundColor Green
