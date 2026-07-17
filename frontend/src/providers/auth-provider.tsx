"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { setUnauthorizedHandler } from "@/services/api/client";
import { authService } from "@/services/auth.service";
import { authTokenStorage } from "@/services/auth-token";
import type { AuthUser, LoginCredentials, UserRole } from "@/types/auth";
import { getPostLoginPath } from "@/utils/auth-navigation";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  role: UserRole | null;
  user: AuthUser | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    authTokenStorage.clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = authTokenStorage.getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    return setUnauthorizedHandler(() => {
      clearSession();
      router.replace("/login");
    });
  }, [clearSession, router]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const loginResult = await authService.login(credentials);

      authTokenStorage.setToken(loginResult.token);
      setUser(loginResult.user);
      router.replace(getPostLoginPath(loginResult.user.role));
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      if (authTokenStorage.getToken()) {
        await authService.logout();
      }
    } finally {
      clearSession();
      router.replace("/login");
    }
  }, [clearSession, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshUser,
      role: user?.role ?? null,
      user,
    }),
    [isLoading, login, logout, refreshUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
