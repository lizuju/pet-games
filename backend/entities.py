from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass(frozen=True)
class UpgradeableEntity:
    id: str
    name: str
    description: str
    base_cost: float
    cost_growth: float
    max_level: int
    money_rate_bonus: float = 0.0
    fish_rate_bonus: float = 0.0
    bonus_growth: float = 0.0

    def cost(self, level: int) -> int:
        return int(round(self.base_cost * (self.cost_growth ** level)))

    def bonus(self, level: int) -> tuple[float, float]:
        multiplier = 1 + (self.bonus_growth * level)
        money = self.money_rate_bonus * multiplier
        fish = self.fish_rate_bonus * multiplier
        return round(money, 2), round(fish, 2)


@dataclass(frozen=True)
class ShopItem:
    id: str
    name: str
    description: str
    cost_money: int
    fish_reward: float


@dataclass(frozen=True)
class TaskDefinition:
    id: str
    name: str
    description: str
    reward_money: float
    reward_xp: float
    requires: Dict[str, Any] = field(default_factory=dict)
