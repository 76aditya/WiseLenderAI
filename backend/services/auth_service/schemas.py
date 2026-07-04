from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    admin: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class TokenRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
