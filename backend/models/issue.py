from sqlmodel import SQLModel, Field
from typing import Optional

class Issue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    status: str
    priority: str
    tags: str
    created_by: int
    assigned_to: Optional[int]
    team_id: int  # NEW: Add team_id for team-based filtering
