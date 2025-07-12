from pydantic import BaseModel
from typing import Optional

class InviteRequest(BaseModel):
    email: str

class TeamMemberOut(BaseModel):
    id: int
    user_id: int
    invited_by: int
    email: str
    status: str
