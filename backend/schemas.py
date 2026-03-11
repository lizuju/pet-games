from pydantic import BaseModel, Field
from typing import Any, Dict


class ActionRequest(BaseModel):
    type: str
    payload: Dict[str, Any] = Field(default_factory=dict)
