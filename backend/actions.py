from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional, Protocol, TYPE_CHECKING

if TYPE_CHECKING:
    from game_engine import GameEngine

from policies import UpgradePolicy
from errors import ActionError


@dataclass
class ActionContext:
    engine: "GameEngine"
    state: Dict[str, Any]
    now: float
    payload: Dict[str, Any]


class ActionHandler(Protocol):
    action_type: str

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        ...


class ActionRegistry:
    def __init__(self) -> None:
        self._handlers: Dict[str, ActionHandler] = {}

    def register(self, handler: ActionHandler) -> None:
        self._handlers[handler.action_type] = handler

    def get(self, action_type: str) -> Optional[ActionHandler]:
        return self._handlers.get(action_type)


class CollectAction:
    action_type = "collect"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        gain = 0.01
        xp_gain = 0.005
        ctx.state["money"] += gain
        ctx.state["game_data"]["xp"] += xp_gain
        return ctx.engine.apply_leveling(ctx.state)


class CollectFishAction:
    action_type = "collect_fish"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        gain = 0.01
        xp_gain = 0.002
        ctx.state["fish"] += gain
        ctx.state["game_data"]["xp"] += xp_gain
        return ctx.engine.apply_leveling(ctx.state)


class UpgradeDeskAction:
    action_type = "upgrade_desk"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        policy = UpgradePolicy(category="desks", cooldown_key="desks", affects_staff_count=False)
        return policy.apply(ctx)


class UpgradeStaffAction:
    action_type = "upgrade_staff"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        policy = UpgradePolicy(category="staff", cooldown_key="staff", affects_staff_count=True)
        return policy.apply(ctx)


class HireStaffAction(UpgradeStaffAction):
    action_type = "hire_staff"


class UpgradeSkillAction:
    action_type = "upgrade_skill"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        policy = UpgradePolicy(category="skills", cooldown_key="skills", affects_staff_count=False)
        return policy.apply(ctx)


class BuyShopAction:
    action_type = "buy_shop"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        item = ctx.engine.get_shop_item(ctx.payload.get("id"))
        if not item:
            raise ActionError(404, "Shop item not found")
        if ctx.state["money"] < item.cost_money:
            raise ActionError(400, "Not enough money")
        ctx.state["money"] -= item.cost_money
        ctx.state["fish"] += item.fish_reward
        return ctx.engine.apply_leveling(ctx.state)


class CompleteTaskAction:
    action_type = "complete_task"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        item = ctx.engine.get_task(ctx.payload.get("id"))
        if not item:
            raise ActionError(404, "Task not found")
        tasks_status = ctx.state["game_data"].get("tasks_status", {})
        if tasks_status.get(item.id, {}).get("done"):
            raise ActionError(409, "Task already completed")
        if not ctx.engine.task_requirements_met(ctx.state, item):
            raise ActionError(400, "Task requirements not met")
        ctx.state["money"] += item.reward_money
        ctx.state["game_data"]["xp"] += item.reward_xp
        tasks_status[item.id] = {"done": True}
        ctx.state["game_data"]["tasks_status"] = tasks_status
        return ctx.engine.apply_leveling(ctx.state)


class UpdateSettingsAction:
    action_type = "update_settings"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        settings = ctx.state["game_data"].get("settings", {})
        for key in ("auto_save", "offline_income"):
            if key in ctx.payload:
                settings[key] = bool(ctx.payload[key])
        ctx.state["game_data"]["settings"] = settings
        if "offline_income" in ctx.payload and not settings.get("offline_income", True):
            ctx.state["game_data"]["last_tick"] = ctx.now
        return ctx.state


class CarePetAction:
    action_type = "care_pet"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        ctx.state["game_data"]["last_pet_care"] = ctx.now
        return ctx.state


class CarePlantAction:
    action_type = "care_plant"

    def apply(self, ctx: ActionContext) -> Dict[str, Any]:
        ctx.state["game_data"]["last_plant_care"] = ctx.now
        return ctx.state
