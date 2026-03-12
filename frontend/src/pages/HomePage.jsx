import { useMemo, useState } from 'react';
import BackgroundLayer from '../components/layout/BackgroundLayer';
import TopHud from '../components/hud/TopHud';
import SideButtons from '../components/controls/SideButtons';
import GameWorld from '../components/world/GameWorld';
import BottomNav from '../components/nav/BottomNav';
import TabPanels from '../components/panels/TabPanels';
import SidePanels from '../components/panels/SidePanels';
import CharacterPanel from '../components/panels/CharacterPanel';
import { useGameEngine } from '../hooks/useGameEngine';
import { carePetAction, carePlantAction, collectAction, collectFishAction } from '../game/actions';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('');
  const {
    state,
    runServerAction,
    loading,
    error,
    triggerRestBoost,
    restBoostActive,
    restBoostRemaining,
    restCooldownRemaining,
    restCooldownActive,
  } = useGameEngine();
  const [sidePanel, setSidePanel] = useState('');
  const [activeCharacter, setActiveCharacter] = useState('');

  const moneyDisplay = useMemo(() => {
    const value = Number(state.money || 0);
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toFixed(0);
  }, [state.money]);

  const levelProgress = useMemo(() => {
    const progress = Number(state.game_data?.level_progress || 0.6);
    const clamped = Math.min(1, Math.max(0, progress));
    return `${Math.round(clamped * 100)}%`;
  }, [state.game_data]);

  const handlePrimaryAction = () => {
    if (loading) return;
    runServerAction(collectAction());
  };

  const handleMoneyClick = () => {
    if (loading) return;
    runServerAction(collectAction());
  };

  const handleFishClick = () => {
    if (loading) return;
    runServerAction(collectFishAction());
  };

  const handleCharacterClick = (id) => {
    setActiveCharacter(id);
    runServerAction(carePetAction());
    if (id === 'cactus') {
      runServerAction(carePlantAction());
    }
  };

  const handleRestClick = () => {
    triggerRestBoost();
    runServerAction(carePlantAction());
  };

  const handleTabChange = (tab) => {
    setActiveTab((prev) => (prev === tab ? '' : tab));
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col shadow-2xl">
      <BackgroundLayer />
      <TopHud
        money={moneyDisplay}
        moneyRate={`+${Number(state.game_data?.money_rate || 0).toFixed(2)}/s`}
        fish={state.fish}
        staffCount={state.staff_count}
        maxStaff={state.max_staff}
        level={state.level}
        levelProgress={levelProgress}
        onMoneyClick={handleMoneyClick}
        onFishClick={handleFishClick}
      />
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          {error}
        </div>
      )}
      <SideButtons onOpenPanel={setSidePanel} />
      <GameWorld
        onCharacterClick={handleCharacterClick}
        onRestClick={handleRestClick}
        resting={restBoostActive}
        boostRemaining={restBoostRemaining}
        cooldownRemaining={restCooldownRemaining}
        cooldownActive={restCooldownActive}
      />
      <TabPanels
        activeTab={activeTab}
        state={state}
        onServerAction={runServerAction}
        onClose={() => setActiveTab('')}
      />
      <CharacterPanel
        characterId={activeCharacter}
        onClose={() => setActiveCharacter('')}
        state={state}
        onServerAction={runServerAction}
      />
      <SidePanels
        activePanel={sidePanel}
        onClose={() => setSidePanel('')}
        state={state}
        onServerAction={runServerAction}
      />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onPrimaryAction={handlePrimaryAction} />
    </div>
  );
};

export default HomePage;
