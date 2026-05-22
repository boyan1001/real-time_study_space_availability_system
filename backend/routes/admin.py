from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from dependencies import require_admin
from database import read_db, write_db

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


class Room(BaseModel):
    room_id: int
    name: str
    capacity: int
    current_occupancy: int = 0
    status: str = "available"


@router.get("/users")
def list_users():
    db = read_db()
    return {
        "users": [
            {
                "user_id": u["user_id"],
                "name": u["name"],
                "email": u["email"],
                "privileges": u["privileges"],
                "location": u["location"],
            }
            for u in db["users"]
        ]
    }


@router.get("/rooms")
def list_rooms():
    db = read_db()
    return {"rooms": db["rooms"]}


@router.post("/rooms/{room_id}")
def create_room(room_id: int, room: Room):
    db = read_db()
    if any(r["room_id"] == room_id for r in db["rooms"]):
        raise HTTPException(status_code=400, detail="教室已存在")
    db["rooms"].append(room.model_dump())
    write_db(db)
    return {"message": "教室建立成功", "room_id": room_id, "room": room}


@router.put("/rooms/{room_id}")
def update_room(room_id: int, room: Room):
    db = read_db()
    for i, r in enumerate(db["rooms"]):
        if r["room_id"] == room_id:
            db["rooms"][i] = room.model_dump()
            write_db(db)
            return {"message": "教室更新成功", "room_id": room_id, "room": room}
    raise HTTPException(status_code=404, detail="找不到教室")


@router.delete("/rooms/{room_id}")
def delete_room(room_id: int):
    db = read_db()
    db["rooms"] = [r for r in db["rooms"] if r["room_id"] != room_id]
    write_db(db)
    return {"message": "教室刪除成功", "room_id": room_id}


@router.get("/rooms/{room_id}/qrcode")
def get_room_qrcode(room_id: int):
    db = read_db()
    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="找不到教室")
    return {
        "room_id": room_id,
        "room_name": room["name"],
        "qr_checkin": f"http://localhost:8000/rooms/{room_id}/in",
        "qr_checkout": f"http://localhost:8000/rooms/{room_id}/out",
    }


@router.get("/rooms/{room_id}/history")
def get_room_events(room_id: int):
    db = read_db()
    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="找不到教室")
    events = [e for e in db["events"] if e["room_id"] == room_id]
    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return {
        "room_id": room_id,
        "room_name": room["name"],
        "events": events,
    }


@router.get("/events")
def list_all_events():
    db = read_db()
    events = sorted(db["events"], key=lambda e: e["timestamp"], reverse=True)
    users_map = {u["user_id"]: u["name"] for u in db["users"]}
    rooms_map = {r["room_id"]: r["name"] for r in db["rooms"]}
    enriched = [
        {
            **e,
            "user_name": users_map.get(e["user_id"], e["user_id"]),
            "room_name": rooms_map.get(e["room_id"], str(e["room_id"])),
        }
        for e in events
    ]
    return {"events": enriched}


@router.get("/stats")
def get_stats():
    db = read_db()
    total_rooms = len(db["rooms"])
    occupied_rooms = sum(1 for r in db["rooms"] if r["status"] == "occupied")
    total_users = len(db["users"])
    active_users = sum(1 for u in db["users"] if u["location"] != "unknown")
    total_events = len(db["events"])
    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": total_rooms - occupied_rooms,
        "total_users": total_users,
        "active_users": active_users,
        "total_events": total_events,
    }
