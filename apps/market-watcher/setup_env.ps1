# Market Watcher Setup Script for Windows
$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Market Watcher..." -ForegroundColor Cyan

# 1. Check Python
$pythonCmd = "python"
try {
    $version = & $pythonCmd --version 2>&1
    Write-Host "🐍 Found: $version" -ForegroundColor Green
}
catch {
    Write-Error "❌ Python not found. Please install Python 3.11 or 3.12."
    exit 1
}

# 2. Create Virtual Environment
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment (venv)..." -ForegroundColor Yellow
    & $pythonCmd -m venv venv
}

# 2.5 Ensure pip
try {
    & ".\venv\Scripts\python" -m pip --version 2>&1 | Out-Null
}
catch {
    Write-Host "🔧 Installing pip..." -ForegroundColor Yellow
    & ".\venv\Scripts\python" -m ensurepip --upgrade
}

# 3. Install Dependencies
Write-Host "⬇️ Installing dependencies..." -ForegroundColor Yellow
# Use the pip inside venv explicitly
& ".\venv\Scripts\python" -m pip install --upgrade pip
& ".\venv\Scripts\python" -m pip install -r requirements.txt

# 4. Setup .env
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env from template..." -ForegroundColor Yellow
    $envContent = @"
GEMINI_API_KEY=YOUR_API_KEY_HERE
VOICEVOX_URL=http://localhost:50021
"@
    Set-Content ".env" -Value $envContent -Encoding UTF8
    Write-Warning "⚠️ Created .env file. Please update GEMINI_API_KEY with your actual key!"
}

# 5. Create Output Directory
if (-not (Test-Path "output")) {
    New-Item -ItemType Directory -Force -Path "output" | Out-Null
}

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "👉 Run this to start: .\venv\Scripts\python src/main.py" -ForegroundColor Cyan
