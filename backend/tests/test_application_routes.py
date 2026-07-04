import uuid
from datetime import datetime

from fastapi.testclient import TestClient

from services.application_service.main import app
import services.application_service.routes as application_routes
from services.shared.models import Application


client = TestClient(app)


def override_get_db():
    yield None


class DummyUser:
    def __init__(self):
        self.id = uuid.uuid4()
        self.admin = False


def override_get_current_user():
    return DummyUser()


def test_create_application_returns_complete_application_response(monkeypatch):
    application = Application(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        title="Loan Application",
        status="DRAFT",
        questionnaire={"income": 50000},
        final_review="NOT_REVIEWED",
        reviewed_by=None,
        reviewed_at=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    def fake_create_application(db, user_id, title, questionnaire):
        return application

    monkeypatch.setattr(application_routes.crud, "create_application", fake_create_application)
    app.dependency_overrides[application_routes.get_db] = override_get_db
    app.dependency_overrides[application_routes.get_current_user] = override_get_current_user

    try:
        response = client.post(
            "/applications",
            json={"title": "Loan Application", "questionnaire": {"income": 50000}},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == str(application.id)
    assert body["final_review"] == "NOT_REVIEWED"
    assert body["reviewed_by"] is None
    assert body["reviewed_at"] is None
