from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    preferred_roles: Optional[str] = None
    preferred_locations: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileInDBBase(ProfileBase):
    id: str
    user_id: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Profile(ProfileInDBBase):
    pass
