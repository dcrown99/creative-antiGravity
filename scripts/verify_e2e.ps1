# Antigravity E2E Execution Protocol

# 1. Install Playwright Dependencies
Write-Host "📦 Installing Playwright packages..." -ForegroundColor Cyan
pnpm add -D @playwright/test --filter money-master --filter auto-clipper-web
pnpm exec playwright install chromium

# 2. Run Tests (Money Master)
Write-Host "🧪 Running Money Master E2E Tests..." -ForegroundColor Cyan
Push-Location apps/money-master
pnpm install
# Note: 初回はサーバー起動に時間がかかるためタイムアウトする場合は再実行してください
pnpm exec playwright test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Money Master Tests Failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 3. Run Tests (Auto Clipper)
Write-Host "🧪 Running Auto Clipper E2E Tests..." -ForegroundColor Cyan
Push-Location apps/auto-clipper-web
pnpm install
pnpm exec playwright test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Auto Clipper Tests Failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# 4. Report
Write-Host "✅ All Systems Green. Ready for Deployment." -ForegroundColor Green
