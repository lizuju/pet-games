import { useMemo, useState } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import {
  completeTaskAction,
  hireStaffAction,
  upgradeDeskAction,
  upgradeSkillAction,
} from '../../game/actions';

const PanelShell = ({ title, children, onClose }) => {
  return (
    <div className="absolute left-4 right-4 top-24 z-50 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.14)] border border-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-slate-800 font-extrabold text-sm tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Close
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
  >
    {label}
  </button>
);

const ActionRow = ({ title, description, reward, status, cost, disabled, onClick }) => (
  <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
    <div className="flex flex-col">
      <span className="text-slate-800 font-bold text-sm">{title}</span>
      <span className="text-slate-500 text-[11px]">{description}</span>
      {status && <span className="text-slate-400 text-[11px] mt-1">{status}</span>}
      {reward && <span className="text-emerald-500 text-[11px] font-bold mt-1">{reward}</span>}
    </div>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${disabled ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
    >
      {cost || 'Go'}
    </button>
  </div>
);

const CHARACTER_CONFIG = {
  ceo: {
    title: 'CEO Cat',
    upgrade: 'desks',
    dialogue: [
      'Keep the cash flowing. Efficiency is everything.',
      'A stronger desk means faster growth.',
    ],
  },
  dev: {
    title: 'Dev Cat',
    upgrade: 'staff',
    dialogue: [
      'More hands means faster builds.',
      'We can automate this, just need resources.',
    ],
  },
  designer: {
    title: 'Designer Cat',
    upgrade: 'skills',
    dialogue: [
      'Aesthetic boosts productivity.',
      'Upgrading skills makes everything smoother.',
    ],
  },
  cactus: {
    title: 'Cactus Buddy',
    upgrade: 'skills',
    dialogue: [
      'Stay sharp, grow slow.',
      'Quiet growth beats loud chaos.',
    ],
  },
};

const CharacterPanel = ({ characterId, onClose, state, onServerAction }) => {
  const { catalog, loading } = useCatalog();
  const [tab, setTab] = useState('upgrade');

  const money = Number(state.money || 0);
  const staffCount = Number(state.staff_count || 0);
  const maxStaff = Number(state.max_staff || 0);
  const deskLevels = state.game_data?.desk_levels || {};
  const staffLevels = state.game_data?.staff_levels || {};
  const skillLevels = state.game_data?.skill_levels || {};
  const legacyDeskLevel = Number(state.game_data?.desk_level || 0);
  const maxDeskLevel = Math.max(legacyDeskLevel, ...Object.values(deskLevels || {}));
  const upgradeCooldowns = state.game_data?.upgrade_cooldowns || {};

  const tasks = useMemo(() => catalog?.tasks || [], [catalog]);
  const desks = useMemo(() => catalog?.desks || [], [catalog]);
  const staff = useMemo(() => catalog?.staff || [], [catalog]);
  const skills = useMemo(() => catalog?.skills || [], [catalog]);

  if (!characterId) return null;
  const config = CHARACTER_CONFIG[characterId];
  if (!config) return null;

  const nextCost = (item, level) => {
    const base = Number(item.base_cost || 0);
    const growth = Number(item.cost_growth || 1);
    return Math.round(base * (growth ** level));
  };

  const nextBonus = (item, level) => {
    const growth = Number(item.bonus_growth || 0);
    const multiplier = 1 + growth * level;
    return {
      money: Number(item.money_rate_bonus || 0) * multiplier,
      fish: Number(item.fish_rate_bonus || 0) * multiplier,
    };
  };

  const requirementsMet = (task) => {
    const requires = task.requires || {};
    if (typeof requires.desk_level === 'number' && maxDeskLevel < requires.desk_level) return false;
    if (typeof requires.staff_count === 'number' && staffCount < requires.staff_count) return false;
    if (typeof requires.skill_level === 'number') {
      const maxSkill = Math.max(0, ...Object.values(skillLevels));
      if (maxSkill < requires.skill_level) return false;
    }
    return true;
  };

  const cooldownRemaining = (key) => {
    const now = Date.now() / 1000;
    const until = Number(upgradeCooldowns[key] || 0);
    if (until <= now) return 0;
    return Math.ceil(until - now);
  };

  const renderUpgrades = () => {
    if (loading) {
      return <div className="text-slate-400 text-xs">Loading...</div>;
    }

    if (config.upgrade === 'desks') {
      const cooldown = cooldownRemaining('desks');
      return desks.map((item) => {
        const currentLevel = Number(deskLevels[item.id] || 0);
        const maxLevel = Number(item.max_level || 0);
        const atMax = currentLevel >= maxLevel;
        const costValue = nextCost(item, currentLevel);
        const bonus = nextBonus(item, currentLevel);
        return (
          <ActionRow
            key={item.id}
            title={item.name}
            description={item.description}
            reward={`+${bonus.money.toFixed(2)}/s`}
            status={`Level ${currentLevel}/${maxLevel}`}
            cost={atMax ? 'Max' : `$${costValue}`}
            disabled={atMax || money < costValue || cooldown > 0}
            onClick={() => onServerAction(upgradeDeskAction(item.id))}
          />
        );
      });
    }

    if (config.upgrade === 'staff') {
      const cooldown = cooldownRemaining('staff');
      return staff.map((item) => {
        const currentLevel = Number(staffLevels[item.id] || 0);
        const maxLevel = Number(item.max_level || 0);
        const atMax = currentLevel >= maxLevel;
        const costValue = nextCost(item, currentLevel);
        const isHire = currentLevel === 0;
        const blocked = isHire && staffCount >= maxStaff;
        const bonus = nextBonus(item, currentLevel);
        return (
          <ActionRow
            key={item.id}
            title={item.name}
            description={item.description}
            reward={`+${bonus.money.toFixed(2)}/s +${bonus.fish.toFixed(2)}/s`}
            status={`Level ${currentLevel}/${maxLevel}`}
            cost={atMax ? 'Max' : isHire ? `Hire $${costValue}` : `Up $${costValue}`}
            disabled={atMax || blocked || money < costValue || cooldown > 0}
            onClick={() => onServerAction(hireStaffAction(item.id))}
          />
        );
      });
    }

    if (config.upgrade === 'skills') {
      const cooldown = cooldownRemaining('skills');
      return skills.map((item) => {
        const currentLevel = Number(skillLevels[item.id] || 0);
        const maxLevel = Number(item.max_level || 0);
        const atMax = currentLevel >= maxLevel;
        const costValue = nextCost(item, currentLevel);
        const bonus = nextBonus(item, currentLevel);
        return (
          <ActionRow
            key={item.id}
            title={item.name}
            description={item.description}
            reward={`+${bonus.money.toFixed(2)}/s +${bonus.fish.toFixed(2)}/s`}
            status={`Level ${currentLevel}/${maxLevel}`}
            cost={atMax ? 'Max' : `$${costValue}`}
            disabled={atMax || money < costValue || cooldown > 0}
            onClick={() => onServerAction(upgradeSkillAction(item.id))}
          />
        );
      });
    }

    return null;
  };

  const renderTasks = () => {
    if (loading) return <div className="text-slate-400 text-xs">Loading...</div>;
    return tasks.map((task) => {
      const done = Boolean(state.game_data?.tasks_status?.[task.id]?.done);
      const canClaim = requirementsMet(task);
      return (
        <ActionRow
          key={task.id}
          title={task.name}
          description={task.description}
          reward={`$${task.reward_money} +${task.reward_xp} XP`}
          status={done ? 'Completed' : canClaim ? 'Ready' : 'Locked'}
          cost={done ? 'Done' : canClaim ? 'Claim' : 'Locked'}
          disabled={done || !canClaim}
          onClick={() => onServerAction(completeTaskAction(task.id))}
        />
      );
    });
  };

  const renderDialogue = () => {
    return config.dialogue.map((line, index) => (
      <div key={index} className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 text-slate-600 text-sm">
        {line}
      </div>
    ));
  };

  return (
    <PanelShell title={config.title} onClose={onClose}>
      <div className="flex items-center gap-2">
        <TabButton label="Upgrade" active={tab === 'upgrade'} onClick={() => setTab('upgrade')} />
        <TabButton label="Dialogue" active={tab === 'dialogue'} onClick={() => setTab('dialogue')} />
        <TabButton label="Tasks" active={tab === 'tasks'} onClick={() => setTab('tasks')} />
      </div>
      {tab === 'upgrade' && renderUpgrades()}
      {tab === 'dialogue' && renderDialogue()}
      {tab === 'tasks' && renderTasks()}
    </PanelShell>
  );
};

export default CharacterPanel;
