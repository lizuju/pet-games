import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPlayerState, savePlayerState } from '../api/playerApi';

const DEFAULT_STATE = {
  money: 0,
  fish: 0,
  level: 1,
  staff_count: 0,
  max_staff: 15,
  game_data: {},
};

const getOrCreatePlayerId = () => {
  const key = 'pet_games_player_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = globalThis.crypto?.randomUUID?.() || `player_${Date.now()}`;
  localStorage.setItem(key, id);
  return id;
};

export const usePlayerState = () => {
  const [state, setState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const inflight = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getPlayerState(playerId)
      .then((data) => {
        if (!isMounted) return;
        setState({ ...DEFAULT_STATE, ...data });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [playerId]);

  const save = useCallback(
    async (nextState) => {
      setState(nextState);
      setError('');
      if (inflight.current) {
        inflight.current.abort();
      }
      const controller = new AbortController();
      inflight.current = controller;
      try {
        await savePlayerState(playerId, nextState, controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err?.message || 'Failed to save');
      } finally {
        if (inflight.current === controller) {
          inflight.current = null;
        }
      }
    },
    [playerId]
  );

  return {
    playerId,
    state,
    setState,
    save,
    loading,
    error,
  };
};
