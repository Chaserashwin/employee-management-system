"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/services/dashboard.service";

export const dashboardQueryKeys = {
  summary: ["dashboard", "summary"] as const,
};

export function useDashboardSummary(enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => dashboardService.getDashboard(),
    queryKey: dashboardQueryKeys.summary,
    staleTime: 120_000,
  });
}
