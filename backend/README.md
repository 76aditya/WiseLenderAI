# WiseLenderAI Backend

This backend contains modular services for authentication, application management, prediction orchestration, and admin operations.

## Setup

```bash
cd WiseLenderAI-main/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Services

- `services/auth_service/main.py` — user registration, login, and token management
- `services/application_service/main.py` — application creation, review, and submission
- `services/prediction_service/main.py` — enqueues prediction jobs and returns cached/full results
- `services/admin_service/main.py` — admin user, application, prediction search, manual prediction, queue inspection, and manual review workflow

## Admin review workflow

The admin service now supports a manual review process for loan applications:

- `PATCH /admin/applications/{application_id}/review` — approve or reject an application with a final review decision
- `GET /admin/applications/pending-review` — list applications with `final_review == NOT_REVIEWED`
- `GET /admin/applications/approved` — list applications with `final_review == APPROVED`
- `GET /admin/applications/rejected` — list applications with `final_review == REJECTED`
- `GET /admin/applications/{application_id}` — return application details, user details, prediction, and review audit fields

## Run an API service

```bash
PYTHONPATH=. uvicorn services.auth_service.main:app --host 0.0.0.0 --port 8001
PYTHONPATH=. uvicorn services.application_service.main:app --host 0.0.0.0 --port 8002
PYTHONPATH=. uvicorn services.prediction_service.main:app --host 0.0.0.0 --port 8003
PYTHONPATH=. uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8004
```

## Database migrations with Alembic

Alembic is configured in the `backend/migrations` directory and uses `backend/alembic.ini`.
Services no longer use SQLAlchemy `Base.metadata.create_all(...)`; schema changes are applied through Alembic migrations only.
The migration system loads `DATABASE_URL` from `.env` via `services/shared/config.py`, so credentials are not hardcoded.

### Initialize Alembic
```bash
cd WiseLenderAI-main/backend
. .venv/bin/activate
# Already initialized by this project; no need to run alembic init
ls migrations
```

### Create a new migration
```bash
cd WiseLenderAI-main/backend
. .venv/bin/activate
python3 -m alembic -c alembic.ini revision --autogenerate -m "your message"
```

### Apply migrations
```bash
cd WiseLenderAI-main/backend
. .venv/bin/activate
python3 -m alembic -c alembic.ini upgrade head
```

### Rollback migration
```bash
cd WiseLenderAI-main/backend
. .venv/bin/activate
python3 -m alembic -c alembic.ini downgrade -1
```

### Upgrade to latest version
```bash
cd WiseLenderAI-main/backend
. .venv/bin/activate
python3 -m alembic -c alembic.ini upgrade head
```

### Start service with migrations
Use the provided startup wrapper so migrations run before the service launches:

```bash
cd WiseLenderAI-main/backend
./startup.sh uvicorn services.application_service.main:app --host 0.0.0.0 --port 8002
```

## Run Celery worker

```bash
PYTHONPATH=. celery -A services.prediction_service.tasks.celery_app worker --loglevel=info
```

## Notes

- The prediction service sends requests to the ML model API at `ML_SERVICE_URL`.
- Prediction results are cached in Redis with key `prediction:{application_id}` for 24 hours.
- Database models are created automatically on startup if they do not already exist.
