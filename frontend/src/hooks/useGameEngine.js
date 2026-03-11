import { useCallback, useEffect, useRef, useState } from 'react';
import { applyPlayerAction } from '../api/playerApi';
import { applyAction, normalizeState, tick } from '../game/engine';
import { usePlayerState } from './usePlayerState';

const SAVE_INTERVAL_MS = 5000;

export const useGameEngine = () => {
  const { state: serverState, save, loading, error: loadError, playerId } = usePlayerState();
  const [actionError, setActionError] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [restBoostUntil, setRestBoostUntil] = useState(0);
  const [restCooldownUntil, setRestCooldownUntil] = useState(0);
  const [state, setState] = useState(() => normalizeState(serverState));
  const hydratedRef = useRef(false);
  const lastSaveRef = useRef(0);
  const actionQueueRef = useRef(Promise.resolve());
  const pendingActionsRef = useRef(0);

  useEffect(() => {
    if (!loading) {
      setState(normalizeState(serverState));
      hydratedRef.current = true;
    }
  }, [loading, serverState]);

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
        const updated = await applyPlayerAction(playerId, action);
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
