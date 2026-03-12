from typing import Any, Dict, Tuple

import time

from errors import ActionError
from actions import (
    ActionContext,
    ActionRegistry,
    BuyShopAction,
    CarePetAction,
    CarePlantAction,
    CollectAction,
    CollectFishAction,
    ClaimAchievementAction,
    CompleteTaskAction,
    HireStaffAction,
    InteractCharacterAction,
    UpdateSettingsAction,
    UpgradeDeskAction,
    UpgradeSkillAction,
    UpgradeStaffAction,
)
from entities import UpgradeableEntity, ShopItem, TaskDefinition

from actions import (
    ActionContext,
    ActionRegistry,
    BuyShopAction,
    CarePetAction,
    CarePlantAction,
    CollectAction,
    CollectFishAction,
    CompleteTaskAction,
    HireStaffAction,
    UpdateSettingsAction,
    UpgradeDeskAction,
    UpgradeSkillAction,
    UpgradeStaffAction,
)


class GameEngine:
    def __init__(self) -> None:
        self.default_game_data: Dict[str, Any] = {
            "money_rate": 0.02,
            "fish_rate": 0.004,
            "xp": 0.0,
            "xp_to_next": 50.0,
            "level_progress": 0.0,
            "desk_level": 0,
            "desk_levels": {},
            "staff_levels": {},
            "skill_levels": {},
            "tasks_status": {},
            "achievements_status": {},
            "interaction_cooldowns": {},
            "last_tick": None,
            "last_pet_care": None,
            "last_plant_care": None,
            "upgrade_cooldowns": {
                "desks": 0,
                "staff": 0,
                "skills": 0,
            },
            "settings": {
                "auto_save": True,
                "offline_income": True,
            },
        }
        self.offline_cap_seconds = 6 * 60 * 60
        self.care_grace_seconds = 30 * 60
        self.decay_step_seconds = 30 * 60
        self.decay_max_steps = 12
        self.upgrade_cooldown_seconds = 30 * 60
        self.interaction_cooldown_seconds = 5
        self.registry = ActionRegistry()
        self._register_actions()
        self.upgrade_cooldown_seconds = 30 * 60
        self.registry = ActionRegistry()
        self._register_actions()

        self.catalog: Dict[str, Any] = {
            "desks": [
                {
                    "id": "desk_basic",
                    "name": "Maple Desk",
                    "description": "Boosts money production.",
                    "base_cost": 50,
                    "cost_growth": 1.5,
                    "max_level": 6,
                    "money_rate_bonus": 0.007,
                    "bonus_growth": 0.0008,
                },
                {
                    "id": "desk_modern",
                    "name": "Modern Desk",
                    "description": "Extra productivity bump.",
                    "base_cost": 150,
                    "cost_growth": 1.65,
                    "max_level": 5,
                    "money_rate_bonus": 0.018,
                    "bonus_growth": 0.0008,
                },
            ],
            "staff": [
                {
                    "id": "staff_intern",
                    "name": "Intern",
                    "description": "Cheap help for basic tasks.",
                    "base_cost": 80,
                    "cost_growth": 1.45,
                    "max_level": 4,
                    "money_rate_bonus": 0.004,
                    "fish_rate_bonus": 0.0015,
                    "bonus_growth": 0.0006,
                },
                {
                    "id": "staff_dev",
                    "name": "Junior Dev",
                    "description": "Improves money + fish rate.",
                    "base_cost": 200,
                    "cost_growth": 1.5,
                    "max_level": 4,
                    "money_rate_bonus": 0.008,
                    "fish_rate_bonus": 0.0035,
                    "bonus_growth": 0.0006,
                },
            ],
            "skills": [
                {
                    "id": "skill_finance",
                    "name": "Finance Sense",
                    "description": "Permanent money rate boost.",
                    "base_cost": 120,
                    "cost_growth": 1.6,
                    "max_level": 5,
                    "money_rate_bonus": 0.01,
                    "fish_rate_bonus": 0.0,
                    "bonus_growth": 0.0007,
                },
                {
                    "id": "skill_fishing",
                    "name": "Ocean Tactics",
                    "description": "Permanent fish rate boost.",
                    "base_cost": 90,
                    "cost_growth": 1.55,
                    "max_level": 5,
                    "money_rate_bonus": 0.0,
                    "fish_rate_bonus": 0.006,
                    "bonus_growth": 0.0007,
                },
            ],
            "shop": [
                {
                    "id": "fish_pack_small",
                    "name": "Fish Pack",
                    "description": "Instant fish boost.",
                    "cost_money": 30,
                    "fish_reward": 50,
                },
                {
                    "id": "fish_pack_large",
                    "name": "Big Fish Pack",
                    "description": "Large fish boost.",
                    "cost_money": 80,
                    "fish_reward": 160,
                },
            ],
            "tasks": [
                {
                    "id": "task_welcome",
                    "name": "Welcome aboard",
                    "description": "Claim your first bonus.",
                    "reward_money": 25,
                    "reward_xp": 8,
                    "requires": {},
                },
                {
                    "id": "task_builder",
                    "name": "Office Builder",
                    "description": "Upgrade a desk.",
                    "reward_money": 40,
                    "reward_xp": 10,
                    "requires": {"desk_level": 1},
                },
                {
                    "id": "task_hire",
                    "name": "First Hire",
                    "description": "Hire your first staff.",
                    "reward_money": 60,
                    "reward_xp": 12,
                    "requires": {"staff_count": 1},
                },
                {
                    "id": "task_skill",
                    "name": "Skill Training",
                    "description": "Upgrade a skill.",
                    "reward_money": 80,
                    "reward_xp": 15,
                    "requires": {"skill_level": 1},
                },
            ],
            "achievements": [
                {
                    "id": "ach_first_steps",
                    "name": "First Steps",
                    "description": "Reach level 2.",
                    "reward_money": 50,
                    "reward_xp": 10,
                    "requires": {"level": 2},
                },
                {
                    "id": "ach_desk_starter",
                    "name": "Desk Starter",
                    "description": "Upgrade any desk to level 1.",
                    "reward_money": 60,
                    "reward_xp": 12,
                    "requires": {"desk_level": 1},
                },
                {
                    "id": "ach_team_builder",
                    "name": "Team Builder",
                    "description": "Hire your first staff member.",
                    "reward_money": 75,
                    "reward_xp": 15,
                    "requires": {"staff_count": 1},
                },
                {
                    "id": "ach_skill_learner",
                    "name": "Skill Learner",
                    "description": "Upgrade a skill to level 1.",
                    "reward_money": 80,
                    "reward_xp": 18,
                    "requires": {"skill_level": 1},
                },
                {
                    "id": "ach_fish_hoarder",
                    "name": "Fish Hoarder",
                    "description": "Hold 100 fish at once.",
                    "reward_money": 90,
                    "reward_xp": 20,
                    "requires": {"fish": 100},
                },
            ],
        }
        self._build_entities()

    def _register_actions(self) -> None:
        self.registry.register(CollectAction())
        self.registry.register(CollectFishAction())
        self.registry.register(UpgradeDeskAction())
        self.registry.register(UpgradeStaffAction())
        self.registry.register(HireStaffAction())
        self.registry.register(UpgradeSkillAction())
        self.registry.register(BuyShopAction())
        self.registry.register(CompleteTaskAction())
        self.registry.register(ClaimAchievementAction())
        self.registry.register(UpdateSettingsAction())
        self.registry.register(CarePetAction())
        self.registry.register(CarePlantAction())
        self.registry.register(InteractCharacterAction())

    def _build_entities(self) -> None:
        self.desks: Dict[str, UpgradeableEntity] = {}
        self.staff: Dict[str, UpgradeableEntity] = {}
        self.skills: Dict[str, UpgradeableEntity] = {}
        self.shop: Dict[str, ShopItem] = {}
        self.tasks: Dict[str, TaskDefinition] = {}

        for item in self.catalog.get("desks", []):
            self.desks[item["id"]] = UpgradeableEntity(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                base_cost=float(item["base_cost"]),
                cost_growth=float(item["cost_growth"]),
                max_level=int(item["max_level"]),
                money_rate_bonus=float(item.get("money_rate_bonus", 0.0)),
                fish_rate_bonus=float(item.get("fish_rate_bonus", 0.0)),
                bonus_growth=float(item.get("bonus_growth", 0.0)),
            )

        for item in self.catalog.get("staff", []):
            self.staff[item["id"]] = UpgradeableEntity(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                base_cost=float(item["base_cost"]),
                cost_growth=float(item["cost_growth"]),
                max_level=int(item["max_level"]),
                money_rate_bonus=float(item.get("money_rate_bonus", 0.0)),
                fish_rate_bonus=float(item.get("fish_rate_bonus", 0.0)),
                bonus_growth=float(item.get("bonus_growth", 0.0)),
            )

        for item in self.catalog.get("skills", []):
            self.skills[item["id"]] = UpgradeableEntity(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                base_cost=float(item["base_cost"]),
                cost_growth=float(item["cost_growth"]),
                max_level=int(item["max_level"]),
                money_rate_bonus=float(item.get("money_rate_bonus", 0.0)),
                fish_rate_bonus=float(item.get("fish_rate_bonus", 0.0)),
                bonus_growth=float(item.get("bonus_growth", 0.0)),
            )

        for item in self.catalog.get("shop", []):
            self.shop[item["id"]] = ShopItem(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                cost_money=int(item["cost_money"]),
                fish_reward=float(item["fish_reward"]),
            )

        for item in self.catalog.get("tasks", []):
            self.tasks[item["id"]] = TaskDefinition(
                id=item["id"],
                name=item["name"],
                description=item["description"],
                reward_money=float(item["reward_money"]),
                reward_xp=float(item["reward_xp"]),
                requires=item.get("requires", {}),
            )

    def get_catalog(self) -> Dict[str, Any]:
        return self.catalog

    def normalize_state(self, state: Dict[str, Any]) -> Dict[str, Any]:
        safe = state or {}
        game_data = {**self.default_game_data, **safe.get("game_data", {})}
        tasks_status = game_data.get("tasks_status") or {}
        game_data["tasks_status"] = tasks_status
        achievements_status = game_data.get("achievements_status") or {}
        game_data["achievements_status"] = achievements_status
        desk_levels = game_data.get("desk_levels") or {}
        if not desk_levels and int(game_data.get("desk_level", 0)) > 0:
            desk_levels["desk_basic"] = int(game_data.get("desk_level", 0))
        game_data["desk_levels"] = desk_levels
        staff_levels = game_data.get("staff_levels") or {}
        skill_levels = game_data.get("skill_levels") or {}
        game_data["staff_levels"] = staff_levels
        game_data["skill_levels"] = skill_levels
        settings = game_data.get("settings") or {}
        game_data["settings"] = {
            "auto_save": bool(settings.get("auto_save", True)),
            "offline_income": bool(settings.get("offline_income", True)),
        }
        if not game_data.get("last_pet_care"):
            game_data["last_pet_care"] = None
        if not game_data.get("last_plant_care"):
            game_data["last_plant_care"] = None
        cooldowns = game_data.get("upgrade_cooldowns") or {}
        game_data["upgrade_cooldowns"] = {
            "desks": float(cooldowns.get("desks", 0)),
            "staff": float(cooldowns.get("staff", 0)),
            "skills": float(cooldowns.get("skills", 0)),
        }
        interaction_cooldowns = game_data.get("interaction_cooldowns") or {}
        game_data["interaction_cooldowns"] = {
            "ceo": float(interaction_cooldowns.get("ceo", 0)),
            "dev": float(interaction_cooldowns.get("dev", 0)),
            "designer": float(interaction_cooldowns.get("designer", 0)),
            "cactus": float(interaction_cooldowns.get("cactus", 0)),
        }

        return {
            "money": float(safe.get("money", 0.0)),
            "fish": float(safe.get("fish", 0.0)),
            "level": int(safe.get("level", 1)),
            "staff_count": int(safe.get("staff_count", 0)),
            "max_staff": int(safe.get("max_staff", 15)),
            "rev": int(safe.get("rev", 0)),
            "game_data": {
                **game_data,
                "money_rate": float(game_data.get("money_rate", 0.0)),
                "fish_rate": float(game_data.get("fish_rate", 0.0)),
                "xp": float(game_data.get("xp", 0.0)),
                "xp_to_next": float(game_data.get("xp_to_next", 1.0)),
                "level_progress": float(game_data.get("level_progress", 0.0)),
                "desk_level": int(game_data.get("desk_level", 0)),
                "desk_levels": desk_levels,
                "staff_levels": staff_levels,
                "skill_levels": skill_levels,
                "tasks_status": tasks_status,
                "achievements_status": achievements_status,
                "last_tick": game_data.get("last_tick"),
                "last_pet_care": game_data.get("last_pet_care"),
                "last_plant_care": game_data.get("last_plant_care"),
                "upgrade_cooldowns": game_data["upgrade_cooldowns"],
                "interaction_cooldowns": game_data["interaction_cooldowns"],
                "settings": game_data["settings"],
            },
        }

    def apply_leveling(self, state: Dict[str, Any]) -> Dict[str, Any]:
        game_data = state["game_data"]
        xp = float(game_data.get("xp", 0.0))
        xp_to_next = float(game_data.get("xp_to_next", 1.0))
        money_rate = float(game_data.get("money_rate", 0.0))
        fish_rate = float(game_data.get("fish_rate", 0.0))
        level = int(state.get("level", 1))
        max_staff = int(state.get("max_staff", 15))

        while xp >= xp_to_next:
            xp -= xp_to_next
            level += 1
            xp_to_next = round(xp_to_next * 1.2 + 10)
            money_rate = round(money_rate * 1.01 + 0.001, 3)
            fish_rate = round(fish_rate * 1.01 + 0.0005, 3)
            max_staff += 1

        level_progress = xp / xp_to_next if xp_to_next > 0 else 0.0

        state["level"] = level
        state["max_staff"] = max_staff
        game_data["xp"] = round(xp, 2)
        game_data["xp_to_next"] = xp_to_next
        game_data["money_rate"] = money_rate
        game_data["fish_rate"] = fish_rate
        game_data["level_progress"] = round(level_progress, 4)
        return state

    def get_upgradeable(self, category: str, item_id: str) -> UpgradeableEntity | None:
        if category == "desks":
            return self.desks.get(item_id)
        if category == "staff":
            return self.staff.get(item_id)
        if category == "skills":
            return self.skills.get(item_id)
        return None

    def get_shop_item(self, item_id: str) -> ShopItem | None:
        return self.shop.get(item_id)

    def get_task(self, item_id: str) -> TaskDefinition | None:
        return self.tasks.get(item_id)

    def next_cost(self, item: UpgradeableEntity, current_level: int) -> int:
        return item.cost(current_level)

    def next_bonus(self, item: UpgradeableEntity, current_level: int) -> Tuple[float, float]:
        return item.bonus(current_level)

    def task_requirements_met(self, state: Dict[str, Any], task: TaskDefinition | Dict[str, Any]) -> bool:
        requires = task.requires if isinstance(task, TaskDefinition) else task.get("requires", {}) or {}
        if "desk_level" in requires:
            desk_levels = state["game_data"].get("desk_levels", {})
            max_desk = max(desk_levels.values(), default=state["game_data"].get("desk_level", 0))
            if max_desk < int(requires["desk_level"]):
                return False
        if "staff_count" in requires:
            if state.get("staff_count", 0) < int(requires["staff_count"]):
                return False
        if "skill_level" in requires:
            levels = state["game_data"].get("skill_levels", {})
            max_skill = max(levels.values(), default=0)
            if max_skill < int(requires["skill_level"]):
                return False
        return True

    def achievement_requirements_met(self, state: Dict[str, Any], achievement: Dict[str, Any]) -> bool:
        requires = achievement.get("requires", {}) or {}
        if "level" in requires:
            if int(state.get("level", 1)) < int(requires["level"]):
                return False
        if "money" in requires:
            if float(state.get("money", 0.0)) < float(requires["money"]):
                return False
        if "fish" in requires:
            if float(state.get("fish", 0.0)) < float(requires["fish"]):
                return False
        if "desk_level" in requires:
            desk_levels = state["game_data"].get("desk_levels", {})
            max_desk = max(desk_levels.values(), default=state["game_data"].get("desk_level", 0))
            if max_desk < int(requires["desk_level"]):
                return False
        if "staff_count" in requires:
            if int(state.get("staff_count", 0)) < int(requires["staff_count"]):
                return False
        if "skill_level" in requires:
            levels = state["game_data"].get("skill_levels", {})
            max_skill = max(levels.values(), default=0)
            if max_skill < int(requires["skill_level"]):
                return False
        return True

    def apply_tick(self, state: Dict[str, Any], delta_seconds: float) -> Dict[str, Any]:
        if delta_seconds <= 0:
            return state
        state = self.normalize_state(state)
        game_data = state["game_data"]
        money_rate = float(game_data.get("money_rate", 0.0))
        fish_rate = float(game_data.get("fish_rate", 0.0))
        state["money"] = round(state["money"] + money_rate * delta_seconds, 2)
        state["fish"] = round(state["fish"] + fish_rate * delta_seconds, 2)
        game_data["xp"] = round(
            game_data.get("xp", 0.0) + (money_rate * 0.0012 + fish_rate * 0.002) * delta_seconds,
            2,
        )
        return self.apply_leveling(state)

    def _decay_steps(self, last_care: float | None, now: float) -> Tuple[int, float | None]:
        if not last_care:
            return 0, now
        elapsed = max(0, int(now - float(last_care)))
        if elapsed <= self.care_grace_seconds:
            return 0, last_care
        over = elapsed - self.care_grace_seconds
        steps = int(over // self.decay_step_seconds) + 1
        steps = min(steps, self.decay_max_steps)
        remainder = over % self.decay_step_seconds
        new_last = now - (self.care_grace_seconds + remainder)
        return steps, new_last

    def _downgrade_levels(self, state: Dict[str, Any], category: str, levels_key: str, steps: int, affects_staff_count: bool) -> None:
        if steps <= 0:
            return
        game_data = state["game_data"]
        levels = game_data.get(levels_key, {})
        for _ in range(steps):
            if not levels:
                break
            item_id, level = max(levels.items(), key=lambda kv: kv[1])
            if level <= 0:
                levels.pop(item_id, None)
                continue
            item = self.get_upgradeable(category, item_id)
            if not item:
                levels.pop(item_id, None)
                continue
            bonus_money, bonus_fish = self.next_bonus(item, level - 1)
            game_data["money_rate"] = max(0.0, game_data["money_rate"] - bonus_money)
            game_data["fish_rate"] = max(0.0, game_data["fish_rate"] - bonus_fish)
            new_level = level - 1
            if new_level <= 0:
                levels.pop(item_id, None)
                if affects_staff_count:
                    state["staff_count"] = max(0, state["staff_count"] - 1)
            else:
                levels[item_id] = new_level
        game_data[levels_key] = levels

    def apply_neglect_decay(self, state: Dict[str, Any], now: float) -> Dict[str, Any]:
        state = self.normalize_state(state)
        game_data = state["game_data"]

        last_pet_care = game_data.get("last_pet_care")
        last_plant_care = game_data.get("last_plant_care")
        pet_steps, pet_last = self._decay_steps(last_pet_care, now)
        plant_steps, plant_last = self._decay_steps(last_plant_care, now)

        if last_pet_care is None:
            game_data["last_pet_care"] = pet_last
        if last_plant_care is None:
            game_data["last_plant_care"] = plant_last

        if pet_steps > 0:
            self._downgrade_levels(state, "staff", "staff_levels", pet_steps, True)
            self._downgrade_levels(state, "skills", "skill_levels", pet_steps, False)
            game_data["last_pet_care"] = pet_last

        if plant_steps > 0:
            self._downgrade_levels(state, "desks", "desk_levels", plant_steps, False)
            desk_levels = game_data.get("desk_levels", {})
            game_data["desk_level"] = max(desk_levels.values(), default=0)
            game_data["last_plant_care"] = plant_last

        return state

    def apply_offline(self, state: Dict[str, Any], now_ts: float | None = None) -> Tuple[Dict[str, Any], int]:
        state = self.normalize_state(state)
        game_data = state["game_data"]
        now = now_ts or time.time()
        last_tick = game_data.get("last_tick")
        if not game_data.get("settings", {}).get("offline_income", True):
            game_data["last_tick"] = now
            state = self.apply_neglect_decay(state, now)
            return state, 0
        if not last_tick:
            game_data["last_tick"] = now
            state = self.apply_neglect_decay(state, now)
            return state, 0
        elapsed = max(0, int(now - float(last_tick)))
        capped = min(elapsed, self.offline_cap_seconds)
        if capped > 0:
            state = self.apply_tick(state, capped)
        state = self.apply_neglect_decay(state, now)
        game_data = state["game_data"]
        game_data["last_tick"] = now
        return state, capped

    def apply_action(
        self,
        state: Dict[str, Any],
        action_type: str,
        payload: Dict[str, Any],
        apply_decay: bool = False,
    ) -> Dict[str, Any]:
        now = time.time()
        state = self.normalize_state(state)
        if apply_decay:
            state = self.apply_neglect_decay(state, now)
        payload = payload or {}
        handler = self.registry.get(action_type)
        if not handler:
            raise ActionError(400, "Unknown action type")
        context = ActionContext(engine=self, state=state, now=now, payload=payload)
        return handler.apply(context)
