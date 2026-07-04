# Backend Error Fixes Summary

## Overview
Fixed all runtime errors preventing the WiseLenderAI backend from starting and responding to HTTP requests. The backend is now fully functional and testable with Postman.

## Issues Fixed

### 1. ✓ Bcrypt/Passlib Incompatibility
**Problem:** `AttributeError: module 'bcrypt' has no attribute '__about__'` when hashing passwords  
**Root Cause:** Incompatible versions of `passlib` (1.7.4) and `bcrypt` (4.3.0)  
**Solution:** Updated to compatible versions `passlib==1.7.4` and `bcrypt==4.0.1`  
**Impact:** Password hashing and user authentication now works

### 2. ✓ UUID Serialization in Responses
**Problem:** `ResponseValidationError: Input should be a valid string` for UUID fields in API responses  
**Root Cause:** Pydantic v2 expects string type but receiving UUID objects from SQLAlchemy models  
**Solution:** Added explicit UUID-to-string conversion in all route handlers
- Auth Service: `UserResponse` endpoints convert UUID to string
- Application Service: `ApplicationResponse` endpoints use helper function `to_application_response()`
- Prediction Service: `PredictionResultResponse` endpoints use helper function `to_prediction_response()`
**Impact:** All API responses now properly serialize with string IDs

### 3. ✓ Authorization Comparison Type Mismatch
**Problem:** 403 Forbidden errors on user's own resources due to authorization check failure  
**Root Cause:** Comparing UUID object (`application.user_id`) with string (`str(current_user.id)`)  
**Solution:** Convert both sides of comparison to string: `str(application.user_id) != str(current_user.id)`  
**Impact:** Users can now access their own applications and other resources

### 4. ✓ FastAPI Deprecated Decorators
**Problem:** `DeprecationWarning` for `@app.on_event("startup")` in FastAPI 0.115+  
**Root Cause:** Deprecated pattern in FastAPI 0.115.3  
**Solution:** Updated all 4 services to use async `lifespan` context manager:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)
```
**Files Updated:**
- `services/auth_service/main.py`
- `services/application_service/main.py`
- `services/prediction_service/main.py`
- `services/admin_service/main.py`
**Impact:** No deprecation warnings, compatible with FastAPI 0.115+

### 5. ✓ Missing ConfigDict Import
**Problem:** `NameError: name 'ConfigDict' is not defined` in Pydantic models  
**Root Cause:** Missing import statement for ConfigDict from pydantic  
**Solution:** Added `from pydantic import ConfigDict` in auth service schemas  
**Impact:** Pydantic ORM mode properly configured

### 6. ✓ Accept ML-model payload in Application creation
**Problem:** Frontend/clients expect to POST a flat ML-model input (many fields at top-level) but the Application Service only accepted a nested `questionnaire` object.
**Root Cause:** `POST /applications/` required `{ "title":..., "questionnaire": {...} }` shape; raw ML payloads were rejected or mis-stored.
**Solution:** Updated `create_application` route to accept either the original `{title, questionnaire}` shape or a flat ML-model payload. Flat payloads are stored under the `questionnaire` column and a default title `Loan Application` is used when `title` is not provided.
**Impact:** Clients can now POST the ML model input directly to `POST /applications/` and have it saved correctly for prediction workflows.

### 7. ✓ Fix ML service URL type for prediction requests
**Problem:** Celery prediction tasks failed when calling the ML model API with a Pydantic `HttpUrl` object.
**Root Cause:** `httpx.Client.post()` expects a `str` or `httpx.URL`, but `settings.ML_SERVICE_URL` was a `pydantic_core._pydantic_core.Url` object.
**Solution:** Cast `settings.ML_SERVICE_URL` to `str()` in `services/shared/ml_client.py` before sending the request.
**Impact:** Prediction tasks now successfully send requests to the ML model API URL.

## Files Modified

### Core Fixes
- **backend/requirements.txt** - Specified compatible versions
- **services/auth_service/schemas.py** - Added ConfigDict import
- **services/auth_service/routes.py** - UUID-to-string conversion in responses
- **services/application_service/routes.py** - UUID conversion, authorization fix, and accept flat ML-model payloads on `POST /applications/`
- **services/shared/ml_client.py** - Cast ML service URL to string before sending HTTPX requests
- **services/prediction_service/routes.py** - UUID conversion + authorization fix
- **services/auth_service/main.py** - Async lifespan pattern
- **services/application_service/main.py** - Async lifespan pattern
- **services/prediction_service/main.py** - Async lifespan pattern
- **services/admin_service/main.py** - Async lifespan pattern

## Running the Backend

### Prerequisites
```bash
# All dependencies are in requirements.txt
pip install -r requirements.txt
```

### Start All 4 Services

**Terminal 1 - Auth Service (Port 8001):**
```bash
cd backend
export PYTHONPATH=.
python3 -m uvicorn services.auth_service.main:app --host 127.0.0.1 --port 8001
```

**Terminal 2 - Application Service (Port 8002):**
```bash
cd backend
export PYTHONPATH=.
python3 -m uvicorn services.application_service.main:app --host 127.0.0.1 --port 8002
```

**Terminal 3 - Prediction Service (Port 8003):**
```bash
cd backend
export PYTHONPATH=.
python3 -m uvicorn services.prediction_service.main:app --host 127.0.0.1 --port 8003
```

**Terminal 4 - Admin Service (Port 8004):**
```bash
cd backend
export PYTHONPATH=.
python3 -m uvicorn services.admin_service.main:app --host 127.0.0.1 --port 8004
```

### Optional: Start Celery Worker

```bash
cd backend
export PYTHONPATH=.
celery -A services.prediction_service.tasks worker --loglevel=info
```

## Testing with Postman

### 1. Authentication
- **Register User:** POST `http://localhost:8001/auth/register/`
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```

- **Login:** POST `http://localhost:8001/auth/login/`
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
  Copy the `access_token` from response

