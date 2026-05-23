from fastapi import APIRouter, HTTPException, Query

from database import read_db
from services.prediction_service import predict_room

router = APIRouter(prefix="/rooms", tags=["Predictions"])


@router.get("/{room_id}/prediction")
def get_room_prediction(
    room_id: int,
    minutes_ahead: int = Query(default=30, ge=5, le=240),
):
    """Return a prediction for one room."""
    db = read_db()

    room = next((r for r in db["rooms"] if r["room_id"] == room_id), None)

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    return predict_room(
        room=room,
        events=db.get("events", []),
        minutes_ahead=minutes_ahead,
    )


@router.get("/predictions/all")
def get_all_room_predictions(
    minutes_ahead: int = Query(default=30, ge=5, le=240),
):
    """Return predictions for all rooms."""
    db = read_db()

    return {
        "minutes_ahead": minutes_ahead,
        "predictions": [
            predict_room(
                room=room,
                events=db.get("events", []),
                minutes_ahead=minutes_ahead,
            )
            for room in db["rooms"]
        ],
    }
