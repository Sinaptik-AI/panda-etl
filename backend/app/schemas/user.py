from pydantic import BaseModel, EmailStr


class APIKeyRequest(BaseModel):
    email: EmailStr
