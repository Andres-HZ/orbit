import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type AuthUser, type Profile } from "./api";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  refreshProfile(): Promise<void>;
  setProfile(profile: Profile): void;
  logout(): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenKey = "orbit.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(token));

  function applyProfile(nextProfile: Profile) {
    setProfile(nextProfile);
    setUser(nextProfile.user);
  }

  async function applyToken(nextToken: string, nextUser?: AuthUser) {
    localStorage.setItem(tokenKey, nextToken);
    setToken(nextToken);
    if (nextUser) setUser(nextUser);
    const nextProfile = await api.me(nextToken);
    applyProfile(nextProfile);
  }

  async function login(email: string, password: string) {
    const result = await api.login({ email, password });
    await applyToken(result.token, result.user);
  }

  async function register(name: string, email: string, password: string) {
    const result = await api.register({ name, email, password });
    await applyToken(result.token, result.user);
  }

  async function refreshProfile() {
    if (!token) return;
    const nextProfile = await api.me(token);
    applyProfile(nextProfile);
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
    setProfile(null);
  }

  useEffect(() => {
    let active = true;
    async function restore() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const nextProfile = await api.me(token);
        if (!active) return;
        applyProfile(nextProfile);
      } catch {
        if (!active) return;
        logout();
      } finally {
        if (active) setLoading(false);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      profile,
      loading,
      login,
      register,
      refreshProfile,
      setProfile: applyProfile,
      logout
    }),
    [token, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
