const API_BASE = import.meta.env.VITE_API_BASE || '';

const handleJson = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
};

export const getCatalog = async () => {
  const response = await fetch(`${API_BASE}/api/catalog`);
  return handleJson(response);
};
