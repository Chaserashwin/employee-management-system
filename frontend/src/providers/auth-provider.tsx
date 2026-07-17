"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { employeeQueryKeys } from "@/features/employees/hooks/use-employees";
import { dashboardService } from "@/services/dashboard.service";
import { employeeService } from "@/services/employee.service";
import { useNavigationProgress } from "@/providers/navigation-progress-provider";
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
  const queryClient = useQueryClient();
  const { finishNavigation, startNavigation } = useNavigationProgress();
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
      startNavigation();
      clearSession();
      queryClient.clear();
      router.replace("/login");
    });
  }, [clearSession, queryClient, router, startNavigation]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      startNavigation();

      try {
        const loginResult = await authService.login(credentials);

        authTokenStorage.setToken(loginResult.token);
        setUser(loginResult.user);

        if (loginResult.user.role === "EMPLOYEE") {
          void queryClient.prefetchQuery({
            queryFn: () => employeeService.getMyProfile(),
            queryKey: employeeQueryKeys.me(),
            staleTime: 5 * 60_000,
          });
        } else {
          void queryClient.prefetchQuery({
            queryFn: () => dashboardService.getDashboard(),
            queryKey: dashboardQueryKeys.summary,
            staleTime: 5 * 60_000,
          });
        }

        router.replace(getPostLoginPath(loginResult.user.role));
      } catch (error) {
        finishNavigation();
        throw error;
      }
    },
    [finishNavigation, queryClient, router, startNavigation],
  );

  const logout = useCallback(async () => {
    const token = authTokenStorage.getToken() ?? undefined;

    startNavigation();
    clearSession();
    queryClient.clear();
    router.replace("/login");

    if (token) {
      void authService.logout(token).catch(() => undefined);
    }
  }, [clearSession, queryClient, router, startNavigation]);

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
