import os
import sys
# Add current directory to path so imports work
sys.path.append(os.getcwd())

from utils.digest_maker import create_digest_video
from moviepy.editor import ColorClip, TextClip, CompositeVideoClip

def create_dummy_video(filename):
    print(f"Creating dummy video: {filename}")
    # Create a simple video with some text to simulate content
    clip = ColorClip(size=(1920, 1080), color=(0, 0, 255), duration=10)
    txt = TextClip("Test Video Source", fontsize=70, color='white').set_position('center').set_duration(10)
    video = CompositeVideoClip([clip, txt])
    video.write_videofile(filename, fps=24)

def test_digest():
    src_video = "test_src.mp4"
    if not os.path.exists(src_video):
        create_dummy_video(src_video)

    script = [
        {'start': 1, 'end': 3, 'summary': 'First Segment'},
        {'start': 5, 'end': 7, 'summary': 'Second Segment'}
    ]

    print("\n--- Testing Vertical Mode ---")
    success_v = create_digest_video(src_video, script, "test_digest_vertical.mp4", vertical_mode=True)
    if success_v:
        print("Vertical Digest Created Successfully")
    else:
        print("Vertical Digest Failed")

    print("\n--- Testing Horizontal Mode ---")
    success_h = create_digest_video(src_video, script, "test_digest_horizontal.mp4", vertical_mode=False)
    if success_h:
        print("Horizontal Digest Created Successfully")
    else:
        print("Horizontal Digest Failed")

if __name__ == "__main__":
    test_digest()
