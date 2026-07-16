"use client";

import { useQuery } from "@tanstack/react-query";

import { searchService } from "@/services/search.service";

export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    enabled: enabled && query.trim().length >= 2,
    queryFn: () => searchService.search(query.trim()),
    queryKey: ["search", query.trim()],
    staleTime: 30_000,
  });
}
