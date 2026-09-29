from datetime import datetime, timedelta, timezone
import secrets
import os
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("RENDER") or os.getenv("ENVIRONMENT", "development").lower() == "production":
        raise RuntimeError("JWT_SECRET_KEY must be configured in production.")
    SECRET_KEY = secrets.token_urlsafe(32)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

def create_reset_token():
    return secrets.token_urlsafe(32)
