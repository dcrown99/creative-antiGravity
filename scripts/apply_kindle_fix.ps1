Write-Host "🚀 Applying My Kindle Optimizations..." -ForegroundColor Cyan

# 1. Rebuild Container (Crucial for new dependencies)
Write-Host "🐳 Rebuilding My Kindle container..." -ForegroundColor Yellow
docker-compose up -d --build --force-recreate my-kindle

# 2. Wait for Health
Write-Host "⏳ Waiting for service (10s)..."
Start-Sleep -Seconds 10

# 3. Status
docker-compose ps my-kindle
Write-Host "✅ Optimization Applied! Check http://localhost:3001" -ForegroundColor Green

Write-Host "✅ Optimization Plan Ready."
Write-Host "👉 Copy the markdown prompt above and paste it into your AI Editor."
