from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    display_name: str | None = None


class UserRead(UserBase):
    id: int
    unique_id: str
    created_at: datetime

    class Config:
        orm_mode = True


class UserPublic(BaseModel):
    id: int
    username: str
    display_name: str | None = None
    unique_id: str

    class Config:
        orm_mode = True