- **Get Current User:** GET `http://localhost:8001/auth/me`
  - Header: `Authorization: Bearer <access_token>`

### 2. Applications
- **Create Application:** POST `http://localhost:8002/applications/`
  Example (existing shape):
  ```json
  {
    "title": "My Loan Application",
    "questionnaire": {
      "monthly_income": 75000,
      "employment_years": 5,
      "credit_history": "good"
    }
  }
  ```

  Example (ML-model flat payload — supported now):
  ```json
  {
  "loan_amnt": 10000,
  "annual_inc": 50000,
  "installment": 320,
  "dti": 15,
  "tot_cur_bal": 18000,
  "avg_cur_bal": 4500,
  "open_acc": 8,
  "total_acc": 20,
  "emp_length": 5,
  "revol_util": 35,
  "bc_util": 40,
  "home_ownership": "RENT",
  "purpose": "debt_consolidation",
  "verification_status": "Verified",

  "FLAG_MOBIL": 1,
  "FLAG_PHONE": 1,
  "FLAG_WORK_PHONE": 1,
  "FLAG_CONT_MOBILE": 1,
  "FLAG_EMAIL": 1,
  "DAYS_EMPLOYED": -2400,
  "FLAG_OWN_REALTY": "Y",
  "NAME_HOUSING_TYPE": "House / apartment",
  "CNT_CHILDREN": 1,
  "CNT_FAM_MEMBERS": 3,
  "NAME_FAMILY_STATUS": "Married",
  "DAYS_REGISTRATION": -4500,
  "DAYS_ID_PUBLISH": -2200,
  "DAYS_LAST_PHONE_CHANGE": -350,
  "REG_REGION_NOT_WORK_REGION": 0,
  "REG_CITY_NOT_WORK_CITY": 0,
  "LIVE_CITY_NOT_WORK_CITY": 0,
  "NAME_EDUCATION_TYPE": "Higher education",
  "NAME_INCOME_TYPE": "Working",
  "OCCUPATION_TYPE": "Laborers",
  "ORGANIZATION_TYPE": "Business Entity Type 3",
  "REGION_RATING_CLIENT": 2
  }
  ```
  - Header: `Authorization: Bearer <access_token>`

- **List Applications:** GET `http://localhost:8002/applications/`
  - Header: `Authorization: Bearer <access_token>`

