Write-Host "🚀 Restoring Market Watcher Features..." -ForegroundColor Cyan

# 1. Rebuild Container (Force build to install feedparser)
Write-Host "🐳 Rebuilding Market Watcher container..." -ForegroundColor Yellow
docker-compose up -d --build --force-recreate market-watcher

# 2. Wait for Init
Write-Host "⏳ Waiting for service (10s)..."
Start-Sleep -Seconds 10

# 3. Test
Write-Host "🧪 Testing News Fetching..."
# Execute a small python script inside the container to verify feedparser works
docker-compose exec market-watcher python -c "from src.news import NewsAggregator; print(f'News count: {len(NewsAggregator().fetch_latest())}')"

Write-Host "✅ Restoration Complete!" -ForegroundColor Green
