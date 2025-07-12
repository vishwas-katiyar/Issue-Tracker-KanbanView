from pydantic import BaseModel
from typing import Optional

class IssueBase(BaseModel):
    title: str
    description: str
    status: str
    priority: str
    tags: str
    assigned_to: Optional[int] = None
    team_id: int  # NEW: Add team_id for team-based filtering

class IssueCreate(IssueBase):
    pass

class IssueUpdate(IssueBase):
    pass
