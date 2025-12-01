Write-Host "🚀 Initiating Universal System Redeploy..." -ForegroundColor Cyan

# 1. Execute the Universal Deployer (All Services)
#    Note: Using redeploy_all.ps1 as the universal deployer
if (Test-Path "./scripts/redeploy_all.ps1") {
    ./scripts/redeploy_all.ps1
}
else {
    Write-Error "❌ 'scripts/redeploy_all.ps1' not found! Please save the script first."
    exit 1
}

# 2. Wait for stabilization
Write-Host "⏳ Waiting for services to stabilize (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 3. Health Check Probe
$Checks = @(
    @{ Name = "Money Master"; Url = "http://localhost:3001"; Expect = 200 },
    @{ Name = "Auto Clipper API"; Url = "http://localhost:8000/docs"; Expect = 200 },
    @{ Name = "Market Watcher"; Url = "http://localhost:8001/docs"; Expect = 200 }
)

Write-Host "`n🩺 Running Health Checks..." -ForegroundColor Magenta
foreach ($Check in $Checks) {
    try {
        $resp = Invoke-WebRequest -Uri $Check.Url -Method Head -ErrorAction Stop -TimeoutSec 5
        if ($resp.StatusCode -eq $Check.Expect) {
            Write-Host "  ✅ $($Check.Name): ONLINE" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️ $($Check.Name): Unexpected Status $($resp.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  ❌ $($Check.Name): OFFLINE (Check Logs)" -ForegroundColor Red
    }
}

# 4. Verify Volume Mounts (Spot Check)
Write-Host "`n🔍 Verifying Data Persistence..." -ForegroundColor Cyan
if (Test-Path "apps/money-master/prisma/dev.db") {
    Write-Host "  ✅ Money Master DB file exists on Host." -ForegroundColor Green
}
else {
    Write-Host "  ❌ Money Master DB file MISSING on Host!" -ForegroundColor Red
}

Write-Host "`n🎉 System Update Complete." -ForegroundColor Cyan
