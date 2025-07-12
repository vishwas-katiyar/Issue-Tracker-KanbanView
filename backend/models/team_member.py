from sqlmodel import SQLModel, Field
from typing import Optional

class TeamMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int  # The invited user
    invited_by: int  # The inviter
    email: str
    status: str = Field(default="INVITED")  # INVITED, ACCEPTED
