import json
import os

DB_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

def read_db():
    if not os.path.exists(DB_FILE):
        write_db({"users":[],"breakdowns":[],"schedules":[],"moods":[],"dailylogs":[],"profiles":[],"textLogs":[]})
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=2)