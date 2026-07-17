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
  deletedAt?: string | null;
  deletedBy?: string | null;
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
  isDeleted: boolean;
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

export type DirectReportsResult = {
  count: number;
  items: OrganizationTreeNode[];
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
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  totalPages: number;
  totalRecords: number;
};

export type EmployeeListResult = {
  hasNext: boolean;
  hasPrevious: boolean;
  items: Employee[];
  limit: number;
  page: number;
  totalItems: number;
  totalPages: number;
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
  removeProfileImage?: boolean;
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

export type EmployeeBulkIdsPayload = {
  employeeIds: string[];
};

export type EmployeeCsvImportSummary = {
  duplicates: number;
  imported: number;
  invalid: number;
  rows: number;
  skipped: number;
  valid: number;
};

export type EmployeeCsvImportRow = {
  data: Record<string, string>;
  errors: string[];
  isDuplicate: boolean;
  isValid: boolean;
  rowNumber: number;
};

export type EmployeeCsvImportPreview = {
  rows: EmployeeCsvImportRow[];
  summary: EmployeeCsvImportSummary;
};

export type EmployeeCsvImportResult = EmployeeCsvImportPreview & {
  importedEmployees: Employee[];
};
