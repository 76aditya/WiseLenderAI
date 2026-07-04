from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from typing import Any
from sqlalchemy.orm import Session

from services.application_service import crud, schemas
from services.common.dependencies import get_current_user, get_db, require_admin
from services.shared.models import Application

router = APIRouter(prefix="/applications", tags=["applications"])


def authorize_application(application: Application, current_user):
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if str(application.user_id) != str(current_user.id) and not current_user.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return application

def to_application_response(application: Application) -> schemas.ApplicationResponse:
    return schemas.ApplicationResponse.model_validate(application)

@router.post("/", response_model=schemas.ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(payload: dict[str, Any] = Body(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Accept either the existing {"title":..., "questionnaire":{...}} shape
    # or a flat ML-model payload (all model fields at top-level).
    if isinstance(payload, dict) and "title" in payload and "questionnaire" in payload:
        title = payload.get("title")
        questionnaire = payload.get("questionnaire")
    else:
        title = payload.get("title", "Loan Application")
        questionnaire = payload

    application = crud.create_application(
        db,
        user_id=str(current_user.id),
        title=title,
        questionnaire=questionnaire,
    )
    return to_application_response(application)

@router.get("/", response_model=list[schemas.ApplicationResponse])
def list_applications(
    search: str | None = Query(default=None, description="Search by application title"),
    status: str | None = Query(default=None, description="Filter by application status"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.admin:
        applications = crud.list_applications(db, search=search, status=status)
    else:
        applications = crud.list_applications_for_user(db, user_id=str(current_user.id))
    return [to_application_response(app) for app in applications]

@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def read_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = crud.get_application_by_id(db, application_id)
    authorize_application(application, current_user)
    return to_application_response(application)

@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(application_id: str, application_in: schemas.ApplicationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = crud.get_application_by_id(db, application_id)
    authorize_application(application, current_user)
    updated = crud.update_application(
        db,
        application,
        title=application_in.title,
        questionnaire=application_in.questionnaire,
        status=application_in.status,
    )
    return to_application_response(updated)

@router.post("/{application_id}/submit", response_model=schemas.ApplicationResponse)
def submit_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = crud.get_application_by_id(db, application_id)
    authorize_application(application, current_user)
    application = crud.update_application(db, application, status="SUBMITTED")
    return to_application_response(application)

@router.post("/{application_id}/admin/approve", response_model=schemas.ApplicationResponse)
def approve_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    application = crud.get_application_by_id(db, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    application = crud.update_application(db, application, status="APPROVED")
    return to_application_response(application)

@router.post("/{application_id}/admin/reject", response_model=schemas.ApplicationResponse)
def reject_application(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    application = crud.get_application_by_id(db, application_id)
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    application = crud.update_application(db, application, status="REJECTED")
    return to_application_response(application)
