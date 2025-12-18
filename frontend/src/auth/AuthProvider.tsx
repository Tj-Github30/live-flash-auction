import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Tokens = {
  idToken: string;
  accessToken: string;
  expiresAt: number;
};

type UserInfo = {
  sub: string;
  // Cognito ID token commonly includes this key; keep it optional for safety.
  "cognito:username"?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  name?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: Tokens | null;
  user: UserInfo | null;
  login: () => void;
  logout: () => void;
  refreshTokens: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const STORAGE_KEY = "auction_auth_tokens";

const {
  VITE_COGNITO_DOMAIN,
  VITE_COGNITO_CLIENT_ID,
  VITE_COGNITO_REDIRECT_URI,
  VITE_COGNITO_LOGOUT_REDIRECT_URI,
  VITE_COGNITO_SCOPES,
} = import.meta.env;

const rawDomain = (VITE_COGNITO_DOMAIN || "").replace(/\/+$/, "");
const COGNITO_BASE_URL = rawDomain.startsWith("https://")
  ? rawDomain
  : `https://${rawDomain}`;

function parseHashTokens(hash: string): Tokens | null {
  if (!hash.startsWith("#")) return null;

  const params = new URLSearchParams(hash.slice(1));
  const idToken = params.get("id_token");
  const accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!idToken || !accessToken || !expiresIn) return null;

  const expiresAt =
    Math.floor(Date.now() / 1000) + Number(expiresIn || "0");

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTokens = React.useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Tokens = JSON.parse(stored);
        if (parsed.expiresAt > Math.floor(Date.now() / 1000)) {
          setTokens(parsed);
          return;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setTokens(null);
  }, []);

  useEffect(() => {
    const hashTokens = parseHashTokens(window.location.hash);
    if (hashTokens) {
      setTokens(hashTokens);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashTokens));

      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState({}, "", url.toString());
      setIsLoading(false);
      return;
    }

    loadTokens();
    setIsLoading(false);
  }, [loadTokens]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadTokens();
      }
    };

    const checkInterval = setInterval(() => {
      loadTokens();
    }, 500);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [loadTokens]);

  const user = useMemo(
    () => (tokens ? decodeJwt(tokens.idToken) : null),
    [tokens]
  );

  const login = () => {
    if (
      !COGNITO_BASE_URL ||
      !VITE_COGNITO_CLIENT_ID ||
      !VITE_COGNITO_REDIRECT_URI
    ) {
      console.error(
        "Cognito env vars missing. Check VITE_COGNITO_DOMAIN, VITE_COGNITO_CLIENT_ID, VITE_COGNITO_REDIRECT_URI."
      );
      return;
    }

    const authUrl = new URL(`${COGNITO_BASE_URL}/oauth2/authorize`);

    const scopes =
      VITE_COGNITO_SCOPES && VITE_COGNITO_SCOPES.trim().length > 0
        ? VITE_COGNITO_SCOPES.split(/[,\s]+/)
            .filter(Boolean)
            .join(" ")
        : "openid email profile";

    authUrl.searchParams.set("client_id", VITE_COGNITO_CLIENT_ID);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("redirect_uri", VITE_COGNITO_REDIRECT_URI);
    authUrl.searchParams.set("scope", scopes);

    window.location.assign(authUrl.toString());
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTokens(null);
    window.location.href = "/login";
  };

  const value: AuthContextType = {
    isAuthenticated: !!tokens,
    isLoading,
    tokens,
    user,
    login,
    logout,
    refreshTokens: loadTokens,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
