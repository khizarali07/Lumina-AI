@echo off
echo Starting Lumina AI...

echo Starting Backend (FastAPI)...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend (Next.js)...
start cmd /k "cd frontend && npm run dev"

echo Both services are starting up in separate windows!
