const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function pingBackend() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
