import yt_dlp
import os
import imageio_ffmpeg

def test():
    url = "https://www.youtube.com/watch?v=jNQXAC9IVRw" # Short video
    
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"FFmpeg path: {ffmpeg_path} (Type: {type(ffmpeg_path)})")
    
    ydl_opts = {
        'format': 'bestvideo[ext=mp4][vcodec^=avc]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': '/app/temp/test_dl.%(ext)s',
        'quiet': False, # Changed to False to see output
        'no_warnings': False,
        'overwrites': True,
        'ffmpeg_location': ffmpeg_path,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    # Check cookies
    if os.path.exists('/app/cookies.txt'):
        print("Using cookies.txt")
        ydl_opts['cookiefile'] = '/app/cookies.txt'
    
    print(f"Options: {ydl_opts}")
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print("Extracting info...")
            ydl.extract_info(url, download=True)
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
