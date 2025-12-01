$ErrorActionPreference = 'Stop'
Write-Host "🚀 Setting up Auto-Clipper API Environment..." -ForegroundColor Cyan

# 1. System Dependencies Check
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: FFmpeg is required but not installed." -ForegroundColor Red
    Write-Host "   Please install it and add it to your PATH."
    exit 1
}

# 2. Python Version Check
$PYTHON_CMD = "python"
try {
    $version = & $PYTHON_CMD --version 2>&1
    Write-Host "🐍 Using Python: $version" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Python is not found." -ForegroundColor Red
    exit 1
}

# 3. Virtual Environment
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    & $PYTHON_CMD -m venv venv
}

# 4. Install Dependencies
Write-Host "⬇️ Installing Python packages..." -ForegroundColor Cyan

# Install torch explicitly first for CPU support
Write-Host "   Installing PyTorch (CPU version)..." -ForegroundColor Gray
# Unpinned version to support Python 3.13
& .\venv\Scripts\pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

Write-Host "   Installing requirements..." -ForegroundColor Gray
& .\venv\Scripts\pip install -r requirements.txt

# 5. Create Directory Structure
New-Item -ItemType Directory -Force -Path "temp" | Out-Null
New-Item -ItemType Directory -Force -Path "storage" | Out-Null

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "👉 To start the server:"
Write-Host "   .\venv\Scripts\activate"
Write-Host "   uvicorn main:app --reload --port 8000"
