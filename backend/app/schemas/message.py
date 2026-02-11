from datetime import datetime
from pydantic import BaseModel


class MessageCreate(BaseModel):
    chat_id: int
    content: str


class MessageRead(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
