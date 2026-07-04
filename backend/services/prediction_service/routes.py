from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from services.common.dependencies import get_current_user, get_db, require_admin
from services.prediction_service import crud, schemas, tasks
from services.shared.models import Application, ApplicationStatus, Prediction
from services.shared.redis_client import get_cached_prediction

router = APIRouter(prefix="", tags=["prediction"])


def authorize_application(application: Application, current_user):
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if str(application.user_id) != str(current_user.id) and not current_user.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return application

def to_prediction_response(prediction: Prediction) -> schemas.PredictionResultResponse:
    return schemas.PredictionResultResponse(
        application_id=str(prediction.application_id),
        alternative_credit_score=prediction.alternative_credit_score,
        decision=prediction.decision,
        default_probability=prediction.default_probability,
        risk_level=prediction.risk_level,
        financial_index=prediction.financial_index,
        behavior_index=prediction.behavior_index,
        digital_trust_index=prediction.digital_trust_index,
        financial_probability=prediction.financial_probability,
        behavior_probability=prediction.behavior_probability,
        digital_probability=prediction.digital_probability,
        meta_index=prediction.meta_index,
        reasons=prediction.reasons,
        created_at=prediction.created_at,
        updated_at=prediction.updated_at,
    )

@router.post("/applications/{application_id}/predict", response_model=schemas.PredictionJobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_prediction_job(application_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = crud.get_application(db, application_id)
    authorize_application(application, current_user)
    crud.mark_application_status(db, application, ApplicationStatus.PREDICTION_PENDING)
    tasks.perform_prediction.delay(application_id)

    return {
        "status": "accepted",
        "message": "Prediction job accepted",
        "application_id": application_id,
    }

@router.get(
    "/applications/{application_id}/prediction",
    response_model=schemas.PredictionResultResponse | schemas.PredictionPendingResponse,
)
def read_prediction_result(application_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    application = crud.get_application(db, application_id)
    authorize_application(application, current_user)

    cached = get_cached_prediction(application_id)
    if cached is not None:
        return schemas.PredictionResultResponse(**cached)

    prediction = db.query(Prediction).filter(Prediction.application_id == application_id).one_or_none()
    if prediction is not None:
        return to_prediction_response(prediction)

    if application.status in (ApplicationStatus.PREDICTION_PENDING, ApplicationStatus.PROCESSING):
        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={
                "status": "pending",
                "message": "Prediction is still being processed. Please try again shortly.",
                "application_id": application_id,
                "prediction_status": application.status.value,
            },
        )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not available yet")

@router.get("/predictions/{application_id}", response_model=schemas.PredictionResultResponse)
def admin_read_prediction(application_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    from services.shared.models import Prediction

    prediction = db.query(Prediction).filter(Prediction.application_id == application_id).one_or_none()
    if prediction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return to_prediction_response(prediction)
