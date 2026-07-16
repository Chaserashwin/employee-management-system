"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeService } from "@/services/employee.service";
import type {
  EmployeeFormPayload,
  EmployeeManagerPayload,
  EmployeeListParams,
  EmployeeRolePayload,
  EmployeeStatusPayload,
} from "@/types/employee";

export const employeeQueryKeys = {
  all: ["employees"] as const,
  chain: (id: string) => [...employeeQueryKeys.all, "chain", id] as const,
  detail: (id: string) => [...employeeQueryKeys.all, "detail", id] as const,
  list: (params: EmployeeListParams) => [...employeeQueryKeys.all, "list", params] as const,
  managerCandidates: (id: string) =>
    [...employeeQueryKeys.all, "manager-candidates", id] as const,
  reportees: (id: string) => [...employeeQueryKeys.all, "reportees", id] as const,
};

export function useMyEmployeeProfile() {
  return useQuery({
    queryFn: () => employeeService.getMyProfile(),
    queryKey: [...employeeQueryKeys.all, "me"] as const,
  });
}

export function useEmployees(params: EmployeeListParams, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => employeeService.getEmployees(params),
    queryKey: employeeQueryKeys.list(params),
  });
}

export function useEmployeeChain(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getChain(id),
    queryKey: employeeQueryKeys.chain(id),
  });
}

export function useEmployeeReportees(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getReportees(id),
    queryKey: employeeQueryKeys.reportees(id),
  });
}

export function useManagerCandidates(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getManagerCandidates(id),
    queryKey: employeeQueryKeys.managerCandidates(id),
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

export function useRestoreEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.restoreEmployee(id),
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

export function useUpdateEmployeeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeRolePayload }) =>
      employeeService.updateEmployeeRole(id, payload),
    onSuccess: (employee) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(employee.id) });
    },
  });
}

export function useUpdateEmployeeManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeManagerPayload }) =>
      employeeService.updateEmployeeManager(id, payload),
    onSuccess: (employee) => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(employee.id) });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
