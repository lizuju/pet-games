from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class PlayerState(BaseModel):
    money: float = 0.0
    fish: float = 0.0
    level: int = 1
    staff_count: int = 0
    max_staff: int = 15
    game_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
