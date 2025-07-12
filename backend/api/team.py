from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import SessionLocal
from models.team_member import TeamMember
from models.user import User
from schemas.team import InviteRequest, TeamMemberOut
from utils.jwt import decode_access_token
from fastapi import Header
from typing import Optional, List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(Authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not Authorization or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = Authorization.split()[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/invite", response_model=TeamMemberOut)
def invite_user(request: InviteRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(TeamMember).filter(TeamMember.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already invited")
    team_member = TeamMember(user_id=0, invited_by=user.id, email=request.email, status="INVITED")
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    return team_member

@router.get("/team", response_model=List[TeamMemberOut])
def list_team(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(TeamMember).filter(TeamMember.invited_by == user.id).all()
