import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/http-status";
import type { AuthenticatedUser } from "../types/auth";
import type {
  EmployeeListQuery,
  EmployeeListResult,
  EmployeePayload,
  EmployeeRecord,
  EmployeeUpdatePayload,
} from "../types/employee";
import { AppError } from "../utils/app-error";
import {
  createEmployee,
  findEmployeeByEmail,
  findEmployeeById,
  findEmployees,
  softDeleteEmployeeById,
  updateEmployeeById,
  updateEmployeeStatusById,
} from "../repositories/employee.repository";
import type { EmployeeDocument } from "../models/employee.model";

const duplicateKeyPattern = /duplicate key/i;

const isDuplicateKeyError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    duplicateKeyPattern.test(String(error.message))
  );
};

const toEmployeeRecord = (employee: EmployeeDocument): EmployeeRecord => {
  const plainEmployee = employee.toObject();

  return {
    createdAt: plainEmployee.createdAt,
    deleted: plainEmployee.deleted,
    department: plainEmployee.department,
    designation: plainEmployee.designation,
    email: plainEmployee.email,
    employeeId: plainEmployee.employeeId,
    id: plainEmployee.id as string,
    joiningDate: plainEmployee.joiningDate,
    manager: plainEmployee.manager ? String(plainEmployee.manager) : null,
    name: plainEmployee.name,
    phone: plainEmployee.phone,
    profileImage: plainEmployee.profileImage,
    role: plainEmployee.role,
    salary: plainEmployee.salary,
    status: plainEmployee.status,
    updatedAt: plainEmployee.updatedAt,
  };
};

const assertEmployeeAccess = (employee: EmployeeDocument, requester: AuthenticatedUser) => {
  if (requester.role === "EMPLOYEE" && employee.email !== requester.email) {
    throw new AppError("You are not authorized to access this employee.", HTTP_STATUS.FORBIDDEN);
  }
};

const getEmployeeOrThrow = async (id: string) => {
  const employee = await findEmployeeById(id);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return employee;
};

const createDuplicateEmployeeError = () => {
  return new AppError("Employee email or employee ID already exists.", HTTP_STATUS.CONFLICT);
};

export const listEmployees = async (
  query: EmployeeListQuery,
  requester: AuthenticatedUser,
): Promise<EmployeeListResult> => {
  const accessFilter = requester.role === "EMPLOYEE" ? { email: requester.email } : {};
  const { employees, totalRecords } = await findEmployees(query, accessFilter);
  const totalPages = Math.max(Math.ceil(totalRecords / query.limit), 1);

  return {
    data: employees.map(toEmployeeRecord),
    pagination: {
      currentPage: query.page,
      limit: query.limit,
      totalPages,
      totalRecords,
    },
  };
};

export const getEmployee = async (id: string, requester: AuthenticatedUser) => {
  const employee = await getEmployeeOrThrow(id);
  assertEmployeeAccess(employee, requester);

  return toEmployeeRecord(employee);
};

export const getOwnEmployeeProfile = async (requester: AuthenticatedUser) => {
  const employee = await findEmployeeByEmail(requester.email);

  if (!employee) {
    throw new AppError("Employee profile not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const addEmployee = async (payload: EmployeePayload) => {
  try {
    const employee = await createEmployee(payload);

    return toEmployeeRecord(employee);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createDuplicateEmployeeError();
    }

    throw error;
  }
};

export const editEmployee = async (id: string, payload: EmployeeUpdatePayload) => {
  try {
    const employee = await updateEmployeeById(id, payload);

    if (!employee) {
      throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
    }

    return toEmployeeRecord(employee);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createDuplicateEmployeeError();
    }

    throw error;
  }
};

export const removeEmployee = async (id: string) => {
  const employee = await softDeleteEmployeeById(id);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const changeEmployeeStatus = async (id: string, status: EmployeeDocument["status"]) => {
  const employee = await updateEmployeeStatusById(id, status);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const normalizeEmployeePayload = <TPayload extends EmployeePayload | EmployeeUpdatePayload>(
  payload: TPayload,
): TPayload => {
  if (payload.manager === undefined || payload.manager === null) {
    return payload;
  }

  return {
    ...payload,
    manager: new mongoose.Types.ObjectId(payload.manager).toString(),
  };
};
