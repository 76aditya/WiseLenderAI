import logging

from sqlalchemy.orm import Session

from services.common.security import hash_password, verify_password
from services.shared.models import User

logger = logging.getLogger("auth_service.crud")


def get_user_by_email(db: Session, email: str) -> User | None:
    logger.info("auth.db.lookup_user", extra={"email": email})
    return db.query(User).filter(User.email == email).one_or_none()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.query(User).filter(User.id == user_id).one_or_none()


def create_user(db: Session, email: str, password: str, admin: bool = False) -> User:
    logger.info("auth.db.hash_password", extra={"email": email})
    user = User(
        email=email,
        hashed_password=hash_password(password),
        admin=admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("auth.db.commit_user", extra={"email": email, "user_id": str(user.id)})
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    logger.info("auth.db.authenticate_user", extra={"email": email})
    user = get_user_by_email(db, email)
    if user is None:
        return None
    password_valid = verify_password(password, user.hashed_password)
    if not password_valid:
        logger.warning("auth.db.password_mismatch", extra={"email": email})
        return None
    return user
