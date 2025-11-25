import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Tokens = {
  idToken: string;
  accessToken: string;
  expiresAt: number; // epoch seconds
};

type UserInfo = {
  sub: string;
  email?: string;
  phone_number?: string;
  name?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  tokens: Tokens | null;
  user: UserInfo | null;
  login: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auction_auth_tokens";

const {
  VITE_COGNITO_DOMAIN,
  VITE_COGNITO_CLIENT_ID,
  VITE_COGNITO_REDIRECT_URI,
  VITE_COGNITO_LOGOUT_REDIRECT_URI,
  VITE_COGNITO_SCOPES,
} = import.meta.env;

function parseHashTokens(hash: string): Tokens | null {
  if (!hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.slice(1));
  const idToken = params.get("id_token");
  const accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!idToken || !accessToken || !expiresIn) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + Number(expiresIn);
  return { idToken, accessToken, expiresAt };
}

function decodeJwt(token: string): UserInfo | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<Tokens | null>(null);

  // load tokens from URL hash first, then localStorage
  useEffect(() => {
    // 1) check if we just got redirected from Cognito
    const hashTokens = parseHashTokens(window.location.hash);
    if (hashTokens) {
      setTokens(hashTokens);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashTokens));
      // remove tokens from URL
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState({}, "", url.toString());
      return;
    }

    // 2) otherwise load from storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Tokens = JSON.parse(stored);
      if (parsed.expiresAt > Math.floor(Date.now() / 1000)) {
        setTokens(parsed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const user = useMemo(() => (tokens ? decodeJwt(tokens.idToken) : null), [tokens]);

  const login = () => {
    const authUrl = new URL(`https://${VITE_COGNITO_DOMAIN}/oauth2/authorize`);
    authUrl.searchParams.set("client_id", VITE_COGNITO_CLIENT_ID);
    authUrl.searchParams.set("response_type", "token"); // implicit flow
    authUrl.searchParams.set("redirect_uri", VITE_COGNITO_REDIRECT_URI);
    authUrl.searchParams.set("scope", VITE_COGNITO_SCOPES || "openid+email+profile");
    authUrl.searchParams.set("identity_provider", "Google"); // skip Cognito UI chooser
    window.location.assign(authUrl.toString());
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTokens(null);

    const logoutUrl = new URL(`https://${VITE_COGNITO_DOMAIN}/logout`);
    logoutUrl.searchParams.set("client_id", VITE_COGNITO_CLIENT_ID);
    logoutUrl.searchParams.set("logout_uri", VITE_COGNITO_LOGOUT_REDIRECT_URI);
    window.location.assign(logoutUrl.toString());
  };

  const value: AuthContextType = {
    isAuthenticated: !!tokens,
    tokens,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
