import logging
from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from services.shared.config import settings

logger = logging.getLogger("auth_service.security")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenPayload(BaseModel):
    sub: str
    email: str
    admin: bool = False
    exp: int

class AuthError(Exception):
    pass

def hash_password(password: str) -> str:
    logger.info("auth.security.hash_password")
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    logger.info("auth.security.verify_password")
    return pwd_context.verify(password, hashed_password)

def create_access_token(subject: str, email: str, admin: bool = False, expires_delta: timedelta | None = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": subject,
        "email": email,
        "admin": admin,
        "exp": int(expire.timestamp()),
    }
    logger.info(
        "auth.security.create_access_token",
        extra={"email": email, "admin": admin, "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES},
    )
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return TokenPayload(**payload)
    except JWTError as exc:
        raise AuthError("Could not validate credentials") from exc
