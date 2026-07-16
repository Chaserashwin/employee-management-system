import type { UserRole, UserStatus } from "@/types/auth";

export type EmployeeSummary = {
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
  joiningDate: string;
  name: string;
  phone: string;
  profileImage?: string;
  role: UserRole;
  status: UserStatus;
};

export type Employee = {
  createdAt: string;
  deleted: boolean;
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
  joiningDate: string;
  manager: EmployeeSummary | null;
  name: string;
  phone: string;
  profileImage?: string;
  role: UserRole;
  salary: number;
  status: UserStatus;
  updatedAt: string;
};

export type OrganizationTreeNode = EmployeeSummary & {
  directReporteesCount: number;
  manager: EmployeeSummary | null;
  reportees: OrganizationTreeNode[];
};

export type ReporteesResult = {
  directReportees: OrganizationTreeNode[];
  nestedReportees: OrganizationTreeNode[];
};

export type EmployeeListParams = {
  department?: string;
  limit: number;
  page: number;
  role?: UserRole;
  search?: string;
  sortBy: "joiningDate" | "name";
  sortOrder: "asc" | "desc";
  status?: UserStatus;
};

export type EmployeePagination = {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type EmployeeListResult = {
  data: Employee[];
  pagination: EmployeePagination;
};

export type EmployeeFormPayload = {
  department: string;
  designation: string;
  email: string;
  joiningDate: string;
  name: string;
  phone: string;
  profileImage?: File;
  role: UserRole;
  salary: number;
  status: UserStatus;
};

export type EmployeeStatusPayload = {
  status: UserStatus;
};

export type EmployeeRolePayload = {
  role: UserRole;
};

export type EmployeeManagerPayload = {
  managerId: string | null;
};
