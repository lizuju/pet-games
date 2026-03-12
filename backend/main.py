from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import time

from models import PlayerState
from schemas import ActionRequest
from game_engine import GameEngine


load_dotenv()

app = FastAPI(title="Pet Games API")

# Setup CORS to allow frontend connections
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
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
async def get_player_state(player_id: str):
    player = await db.players.find_one({"_id": player_id})
    if player:
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
        return PlayerState(**updated)
    
    # Return default state if not found (new player)
    return PlayerState()

@app.post("/api/player/{player_id}")
async def save_player_state(player_id: str, state: PlayerState):
    state_dict = engine.normalize_state(state.model_dump())
    state_dict["game_data"]["last_tick"] = time.time()
    result = await db.players.update_one(
        {"_id": player_id},
        {"$set": state_dict},
        upsert=True
    )
    return {"status": "success", "message": "Player state saved"}

@app.post("/api/player/{player_id}/action", response_model=PlayerState)
async def apply_player_action(player_id: str, action: ActionRequest):
    player = await db.players.find_one({"_id": player_id})
    player_dict = {k: v for k, v in player.items() if k != "_id"} if player else {}
    normalized = engine.normalize_state(player_dict)
    normalized, _ = engine.apply_offline(normalized)
    updated = engine.apply_action(normalized, action.type, action.payload, apply_decay=False)
    await db.players.update_one(
        {"_id": player_id},
        {"$set": updated},
        upsert=True
    )
    return PlayerState(**updated)
