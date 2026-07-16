import mongoose from "mongoose";
import { z } from "zod";

import {
  EMPLOYEE_ROLES,
  EMPLOYEE_SORT_FIELDS,
  EMPLOYEE_SORT_ORDERS,
  EMPLOYEE_STATUSES,
} from "../constants/employee";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const emptyStringToUndefined = (value: unknown) => {
  return value === "" ? undefined : value;
};

const requiredText = (fieldName: string) => {
  return z.string().trim().min(1, `${fieldName} is required.`);
};

const objectIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.isValidObjectId(value), "Manager must be a valid employee id.");

const baseEmployeeSchema = z.object({
  name: requiredText("Name"),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number with 7 to 20 characters."),
  department: requiredText("Department"),
  designation: requiredText("Designation"),
  salary: z.coerce.number().nonnegative("Salary must be zero or greater."),
  joiningDate: z.coerce.date("Joining date must be a valid date."),
  status: z.enum(EMPLOYEE_STATUSES, "Status must be ACTIVE or INACTIVE."),
  role: z.enum(EMPLOYEE_ROLES, "Role must be SUPER_ADMIN, HR, or EMPLOYEE."),
  manager: z.preprocess(emptyStringToUndefined, objectIdSchema.nullish()),
});

export const createEmployeeSchema = baseEmployeeSchema;

export const updateEmployeeSchema = baseEmployeeSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one employee field is required.",
);

export const employeeStatusSchema = z.object({
  status: z.enum(EMPLOYEE_STATUSES, "Status must be ACTIVE or INACTIVE."),
});

export const employeeRoleSchema = z.object({
  role: z.enum(EMPLOYEE_ROLES, "Role must be SUPER_ADMIN, HR, or EMPLOYEE."),
});

export const employeeManagerSchema = z.object({
  managerId: z.preprocess(emptyStringToUndefined, objectIdSchema.nullable().optional()),
});

export const employeeIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((value) => mongoose.isValidObjectId(value), "Employee id must be valid."),
});

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  department: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  role: z.preprocess(emptyStringToUndefined, z.enum(EMPLOYEE_ROLES).optional()),
  status: z.preprocess(emptyStringToUndefined, z.enum(EMPLOYEE_STATUSES).optional()),
  sortBy: z.enum(EMPLOYEE_SORT_FIELDS).default("joiningDate"),
  sortOrder: z.enum(EMPLOYEE_SORT_ORDERS).default("desc"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeStatusInput = z.infer<typeof employeeStatusSchema>;
export type EmployeeRoleInput = z.infer<typeof employeeRoleSchema>;
export type EmployeeManagerInput = z.infer<typeof employeeManagerSchema>;
export type EmployeeListQueryInput = z.infer<typeof employeeListQuerySchema>;
