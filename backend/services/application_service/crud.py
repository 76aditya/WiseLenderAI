from datetime import datetime, timezone
from sqlalchemy.orm import Session

from services.shared.models import Application, ApplicationStatus

REVIEW_DECISIONS = {"NOT_REVIEWED", "APPROVED", "REJECTED"}


def create_application(db: Session, user_id: str, title: str, questionnaire: dict) -> Application:
    application = Application(
        user_id=user_id,
        title=title,
        questionnaire=questionnaire,
        status=ApplicationStatus.DRAFT,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_application_by_id(db: Session, application_id: str) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).one_or_none()


def list_applications_for_user(db: Session, user_id: str) -> list[Application]:
    return db.query(Application).filter(Application.user_id == user_id).order_by(Application.created_at.desc()).all()


def list_applications(db: Session, search: str | None = None, status: str | None = None) -> list[Application]:
    query = db.query(Application)
    if search:
        query = query.filter(Application.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Application.status == status)
    return query.order_by(Application.created_at.desc()).all()


def list_applications_by_review_status(db: Session, review_status: str) -> list[Application]:
    if review_status not in REVIEW_DECISIONS:
        raise ValueError("Invalid review status")
    return (
        db.query(Application)
        .filter(Application.final_review == review_status)
        .order_by(Application.created_at.desc())
        .all()
    )


def update_application(db: Session, application: Application, title: str | None = None, questionnaire: dict | None = None, status: str | None = None) -> Application:
    if title is not None:
        application.title = title
    if questionnaire is not None:
        application.questionnaire = questionnaire
    if status is not None:
        application.status = ApplicationStatus(status)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def review_application(db: Session, application: Application, final_review: str, reviewed_by: str) -> Application:
    if application.final_review != "NOT_REVIEWED":
        raise ValueError("Application has already been reviewed")
    if final_review not in REVIEW_DECISIONS - {"NOT_REVIEWED"}:
        raise ValueError("Invalid review decision")
    application.final_review = final_review
    application.reviewed_by = reviewed_by
    application.reviewed_at = datetime.now(timezone.utc)
    if final_review == "APPROVED":
        application.status = ApplicationStatus.APPROVED
    elif final_review == "REJECTED":
        application.status = ApplicationStatus.REJECTED
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def delete_application(db: Session, application: Application) -> None:
    db.delete(application)
    db.commit()
