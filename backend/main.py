from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user import router as user_router
from routes.room import router as room_router
from routes.admin import router as admin_router

app = FastAPI(title="QR code door security API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(room_router)
app.include_router(admin_router)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "QR code door security API"}
