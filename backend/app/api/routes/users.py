from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserPublic, UserRead

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/search", response_model=list[UserPublic])
def search_users(
    query: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[User]:
    return (
        db.query(User)
        .filter((User.username.ilike(f"%{query}%")) | (User.unique_id.ilike(f"%{query}%")))
        .filter(User.id != current_user.id)
        .limit(20)
        .all()
    )


@router.get("/{user_id}", response_model=UserPublic)
def get_user_by_id(
    user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
