import { useMemo } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { buyShopAction, completeTaskAction, hireStaffAction, upgradeDeskAction, upgradeSkillAction } from '../../game/actions';

const PanelShell = ({ title, children, onClose }) => {
  return (
    <div className="absolute left-4 right-4 bottom-36 z-40 pointer-events-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white overflow-hidden max-h-[45vh] flex flex-col">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-slate-800 font-extrabold text-sm tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Close
          </button>
        </div>
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ActionRow = ({ title, description, cost, reward, status, disabled, onClick }) => {
  return (
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
        {cost ? cost : 'Go'}
      </button>
    </div>
  );
};

const TabPanels = ({ activeTab, state, onServerAction, onClose }) => {
  const { catalog, loading, error } = useCatalog();
  const money = Number(state.money || 0);
  const staffCount = Number(state.staff_count || 0);
  const maxStaff = Number(state.max_staff || 0);
  const staffLevels = state.game_data?.staff_levels || {};
  const skillLevels = state.game_data?.skill_levels || {};
  const deskLevels = state.game_data?.desk_levels || {};
  const legacyDeskLevel = Number(state.game_data?.desk_level || 0);
  const upgradeCooldowns = state.game_data?.upgrade_cooldowns || {};
  const tasksStatus = state.game_data?.tasks_status || {};

  const tasks = useMemo(() => catalog?.tasks || [], [catalog]);
  const desks = useMemo(() => catalog?.desks || [], [catalog]);
  const staff = useMemo(() => catalog?.staff || [], [catalog]);
  const shop = useMemo(() => catalog?.shop || [], [catalog]);
  const skills = useMemo(() => catalog?.skills || [], [catalog]);

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

  const maxDeskLevel = Math.max(legacyDeskLevel, ...Object.values(deskLevels || {}));

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

  if (!['desks', 'tasks', 'staff', 'shop'].includes(activeTab)) return null;

  if (loading) {
    return (
      <PanelShell title="Loading..." onClose={onClose}>
        <div className="text-slate-400 text-xs">Fetching game data...</div>
      </PanelShell>
    );
  }

  if (error) {
    return (
      <PanelShell title="Catalog Error" onClose={onClose}>
        <div className="text-rose-500 text-xs">{error}</div>
      </PanelShell>
    );
  }

  if (activeTab === 'desks') {
    const cooldown = cooldownRemaining('desks');
    return (
      <PanelShell title="Desk Upgrades" onClose={onClose}>
        {cooldown > 0 && (
          <div className="text-amber-500 text-[11px] font-bold">Upgrade cooldown: {cooldown}s</div>
        )}
        {desks.map((item) => (
          (() => {
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
          })()
        ))}
      </PanelShell>
    );
  }

  if (activeTab === 'tasks') {
    return (
      <PanelShell title="Tasks" onClose={onClose}>
        {tasks.map((task) => {
          const done = Boolean(tasksStatus[task.id]?.done);
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
        })}
      </PanelShell>
    );
  }

  if (activeTab === 'staff') {
    const cooldown = cooldownRemaining('staff');
    return (
      <PanelShell title="Hire Staff" onClose={onClose}>
        {cooldown > 0 && (
          <div className="text-amber-500 text-[11px] font-bold">Upgrade cooldown: {cooldown}s</div>
        )}
        {staff.map((item) => (
          (() => {
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
          })()
        ))}
        {staffCount >= maxStaff && (
          <div className="text-amber-500 text-[11px] font-bold">Staff limit reached.</div>
        )}
      </PanelShell>
    );
  }

  if (activeTab === 'shop') {
    const cooldown = cooldownRemaining('skills');
    return (
      <PanelShell title="Shop" onClose={onClose}>
        {skills.length > 0 && (
          <>
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Skills</div>
            {cooldown > 0 && (
              <div className="text-amber-500 text-[11px] font-bold">Upgrade cooldown: {cooldown}s</div>
            )}
            {skills.map((item) => {
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
            })}
          </>
        )}
        {skills.length > 0 && <div className="h-2"></div>}
        <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Shop</div>
        {shop.map((item) => (
          <ActionRow
            key={item.id}
            title={item.name}
            description={item.description}
            reward={`+${item.fish_reward} Fish`}
            cost={`$${item.cost_money}`}
            disabled={money < item.cost_money}
            onClick={() => onServerAction(buyShopAction(item.id))}
          />
        ))}
      </PanelShell>
    );
  }

  return null;
};

export default TabPanels;
