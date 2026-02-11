from datetime import datetime
from pydantic import BaseModel


class ChatCreate(BaseModel):
    type: str
    name: str | None = None
    invite_code: str | None = None
    user_a_id: int | None = None
    user_b_id: int | None = None


class ChatRead(BaseModel):
    id: int
    type: str
    name: str | None = None
    invite_code: str | None = None
    owner_id: int | None = None
    user_a_id: int | None = None
    user_b_id: int | None = None
    created_at: datetime

    class Config:
        orm_mode = True


class ChatView(ChatRead):
    title: str
    peer_id: int | None = None
