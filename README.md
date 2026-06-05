# Lumina AI

Welcome to **Lumina AI**, a cutting-edge platform combining a powerful FastAPI backend with a sleek Next.js frontend.

## 🚀 Enterprise & Business Value
Lumina AI is designed for high scalability and rapid AI deployment in enterprise environments. By decoupling the heavy AI processing layer from the user interface, it ensures a frictionless, responsive client experience while handling complex machine learning tasks asynchronously.

## 💡 Core Capabilities
- **High-Performance AI Serving**: Asynchronous AI model endpoints powered by FastAPI.
- **Modern User Experience**: A highly reactive, SEO-optimized frontend built on Next.js.
- **Scalable Monorepo**: Streamlined developer workflow allowing independent deployment of frontend and backend services.

## Architecture Breakdown

Lumina AI leverages a decoupled, modern architecture to separate concerns and ensure scalable performance:

- **Frontend Interface (`frontend/`)**: Built with **Next.js** and **React**, it handles the client-side user experience, routing, and UI rendering.
- **Backend AI Engine (`backend/`)**: Built with **Python** and **FastAPI**, it serves as the core AI processing unit, providing RESTful endpoints for the frontend to consume.

## Setup Instructions

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
