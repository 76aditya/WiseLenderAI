# WiseLenderAI

WiseLenderAI is a modular fintech project with:

- A React frontend (`frontend/`)
- FastAPI backend microservices (`backend/services/`)
- A machine learning model API (`ml-model/api/`)

## Overview

The frontend talks to four backend services:

- Auth service: `http://localhost:8001`
- Application service: `http://localhost:8002`
- Prediction service: `http://localhost:8003`
- Admin service: `http://localhost:8004`

The ML model API runs separately on:

- ML model API: `http://localhost:8000`

## Prerequisites

- Node.js 20+ / npm
- Python 3.12+ and `venv`
- PostgreSQL for backend data storage
- Redis if the prediction service uses Celery caching

## 1. Run the backend

```bash
cd WiseLenderAI-main/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set your database URL in `backend/.env`, for example:

```bash
export DATABASE_URL='postgresql+psycopg://postgres:password@localhost:5432/wiselender'
```

Apply database migrations:

```bash
python3 -m alembic -c alembic.ini upgrade head
```

Start the backend services:

```bash
PYTHONPATH=. uvicorn services.auth_service.main:app --host 0.0.0.0 --port 8001
PYTHONPATH=. uvicorn services.application_service.main:app --host 0.0.0.0 --port 8002
PYTHONPATH=. uvicorn services.prediction_service.main:app --host 0.0.0.0 --port 8003
PYTHONPATH=. uvicorn services.admin_service.main:app --host 0.0.0.0 --port 8004
```

If the prediction service requires Celery, start a worker from the backend directory:

```bash
PYTHONPATH=. celery -A services.prediction_service.tasks worker --loglevel=info
```

## 2. Run the ML model API

```bash
cd WiseLenderAI-main/ml-model
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

## 3. Run the frontend

```bash
cd WiseLenderAI-main/frontend
npm install
npm run dev
```

Open the app in your browser at `http://localhost:5173`.

### Optional production build

```bash
npm run build
npm run preview
```

## Environment configuration

The frontend supports overriding backend URLs with Vite environment variable s:

- `VITE_AUTH_API_URL`
- `VITE_APPLICATION_API_URL`
- `VITE_PREDICTION_API_URL`
- `VITE_ADMIN_API_URL`

For example:

```bash
VITE_AUTH_API_URL=http://localhost:8001 \
VITE_APPLICATION_API_URL=http://localhost:8002 \
VITE_PREDICTION_API_URL=http://localhost:8003 \
VITE_ADMIN_API_URL=http://localhost:8004 \
npm run dev
```

## Notes

- The frontend stores a JWT token in `localStorage` and includes it in backend requests.
- The backend services are independent, so each service must be running for the frontend to work fully.
- The ML model API is used by the prediction service and should be online before prediction requests are made.
