# Campus Crowding Map: Real-Time Study Space Availability for Smarter Student Life
This is the Real-Time Study Space Availability. We register the check-in/check-out event by scanning QR code, and we can get the availability information of study space by the webboard.

## Features
- **Real-time Update Study Space Availability**: Update the availability of study space every 30 seconds.
- **QR Code Check-in/Check-out**: By scanning QR code and login your account, you can check-in or check-out by the website easily.
- **Every One can Get the Study Space Information by Watching Webboard**: We use webboard show the information of every study space we registered.
- **Three-Status Indicator**: Each room displays a colour-coded status based on occupancy rate.
- **Occupancy Prediction**: Predict future room status N minutes ahead based on historical check-in/out events.

## Room Status (Three-Light System)

Each room's status is computed from its current occupancy rate (`current_occupancy / capacity`):

| Status | Colour | Occupancy Rate | Description |
|---|---|---|---|
| `available` | 🟢 Green | < 60% | Plenty of seats, easy to find a spot |
| `busy` | 🟡 Yellow | 60% – 89% | Getting crowded, limited seats remaining |
| `occupied` | 🔴 Red | ≥ 90% | Nearly or completely full |

## Prediction Mode

`GET /rooms/{room_id}/prediction?minutes_ahead=30`

Uses historical check-in/check-out events to estimate a room's occupancy and status at a future point in time. The `minutes_ahead` parameter accepts values between 5 and 240 (default: 30). A bulk endpoint `/rooms/predictions/all` returns predictions for every room in one request.

## Tech Stack
- **Frontend**: React.ts
- **Backend**: FastAPI

## Development Setup
1. **Clone the repository**

```bash
https://github.com/boyan1001/real-time_study_space_availability_system
cd real-time_study_space_availability_system
```

### Backend
2. **Install dependencies**
```bash
cd backend
uv sync
```

3. **Create a `.env` file and reference `.env.example` for required environment variables**
```bash
cp .env.example .env
```
> Fill in the necessary API keys and configuration values in the `.env` file.

4. **Start running backend server**
```bash
uv run uvicorn main:app
```

### Frontend
5. **Install dependencies**
```bash
cd frontend
pnpm install
```

6. **Start running frontend server**
```bash
pnpm dev
```
