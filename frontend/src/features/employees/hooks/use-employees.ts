"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeService } from "@/services/employee.service";
import type {
  EmployeeFormPayload,
  EmployeeListParams,
  EmployeeStatusPayload,
} from "@/types/employee";

export const employeeQueryKeys = {
  all: ["employees"] as const,
  detail: (id: string) => [...employeeQueryKeys.all, "detail", id] as const,
  list: (params: EmployeeListParams) => [...employeeQueryKeys.all, "list", params] as const,
};

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryFn: () => employeeService.getEmployees(params),
    queryKey: employeeQueryKeys.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => employeeService.getEmployee(id),
    queryKey: employeeQueryKeys.detail(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeFormPayload) => employeeService.createEmployee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all }),
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeFormPayload) => employeeService.updateEmployee(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all }),
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeStatusPayload }) =>
      employeeService.updateEmployeeStatus(id, payload),
    onSuccess: (employee) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(employee.id) });
    },
  });
}
