import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AuthUser, LoginCredentials, LoginResponse } from "@/types/auth";

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/api/auth/login", credentials);

    return response.data.data;
  },
  async logout(token?: string) {
    await apiClient.post<ApiResponse<null>>(
      "/api/auth/logout",
      null,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );
  },
  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/api/auth/me");

    return response.data.data;
  },
};
