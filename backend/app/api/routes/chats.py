from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.chat import Chat, GroupMember
from app.models.friendship import Friendship
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatRead, ChatView

router = APIRouter()


@router.post("/", response_model=ChatRead)
def create_chat(
    payload: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Chat:
    chat = Chat(
        type=payload.type,
        name=payload.name,
        invite_code=payload.invite_code,
        owner_id=current_user.id,
        user_a_id=payload.user_a_id,
        user_b_id=payload.user_b_id,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.post("/direct/{friend_id}", response_model=ChatRead)
def create_or_get_direct_chat(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Chat:
    friendship = (
        db.query(Friendship)
        .filter(Friendship.user_id == current_user.id, Friendship.friend_id == friend_id)
        .first()
    )
    if not friendship:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not friends")

    existing = (
        db.query(Chat)
        .filter(Chat.type == "direct")
        .filter(
            or_(
                (Chat.user_a_id == current_user.id) & (Chat.user_b_id == friend_id),
                (Chat.user_a_id == friend_id) & (Chat.user_b_id == current_user.id),
            )
        )
        .first()
    )
    if existing:
        return existing

    chat = Chat(type="direct", user_a_id=current_user.id, user_b_id=friend_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/", response_model=list[ChatView])
def list_chats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[ChatView]:
    direct_chats = (
        db.query(Chat)
        .filter(Chat.type == "direct")
        .filter(or_(Chat.user_a_id == current_user.id, Chat.user_b_id == current_user.id))
        .all()
    )
    memberships = db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()
    group_ids = [member.chat_id for member in memberships]
    group_chats = db.query(Chat).filter(Chat.id.in_(group_ids)).all() if group_ids else []

    chats = {chat.id: chat for chat in [*direct_chats, *group_chats]}.values()
    peer_ids = [
        (chat.user_b_id if chat.user_a_id == current_user.id else chat.user_a_id)
        for chat in chats
        if chat.type == "direct"
    ]
    peers = db.query(User).filter(User.id.in_(peer_ids)).all() if peer_ids else []
    peer_map = {user.id: user for user in peers}

    views: list[ChatView] = []
    for chat in chats:
        if chat.type == "direct":
            peer_id = chat.user_b_id if chat.user_a_id == current_user.id else chat.user_a_id
            peer = peer_map.get(peer_id)
            title = peer.display_name or peer.username if peer else "Direct chat"
            views.append(ChatView(**chat.__dict__, title=title, peer_id=peer_id))
        else:
            title = chat.name or "Group chat"
            views.append(ChatView(**chat.__dict__, title=title, peer_id=None))
    return views
