import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.json"

def read_db() -> dict:
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def write_db(data: dict):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
