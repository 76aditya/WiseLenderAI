import logging

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from services.common.security import AuthError, decode_access_token
from services.shared.database import get_db_session
from services.shared.models import User

logger = logging.getLogger("auth_service.dependencies")

security_scheme = HTTPBearer()


def get_db() -> Session:
    yield from get_db_session()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not payload.sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    user_id = payload.sub

    user = db.query(User).filter(User.username == user_id, User.is_active.is_(True)).one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
