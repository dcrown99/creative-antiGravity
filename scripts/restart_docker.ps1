# Antigravity Docker Manager
# 目的: Docker環境を確実に停止・再構築・起動する
# 使用法: ./scripts/restart_docker.ps1 [-Rebuild]

param (
    [switch]$Rebuild = $false
)

Write-Host "🐳 Stopping Docker services..." -ForegroundColor Cyan
# ゾンビコンテナを残さないよう orphan (定義から消えたコンテナ) も削除
docker compose down --remove-orphans

if ($Rebuild) {
    Write-Host "🏗️  Rebuilding containers (Deep Clean)..." -ForegroundColor Magenta
    # --no-cache: キャッシュを使わずゼロからビルド（依存関係更新時などに必須）
    docker compose build --no-cache
}

Write-Host "🚀 Starting Docker services..." -ForegroundColor Green
docker compose up -d

Write-Host "✅ Docker services are up." -ForegroundColor Green
docker compose ps
