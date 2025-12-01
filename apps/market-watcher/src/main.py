import json
import os

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .analyst import AIAnalyst
from .config import PORTFOLIO_PATH
from .news import NewsAggregator
from .tts import VoicevoxClient
from .db_reader import PortfolioReader

app = FastAPI()

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3003",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyst = AIAnalyst()
tts = VoicevoxClient()
news_collector = NewsAggregator()
portfolio_reader = PortfolioReader(PORTFOLIO_PATH)

class TTSRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/analyze/daily")
def analyze_daily():
    # ... (existing code) ...
    # 1. Load Portfolio
    try:
        portfolio_data = portfolio_reader.read()
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 2. Fetch News (Real RSS)
    try:
        news_list = news_collector.fetch_latest()
    except Exception as e:
        print(f"Error fetching news: {e}")
        # Fallback to empty list or basic message
        news_list = []

    # 3. Analyze
    result = analyst.analyze_market_impact(portfolio_data, news_list)

    return result

@app.post("/analyze/audio")
def analyze_audio():
    # Reuse analyze_daily logic to get text
    try:
        analysis_result = analyze_daily()
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if "error" in analysis_result:
        raise HTTPException(status_code=500, detail=analysis_result["error"])

    script = analysis_result.get("script", "")
    if not script:
         raise HTTPException(status_code=500, detail="No script generated")

    print(f"DEBUG: Script length: {len(script)}")
    print(f"DEBUG: Script content: {script[:100]}...")

    # Generate Audio
    audio_data = tts.generate_audio(script)
    if not audio_data:
        raise HTTPException(status_code=500, detail="Failed to generate audio")

    return Response(content=audio_data, media_type="audio/wav")

    return Response(content=audio_data, media_type="audio/wav")

@app.post("/tts")
def generate_tts(request: TTSRequest):
    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    print(f"DEBUG: TTS Request length: {len(text)}")

    audio_data = tts.generate_audio(text)
    if not audio_data:
        raise HTTPException(status_code=500, detail="Failed to generate audio")

    return Response(content=audio_data, media_type="audio/wav")
