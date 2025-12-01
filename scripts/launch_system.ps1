# scripts/launch_system.ps1
$ErrorActionPreference = "Stop"

Write-Host "🚀 Launching System Integration Phase..." -ForegroundColor Cyan

# 1. Stop & Clean
Write-Host "🛑 Cleaning up old containers..." -ForegroundColor Yellow
docker compose down --remove-orphans

# 2. Rebuild & Launch
Write-Host "🐳 Rebuilding and Starting containers..." -ForegroundColor Cyan
Write-Host "   (This may take a few minutes...)" -ForegroundColor Gray
# --build: Pick up root .npmrc changes
# --force-recreate: Ensure new config is applied
docker compose up -d --build --force-recreate

# 3. Wait for Initialization
Write-Host "⏳ Waiting 30 seconds for database initialization..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 4. Status Check
Write-Host "📊 Checking Container Health..." -ForegroundColor Green
docker compose ps

# 5. Access Dashboard
Write-Host "`n✅ System is LIVE!" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host "💰 Money Master:   http://localhost:3000"
Write-Host "   (DB Path: ./apps/money-master/prisma/dev.db)"
Write-Host "📚 My Kindle:      http://localhost:3001"
Write-Host "🎬 Auto Clipper:   http://localhost:3002"
Write-Host "📈 Market Watcher: http://localhost:8001"
Write-Host "🗣️ Voicevox:       http://localhost:50021"
Write-Host "----------------------------------------"
Write-Host "👉 Please verify all services are running."
