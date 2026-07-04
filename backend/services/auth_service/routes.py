import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from services.auth_service import crud, schemas
from services.common.dependencies import get_current_user, get_db
from services.common.security import create_access_token

logger = logging.getLogger("auth_service.routes")
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info("auth.register.request", extra={"email": str(user_in.email)})
    try:
        if crud.get_user_by_email(db, str(user_in.email)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user = crud.create_user(db, email=str(user_in.email), password=user_in.password)
        logger.info("auth.register.success", extra={"email": str(user.email), "user_id": str(user.id)})
        return schemas.UserResponse(
            id=str(user.id),
            email=user.email,
            admin=user.admin,
            is_active=user.is_active,
        )
    except HTTPException:
        raise
    except IntegrityError as exc:
        db.rollback()
        logger.exception("auth.register.db_integrity_error", extra={"email": str(user_in.email)})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered") from exc
    except Exception as exc:
        db.rollback()
        logger.exception("auth.register.unexpected_error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error") from exc


@router.post("/login", response_model=schemas.TokenResponse)
def login(user_in: schemas.TokenRequest, db: Session = Depends(get_db)):
    logger.info("auth.login.request", extra={"email": str(user_in.email)})
    try:
        user = crud.authenticate_user(db, str(user_in.email), user_in.password)
        if user is None:
            logger.warning("auth.login.invalid_credentials", extra={"email": str(user_in.email)})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(subject=str(user.id), email=user.email, admin=user.admin)
        logger.info("auth.login.success", extra={"email": user.email, "user_id": str(user.id)})
        return schemas.TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("auth.login.unexpected_error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error") from exc


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user=Depends(get_current_user)):
    logger.info("auth.me.request", extra={"user_id": str(current_user.id), "email": current_user.email})
    return schemas.UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        admin=current_user.admin,
        is_active=current_user.is_active,
    )
