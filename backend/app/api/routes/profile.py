from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()


@router.get("/", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("/", response_model=UserRead)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    current_user.display_name = payload.display_name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
