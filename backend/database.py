from sqlmodel import SQLModel, create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from models import user, team, team_member, issue

def init_db():
    SQLModel.metadata.create_all(bind=engine)
