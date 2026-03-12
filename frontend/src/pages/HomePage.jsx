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
import { carePetAction, carePlantAction, collectAction, collectFishAction, interactCharacterAction } from '../game/actions';

const TUTORIAL_KEY = 'pet_games_tutorial_v1';
const TUTORIAL_DONE = 3;

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
  const [interactionNote, setInteractionNote] = useState('');
  const [interactionId, setInteractionId] = useState(0);
  const [characterPing, setCharacterPing] = useState('');
  const [tutorialStep, setTutorialStep] = useState(() => {
    const stored = Number(localStorage.getItem(TUTORIAL_KEY) || 0);
    return Number.isFinite(stored) ? stored : 0;
  });

  const tutorialActive = tutorialStep < TUTORIAL_DONE;

  const setTutorial = (step) => {
    setTutorialStep(step);
    localStorage.setItem(TUTORIAL_KEY, String(step));
  };

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
    if (tutorialStep === 0) {
      setTutorial(1);
    }
  };

  const handleMoneyClick = () => {
    if (loading) return;
    runServerAction(collectAction());
    if (tutorialStep === 0) {
      setTutorial(1);
    }
  };

  const handleFishClick = () => {
    if (loading) return;
    runServerAction(collectFishAction());
  };

  const showInteraction = (text) => {
    setInteractionId((prev) => prev + 1);
    setInteractionNote(text);
    window.setTimeout(() => {
      setInteractionNote((prev) => (prev === text ? '' : prev));
    }, 1600);
  };

  const pingCharacter = (id) => {
    setCharacterPing(id);
    window.setTimeout(() => {
      setCharacterPing((prev) => (prev === id ? '' : prev));
    }, 900);
  };

  const handleCharacterClick = (id) => {
    setActiveCharacter(id);
    runServerAction(carePetAction());
    if (id === 'cactus') {
      runServerAction(carePlantAction());
    }
    runServerAction(interactCharacterAction(id));
    pingCharacter(id);
    if (id === 'ceo') showInteraction('+$0.12');
    if (id === 'dev') showInteraction('+0.08 Fish');
    if (id === 'designer') showInteraction('+0.05 XP');
    if (id === 'cactus') showInteraction('Mood +');
  };

  const handleRestClick = () => {
    triggerRestBoost();
    runServerAction(carePlantAction());
  };

  const handleTabChange = (tab) => {
    setActiveTab((prev) => (prev === tab ? '' : tab));
    if (tutorialStep === 1 && tab === 'desks') {
      setTutorial(2);
    }
  };

  const runServerActionTracked = (action) => {
    if (tutorialStep === 2) {
      const upgradeActions = ['upgrade_desk', 'upgrade_staff', 'upgrade_skill'];
      if (upgradeActions.includes(action?.type)) {
        setTutorial(3);
      }
    }
    return runServerAction(action);
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
      {tutorialActive && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pointer-events-none">
          <div className="mt-4 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white px-4 py-3 text-slate-700 text-sm w-[min(92vw,360px)] pointer-events-auto">
            {tutorialStep === 0 && (
              <div className="flex flex-col gap-2">
                <div className="font-bold text-slate-800">Onboarding 1/3</div>
                <div>Tap the coin or the main button to collect your first reward.</div>
              </div>
            )}
            {tutorialStep === 1 && (
              <div className="flex flex-col gap-2">
                <div className="font-bold text-slate-800">Onboarding 2/3</div>
                <div>Open the Desks tab in the bottom navigation.</div>
              </div>
            )}
            {tutorialStep === 2 && (
              <div className="flex flex-col gap-2">
                <div className="font-bold text-slate-800">Onboarding 3/3</div>
                <div>Complete one upgrade (desk, staff, or skill).</div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="text-slate-400 text-xs font-semibold"
                onClick={() => setTutorial(TUTORIAL_DONE)}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
      {interactionNote && (
        <div
          key={interactionId}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 text-emerald-600 text-xs font-bold bg-white/90 border border-emerald-100 shadow px-3 py-1 rounded-full"
          style={{ animation: 'float-up-fade 1.6s ease-in-out' }}
        >
          {interactionNote}
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
        activePing={characterPing}
      />
      <TabPanels
        activeTab={activeTab}
        state={state}
        onServerAction={runServerActionTracked}
        onClose={() => setActiveTab('')}
      />
      <CharacterPanel
        characterId={activeCharacter}
        onClose={() => setActiveCharacter('')}
        state={state}
        onServerAction={runServerActionTracked}
      />
      <SidePanels
        activePanel={sidePanel}
        onClose={() => setSidePanel('')}
        state={state}
        onServerAction={runServerActionTracked}
      />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onPrimaryAction={handlePrimaryAction} />
    </div>
  );
};

export default HomePage;
