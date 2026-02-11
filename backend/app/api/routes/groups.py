import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.chat import Chat, GroupMember
from app.models.user import User
from app.schemas.chat import ChatRead
from app.schemas.group import GroupCreate, GroupJoin, GroupMemberRead
from app.schemas.user import UserPublic

router = APIRouter()


@router.post("/", response_model=ChatRead)
def create_group(
    payload: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Chat:
    invite_code = secrets.token_hex(3)
    chat = Chat(type="group", name=payload.name, invite_code=invite_code, owner_id=current_user.id)
    db.add(chat)
    db.commit()
    db.refresh(chat)

    member = GroupMember(chat_id=chat.id, user_id=current_user.id, role="owner")
    db.add(member)
    db.commit()
    return chat


@router.post("/join", response_model=GroupMemberRead)
def join_group(
    payload: GroupJoin,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GroupMember:
    chat = db.query(Chat).filter(Chat.invite_code == payload.invite_code).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")

    existing = (
        db.query(GroupMember)
        .filter(GroupMember.chat_id == chat.id, GroupMember.user_id == current_user.id)
        .first()
    )
    if existing:
        return existing

    member = GroupMember(chat_id=chat.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/", response_model=list[ChatRead])
def list_groups(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Chat]:
    memberships = db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()
    group_ids = [member.chat_id for member in memberships]
    return db.query(Chat).filter(Chat.id.in_(group_ids)).all() if group_ids else []


@router.get("/{chat_id}/members", response_model=list[UserPublic])
def list_group_members(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[User]:
    member = (
        db.query(GroupMember)
        .filter(GroupMember.chat_id == chat_id, GroupMember.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    member_ids = db.query(GroupMember.user_id).filter(GroupMember.chat_id == chat_id).all()
    user_ids = [item[0] for item in member_ids]
    return db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
