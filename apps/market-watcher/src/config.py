import os
import sys
from dotenv import load_dotenv

# .env ファイルの読み込み
load_dotenv()

def get_required_env(key: str, description: str):
    value = os.getenv(key)
    if not value or value == "YOUR_API_KEY_HERE":
        print(f"\n❌ Configuration Error: {key} is missing or invalid.")
        print(f"👉 {description}")
        print(f"   Please edit 'apps/market-watcher/.env' and set the correct value.\n")
        sys.exit(1)
    return value

# Configuration
GEMINI_API_KEY = get_required_env(
    "GEMINI_API_KEY", 
    "Google Gemini API Key is required for market analysis."
)

VOICEVOX_URL = os.getenv("VOICEVOX_URL", "http://localhost:50021")

# Output Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTFOLIO_PATH = os.getenv("PORTFOLIO_PATH", os.path.join(BASE_DIR, "data", "portfolio.json"))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"✅ Configuration loaded. Output dir: {OUTPUT_DIR}")
