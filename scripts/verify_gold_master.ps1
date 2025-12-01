# Antigravity Gold Master Verification Script
# 目的: プロジェクト全体の健全性を最終確認する (CI準拠)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔹 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

try {
    Write-Host "🚀 Starting Gold Master Verification..." -ForegroundColor Magenta

    # 1. Dependency Check
    Write-Step "Checking Dependencies (Strict Mode)..."
    pnpm install --frozen-lockfile
    Write-Success "Dependencies are in sync."

    # 2. Type Checking
    Write-Step "Running Type Checks (Global)..."
    pnpm turbo run type-check
    Write-Success "All TypeScript definitions are valid."

    # 3. Linting
    Write-Step "Running Linter (Global)..."
    pnpm turbo run lint
    Write-Success "Code style is compliant."

    # 4. Building
    Write-Step "Building All Applications..."
    # Legacyなmanga-downloaderは除外
    pnpm turbo run build --filter=!manga-downloader
    Write-Success "All Next.js apps built successfully."

    # 5. Unit Testing
    Write-Step "Running Unit Tests..."
    pnpm turbo run test
    Write-Success "All unit tests passed."

    Write-Host "`n🏆 GOLD MASTER VERIFIED. SYSTEM IS READY." -ForegroundColor Yellow
}
catch {
    Write-Host "`n❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
