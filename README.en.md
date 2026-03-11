# Pet Games

[中文](README.md) | [English](README.en.md)

Pet Games is a relaxed idle management game where you grow a tiny studio with your cat companions. Upgrade desks, hire staff, train skills, and build steady money and fish production while completing tasks to unlock more growth.

## Overview
This is a full-stack practice project with a FastAPI + MongoDB backend and a Vite + React frontend. It ships a complete idle-loop experience: continuous resource generation, upgrades, tasks, shop exchanges, offline progress, and care-based decay.

## Core Gameplay
- Automatic money and fish generation (per-second tick, boosted by leveling and upgrades).
- Tap to collect instant rewards and small XP gains.
- Upgrade paths for desks, staff, and skills with scaling costs, scaling bonuses, and a 30-minute cooldown.
- Task system with requirements and reward claims.
- Shop exchanges that convert money into fish packs.
- Rest boost for short-term acceleration with cooldown (20s boost, 40s cooldown by default).
- Offline progress capped at 6 hours, plus care-based decay after 30 minutes of neglect, stepping every 30 minutes up to 12 steps.

## Data and Sync
- Player ID is stored in browser localStorage and auto-generated on first visit.
- The client ticks every second and auto-saves every 5 seconds by default; auto-save and offline income can be disabled in settings.
- The backend persists player state in MongoDB and applies offline earnings and care decay on load.

## Tech Stack
- Backend: FastAPI, Motor (MongoDB)
- Frontend: React, Vite, Tailwind CSS

## Repo Structure
- `backend/`: FastAPI server + game engine
- `frontend/`: Vite React app

## Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

## Environment Variables

### Backend
Create `backend/.env` based on `.env.example`:
```bash
MONGODB_URL=mongodb://localhost:27017
```

### Frontend
Create `frontend/.env` for local dev:
```bash
VITE_API_BASE=http://localhost:8000
```

Create `frontend/.env.production` for production builds:
```bash
VITE_API_BASE=https://api.your-domain.com
```

## Run Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

## Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

## API Endpoints
- `GET /api/health`
- `GET /api/catalog`
- `GET /api/player/{player_id}`
- `POST /api/player/{player_id}`
- `POST /api/player/{player_id}/action`

## Notes
- `.env` and `.env.production` are ignored by git. Use the provided `.env.example` files as templates.
- For production, tighten CORS in `backend/main.py`.

---

## License

This project follows the `LICENSE` file in the repository.
