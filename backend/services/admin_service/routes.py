from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from services.admin_service import schemas as admin_schemas
from services.application_service import crud as application_crud
from services.common.dependencies import get_db, require_admin
from services.prediction_service import tasks
from services.shared.models import Application, Prediction, User
from services.shared.celery_app import celery_app

router = APIRouter(prefix="/admin", tags=["admin"])


def _user_to_dict(user: User) -> dict:
    return {
        "id": user.username,
        "username": user.username,
        "email": user.email,
        "admin": user.admin,
        "is_active": user.is_active,
        "full_name": user.full_name,
        "date_of_birth": user.date_of_birth,
        "gender": user.gender,
        "residential_address": user.residential_address,
        "permanent_address": user.permanent_address,
        "nationality": user.nationality,
        "user_status": user.user_status,
        "mobile_number": user.mobile_number,
        "contact_email": user.contact_email,
        "national_id_number": user.national_id_number,
        "pan_tax_id": user.pan_tax_id,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


def _prediction_to_dict(prediction: Prediction) -> dict:
    return {
        "application_id": str(prediction.application_id),
        "alternative_credit_score": prediction.alternative_credit_score,
        "decision": prediction.decision,
        "default_probability": prediction.default_probability,
        "risk_level": prediction.risk_level,
        "financial_index": prediction.financial_index,
        "behavior_index": prediction.behavior_index,
        "digital_trust_index": prediction.digital_trust_index,
        "financial_probability": prediction.financial_probability,
        "behavior_probability": prediction.behavior_probability,
        "digital_probability": prediction.digital_probability,
        "meta_index": prediction.meta_index,
        "reasons": prediction.reasons,
        "raw_response": prediction.raw_response,
        "created_at": prediction.created_at,
        "updated_at": prediction.updated_at,
    }


def _application_to_dict(application: Application) -> dict:
    return {
        "id": str(application.id),
        "title": application.title,
        "status": application.status.value,
        "questionnaire": application.questionnaire,
        "user": _user_to_dict(application.user),
        "prediction": _prediction_to_dict(application.prediction) if application.prediction else None,
        "final_review": application.final_review,
        "reviewed_by": str(application.reviewed_by) if application.reviewed_by else None,
        "reviewed_at": application.reviewed_at,
        "created_at": application.created_at,
        "updated_at": application.updated_at,
    }


@router.get("/users", response_model=list[admin_schemas.UserSummaryResponse])
def list_users(
    search: str | None = Query(default=None, description="Filter users by email"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    users = query.order_by(User.created_at.desc()).all()
    
    results = []
    for user in users:
        latest_app = db.query(Application).filter(Application.user_id == user.username).order_by(Application.created_at.desc()).first()
        results.append(admin_schemas.UserSummaryResponse(
            id=user.username,
            email=user.email,
            username=user.username,
            role="Admin" if user.admin else "User",
            user_status=user.user_status,
            latest_application_id=str(latest_app.id) if latest_app else None
        ))
    return results

@router.get("/users/{user_id}", response_model=admin_schemas.UserResponse)
def get_user_details(
    user_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    user = db.query(User).filter(User.username == user_id).one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return admin_schemas.UserResponse(**_user_to_dict(user))


@router.get("/applications", response_model=list[admin_schemas.AdminApplicationDetailResponse])
def list_applications(
    search: str | None = Query(default=None, description="Filter applications by title"),
    status: str | None = Query(default=None, description="Filter by application status"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    query = db.query(Application)
    if search:
        query = query.filter(Application.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Application.status == status)
    applications = query.order_by(Application.created_at.desc()).all()
    return [admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(app)) for app in applications]


@router.get("/applications/pending-review", response_model=list[admin_schemas.AdminApplicationDetailResponse])
def list_pending_review(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    applications = application_crud.list_applications_by_review_status(db, "NOT_REVIEWED")
    return [admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(app)) for app in applications]


@router.get("/applications/approved", response_model=list[admin_schemas.AdminApplicationDetailResponse])
def list_approved_applications(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    applications = application_crud.list_applications_by_review_status(db, "APPROVED")
    return [admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(app)) for app in applications]


@router.get("/applications/rejected", response_model=list[admin_schemas.AdminApplicationDetailResponse])
def list_rejected_applications(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    applications = application_crud.list_applications_by_review_status(db, "REJECTED")
    return [admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(app)) for app in applications]


@router.get("/applications/{application_id}", response_model=admin_schemas.AdminApplicationDetailResponse)
def read_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    application = db.query(Application).filter(Application.id == application_id).one_or_none()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(application))


@router.patch("/applications/{application_id}/review", response_model=admin_schemas.AdminApplicationDetailResponse)
def review_application(application_id: str, payload: admin_schemas.ReviewRequest, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    application = db.query(Application).filter(Application.id == application_id).one_or_none()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if application.final_review != "NOT_REVIEWED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Application has already been reviewed",
        )
    try:
        application = application_crud.review_application(
            db,
            application,
            payload.final_review,
            current_user.username,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return admin_schemas.AdminApplicationDetailResponse(**_application_to_dict(application))


@router.get("/applications/{application_id}/prediction", response_model=admin_schemas.PredictionResponse)
def read_prediction(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    prediction = db.query(Prediction).filter(Prediction.application_id == application_id).one_or_none()
    if prediction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return admin_schemas.PredictionResponse(**_prediction_to_dict(prediction))


@router.post("/applications/{application_id}/predict", response_model=dict)
def trigger_manual_prediction(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    application = db.query(Application).filter(Application.id == application_id).one_or_none()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    tasks.perform_prediction.delay(application_id)
    return {"status": "accepted", "message": "Manual prediction job enqueued", "application_id": application_id}


@router.get("/queue", response_model=dict)
def view_queue(current_user=Depends(require_admin)):
    inspector = celery_app.control.inspect()
    reserved = inspector.reserved() or {}
    active = inspector.active() or {}
    scheduled = inspector.scheduled() or {}
    return {
        "reserved": {worker: len(items) for worker, items in reserved.items()},
        "active": {worker: len(items) for worker, items in active.items()},
        "scheduled": {worker: len(items) for worker, items in scheduled.items()},
    }
