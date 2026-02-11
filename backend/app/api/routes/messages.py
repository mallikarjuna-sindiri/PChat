from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.chat import Chat, GroupMember
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead
from app.services.websocket_manager import manager

router = APIRouter()


def ensure_chat_access(db: Session, chat_id: int, user_id: int) -> Chat:
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    if chat.type == "direct" and user_id not in (chat.user_a_id, chat.user_b_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if chat.type == "group":
        member = (
            db.query(GroupMember)
            .filter(GroupMember.chat_id == chat_id, GroupMember.user_id == user_id)
            .first()
        )
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return chat


@router.post("/", response_model=MessageRead)
async def create_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Message:
    ensure_chat_access(db, payload.chat_id, current_user.id)
    message = Message(chat_id=payload.chat_id, sender_id=current_user.id, content=payload.content)
    db.add(message)
    db.commit()
    db.refresh(message)
    await manager.broadcast(
        payload.chat_id,
        {
            "id": message.id,
            "chat_id": message.chat_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        },
    )
    return message


@router.get("/chat/{chat_id}", response_model=list[MessageRead])
def list_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Message]:
    ensure_chat_access(db, chat_id, current_user.id)
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
