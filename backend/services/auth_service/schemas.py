from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID

class UserCreate(BaseModel):
    username: str = Field(min_length=1)
    email: EmailStr | None = None
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr | None = None
    admin: bool
    is_active: bool
    full_name: str
    date_of_birth: str
    gender: str
    residential_address: str
    permanent_address: str
    nationality: str
    user_status: str
    mobile_number: str | None = None
    contact_email: str | None = None
    national_id_number: str | None = None
    pan_tax_id: str | None = None

    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    full_name: str = Field(..., min_length=1)
    date_of_birth: str = Field(..., min_length=1)
    gender: str = Field(..., min_length=1)
    residential_address: str = Field(..., min_length=1)
    permanent_address: str = Field(..., min_length=1)
    nationality: str = Field(..., min_length=1)
    mobile_number: str = Field(..., min_length=1)
    contact_email: EmailStr | None = None
    national_id_number: str = Field(..., min_length=1)
    pan_tax_id: str | None = None

class TokenRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
