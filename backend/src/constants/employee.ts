import { USER_ROLES, USER_STATUSES } from "./user";

export const EMPLOYEE_ROLES = USER_ROLES;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_STATUSES = USER_STATUSES;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_SORT_FIELDS = ["joiningDate", "name"] as const;

export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number];

export const EMPLOYEE_SORT_ORDERS = ["asc", "desc"] as const;

export type EmployeeSortOrder = (typeof EMPLOYEE_SORT_ORDERS)[number];

export const EMPLOYEE_DEPARTMENTS = [
  "Engineering",
  "HR",
  "Marketing",
  "Finance",
  "Sales",
  "Operations",
  "Support",
  "QA",
  "DevOps",
  "Administration",
] as const;

export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number];

export const EMPLOYEE_DESIGNATIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Tech Lead",
  "HR Executive",
  "HR Manager",
  "Marketing Executive",
  "Finance Manager",
  "Sales Executive",
  "QA Engineer",
  "DevOps Engineer",
  "Admin Executive",
  "Support Engineer",
  "Business Analyst",
  "UI UX Designer",
  "Product Manager",
] as const;

export type EmployeeDesignation = (typeof EMPLOYEE_DESIGNATIONS)[number];
