from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class APIKeyRequest(BaseModel):
    email: EmailStr


class UpdateAPIKeyRequest(BaseModel):
    api_key: str


class UserUpdateRequest(BaseModel):
    email: EmailStr = Field(..., title="Email", description="User's email address")
    first_name: Optional[str] = Field(None, title="First Name", description="User's first name")
    last_name: Optional[str] = Field(None, title="Last Name", description="User's last name")
