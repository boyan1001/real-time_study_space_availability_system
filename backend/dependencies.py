from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
import os

security = HTTPBearer()

load_dotenv()
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

def require_admin(
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")