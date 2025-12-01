$ErrorActionPreference = "Continue"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$ArchiveDir = "$PWD\_archive\$Timestamp"

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Cyan

# Create Archive Directory
if (-not (Test-Path $ArchiveDir)) { 
    New-Item -ItemType Directory -Force -Path $ArchiveDir | Out-Null 
}
Write-Host "📂 Archive created at: $ArchiveDir" -ForegroundColor Gray

# List of files/folders to archive
$filesToMove = @(
    "docker-compose-drivestream.yml",
    "apps\money-master\old",
    "apps\my-kindle\start-server.bat",
    "apps\auto-clipper-web\auto-clipper_start_app.bat"
)

foreach ($item in $filesToMove) {
    if (Test-Path $item) {
        Write-Host "   ➡️ Moving: $item"
        Move-Item -Path $item -Destination $ArchiveDir -Force
    } else {
        Write-Host "   blob Skipping (Not found): $item" -ForegroundColor DarkGray
    }
}

Write-Host "`n✅ Cleanup Complete." -ForegroundColor Green
