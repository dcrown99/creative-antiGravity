# Antigravity Dependency Fixer
# 各コンテナ内で pnpm install を実行し、node_modules を復元する

$apps = @("money-master", "my-kindle", "auto-clipper-frontend")

foreach ($app in $apps) {
    Write-Host "`n🚑 Fixing dependencies for $app ..." -ForegroundColor Cyan
    
    # 1. コンテナ内でインストール実行 (CI環境と同様にロックファイル準拠でインストール)
    # --frozen-lockfile: ロックファイルを尊重
    # --prod=false: devDependencies (Tailwind等) も含めるためにproductionフラグを無効化する場合があるが
    # ここでは通常の install を実行して全パッケージを入れる
    docker compose exec $app pnpm install --force

    # 2. コンテナ再起動
    Write-Host "🔄 Restarting $app ..." -ForegroundColor Yellow
    docker compose restart $app
}

Write-Host "`n✅ Repair sequence completed. Please check the Web UI." -ForegroundColor Green
