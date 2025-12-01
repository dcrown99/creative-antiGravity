import sqlite3
import os
from database import DB_NAME

def check_job(job_id):
    if not os.path.exists(DB_NAME):
        print(f"DB not found at {DB_NAME}")
        return

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM jobs WHERE id = ?", (job_id,))
    row = c.fetchone()
    
    if row:
        print(f"Job ID: {row['id']}")
        print(f"Status: {row['status']}")
        print(f"Video Path: {row['video_path']}")
        print(f"Result Path: {row['result_path']}")
        print(f"Candidates: {row['candidates'][:100]}..." if row['candidates'] else "None")
    else:
        print(f"Job {job_id} not found")
        
    conn.close()

if __name__ == "__main__":
    check_job("46bab1b4-0dc9-4667-8c6e-e0ac1861070e")
