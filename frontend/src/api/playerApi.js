const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const tokenKey = 'pet_games_player_token';

export const getPlayerToken = () => localStorage.getItem(tokenKey) || '';

export const setPlayerToken = (token) => {
  if (!token) return;
  localStorage.setItem(tokenKey, token);
};

const handleJson = async (response) => {
  if (response.status === 409) {
    const data = await response.json();
    return { conflict: true, data };
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const getPlayerState = async (playerId) => {
  const token = getPlayerToken();
  const response = await fetch(`${API_BASE}/api/player/${playerId}`, {
    headers: token ? { 'X-Player-Token': token } : undefined,
  });
  return handleJson(response);
};

export const savePlayerState = async (playerId, state, signal) => {
  const token = getPlayerToken();
  const headers = token
    ? { 'Content-Type': 'application/json', 'X-Player-Token': token }
    : { 'Content-Type': 'application/json' };
  const response = await fetch(`${API_BASE}/api/player/${playerId}`, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify(state),
  });
  return handleJson(response);
};

export const applyPlayerAction = async (playerId, action) => {
  const token = getPlayerToken();
  const headers = token
    ? { 'Content-Type': 'application/json', 'X-Player-Token': token }
    : { 'Content-Type': 'application/json' };
  const response = await fetch(`${API_BASE}/api/player/${playerId}/action`, {
    method: 'POST',
    headers,
    body: JSON.stringify(action),
  });
  return handleJson(response);
};
