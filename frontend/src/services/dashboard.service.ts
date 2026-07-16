import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardService = {
  async getDashboard() {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>("/api/dashboard");

    return response.data.data;
  },
};
