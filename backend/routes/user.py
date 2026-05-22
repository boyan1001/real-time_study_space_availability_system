from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import read_db, write_db

router = APIRouter(prefix="/users", tags=["Users"])


class UserRegister(BaseModel):
    user_id: str
    name: str
    email: str
    password: str
    privileges: str = "normal"


class UserLogin(BaseModel):
    user_id: str
    password: str


@router.post("/register")
def register(user: UserRegister):
    db = read_db()
    if any(u["user_id"] == user.user_id for u in db["users"]):
        raise HTTPException(status_code=400, detail="This user ID is already taken")
    db["users"].append({
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "privileges": user.privileges,
        "location": "unknown",
    })
    write_db(db)
    return {"message": "Register Sucessfully", "user_id": user.user_id}


@router.post("/login")
def login(user: UserLogin):
    db = read_db()
    found = next(
        (u for u in db["users"] if u["user_id"] == user.user_id and u["password"] == user.password),
        None,
    )
    if not found:
        raise HTTPException(status_code=401, detail="Invalid user ID or password")
    return {
        "message": "Login Successfully",
        "user_id": found["user_id"],
        "name": found["name"],
        "privileges": found["privileges"],
        "location": found["location"],
    }


@router.get("/profile")
def profile(user_id: str):
    db = read_db()
    user = next((u for u in db["users"] if u["user_id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "privileges": user["privileges"],
        "location": user["location"],
    }
