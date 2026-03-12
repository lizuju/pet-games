import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPlayerState, savePlayerState, setPlayerToken } from '../api/playerApi';

const DEFAULT_STATE = {
  money: 0,
  fish: 0,
  level: 1,
  staff_count: 0,
  max_staff: 15,
  rev: 0,
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
        if (data?.auth_token) {
          setPlayerToken(data.auth_token);
        }
        const { auth_token: _token, ...rest } = data || {};
        setState({ ...DEFAULT_STATE, ...rest });
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
        const result = await savePlayerState(playerId, nextState, controller.signal);
        if (result?.conflict) {
          const serverState = result?.data?.current_state;
          if (serverState) {
            setState(serverState);
          }
          return;
        }
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
