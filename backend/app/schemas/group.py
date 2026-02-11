from datetime import datetime
from pydantic import BaseModel


class GroupCreate(BaseModel):
    name: str


class GroupJoin(BaseModel):
    invite_code: str


class GroupMemberRead(BaseModel):
    id: int
    chat_id: int
    user_id: int
    role: str
    joined_at: datetime

    class Config:
        orm_mode = True
