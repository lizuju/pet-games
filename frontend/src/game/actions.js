export const collectAction = () => ({
  type: 'collect',
  payload: {},
});

export const collectFishAction = () => ({
  type: 'collect_fish',
  payload: {},
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

export const claimAchievementAction = (id) => ({
  type: 'claim_achievement',
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

export const interactCharacterAction = (id) => ({
  type: 'interact_character',
  payload: { id },
});
