# Lumina AI

Welcome to **Lumina AI**, a cutting-edge platform combining a powerful FastAPI backend with a sleek Next.js frontend. 

## Project Architecture

This monorepo is divided into two primary services:

- **`frontend/`**: The user interface, built with Next.js, React, and modern web technologies. 
- **`backend/`**: The core AI engine and API, built with Python and FastAPI.

## Getting Started

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.9+ (for the backend)

### Quick Start (Windows)
You can use the `start.bat` script provided in the root directory to quickly boot up both frontend and backend services:
```bash
.\start.bat
```

### Frontend Setup
To run the frontend locally manually:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### Backend Setup
To run the FastAPI backend locally manually:
```bash
cd backend
python -m venv venv
# Activate the virtual environment
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*(Check your `main.py` or use `uvicorn main:app --reload` as appropriate)*

## Contributing
When making changes to this repository, ensure that you follow the established directory structure and keep dependencies local to their respective folders (`frontend` vs `backend`).

## License
MIT
