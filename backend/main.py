from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from api import auth, issues, team
from api import auth, issues, team
from database import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(issues.router, prefix="/api/issues", tags=["issues"])
app.include_router(team.router, tags=["team"])

@app.get("/")
def read_root():
    return {"message": "Mini Issue Tracker API"}

if __name__ == "__main__":
    init_db()