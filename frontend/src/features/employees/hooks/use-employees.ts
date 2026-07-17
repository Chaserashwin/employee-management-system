"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeService } from "@/services/employee.service";
import type {
  Employee,
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
  lists: () => [...employeeQueryKeys.all, "list"] as const,
  list: (params: EmployeeListParams) => [...employeeQueryKeys.all, "list", params] as const,
  me: () => [...employeeQueryKeys.all, "me"] as const,
  managerCandidates: (id: string) =>
    [...employeeQueryKeys.all, "manager-candidates", id] as const,
  reportees: (id: string) => [...employeeQueryKeys.all, "reportees", id] as const,
};

export function useMyEmployeeProfile() {
  return useQuery({
    queryFn: () => employeeService.getMyProfile(),
    queryKey: employeeQueryKeys.me(),
    staleTime: 5 * 60_000,
  });
}

export function useEmployees(params: EmployeeListParams, enabled = true) {
  return useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryFn: () => employeeService.getEmployees(params),
    queryKey: employeeQueryKeys.list(params),
    staleTime: 60_000,
  });
}

export function useEmployeeChain(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getChain(id),
    queryKey: employeeQueryKeys.chain(id),
    staleTime: 5 * 60_000,
  });
}

export function useEmployeeReportees(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getReportees(id),
    queryKey: employeeQueryKeys.reportees(id),
    staleTime: 5 * 60_000,
  });
}

export function useManagerCandidates(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(id),
    queryFn: () => employeeService.getManagerCandidates(id),
    queryKey: employeeQueryKeys.managerCandidates(id),
    staleTime: 2 * 60_000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => employeeService.getEmployee(id),
    queryKey: employeeQueryKeys.detail(id),
    staleTime: 5 * 60_000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeFormPayload) => employeeService.createEmployee(payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmployeeFormPayload) => employeeService.updateEmployee(id, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: employeeQueryKeys.detail(id) });

      const previousEmployee = queryClient.getQueryData<Employee>(employeeQueryKeys.detail(id));

      if (previousEmployee) {
        queryClient.setQueryData<Employee>(employeeQueryKeys.detail(id), {
          ...previousEmployee,
          department: payload.department,
          designation: payload.designation,
          email: payload.email,
          joiningDate: payload.joiningDate,
          name: payload.name,
          phone: payload.phone,
          profileImage: payload.removeProfileImage ? undefined : previousEmployee.profileImage,
          role: payload.role,
          salary: payload.salary,
          status: payload.status,
        });
      }

      return { previousEmployee };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousEmployee) {
        queryClient.setQueryData(employeeQueryKeys.detail(id), context.previousEmployee);
      }
    },
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useRestoreEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.restoreEmployee(id),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeStatusPayload }) =>
      employeeService.updateEmployeeStatus(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

export function useUpdateEmployeeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeRolePayload }) =>
      employeeService.updateEmployeeRole(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateEmployeeManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeManagerPayload }) =>
      employeeService.updateEmployeeManager(id, payload),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeQueryKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.chain(employee.id) });
      void queryClient.invalidateQueries({ queryKey: employeeQueryKeys.reportees(employee.id) });
      void queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
