import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { GlobalSearchResult } from "@/types/dashboard";

export const searchService = {
  async search(query: string) {
    const response = await apiClient.get<ApiResponse<GlobalSearchResult>>("/api/search", {
      params: {
        q: query,
      },
    });

    return response.data.data;
  },
};
