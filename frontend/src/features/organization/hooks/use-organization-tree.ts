"use client";

import { useQuery } from "@tanstack/react-query";

import { organizationService } from "@/services/organization.service";

export const organizationQueryKeys = {
  tree: ["organization", "tree"] as const,
};

export function useOrganizationTree(enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => organizationService.getTree(),
    queryKey: organizationQueryKeys.tree,
  });
}
