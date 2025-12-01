import sqlite3
import os
from database import DB_NAME
from config import TEMP_DIR

def check_jobs():
    print(f"TEMP_DIR: {TEMP_DIR}")
    print(f"Abs TEMP_DIR: {os.path.abspath(TEMP_DIR)}")
    
    if not os.path.exists(DB_NAME):
        print(f"DB not found at {DB_NAME}")
        return

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT id, status, video_path FROM jobs WHERE status='waiting_for_selection' LIMIT 1")
    row = c.fetchone()
    
    if row:
        vpath = row['video_path']
        print(f"Video Path from DB: {vpath}")
        print(f"Abs Video Path: {os.path.abspath(vpath)}")
        
        abs_temp = os.path.abspath(TEMP_DIR)
        abs_vpath = os.path.abspath(vpath)
        
        if abs_vpath.startswith(abs_temp):
            print("Path starts with TEMP_DIR")
            rel_path = abs_vpath[len(abs_temp):].replace(os.sep, '/')
            if rel_path.startswith('/'):
                rel_path = rel_path[1:]
            video_url = f"/temp/{rel_path}"
            print(f"Calculated URL: {video_url}")
        else:
            print("Path DOES NOT start with TEMP_DIR")
            
            # Debug why
            print(f"'{abs_vpath}' vs '{abs_temp}'")
    else:
        print("No waiting job found")
        
    conn.close()

if __name__ == "__main__":
    check_jobs()
