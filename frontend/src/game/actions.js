export const collectAction = (amount = 0.01, xp = 0.005) => ({
  type: 'collect',
  payload: { amount, xp },
});

export const collectFishAction = (amount = 0.01, xp = 0.002) => ({
  type: 'collect_fish',
  payload: { amount, xp },
});

export const upgradeDeskAction = (id) => ({
  type: 'upgrade_desk',
  payload: { id },
});

export const hireStaffAction = (id) => ({
  type: 'upgrade_staff',
  payload: { id },
});

export const buyShopAction = (id) => ({
  type: 'buy_shop',
  payload: { id },
});

export const upgradeSkillAction = (id) => ({
  type: 'upgrade_skill',
  payload: { id },
});

export const completeTaskAction = (id) => ({
  type: 'complete_task',
  payload: { id },
});

export const updateSettingsAction = (settings) => ({
  type: 'update_settings',
  payload: settings,
});

export const carePetAction = () => ({
  type: 'care_pet',
  payload: {},
});

export const carePlantAction = () => ({
  type: 'care_plant',
  payload: {},
});
