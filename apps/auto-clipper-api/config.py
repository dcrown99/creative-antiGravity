import os
from dotenv import load_dotenv

# Base directory of the backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load environment variables
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Directory for temporary files (downloads, clips)
# Keep this LOCAL for speed (SSD)
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# Directory for final output (Google Drive mount)
# This will be mounted from the host via Docker Volume
FINAL_OUTPUT_DIR = os.getenv("FINAL_OUTPUT_DIR", os.path.join(BASE_DIR, "output"))

# Path to the cookies file for YouTube authentication
COOKIES_FILE = os.path.join(BASE_DIR, "cookies.txt")

# Ensure temp directory exists
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)