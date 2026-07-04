from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    final_review: Literal["APPROVED", "REJECTED"] = Field(
        ..., description="Final review decision must be APPROVED or REJECTED"
    )

    model_config = {
        "extra": "forbid",
    }


class UserResponse(BaseModel):
    id: str
    email: str
    admin: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PredictionResponse(BaseModel):
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
    reasons: dict[str, Any]
    raw_response: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AdminApplicationDetailResponse(BaseModel):
    id: str
    title: str
    status: str
    questionnaire: dict[str, Any]
    user: UserResponse
    prediction: PredictionResponse | None = None
    final_review: str
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
