const DEFAULT_GAME_DATA = {
  money_rate: 0.02,
  fish_rate: 0.004,
  xp: 0,
  xp_to_next: 50,
  level_progress: 0,
  tasks_status: {},
  desk_level: 0,
  staff_levels: {},
  skill_levels: {},
  settings: {
    auto_save: true,
    offline_income: true,
  },
  last_pet_care: null,
  last_plant_care: null,
  upgrade_cooldowns: {
    desks: 0,
    staff: 0,
    skills: 0,
  },
};

const DEFAULT_STATE = {
  money: 0,
  fish: 0,
  level: 1,
  staff_count: 0,
  max_staff: 15,
  game_data: DEFAULT_GAME_DATA,
};

const roundTo = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const normalizeState = (state) => {
  const safe = state || {};
  const gameData = { ...DEFAULT_GAME_DATA, ...(safe.game_data || {}) };
  return {
    ...DEFAULT_STATE,
    ...safe,
    money: Number(safe.money ?? DEFAULT_STATE.money),
    fish: Number(safe.fish ?? DEFAULT_STATE.fish),
    level: Number(safe.level ?? DEFAULT_STATE.level),
    staff_count: Number(safe.staff_count ?? DEFAULT_STATE.staff_count),
    max_staff: Number(safe.max_staff ?? DEFAULT_STATE.max_staff),
    game_data: {
      ...gameData,
      money_rate: Number(gameData.money_rate ?? DEFAULT_GAME_DATA.money_rate),
      fish_rate: Number(gameData.fish_rate ?? DEFAULT_GAME_DATA.fish_rate),
      xp: Number(gameData.xp ?? DEFAULT_GAME_DATA.xp),
      xp_to_next: Number(gameData.xp_to_next ?? DEFAULT_GAME_DATA.xp_to_next),
      level_progress: Number(gameData.level_progress ?? DEFAULT_GAME_DATA.level_progress),
      desk_level: Number(gameData.desk_level ?? DEFAULT_GAME_DATA.desk_level),
      staff_levels: gameData.staff_levels ?? DEFAULT_GAME_DATA.staff_levels,
      skill_levels: gameData.skill_levels ?? DEFAULT_GAME_DATA.skill_levels,
      settings: {
        auto_save: Boolean(gameData.settings?.auto_save ?? DEFAULT_GAME_DATA.settings.auto_save),
        offline_income: Boolean(gameData.settings?.offline_income ?? DEFAULT_GAME_DATA.settings.offline_income),
      },
      last_pet_care: gameData.last_pet_care ?? DEFAULT_GAME_DATA.last_pet_care,
      last_plant_care: gameData.last_plant_care ?? DEFAULT_GAME_DATA.last_plant_care,
      upgrade_cooldowns: gameData.upgrade_cooldowns ?? DEFAULT_GAME_DATA.upgrade_cooldowns,
    },
  };
};

export const tick = (state, deltaSeconds = 1) => {
  const safe = normalizeState(state);
  const delta = Math.max(0, Number(deltaSeconds || 0));

  let moneyRate = safe.game_data.money_rate;
  let fishRate = safe.game_data.fish_rate;
  let xp = safe.game_data.xp;
  let xpToNext = safe.game_data.xp_to_next;
  let level = safe.level;
  let maxStaff = safe.max_staff;

  let money = safe.money + moneyRate * delta;
  let fish = safe.fish + fishRate * delta;
  xp += (moneyRate * 0.0012 + fishRate * 0.002) * delta;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = Math.round(xpToNext * 1.2 + 10);
    moneyRate = roundTo(moneyRate * 1.01 + 0.001, 3);
    fishRate = roundTo(fishRate * 1.01 + 0.0005, 3);
    maxStaff += 1;
  }

  const levelProgress = xpToNext > 0 ? roundTo(xp / xpToNext, 4) : 0;

  return {
    ...safe,
    money: roundTo(money, 2),
    fish: roundTo(fish, 2),
    level,
    max_staff: maxStaff,
    game_data: {
      ...safe.game_data,
      money_rate: moneyRate,
      fish_rate: fishRate,
      xp: roundTo(xp, 2),
      xp_to_next: xpToNext,
      level_progress: levelProgress,
    },
  };
};

export const applyAction = (state, action) => {
  const safe = normalizeState(state);

  switch (action?.type) {
    case 'collect': {
      const moneyGain = Number(action.amount ?? 0.1);
      const xpGain = Number(action.xp ?? 0.005);
      return {
        ...safe,
        money: roundTo(safe.money + moneyGain, 2),
        game_data: {
          ...safe.game_data,
          xp: roundTo(safe.game_data.xp + xpGain, 2),
        },
      };
    }
    case 'collect_fish': {
      const fishGain = Number(action.amount ?? 0.1);
      const xpGain = Number(action.xp ?? 0.002);
      return {
        ...safe,
        fish: roundTo(safe.fish + fishGain, 2),
        game_data: {
          ...safe.game_data,
          xp: roundTo(safe.game_data.xp + xpGain, 2),
        },
      };
    }
    default:
      return safe;
  }
};

export const gameDefaults = DEFAULT_STATE;
