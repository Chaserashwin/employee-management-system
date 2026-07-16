import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { OrganizationTreeNode } from "@/types/employee";

export const organizationService = {
  async getTree() {
    const response =
      await apiClient.get<ApiResponse<OrganizationTreeNode[]>>("/api/organization/tree");

    return response.data.data;
  },
};
