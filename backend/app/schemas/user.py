from pydantic import BaseModel, EmailStr


class APIKeyRequest(BaseModel):
    email: EmailStr


class UpdateAPIKeyRequest(BaseModel):
    api_key: str
