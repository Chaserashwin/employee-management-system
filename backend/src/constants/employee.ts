import { USER_ROLES, USER_STATUSES } from "./user";

export const EMPLOYEE_ROLES = USER_ROLES;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_STATUSES = USER_STATUSES;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_SORT_FIELDS = ["joiningDate", "name"] as const;

export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number];

export const EMPLOYEE_SORT_ORDERS = ["asc", "desc"] as const;

export type EmployeeSortOrder = (typeof EMPLOYEE_SORT_ORDERS)[number];
