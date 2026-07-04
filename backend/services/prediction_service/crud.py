from sqlalchemy.orm import Session

from services.shared.models import Application, ApplicationStatus, Prediction


def get_application(db: Session, application_id: str) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).one_or_none()


def upsert_prediction(db: Session, application: Application, result: dict) -> Prediction:
    prediction = db.query(Prediction).filter(Prediction.application_id == application.id).one_or_none()
    if prediction is None:
        prediction = Prediction(application_id=application.id)
        db.add(prediction)

    prediction.alternative_credit_score = int(result["alternative_credit_score"])
    prediction.decision = result["decision"]
    prediction.default_probability = float(result["default_probability"])
    prediction.risk_level = result["risk_level"]
    prediction.financial_index = float(result["financial_index"])
    prediction.behavior_index = float(result["behavior_index"])
    prediction.digital_trust_index = float(result["digital_trust_index"])
    prediction.financial_probability = float(result["financial_probability"])
    prediction.behavior_probability = float(result["behavior_probability"])
    prediction.digital_probability = float(result["digital_probability"])
    prediction.meta_index = float(result["meta_index"])
    prediction.reasons = {
        "financial_reasons": result.get("financial_reasons", []),
        "behavior_reasons": result.get("behavior_reasons", []),
        "digital_reasons": result.get("digital_reasons", []),
    }
    prediction.raw_response = result
    db.commit()
    db.refresh(prediction)
    return prediction


def mark_application_status(db: Session, application: Application, status: ApplicationStatus) -> Application:
    application.status = status
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
