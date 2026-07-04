from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

class ApplicationCreate(BaseModel):
    title: str = Field(min_length=3, max_length=128)
    questionnaire: dict[str, Any]

class ApplicationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=128)
    questionnaire: dict[str, Any] | None = None
    status: str | None = None

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    status: str
    questionnaire: dict[str, Any]
    final_review: str
    reviewed_by: str | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", "user_id", "reviewed_by", mode="before")
    @classmethod
    def stringify_uuid(cls, value: Any) -> Any:
        if isinstance(value, UUID):
            return str(value)
        return value
