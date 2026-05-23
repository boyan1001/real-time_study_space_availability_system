from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from database import read_db, write_db
import uuid

router = APIRouter(prefix="/rooms", tags=["Rooms"])


def compute_status(occupancy: int, capacity: int) -> str:
    """三燈號制：空閒 / 忙碌 / 滿載"""
    if capacity == 0 or occupancy == 0:
        return "available"
    pct = occupancy / capacity
    if pct >= 0.9:
        return "occupied"
    if pct >= 0.6:
        return "busy"
    return "available"


class RoomDoorEvent(BaseModel):
    user_id: str
    event_type: Optional[str] = None


@router.get("", summary = "List all rooms with current status")
def list_rooms():
    db = read_db()
    return {"rooms": db["rooms"]}


@router.get("/{room_id}", summary = "Get detailed info for a specific room")
def get_room_info(room_id: int):
    db = read_db()
    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return room


@router.post("/{room_id}/in", summary = "Check in to a room", description = "Simulate a user entering a room by scanning the QR code")
def checkin(room_id: int, event: RoomDoorEvent):
    db = read_db()
    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")

    room["current_occupancy"] = min(room["current_occupancy"] + 1, room["capacity"])
    room["status"] = compute_status(room["current_occupancy"], room["capacity"])

    for u in db["users"]:
        if u["user_id"] == event.user_id:
            u["location"] = f"Room {room_id}"

    new_event = {
        "event_id": f"evt-{uuid.uuid4().hex[:8]}",
        "room_id": room_id,
        "user_id": event.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": "checkin",
    }
    db["events"].append(new_event)
    write_db(db)
    return new_event


@router.post("/{room_id}/out", summary = "Check out of a room", description = "Simulate a user leaving a room by scanning the QR code")
def checkout(room_id: int, event: RoomDoorEvent):
    db = read_db()
    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")

    room["current_occupancy"] = max(room["current_occupancy"] - 1, 0)
    room["status"] = compute_status(room["current_occupancy"], room["capacity"])

    for u in db["users"]:
        if u["user_id"] == event.user_id:
            u["location"] = "unknown"

    new_event = {
        "event_id": f"evt-{uuid.uuid4().hex[:8]}",
        "room_id": room_id,
        "user_id": event.user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": "checkout",
    }
    db["events"].append(new_event)
    write_db(db)
    return new_event
