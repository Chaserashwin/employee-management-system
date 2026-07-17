"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { employeeQueryKeys } from "@/features/employees/hooks/use-employees";
import { organizationQueryKeys } from "@/features/organization/hooks/use-organization-tree";
import { dashboardService } from "@/services/dashboard.service";
import { employeeService } from "@/services/employee.service";
import { organizationService } from "@/services/organization.service";
import type { Employee, EmployeeListParams } from "@/types/employee";

const DEFAULT_EMPLOYEE_LIST_PARAMS = {
  limit: 10,
  page: 1,
  sortBy: "joiningDate",
  sortOrder: "desc",
} satisfies EmployeeListParams;

export function useRoutePrefetch() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const prefetchRoute = useCallback(
    (href: string) => {
      router.prefetch(href);

      if (href === "/") {
        void queryClient.prefetchQuery({
          queryFn: () => dashboardService.getDashboard(),
          queryKey: dashboardQueryKeys.summary,
          staleTime: 5 * 60_000,
        });
        return;
      }

      if (href === "/employees") {
        void queryClient.prefetchQuery({
          queryFn: () => employeeService.getEmployees(DEFAULT_EMPLOYEE_LIST_PARAMS),
          queryKey: employeeQueryKeys.list(DEFAULT_EMPLOYEE_LIST_PARAMS),
          staleTime: 60_000,
        });
        return;
      }

      if (href === "/organization") {
        void queryClient.prefetchQuery({
          queryFn: () => organizationService.getTree(),
          queryKey: organizationQueryKeys.tree,
          staleTime: 5 * 60_000,
        });
        return;
      }

      if (href === "/profile") {
        void queryClient.prefetchQuery({
          queryFn: () => employeeService.getMyProfile(),
          queryKey: employeeQueryKeys.me(),
          staleTime: 5 * 60_000,
        });
      }
    },
    [queryClient, router],
  );

  const prefetchEmployeeRoute = useCallback(
    (employee: Employee, href: string) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      router.prefetch(href);
    },
    [queryClient, router],
  );

  return {
    prefetchEmployeeRoute,
    prefetchRoute,
  };
}
