import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";
import type { UserDto, LoginResponse } from "@nimbus/shared-types";

/**
 * Сервис аутентификации: бизнес-логика сессии пользователя
 * (восстановление по токену, вход, выход) отделена от React-слоя.
 */
export class AuthStore {
  /** Восстанавливает сессию по сохранённому токену; при невалидном токене очищает его. */
  async restoreSession(): Promise<UserDto | null> {
    if (!getToken()) return null;
    try {
      const r = await api.get<{ user: UserDto }>("/auth/me");
      return r.user;
    } catch {
      setToken(null);
      return null;
    }
  }

  async login(email: string, password: string): Promise<UserDto> {
    const r = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(r.accessToken);
    return r.user;
  }

  logout(): void {
    setToken(null);
  }
}

const authStore = new AuthStore();

interface Ctx {
  user: UserDto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authStore
      .restoreSession()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authStore.login(email, password));
  }, []);

  const logout = useCallback(() => {
    authStore.logout();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
