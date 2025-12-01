from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class JobRequest(BaseModel):
    url: str

class JobResponse(BaseModel):
    id: str
    status: str
    url: str
    result_path: Optional[str] = None
    video_path: Optional[str] = None
    thumbnail_url: Optional[str] = None
    candidates: Optional[List[Dict[str, Any]]] = None
    youtube_url: Optional[str] = None # Added

class RenderRequest(BaseModel):
    start: float
    end: float
    vertical_mode: bool = True
    subtitles: bool = True
    subtitle_position: str = "bottom"
    use_narration: bool = False
    narration_script: Optional[str] = None
    use_thumbnail: bool = False
    thumbnail_title: Optional[str] = None
    bgm_file: Optional[str] = None
    # YouTube Integration
    upload_to_youtube: bool = False
    youtube_privacy: str = "private" # private, public, unlisted

class DigestRequest(BaseModel):
    duration_minutes: int = 5
    model_name: str = "gemini-2.5-flash"
    bgm_file: Optional[str] = None
    # YouTube Integration
    upload_to_youtube: bool = False
    youtube_privacy: str = "private"
