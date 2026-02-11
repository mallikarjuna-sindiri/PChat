from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.db.base import Base


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False)  # direct | group
    name = Column(String(120), nullable=True)
    invite_code = Column(String(20), unique=True, nullable=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_a_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_b_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class GroupMember(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="member")
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
