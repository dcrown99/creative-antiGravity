$ErrorActionPreference = "Stop"
$ConfigDir = "$PWD\config\rclone"
if (-not (Test-Path $ConfigDir)) { New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null }

Write-Host "🚀 Starting Google Drive Auth..." -ForegroundColor Cyan
Write-Host "👉 Instructions:"
Write-Host "   1. Type 'n' (New remote)"
Write-Host "   2. Name it 'MyDrive' (Case Sensitive!)"
Write-Host "   3. Storage: Search 'drive' and enter number (usually 18)"
Write-Host "   4. Client ID/Secret: Leave blank (Press Enter)"
Write-Host "   5. Scope: Choose '1' (Full Access)"
Write-Host "   6. Root Folder ID: Leave blank"
Write-Host "   7. Service Account: Leave blank"
Write-Host "   8. Edit advanced config?: 'n'"
Write-Host "   9. Use auto config?: 'y' (Browser will open)"
Write-Host "⚠️  NOTE: If browser doesn't open, copy the URL manually."

# Run interactive config
# Using 'docker compose run' or 'docker run' with interactive TTY
# We use 'docker run' here as requested, ensuring volume mapping matches
docker run -it --rm -v "$ConfigDir`:/config/rclone" -p 53682:53682 rclone/rclone:latest config

Write-Host "`n🔄 Restarting Drive Mounter..." -ForegroundColor Cyan
docker compose restart rclone

Write-Host "⏳ Waiting for mount (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

if (Test-Path "$PWD\gdrive_mount") {
    $files = Get-ChildItem "$PWD\gdrive_mount" | Select-Object -First 3
    if ($files) {
        Write-Host "🎉 Drive Mounted! Files detected:" -ForegroundColor Green
        $files | Format-Table Name
    } else {
        Write-Warning "⚠️ Mount folder is empty. Check your Drive content."
    }
}
Write-Host "👉 Verify My Kindle at http://localhost:3001"
