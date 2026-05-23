from datetime import datetime, timezone
from typing import Any


def _parse_timestamp(value: str) -> datetime | None:
    try:
        if value.endswith("Z"):
            value = value[:-1] + "+00:00"
        return datetime.fromisoformat(value)
    except Exception:
        return None


def _availability_label(occupancy: int, capacity: int) -> str:
    if capacity <= 0:
        return "unknown"
    ratio = occupancy / capacity
    if ratio >= 1:
        return "full"
    if ratio >= 0.75:
        return "busy"
    if ratio >= 0.4:
        return "moderate"
    return "available"


def _time_pressure(now: datetime) -> float:
    hour = now.hour
    if 8 <= hour < 11:
        return 0.18
    if 11 <= hour < 14:
        return 0.32
    if 14 <= hour < 20:
        return 0.45
    if 20 <= hour < 24:
        return 0.20
    return 0.05


def _weekday_pressure(now: datetime) -> float:
    weekday = now.weekday()
    if weekday in [0, 1, 2, 3]:
        return 0.18
    if weekday == 4:
        return 0.14
    if weekday == 5:
        return 0.07
    return 0.04


def _recent_flow(events: list[dict[str, Any]], room_id: int, now: datetime) -> int:
    recent_score = 0
    for event in events:
        if event.get("room_id") != room_id:
            continue
        timestamp = _parse_timestamp(str(event.get("timestamp", "")))
        if timestamp is None:
            continue
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        hours_ago = (now - timestamp.astimezone(timezone.utc)).total_seconds() / 3600
        if 0 <= hours_ago <= 2:
            if event.get("event_type") == "checkin":
                recent_score += 1
            elif event.get("event_type") == "checkout":
                recent_score -= 1
    return recent_score


def predict_room(room: dict[str, Any], events: list[dict[str, Any]], minutes_ahead: int = 30) -> dict[str, Any]:
    now = datetime.now(timezone.utc)

    room_id = int(room["room_id"])
    capacity = int(room["capacity"])
    current_occupancy = int(room["current_occupancy"])

    minutes_ahead = max(5, min(minutes_ahead, 240))
    horizon = minutes_ahead / 60

    pressure = _time_pressure(now) + _weekday_pressure(now)
    trend = _recent_flow(events, room_id, now)

    predicted_change = round((capacity * pressure * horizon * 0.35) + (trend * horizon * 0.60))
    predicted_occupancy = current_occupancy + predicted_change
    predicted_occupancy = max(0, min(capacity, predicted_occupancy))

    predicted_available_seats = max(0, capacity - predicted_occupancy)
    confidence = 0.78 if minutes_ahead <= 30 else 0.65 if minutes_ahead <= 60 else 0.52

    return {
        "room_id": room_id,
        "room_name": room.get("name"),
        "minutes_ahead": minutes_ahead,
        "current_occupancy": current_occupancy,
        "predicted_occupancy": predicted_occupancy,
        "capacity": capacity,
        "predicted_available_seats": predicted_available_seats,
        "predicted_availability": _availability_label(predicted_occupancy, capacity),
        "confidence": confidence,
        "model_type": "heuristic_prediction_v1",
    }
