import { useCallback, useEffect, useRef, useState } from 'react';
import { applyPlayerAction } from '../api/playerApi';
import { applyAction, normalizeState, tick } from '../game/engine';
import { usePlayerState } from './usePlayerState';

const SAVE_INTERVAL_MS = 5000;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const useGameEngine = () => {
  const { state: serverState, save, loading, error: loadError, playerId } = usePlayerState();
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [restBoostUntil, setRestBoostUntil] = useState(0);
  const [restCooldownUntil, setRestCooldownUntil] = useState(0);
  const [state, setState] = useState(() => normalizeState(serverState));
  const stateRef = useRef(state);
  const hydratedRef = useRef(false);
  const lastSaveRef = useRef(0);
  const actionQueueRef = useRef(Promise.resolve());
  const pendingActionsRef = useRef(0);

  useEffect(() => {
    if (!loading) {
      const next = normalizeState(serverState);
      setState(next);
      stateRef.current = next;
      hydratedRef.current = true;
    }
  }, [loading, serverState]);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persistIfDue = useCallback(
    (nextState, force = false) => {
      const autoSave = nextState?.game_data?.settings?.auto_save ?? true;
      if (!autoSave && !force) return;
      const now = Date.now();
      if (force || now - lastSaveRef.current >= SAVE_INTERVAL_MS) {
        lastSaveRef.current = now;
        save(nextState);
      }
    },
    [save]
  );

  const runServerAction = useCallback(
    (action) => {
      if (loading) return Promise.resolve();
      setActionError('');
      pendingActionsRef.current += 1;
      setActionBusy(true);

      const run = async () => {
      const currentState = stateRef.current || state;
      const actionPayload = {
        ...action,
        client_rev: currentState?.rev ?? 0,
      };
        const updated = await applyPlayerAction(playerId, actionPayload);
        if (updated?.conflict) {
          const serverState = updated?.data?.current_state;
          if (serverState) {
            setState(normalizeState(serverState));
            lastSaveRef.current = Date.now();
          }
          return;
        }
        const normalized = normalizeState(updated);
        setState(normalized);
        lastSaveRef.current = Date.now();
      };

      actionQueueRef.current = actionQueueRef.current
        .then(run)
        .catch((err) => {
          setActionError(err?.message || 'Action failed');
        })
        .finally(() => {
          pendingActionsRef.current -= 1;
          if (pendingActionsRef.current <= 0) {
            pendingActionsRef.current = 0;
            setActionBusy(false);
          }
        });

      return actionQueueRef.current;
    },
    [loading, playerId]
  );

  useEffect(() => {
    if (loading || !hydratedRef.current || actionBusy) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const boostActive = restBoostUntil > now;
        const delta = boostActive ? 2 : 1;
        const next = tick(prev, delta);
        persistIfDue(next, false);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, persistIfDue, actionBusy, restBoostUntil]);

  useEffect(() => {
    const renderGameToText = () => {
      const safe = normalizeState(state);
      const payload = {
        mode: 'idle',
        coords: { origin: 'top-left', x: 'right', y: 'down' },
        stats: {
          money: safe.money,
          fish: safe.fish,
          level: safe.level,
          staff_count: safe.staff_count,
          max_staff: safe.max_staff,
          money_rate: safe.game_data?.money_rate,
          fish_rate: safe.game_data?.fish_rate,
          xp: safe.game_data?.xp,
          xp_to_next: safe.game_data?.xp_to_next,
        },
        achievements: safe.game_data?.achievements_status || {},
        tasks: safe.game_data?.tasks_status || {},
        api_base: API_BASE,
      };
      return JSON.stringify(payload);
    };

    const advanceTime = (ms) => {
      const steps = Math.max(1, Math.round(Number(ms || 0) / (1000 / 60)));
      setState((prev) => {
        let next = prev;
        for (let i = 0; i < steps; i += 1) {
          next = tick(next, 1 / 60);
        }
        persistIfDue(next, false);
        return next;
      });
    };

    window.render_game_to_text = renderGameToText;
    window.advanceTime = advanceTime;
    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [state, persistIfDue]);

  const dispatch = useCallback(
    (action, options = {}) => {
      setState((prev) => {
        const next = applyAction(prev, action);
        persistIfDue(next, Boolean(options.saveNow));
        return next;
      });
    },
    [persistIfDue]
  );

  const triggerRestBoost = useCallback(() => {
    const now = Date.now();
    const duration = 20_000;
    const cooldown = 40_000;
    setRestCooldownUntil((prevCooldown) => {
      if (now < prevCooldown) return prevCooldown;
      setRestBoostUntil((prevBoost) => Math.max(prevBoost, now + duration));
      return now + duration + cooldown;
    });
  }, []);

  return {
    state,
    loading,
    error: actionError || loadError,
    dispatch,
    runServerAction,
    actionBusy,
    triggerRestBoost,
    restBoostActive: restBoostUntil > Date.now(),
    restCooldownActive: restCooldownUntil > Date.now(),
    restCooldownRemaining: Math.max(0, Math.ceil((restCooldownUntil - Date.now()) / 1000)),
    restBoostRemaining: Math.max(0, Math.ceil((restBoostUntil - Date.now()) / 1000)),
  };
};
