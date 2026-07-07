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
    logger.info("auth.register.request", extra={"username": str(user_in.username)})
    try:
        if crud.get_user_by_username(db, str(user_in.username)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )
        user = crud.create_user(db, username=str(user_in.username), email=user_in.email, password=user_in.password)
        logger.info("auth.register.success", extra={"username": str(user.username), "user_id": str(user.id)})
        return schemas.UserResponse(
            id=str(user.id),
            username=user.username,
            email=user.email,
            admin=user.admin,
            is_active=user.is_active,
            full_name=user.full_name,
            date_of_birth=user.date_of_birth,
            gender=user.gender,
            residential_address=user.residential_address,
            permanent_address=user.permanent_address,
            nationality=user.nationality,
            user_status=user.user_status,
            mobile_number=user.mobile_number,
            contact_email=user.contact_email,
            national_id_number=user.national_id_number,
            pan_tax_id=user.pan_tax_id,
        )
    except HTTPException:
        raise
    except IntegrityError as exc:
        db.rollback()
        logger.exception("auth.register.db_integrity_error", extra={"username": str(user_in.username)})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already registered") from exc
    except Exception as exc:
        db.rollback()
        logger.exception("auth.register.unexpected_error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error") from exc


@router.post("/login", response_model=schemas.TokenResponse)
def login(user_in: schemas.TokenRequest, db: Session = Depends(get_db)):
    logger.info("auth.login.request", extra={"username": str(user_in.username)})
    try:
        user = crud.authenticate_user(db, str(user_in.username), user_in.password)
        if user is None:
            logger.warning("auth.login.invalid_credentials", extra={"username": str(user_in.username)})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = create_access_token(subject=str(user.id), username=user.username, admin=user.admin)
        logger.info("auth.login.success", extra={"username": user.username, "user_id": str(user.id)})
        return schemas.TokenResponse(access_token=access_token, token_type="bearer")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("auth.login.unexpected_error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected server error") from exc


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user=Depends(get_current_user)):
    logger.info("auth.me.request", extra={"user_id": str(current_user.id), "username": current_user.username})
    return schemas.UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        email=current_user.email,
        admin=current_user.admin,
        is_active=current_user.is_active,
        full_name=current_user.full_name,
        date_of_birth=current_user.date_of_birth,
        gender=current_user.gender,
        residential_address=current_user.residential_address,
        permanent_address=current_user.permanent_address,
        nationality=current_user.nationality,
        user_status=current_user.user_status,
        mobile_number=current_user.mobile_number,
        contact_email=current_user.contact_email,
        national_id_number=current_user.national_id_number,
        pan_tax_id=current_user.pan_tax_id,
    )

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(profile_in: schemas.UserProfileUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    logger.info("auth.profile_update.request", extra={"user_id": str(current_user.id)})
    
    current_user.full_name = profile_in.full_name
    current_user.date_of_birth = profile_in.date_of_birth
    current_user.gender = profile_in.gender
    current_user.residential_address = profile_in.residential_address
    current_user.permanent_address = profile_in.permanent_address
    current_user.nationality = profile_in.nationality
    current_user.mobile_number = profile_in.mobile_number
    current_user.contact_email = profile_in.contact_email
    current_user.national_id_number = profile_in.national_id_number
    current_user.pan_tax_id = profile_in.pan_tax_id
    
    if current_user.user_status == 'Pending':
        current_user.user_status = 'Active'

    db.commit()
    db.refresh(current_user)
    
    return read_current_user(current_user)
