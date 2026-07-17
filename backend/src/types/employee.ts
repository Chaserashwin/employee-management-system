import type {
  EmployeeRole,
  EmployeeSortField,
  EmployeeSortOrder,
  EmployeeStatus,
} from "../constants/employee";

export type EmployeeSummary = {
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
  joiningDate: Date;
  name: string;
  phone: string;
  profileImage?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
};

export type EmployeeRecord = {
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
  isDeleted: boolean;
  joiningDate: Date;
  manager: EmployeeSummary | null;
  name: string;
  phone: string;
  profileImage?: string;
  role: EmployeeRole;
  salary: number;
  status: EmployeeStatus;
  updatedAt: Date;
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

export type EmployeeListQuery = {
  department?: string;
  limit: number;
  page: number;
  role?: EmployeeRole;
  search?: string;
  sortBy: EmployeeSortField;
  sortOrder: EmployeeSortOrder;
  status?: EmployeeStatus;
};

export type EmployeeListResult = {
  hasNext: boolean;
  hasPrevious: boolean;
  items: EmployeeRecord[];
  limit: number;
  page: number;
  totalItems: number;
  totalPages: number;
  data: EmployeeRecord[];
  pagination: {
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
};

export type EmployeePayload = {
  department: string;
  designation: string;
  email: string;
  employeeId?: string;
  joiningDate: Date;
  manager?: string | null;
  name: string;
  phone: string;
  profileImage?: string | null;
  role: EmployeeRole;
  salary: number;
  status: EmployeeStatus;
};

export type EmployeeUpdatePayload = Partial<EmployeePayload>;

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
  importedEmployees: EmployeeRecord[];
};
