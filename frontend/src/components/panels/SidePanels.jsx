import { useMemo } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { updateSettingsAction } from '../../game/actions';

const PanelShell = ({ title, children, onClose }) => {
  return (
    <div className="absolute right-4 top-32 z-50 w-72 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.12)] border border-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
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

const EmptyState = ({ title, description }) => (
  <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
    <div className="text-slate-800 font-bold text-sm">{title}</div>
    <div className="text-slate-500 text-xs mt-1">{description}</div>
  </div>
);

const SidePanels = ({ activePanel, onClose, state, onServerAction }) => {
  const { catalog } = useCatalog();
  const moneyRate = Number(state.game_data?.money_rate || 0);
  const fishRate = Number(state.game_data?.fish_rate || 0);
  const deskLevels = state.game_data?.desk_levels || {};
  const staffLevels = state.game_data?.staff_levels || {};
  const skillLevels = state.game_data?.skill_levels || {};
  const tasksStatus = state.game_data?.tasks_status || {};
  const settings = state.game_data?.settings || { auto_save: true, offline_income: true };

  const maxDeskLevel = Math.max(Number(state.game_data?.desk_level || 0), ...Object.values(deskLevels || {}));
  const maxSkillLevel = Math.max(0, ...Object.values(skillLevels || {}));

  const tasks = useMemo(() => catalog?.tasks || [], [catalog]);

  if (!activePanel) return null;

  if (activePanel === 'inventory') {
    return (
      <PanelShell title="Inventory" onClose={onClose}>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="text-slate-800 font-bold text-sm">Production</div>
          <div className="text-slate-500 text-xs mt-1">Money: +{moneyRate.toFixed(2)}/s</div>
          <div className="text-slate-500 text-xs">Fish: +{fishRate.toFixed(2)}/s</div>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
          <div className="text-slate-800 font-bold text-sm">Upgrades</div>
          <div className="text-slate-500 text-xs mt-1">Desk Level: {maxDeskLevel}</div>
          <div className="text-slate-500 text-xs">Staff Types: {Object.keys(staffLevels).length}</div>
          <div className="text-slate-500 text-xs">Skill Levels: {maxSkillLevel}</div>
        </div>
      </PanelShell>
    );
  }

  if (activePanel === 'messages') {
    return (
      <PanelShell title="Messages" onClose={onClose}>
        {tasks.length === 0 && (
          <EmptyState title="No messages" description="New tasks and updates will appear here." />
        )}
        {tasks.map((task) => {
          const done = Boolean(tasksStatus[task.id]?.done);
          const requires = task.requires || {};
          const locked = (requires.desk_level && maxDeskLevel < requires.desk_level) ||
            (requires.staff_count && state.staff_count < requires.staff_count) ||
            (requires.skill_level && maxSkillLevel < requires.skill_level);
          return (
            <div key={task.id} className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
              <div className="text-slate-800 font-bold text-sm">{task.name}</div>
              <div className="text-slate-500 text-xs mt-1">{task.description}</div>
              <div className="text-emerald-500 text-xs font-bold mt-1">
                ${task.reward_money} +{task.reward_xp} XP
              </div>
              <div className="text-slate-400 text-[11px] mt-1">
                {done ? 'Completed' : locked ? 'Locked' : 'Ready'}
              </div>
            </div>
          );
        })}
      </PanelShell>
    );
  }

  if (activePanel === 'settings') {
    return (
      <PanelShell title="Settings" onClose={onClose}>
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
          <div>
            <div className="text-slate-800 font-bold text-sm">Auto Save</div>
            <div className="text-slate-500 text-xs">Every 5 seconds</div>
          </div>
          <button
            onClick={() => onServerAction(updateSettingsAction({ auto_save: !settings.auto_save }))}
            className={`text-xs font-bold ${settings.auto_save ? 'text-emerald-500' : 'text-slate-400'}`}
          >
            {settings.auto_save ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
          <div>
            <div className="text-slate-800 font-bold text-sm">Offline Income</div>
            <div className="text-slate-500 text-xs">Up to 6h</div>
          </div>
          <button
            onClick={() => onServerAction(updateSettingsAction({ offline_income: !settings.offline_income }))}
            className={`text-xs font-bold ${settings.offline_income ? 'text-emerald-500' : 'text-slate-400'}`}
          >
            {settings.offline_income ? 'ON' : 'OFF'}
          </button>
        </div>
      </PanelShell>
    );
  }

  return null;
};

export default SidePanels;
