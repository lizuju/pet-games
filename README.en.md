# Pet Games

[中文](README.md) | [English](README.en.md)

Pet Games is a relaxed idle management game where you grow a tiny studio with your cat companions. Upgrade desks, hire staff, train skills, and build steady money and fish production while completing tasks to unlock more growth.

## Overview
This is a full-stack practice project with a FastAPI + MongoDB backend and a Vite + React frontend. It ships a complete idle-loop experience: continuous resource generation, upgrades, tasks, shop exchanges, offline progress, and care-based decay.

## Core Features
- **Complete Offline Calculation**: 6-hour offline earnings with automatic care decay system
- **Persistent Storage**: Reliable player state management with MongoDB
- **Responsive UI**: Smooth game experience built with React + Tailwind CSS
- **Auto-Save**: Configurable auto-save mechanism (every 5 seconds by default)
- **Multi-Platform Deployment**: Ready for Vercel (frontend), Render (backend), and MongoDB Atlas (database)

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

## Production Deployment Guide

### Frontend Deployment (Vercel)

1. **Prerequisites**
   - Push the project to GitHub
   - Visit [Vercel](https://vercel.com) and sign in with your GitHub account

2. **Create Project**
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Choose "Vite" as the framework
   - Set root directory to `frontend`

3. **Configure Environment Variables**
   - Add environment variables in Vercel project settings:
   ```
   VITE_API_BASE=https://your-render-api.onrender.com
   ```

4. **Deployment Complete**
   - Vercel automatically builds and deploys on each push
   - Your app will be live at `https://your-project.vercel.app`

### Backend Deployment (Render)

1. **Prerequisites**
   - Create `backend/render.yaml` in your project root:
   ```yaml
   services:
     - type: web
       name: pet-games-api
       env: python
       plan: free
       buildCommand: "pip install -r requirements.txt"
       startCommand: "uvicorn main:app --host 0.0.0.0 --port 8000"
       envVars:
         - key: MONGODB_URL
           scope: run
           value: ${MONGODB_URL}
   ```

2. **Access Render**
   - Sign up at [Render](https://render.com)
   - Connect your GitHub account

3. **Create Web Service**
   - Click "New +" > "Web Service"
   - Select the GitHub repository containing `backend/`
   - Configure:
     - Name: `pet-games-api`
     - Environment: `Python 3.10`
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`

4. **Set Environment Variables**
   - Add in Render dashboard:
   ```
   MONGODB_URL = (your MongoDB Atlas connection string)
   ```

5. **Deployment Complete**
   - Your API will run at `https://your-app.onrender.com`
   - Save this URL for the frontend's `VITE_API_BASE` configuration

### Database Deployment (MongoDB Atlas)

1. **Create Account and Project**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up and create a free organization and project

2. **Create Cluster**
   - Select "M0 Sandbox" (free tier)
   - Choose the region closest to your location
   - Wait for cluster deployment (usually 1-3 minutes)

3. **Configure Database User**
   - Go to "Database Access" tab
   - Add a new user (select "Password" method)
   - Generate a strong password and save it
   - Ensure the user has "readWriteAnyDatabase" permissions

4. **Configure Network Access**
   - Go to "Network Access" tab
   - Add IP address to the allowlist
   - For convenience, you can add `0.0.0.0/0` (allow all IPs), but **restrict to specific IPs in production**

5. **Get Connection String**
   - Go to "Databases" tab and click "Connect"
   - Select "Drivers" > "Python" version
   - Copy the connection string, formatted as:
   ```
   mongodb+srv://<username>:<password>@cluster-xxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
   ```

6. **Configure Environment Variables**
   - Set `MONGODB_URL` in your Render backend project
   - For local development, use this string in `backend/.env`

### Complete Architecture

```
GitHub (Repository)
    ↓
Vercel (Frontend) <- VITE_API_BASE -> Render (Backend) <- MONGODB_URL -> MongoDB Atlas
```

### Test Your Deployment

1. Open your Vercel app URL
2. Check network requests in browser devtools
3. Verify API calls successfully reach your Render backend
4. Test core game features (save, load, upgrades, etc.)

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
