from celery import Task

from services.shared.celery_app import celery_app
from services.shared.database import SessionLocal
from services.shared.ml_client import request_prediction
from services.shared.redis_client import cache_prediction
from services.shared.models import ApplicationStatus
from services.prediction_service import crud


class PredictionTask(Task):
    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 3, "countdown": 10}
    retry_backoff = True


@celery_app.task(name="prediction_service.perform_prediction", bind=True, base=PredictionTask)
def perform_prediction(self, application_id: str) -> dict:
    db = SessionLocal()
    try:
        application = crud.get_application(db, application_id)
        if application is None:
            raise ValueError("Application not found")
        crud.mark_application_status(db, application, ApplicationStatus.PROCESSING)

        result = request_prediction(application.questionnaire)

        prediction = crud.upsert_prediction(db, application, result)
        crud.mark_application_status(db, application, ApplicationStatus.PREDICTED)

        cached_payload = {
            "application_id": str(application.id),
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
            "created_at": prediction.created_at.isoformat(),
            "updated_at": prediction.updated_at.isoformat(),
        }
        cache_prediction(application_id, cached_payload)
        return cached_payload
    finally:
        db.close()
