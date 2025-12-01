$ErrorActionPreference = "Stop"

Write-Host "🔄 Starting GitHub Sync..." -ForegroundColor Cyan

# Check status
Write-Host "📄 Git Status:" -ForegroundColor Gray
git status

# Stage changes
Write-Host "➕ Staging changes..." -ForegroundColor Gray
git add .

# Commit
Write-Host "💾 Committing..." -ForegroundColor Gray
try {
    git commit -m "chore: cleanup obsolete files and legacy scripts"
} catch {
    Write-Host "⚠️ No changes to commit or commit failed." -ForegroundColor Yellow
}

# Push
Write-Host "🚀 Pushing to remote..." -ForegroundColor Gray
git push

Write-Host "`n✅ GitHub Sync Complete. Obsolete files should be gone from remote." -ForegroundColor Green
