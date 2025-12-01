# Wrapper for redeploy_all.ps1 to satisfy documentation references
Write-Host "?? Redirecting to scripts/redeploy_all.ps1..." -ForegroundColor Cyan
if (Test-Path "./scripts/redeploy_all.ps1") {
    ./scripts/redeploy_all.ps1 @args
}
else {
    Write-Error "?? 'scripts/redeploy_all.ps1' not found!"
    exit 1
}
