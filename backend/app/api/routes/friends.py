from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.friendship import FriendRequest, Friendship
from app.models.user import User
from app.schemas.friendship import (
    FriendRequestCreate,
    FriendRequestWithUser,
    FriendshipWithUser,
)

router = APIRouter()


def are_friends(db: Session, user_id: int, friend_id: int) -> bool:
    return (
        db.query(Friendship)
        .filter(Friendship.user_id == user_id, Friendship.friend_id == friend_id)
        .first()
        is not None
    )


@router.post("/requests", response_model=FriendRequestWithUser)
def send_request(
    payload: FriendRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FriendRequest:
    if payload.to_user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot add yourself")

    target = db.query(User).filter(User.id == payload.to_user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if are_friends(db, current_user.id, payload.to_user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already friends")

    existing_request = (
        db.query(FriendRequest)
        .filter(
            ((FriendRequest.from_user_id == current_user.id) & (FriendRequest.to_user_id == payload.to_user_id))
            | ((FriendRequest.from_user_id == payload.to_user_id) & (FriendRequest.to_user_id == current_user.id))
        )
        .first()
    )
    if existing_request and existing_request.status == "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already pending")

    request = FriendRequest(from_user_id=current_user.id, to_user_id=payload.to_user_id)
    db.add(request)
    db.commit()
    db.refresh(request)
    return FriendRequestWithUser(**request.__dict__, from_user=current_user)


@router.get("/requests", response_model=list[FriendRequestWithUser])
def list_requests(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[FriendRequest]:
    requests = (
        db.query(FriendRequest)
        .filter(FriendRequest.to_user_id == current_user.id, FriendRequest.status == "pending")
        .all()
    )
    from_ids = [req.from_user_id for req in requests]
    users = db.query(User).filter(User.id.in_(from_ids)).all() if from_ids else []
    user_map = {user.id: user for user in users}
    return [
        FriendRequestWithUser(**req.__dict__, from_user=user_map.get(req.from_user_id))
        for req in requests
        if user_map.get(req.from_user_id)
    ]


@router.post("/requests/{request_id}/accept", response_model=FriendshipWithUser)
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Friendship:
    request = (
        db.query(FriendRequest)
        .filter(FriendRequest.id == request_id, FriendRequest.to_user_id == current_user.id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    request.status = "accepted"
    if not are_friends(db, current_user.id, request.from_user_id):
        db.add(Friendship(user_id=current_user.id, friend_id=request.from_user_id))
    if not are_friends(db, request.from_user_id, current_user.id):
        db.add(Friendship(user_id=request.from_user_id, friend_id=current_user.id))
    db.commit()
    friend = db.query(User).filter(User.id == request.from_user_id).first()
    friendship = (
        db.query(Friendship)
        .filter(Friendship.user_id == current_user.id, Friendship.friend_id == request.from_user_id)
        .first()
    )
    if not friendship:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Friendship missing")
    return FriendshipWithUser(**friendship.__dict__, friend=friend)


@router.post("/requests/{request_id}/reject")
def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    request = (
        db.query(FriendRequest)
        .filter(FriendRequest.id == request_id, FriendRequest.to_user_id == current_user.id)
        .first()
    )
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    request.status = "rejected"
    db.commit()
    return {"status": "rejected"}


@router.get("/list", response_model=list[FriendshipWithUser])
def list_friends(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[Friendship]:
    friendships = db.query(Friendship).filter(Friendship.user_id == current_user.id).all()
    friend_ids = [friend.friend_id for friend in friendships]
    users = db.query(User).filter(User.id.in_(friend_ids)).all() if friend_ids else []
    user_map = {user.id: user for user in users}
    return [
        FriendshipWithUser(**friendship.__dict__, friend=user_map.get(friendship.friend_id))
        for friendship in friendships
        if user_map.get(friendship.friend_id)
    ]
