from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session
from typing import Optional

from database import SessionLocal
from models.issue import Issue
from models.user import User
from schemas.issue import IssueCreate, IssueUpdate
from utils.jwt import decode_access_token

router = APIRouter()

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency: Get current authenticated user from Bearer token
def get_current_user(Authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not Authorization or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = Authorization.split()[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.get("/")
def list_issues(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # List all issues for the current user's team
    return db.query(Issue).filter(Issue.team_id == user.team_id).all()

@router.post("/")
def create_issue(issue: IssueCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Create new issue, automatically assigning created_by and team_id from user
    issue_data = issue.dict()
    issue_data["created_by"] = user.id
    issue_data["team_id"] = user.team_id
    new_issue = Issue(**issue_data)
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    return new_issue

@router.get("/{issue_id}")
def get_issue(issue_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Get issue only if created by current user (ownership)
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.created_by == user.id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    return issue

@router.put("/{issue_id}")
def update_issue(issue_id: int, update: IssueUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Update issue if it belongs to the user's team
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.team_id == user.team_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found or not in your team")
    for key, value in update.dict(exclude_unset=True).items():
        setattr(issue, key, value)
    db.commit()
    db.refresh(issue)
    return issue

@router.delete("/{issue_id}")
def delete_issue(issue_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Delete issue only if current user is the creator (owner)
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.created_by == user.id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found or not owner")
    db.delete(issue)
    db.commit()
    return {"ok": True}

# --- Optional alternative delete if you want any team member to delete ---
"""
@router.delete("/{issue_id}")
def delete_issue_team(issue_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Delete issue if it belongs to the user's team (not necessarily creator)
    issue = db.query(Issue).filter(Issue.id == issue_id, Issue.team_id == user.team_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found or not in your team")
    db.delete(issue)
    db.commit()
    return {"ok": True}
"""
