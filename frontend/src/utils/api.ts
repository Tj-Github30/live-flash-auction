/**
 * API utility functions that automatically include authentication tokens
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const STORAGE_KEY = "auction_auth_tokens";

interface Tokens {
  idToken: string;
  accessToken: string;
  expiresAt: number;
}

/**
 * Get tokens from localStorage
 */
function getTokens(): Tokens | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed: Tokens = JSON.parse(stored);
    // Check if token is expired
    if (parsed.expiresAt > Math.floor(Date.now() / 1000)) {
      return parsed;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Make an authenticated API request
 * Automatically includes Authorization header with token
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const tokens = getTokens();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token is available
  if (tokens?.idToken) {
    headers["Authorization"] = `Bearer ${tokens.idToken}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Helper to parse JSON response and handle errors
 */
export async function apiJson<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