- **Get Application:** GET `http://localhost:8002/applications/{application_id}`
  - Header: `Authorization: Bearer <access_token>`

- **Update Application:** PUT `http://localhost:8002/applications/{application_id}`
  - Header: `Authorization: Bearer <access_token>`

- **Submit Application:** POST `http://localhost:8002/applications/{application_id}/submit`
  - Header: `Authorization: Bearer <access_token>`

### 3. Predictions
- **Start Prediction Job:** POST `http://localhost:8003/applications/{application_id}/predict`
  - Header: `Authorization: Bearer <access_token>`
  - Response: `202 Accepted`

- **Get Prediction Result:** GET `http://localhost:8003/applications/{application_id}/prediction`
  - Header: `Authorization: Bearer <access_token>`
  - Returns `202 Accepted` while prediction is pending, then `200 OK` when ready.

### 4. Admin Endpoints
- **List Users:** GET `http://localhost:8004/admin/users`
  - Header: `Authorization: Bearer <admin_token>`

- **List Applications:** GET `http://localhost:8004/admin/applications`
  - Header: `Authorization: Bearer <admin_token>`

New admin review endpoints (manual review workflow):

- **Review Application:** PATCH `http://localhost:8004/admin/applications/{application_id}/review`
  - Body: `{ "final_review": "APPROVED" }` or `{ "final_review": "REJECTED" }`
  - Validates input and returns `409 Conflict` if application already reviewed
  - Header: `Authorization: Bearer <admin_token>`

- **List Pending Review:** GET `http://localhost:8004/admin/applications/pending-review`
  - Returns applications where `final_review == NOT_REVIEWED`
  - Header: `Authorization: Bearer <admin_token>`

- **List Approved Applications:** GET `http://localhost:8004/admin/applications/approved`
  - Returns applications where `final_review == APPROVED`
  - Header: `Authorization: Bearer <admin_token>`

- **List Rejected Applications:** GET `http://localhost:8004/admin/applications/rejected`
  - Returns applications where `final_review == REJECTED`
  - Header: `Authorization: Bearer <admin_token>`

- **Application Details (Admin):** GET `http://localhost:8004/admin/applications/{application_id}`
  - Returns application details, user details, prediction (if present), and review audit fields (`final_review`, `reviewed_by`, `reviewed_at`)
  - Header: `Authorization: Bearer <admin_token>`

Example API response (admin view / application detail):
```json
{
  "application_id":"<uuid>",
  "prediction":{
    "credit_score":742,
    "risk":"LOW",
    "recommendation":"APPROVE"
  },
  "final_review":"APPROVED",
  "reviewed_by":"<admin-uuid>",
  "reviewed_at":"2026-07-01T14:22:18Z"
}
```

## Important Notes

1. **Trailing Slashes:** Some endpoints redirect from `/applications` to `/applications/` - Postman and httpx handle this automatically
2. **Database:** Models are created automatically on service startup
3. **Redis & RabbitMQ:** Optional for running basic endpoints without async tasks
4. **Environment Variables:** Copy `.env.example` to `.env` for local development

## Test Results

✓ Auth Service
- POST /auth/register (201)
- POST /auth/login (200)
- GET /auth/me (200)

✓ Application Service
- POST /applications/ (201)
- GET /applications/ (200)
- GET /applications/{id} (200)
- PUT /applications/{id} (200)
- POST /applications/{id}/submit (200)

✓ Prediction Service
- POST /applications/{id}/predict (202)
- GET /applications/{id}/prediction (200 or 404)    

✓ Admin Service
- GET /admin/users (200 or 403)
- GET /admin/applications (200 or 403)

## Known Limitations

1. **Database:** Currently configured for PostgreSQL. Update `.env` with your database URL
2. **Redis/RabbitMQ:** Required for Celery async tasks. Ensure these services are running
3. **ML Service:** Prediction service expects ML model API at URL specified in `.env` (`ML_SERVICE_URL`)

## Next Steps

1. Update `.env` with your PostgreSQL credentials
2. Start Redis and RabbitMQ if using async predictions
3. Update `ML_SERVICE_URL` to point to your ML model API
4. Run services using the commands above
5. Test all endpoints in Postman using the examples above