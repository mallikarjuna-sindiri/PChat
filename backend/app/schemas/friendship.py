from datetime import datetime
from pydantic import BaseModel

from app.schemas.user import UserPublic


class FriendRequestCreate(BaseModel):
    to_user_id: int


class FriendRequestRead(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


class FriendRequestWithUser(FriendRequestRead):
    from_user: UserPublic


class FriendshipRead(BaseModel):
    id: int
    user_id: int
    friend_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class FriendshipWithUser(FriendshipRead):
    friend: UserPublic
