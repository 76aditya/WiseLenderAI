from datetime import datetime
from typing import Any

from pydantic import BaseModel

class PredictionJobResponse(BaseModel):
    status: str
    message: str
    application_id: str

class PredictionResultResponse(BaseModel):
    application_id: str
    alternative_credit_score: int
    decision: str
    default_probability: float
    risk_level: str
    financial_index: float
    behavior_index: float
    digital_trust_index: float
    financial_probability: float
    behavior_probability: float
    digital_probability: float
    meta_index: float
    reasons: dict[str, list[dict[str, Any]]]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PredictionPendingResponse(BaseModel):
    status: str
    message: str
    application_id: str
    prediction_status: str
