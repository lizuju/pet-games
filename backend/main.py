from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import secrets
from dotenv import load_dotenv
import time

from models import PlayerState
from schemas import ActionRequest
from game_engine import GameEngine
from errors import ActionError


load_dotenv()

app = FastAPI(title="Pet Games API")

# Setup CORS to allow frontend connections
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
frontend_origin_regex = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"^https://pet-games(-[\w-]+)?\.vercel\.app$",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_origin_regex=frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace this with your actual MongoDB connection string from Atlas
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.pet_games
engine = GameEngine()

@app.get("/")
async def root():
    return {"message": "Welcome to Pet Games API"}

@app.get("/api/health")
async def health_check():
    try:
        await client.admin.command("ping")
        database = "connected"
    except Exception:
        database = "disconnected"
    return {"status": "ok", "database": database}

@app.get("/api/catalog")
async def get_catalog():
    return engine.get_catalog()

@app.get("/api/player/{player_id}", response_model=PlayerState)
async def get_player_state(player_id: str, x_player_token: str | None = Header(default=None)):
    player = await db.players.find_one({"_id": player_id})
    if player:
        auth_token = player.get("auth_token")
        if auth_token:
            if not x_player_token or x_player_token != auth_token:
                raise HTTPException(status_code=403, detail="Invalid or missing player token")
        else:
            auth_token = secrets.token_urlsafe(32)
            await db.players.update_one(
                {"_id": player_id},
                {"$set": {"auth_token": auth_token}},
                upsert=True
            )
        # MongoDB returns _id, which isn't in our Pydantic model by default.
        # We can either exclude it or pass the rest of the dictionary.
        player_dict = {k: v for k, v in player.items() if k != "_id"}
        normalized = engine.normalize_state(player_dict)
        prior_last_tick = normalized["game_data"].get("last_tick")
        prior_last_pet_care = normalized["game_data"].get("last_pet_care")
        prior_last_plant_care = normalized["game_data"].get("last_plant_care")
        updated, elapsed = engine.apply_offline(normalized)
        updated_game_data = updated["game_data"]
        should_persist = (
            elapsed > 0
            or prior_last_tick != updated_game_data.get("last_tick")
            or prior_last_pet_care != updated_game_data.get("last_pet_care")
            or prior_last_plant_care != updated_game_data.get("last_plant_care")
        )
        if should_persist:
            await db.players.update_one(
                {"_id": player_id},
                {"$set": updated},
                upsert=True
            )
        updated["auth_token"] = auth_token
        return PlayerState(**updated)
    
    # Return default state if not found (new player)
    auth_token = secrets.token_urlsafe(32)
    default_state = PlayerState(auth_token=auth_token).model_dump()
    await db.players.update_one(
        {"_id": player_id},
        {"$set": default_state},
        upsert=True
    )
    return PlayerState(**default_state)

@app.post("/api/player/{player_id}")
async def save_player_state(
    player_id: str,
    state: PlayerState,
    x_player_token: str | None = Header(default=None),
):
    if not x_player_token:
        raise HTTPException(status_code=401, detail="Missing player token")
    current = await db.players.find_one({"_id": player_id})
    if current and current.get("auth_token") != x_player_token:
        raise HTTPException(status_code=403, detail="Invalid player token")

    current_rev = int(current.get("rev", 0)) if current else 0
    client_rev = int(state.rev or 0)
    if current and client_rev != current_rev:
        player_dict = {k: v for k, v in current.items() if k != "_id"}
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Version conflict",
                "current_state": engine.normalize_state(player_dict),
            },
        )

    state_dict = engine.normalize_state(state.model_dump())
    state_dict["game_data"]["last_tick"] = time.time()
    state_dict["rev"] = current_rev + 1
    state_dict["auth_token"] = x_player_token
    await db.players.update_one(
        {"_id": player_id},
        {"$set": state_dict},
        upsert=True
    )
    return {"status": "success", "message": "Player state saved"}

@app.post("/api/player/{player_id}/action", response_model=PlayerState)
async def apply_player_action(
    player_id: str,
    action: ActionRequest,
    x_player_token: str | None = Header(default=None),
):
    if not x_player_token:
        raise HTTPException(status_code=401, detail="Missing player token")
    player = await db.players.find_one({"_id": player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if player.get("auth_token") != x_player_token:
        raise HTTPException(status_code=403, detail="Invalid player token")

    current_rev = int(player.get("rev", 0))
    client_rev = int(action.client_rev or 0)
    if client_rev != current_rev:
        player_dict = {k: v for k, v in player.items() if k != "_id"}
        return JSONResponse(
            status_code=409,
            content={
                "detail": "Version conflict",
                "current_state": engine.normalize_state(player_dict),
            },
        )

    player_dict = {k: v for k, v in player.items() if k != "_id"}
    normalized = engine.normalize_state(player_dict)
    normalized, _ = engine.apply_offline(normalized)
    try:
        updated = engine.apply_action(normalized, action.type, action.payload, apply_decay=False)
    except ActionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    updated["rev"] = current_rev + 1
    updated["auth_token"] = player.get("auth_token")
    await db.players.update_one(
        {"_id": player_id},
        {"$set": updated},
        upsert=True
    )
    return PlayerState(**updated)
