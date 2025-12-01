Write-Host "🔍 Verifying Architecture Compliance..." -ForegroundColor Cyan

# 1. Check Money Master DB Shared Access
$mmPath = "apps/money-master/prisma/dev.db"
if (Test-Path $mmPath) {
    Write-Host "✅ [Core DB] Exists at $mmPath" -ForegroundColor Green
}
else {
    Write-Warning "⚠️ [Core DB] Not found. Market Watcher might fail."
}

# 2. Verify Port Allocations (Simple Netstat check for conflicts)
$Ports = @(3001, 3002, 3003, 8000, 8001, 8888, 6379, 50021)
Write-Host "`n📡 Checking Reserved Ports..." -ForegroundColor Cyan
foreach ($P in $Ports) {
    $con = Get-NetTCPConnection -LocalPort $P -ErrorAction SilentlyContinue
    if ($con) {
        Write-Host "   Port $P is Active (State: $($con.State))" -ForegroundColor Gray
    }
    else {
        Write-Host "   Port $P is FREE (Service might be down)" -ForegroundColor Yellow
    }
}

# 3. Docker Volume Inspection (Market Watcher specifically)
Write-Host "`n🐳 Inspecting Market Watcher Mounts..." -ForegroundColor Cyan
try {
    $mounts = docker inspect market-watcher --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'
    if ($mounts -match "dev.db") {
        Write-Host "✅ Market Watcher has DB mounted." -ForegroundColor Green
    }
    else {
        Write-Warning "⚠️ Market Watcher is MISSING the DB mount!"
    }
}
catch {
    Write-Host "   (Market Watcher container not running)" -ForegroundColor Gray
}

Write-Host "`n📜 Architecture Review Complete." -ForegroundColor Cyan
