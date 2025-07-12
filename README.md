

# KanbanView

KanbanView is a full-stack Kanban board application for teams to manage tasks and workflows efficiently. It features user authentication, team management, and issue tracking, with a modern drag-and-drop frontend and a robust backend API.

---

## Features
- User registration and login (JWT-based authentication)
- Password hashing and secure token management
- Team creation, listing, and member management
- Invite users to teams
- Issue creation, editing, assignment, and deletion
- Issue status management (To Do, In Progress, Done)
- Drag-and-drop Kanban board UI
- Filter and search issues by status, assignee, or team
- Responsive design for desktop and mobile
- Protected routes and role-based permissions
- Persistent login (token storage)
- Error handling and user feedback
- RESTful API for all core features

---

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** FastAPI (served with Uvicorn)
- **Database:** SQLite

---

## Project Structure
```
KanbanView/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── api/
│   ├── models/
│   ├── schemas/
│   └── utils/
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── api/
└── README.md
```

---

## API Overview
The backend exposes a RESTful API for all core features. Key endpoints include:

**Auth**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

**Team Management**
- `GET /api/team` — List teams
- `POST /api/team` — Create a new team
- `GET /api/team/{id}` — Get team details
- `POST /api/team/{id}/members` — Add member to team

**Issue Management**
- `GET /api/issues` — List all issues
- `POST /api/issues` — Create a new issue
- `GET /api/issues/{id}` — Get issue details
- `PUT /api/issues/{id}` — Update issue
- `DELETE /api/issues/{id}` — Delete issue

All endpoints require authentication except registration and login. See backend code for more details and request/response formats.

---

## Backend Setup

### Prerequisites
- Python 3.10+
- pip

### Installation & Run
1. Navigate to the `backend` directory:
   ```cmd
   cd backend
   ```
2. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
3. **Initialize the database and run the backend server:**
   - To initialize the SQLite database, run:
     ```cmd
     python main.py
     ```
   - The API will be available at `http://localhost:8000` (or as configured).
   - The backend uses Uvicorn to serve the application.

---

## Frontend Setup

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation & Run
1. Navigate to the `frontend` directory:
   ```cmd
   cd frontend
   ```
2. Install dependencies:
   ```cmd
   yarn
   ```
3. Start the development server:
   ```cmd
   yarn dev
   ```
   The app will be available at Vite's default dev URL, usually `http://localhost:5173`.

---

## Usage
1. Register a new user or log in.
2. Create or join a team.
3. Add issues/tasks to the Kanban board.
4. Drag and drop issues to update their status.

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License
This project is licensed under the MIT License.
