const API_BASE = import.meta.env.VITE_API_BASE || '';

const handleJson = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const getPlayerState = async (playerId) => {
  const response = await fetch(`${API_BASE}/api/player/${playerId}`);
  return handleJson(response);
};

export const savePlayerState = async (playerId, state, signal) => {
  const response = await fetch(`${API_BASE}/api/player/${playerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify(state),
  });
  return handleJson(response);
};

export const applyPlayerAction = async (playerId, action) => {
  const response = await fetch(`${API_BASE}/api/player/${playerId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(action),
  });
  return handleJson(response);
};
