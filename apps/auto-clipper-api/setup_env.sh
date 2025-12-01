#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Auto-Clipper API Environment..."

# 1. System Dependencies Check
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: FFmpeg is required but not installed."
    echo "   Please install it (e.g., 'brew install ffmpeg' or 'sudo apt install ffmpeg')."
    exit 1
fi

# 2. Python Version Check
# Try to find python 3.11 or 3.12, fallback to python3
PYTHON_CMD="python3"
if command -v python3.11 &> /dev/null; then
    PYTHON_CMD="python3.11"
elif command -v python3.12 &> /dev/null; then
    PYTHON_CMD="python3.12"
fi
echo "🐍 Using Python: $($PYTHON_CMD --version)"

# 3. Virtual Environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate venv
source venv/bin/activate

# 4. Install Dependencies
echo "⬇️ Installing Python packages..."
pip install --upgrade pip

# Install torch explicitly first for CPU support (Stability First)
# User can manually install CUDA version later if needed
echo "   Installing PyTorch (CPU version for compatibility)..."
# Unpinned version to support Python 3.13
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

echo "   Installing requirements..."
pip install -r requirements.txt

# 5. Create Directory Structure
mkdir -p temp
mkdir -p storage

echo "✅ Setup Complete!"
echo "👉 To start the server:"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload --port 8000"
