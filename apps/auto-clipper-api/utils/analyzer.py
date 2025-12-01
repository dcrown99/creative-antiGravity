import librosa
import numpy as np
import os
from .llm_analyzer import analyze_transcript_semantics

def analyze_audio(video_path: str, duration: int = 30, top_n: int = 1, transcript: list = None):
    """
    Analyzes the video to find the most 'exciting' segment.
    
    Args:
        video_path: Path to the video file.
        duration: Target duration of the clip in seconds.
        top_n: Number of segments to return.
        transcript: Optional list of transcript segments for semantic analysis.
        
    Returns:
        tuple: (start_time, end_time) in seconds.
    """
    
    # 1. Semantic Analysis (if transcript is available)
    if transcript:
        print("Running Semantic Analysis with LLM...")
        candidates = analyze_transcript_semantics(transcript)
        if candidates:
            # Return the best candidate
            # candidates is list of (start, end, reason)
            best = candidates[0]
            print(f"LLM selected segment: {best['start']}-{best['end']} ({best['reason']})")
            return (best['start'], best['end'])
        else:
            print("LLM analysis failed or returned no results. Falling back to audio analysis.")

    # 2. Audio Analysis (Fallback or default)
    print("Running Audio Analysis (RMS/ZCR)...")
    # Extract audio from MP4 using ffmpeg
    try:
        import subprocess
        import tempfile
        import imageio_ffmpeg
        
        # Get ffmpeg path
        ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
        
        # Create temporary WAV file
        temp_audio = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_audio_path = temp_audio.name
        temp_audio.close()
        
        # Extract audio using ffmpeg
        subprocess.run([
            ffmpeg_path,
            '-i', video_path,
            '-vn',  # No video
            '-acodec', 'pcm_s16le',  # WAV codec
            '-ar', '22050',  # Sample rate
            '-ac', '1',  # Mono
            '-y',  # Overwrite
            temp_audio_path
        ], check=True, capture_output=True)
        
        # Load the extracted audio with librosa
        y, sr = librosa.load(temp_audio_path, sr=None)
        
        # Clean up temporary file
        os.remove(temp_audio_path)
        
    except Exception as e:
        print(f"Error loading audio: {e}")
        return (0, duration)

    # Calculate features
    hop_length = 512
    frame_length = 2048
    
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    zcr = librosa.feature.zero_crossing_rate(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    
    # Normalize features to 0-1 range
    def normalize(x):
        return (x - np.min(x)) / (np.max(x) - np.min(x) + 1e-8)
        
    rms_norm = normalize(rms)
    zcr_norm = normalize(zcr)
    
    # Combined score: 60% Energy, 40% ZCR
    combined_score = 0.6 * rms_norm + 0.4 * zcr_norm
    
    # Sliding window to find the segment with highest average score
    frames_per_sec = sr / hop_length
    window_size_frames = int(duration * frames_per_sec)
    
    if len(combined_score) < window_size_frames:
        return (0, len(y) / sr)
        
    # Convolve with a window of ones to get moving sum
    window = np.ones(window_size_frames)
    moving_sum = np.convolve(combined_score, window, mode='valid')
    
    # Find index of maximum sum
    best_frame_idx = np.argmax(moving_sum)
    
    start_time = best_frame_idx / frames_per_sec
    end_time = start_time + duration
    
    return (start_time, end_time)
