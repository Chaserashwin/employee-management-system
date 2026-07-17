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
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  id: string;
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
  data: EmployeeRecord[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
};

export type EmployeePayload = {
  department: string;
  designation: string;
  email: string;
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
