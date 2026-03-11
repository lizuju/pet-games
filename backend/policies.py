from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, TYPE_CHECKING

if TYPE_CHECKING:
    from actions import ActionContext


LEVELS_KEY = {
    "desks": "desk_levels",
    "staff": "staff_levels",
    "skills": "skill_levels",
}


@dataclass(frozen=True)
class UpgradePolicy:
    category: str
    cooldown_key: str
    affects_staff_count: bool = False

    def apply(self, ctx: ActionContext) -> Dict:
        cooldowns = ctx.state["game_data"].get("upgrade_cooldowns", {})
        if ctx.now < float(cooldowns.get(self.cooldown_key, 0)):
            return ctx.state

        item = ctx.engine.get_upgradeable(self.category, ctx.payload.get("id"))
        if not item:
            return ctx.state

        levels_key = LEVELS_KEY[self.category]
        levels = ctx.state["game_data"].get(levels_key, {})
        current_level = int(levels.get(item.id, 0))
        if current_level >= item.max_level:
            return ctx.state

        cost = ctx.engine.next_cost(item, current_level)
        if ctx.state["money"] < cost:
            return ctx.state

        if self.affects_staff_count and current_level == 0:
            if ctx.state["staff_count"] >= ctx.state["max_staff"]:
                return ctx.state

        ctx.state["money"] -= cost

        if self.affects_staff_count and current_level == 0:
            ctx.state["staff_count"] += 1

        levels[item.id] = current_level + 1
        ctx.state["game_data"][levels_key] = levels

        if self.category == "desks":
            ctx.state["game_data"]["desk_level"] = max(levels.values(), default=0)

        bonus_money, bonus_fish = ctx.engine.next_bonus(item, current_level)
        ctx.state["game_data"]["money_rate"] += bonus_money
        ctx.state["game_data"]["fish_rate"] += bonus_fish

        cooldowns[self.cooldown_key] = ctx.now + ctx.engine.upgrade_cooldown_seconds
        ctx.state["game_data"]["upgrade_cooldowns"] = cooldowns

        return ctx.engine.apply_leveling(ctx.state)
