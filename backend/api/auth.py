from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from database import SessionLocal
from models.user import User
from schemas.auth import UserCreate, UserLogin
from utils.jwt import get_password_hash, verify_password, create_access_token
from fastapi.responses import JSONResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if email already exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)

    # Default to None
    team_id = None

    # Check if the user was invited (look in TeamMember)
    from models.team_member import TeamMember  # ensure this import
    invite = db.query(TeamMember).filter(TeamMember.email == user.email, TeamMember.status == "INVITED").first()

    if invite:
        inviter = db.query(User).filter(User.id == invite.invited_by).first()
        if inviter and inviter.team_id:
            team_id = inviter.team_id
        else:
            raise HTTPException(status_code=400, detail="Inviter has no team")
    else:
        # Not invited — create a new team
        from models.team import Team  # ensure this import
        new_team = Team(name=f"{user.username}'s Team")
        db.add(new_team)
        db.flush()  # gets new_team.id before commit
        team_id = new_team.id

    # Create the user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        team_id=team_id
    )
    db.add(new_user)
    db.flush()  # Ensure new_user.id is populated before using it

    # Optional: update the invite status if user was invited
    if invite:
        invite.user_id = new_user.id
        invite.status = "JOINED"
        db.add(invite)

    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "team_id": new_user.team_id
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_obj = db.query(User).filter(User.username == user.username).first()
    if not user_obj or not verify_password(user.password, user_obj.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user_obj.username, "user_id": user_obj.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_obj.id,
            "username": user_obj.username,
            "email": user_obj.email,
            "team_id": user_obj.team_id
        }
    }
