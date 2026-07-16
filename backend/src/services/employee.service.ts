import mongoose from "mongoose";

import { HTTP_STATUS } from "../constants/http-status";
import type { AuthenticatedUser } from "../types/auth";
import type {
  EmployeeListQuery,
  EmployeeListResult,
  EmployeePayload,
  EmployeeRecord,
  EmployeeSummary,
  EmployeeUpdatePayload,
  OrganizationTreeNode,
  ReporteesResult,
} from "../types/employee";
import { AppError } from "../utils/app-error";
import {
  createEmployee,
  findAllEmployees,
  findEmployeeByEmail,
  findEmployeeByEmailIncludingDeleted,
  findEmployeeById,
  findEmployees,
  findManagerCandidates,
  restoreEmployeeById,
  softDeleteEmployeeById,
  updateEmployeeById,
  updateEmployeeManagerById,
  updateEmployeeRoleById,
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

const toId = (value: unknown) => String(value);

const getDocumentId = (employee: EmployeeDocument) => employee.id as string;

const getManagerId = (employee: EmployeeDocument) => {
  return employee.manager ? toId(employee.manager) : null;
};

const toEmployeeSummary = (employee: EmployeeDocument): EmployeeSummary => ({
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  employeeId: employee.employeeId,
  id: getDocumentId(employee),
  joiningDate: employee.joiningDate,
  name: employee.name,
  phone: employee.phone,
  profileImage: employee.profileImage,
  role: employee.role,
  status: employee.status,
});

const createEmployeeMap = (employees: EmployeeDocument[]) => {
  return new Map(employees.map((employee) => [getDocumentId(employee), employee]));
};

const createChildrenMap = (employees: EmployeeDocument[]) => {
  const childrenMap = new Map<string, EmployeeDocument[]>();

  for (const employee of employees) {
    const managerId = getManagerId(employee) ?? "ROOT";
    const children = childrenMap.get(managerId) ?? [];

    children.push(employee);
    childrenMap.set(managerId, children);
  }

  return childrenMap;
};

const toEmployeeRecord = (
  employee: EmployeeDocument,
  employeeMap = createEmployeeMap([employee]),
): EmployeeRecord => {
  return {
    createdAt: employee.createdAt,
    deleted: employee.deleted,
    department: employee.department,
    designation: employee.designation,
    email: employee.email,
    employeeId: employee.employeeId,
    id: getDocumentId(employee),
    joiningDate: employee.joiningDate,
    manager: employee.manager && employeeMap.get(toId(employee.manager))
      ? toEmployeeSummary(employeeMap.get(toId(employee.manager)) as EmployeeDocument)
      : null,
    name: employee.name,
    phone: employee.phone,
    profileImage: employee.profileImage,
    role: employee.role,
    salary: employee.salary,
    status: employee.status,
    updatedAt: employee.updatedAt,
  };
};

const buildTreeNode = (
  employee: EmployeeDocument,
  employeeMap: Map<string, EmployeeDocument>,
  childrenMap: Map<string, EmployeeDocument[]>,
): OrganizationTreeNode => {
  const employeeId = getDocumentId(employee);
  const reportees = (childrenMap.get(employeeId) ?? []).map((reportee) =>
    buildTreeNode(reportee, employeeMap, childrenMap),
  );

  return {
    ...toEmployeeSummary(employee),
    directReporteesCount: reportees.length,
    manager: employee.manager && employeeMap.get(toId(employee.manager))
      ? toEmployeeSummary(employeeMap.get(toId(employee.manager)) as EmployeeDocument)
      : null,
    reportees,
  };
};

const flattenTree = (nodes: OrganizationTreeNode[]): OrganizationTreeNode[] => {
  return nodes.flatMap((node) => [node, ...flattenTree(node.reportees)]);
};

const getDescendantIds = (employeeId: string, childrenMap: Map<string, EmployeeDocument[]>) => {
  const descendants = new Set<string>();
  const stack = [...(childrenMap.get(employeeId) ?? [])];

  while (stack.length > 0) {
    const employee = stack.pop();

    if (!employee) {
      continue;
    }

    const childId = getDocumentId(employee);
    descendants.add(childId);
    stack.push(...(childrenMap.get(childId) ?? []));
  }

  return descendants;
};

const assertEmployeeAccess = (employee: EmployeeDocument, requester: AuthenticatedUser) => {
  if (requester.role === "EMPLOYEE" && employee.email !== requester.email) {
    throw new AppError("You are not authorized to access this employee.", HTTP_STATUS.FORBIDDEN);
  }
};

const assertHrCanModifyEmployee = (employee: EmployeeDocument, requester: AuthenticatedUser) => {
  if (requester.role === "HR" && employee.role === "SUPER_ADMIN") {
    throw new AppError("HR cannot modify SUPER_ADMIN accounts.", HTTP_STATUS.FORBIDDEN);
  }
};

const assertHrCanUseRole = (
  role: EmployeeDocument["role"] | undefined,
  requester: AuthenticatedUser,
) => {
  if (requester.role === "HR" && role === "SUPER_ADMIN") {
    throw new AppError("HR cannot assign SUPER_ADMIN role.", HTTP_STATUS.FORBIDDEN);
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
  if (requester.role === "EMPLOYEE") {
    throw new AppError("You are not authorized to access employee listing.", HTTP_STATUS.FORBIDDEN);
  }

  const { employees, totalRecords } = await findEmployees(query);
  const allEmployees = await findAllEmployees();
  const employeeMap = createEmployeeMap(allEmployees);
  const totalPages = Math.max(Math.ceil(totalRecords / query.limit), 1);

  return {
    data: employees.map((employee) => toEmployeeRecord(employee, employeeMap)),
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

  const allEmployees = await findAllEmployees();
  return toEmployeeRecord(employee, createEmployeeMap(allEmployees));
};

export const getOwnEmployeeProfile = async (requester: AuthenticatedUser) => {
  const employee = await findEmployeeByEmail(requester.email);

  if (!employee) {
    throw new AppError("Employee profile not found.", HTTP_STATUS.NOT_FOUND);
  }

  const allEmployees = await findAllEmployees();
  return toEmployeeRecord(employee, createEmployeeMap(allEmployees));
};

export const addEmployee = async (payload: EmployeePayload, requester: AuthenticatedUser) => {
  assertHrCanUseRole(payload.role, requester);

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

export const editEmployee = async (
  id: string,
  payload: EmployeeUpdatePayload,
  requester: AuthenticatedUser,
) => {
  const currentEmployee = await getEmployeeOrThrow(id);
  assertHrCanModifyEmployee(currentEmployee, requester);
  assertHrCanUseRole(payload.role, requester);

  try {
    const employee = await updateEmployeeById(id, payload);

    if (!employee) {
      throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
    }

    const allEmployees = await findAllEmployees();
    return toEmployeeRecord(employee, createEmployeeMap(allEmployees));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createDuplicateEmployeeError();
    }

    throw error;
  }
};

export const editOwnEmployeeProfile = async (
  requester: AuthenticatedUser,
  payload: EmployeeUpdatePayload,
) => {
  const employee = await findEmployeeByEmail(requester.email);

  if (!employee) {
    throw new AppError("Employee profile not found.", HTTP_STATUS.NOT_FOUND);
  }

  const permittedPayload: EmployeeUpdatePayload = {
    phone: payload.phone,
    profileImage: payload.profileImage,
  };

  const updatedEmployee = await updateEmployeeById(getDocumentId(employee), permittedPayload);

  if (!updatedEmployee) {
    throw new AppError("Employee profile not found.", HTTP_STATUS.NOT_FOUND);
  }

  const allEmployees = await findAllEmployees();
  return toEmployeeRecord(updatedEmployee, createEmployeeMap(allEmployees));
};

export const removeEmployee = async (id: string) => {
  const employee = await softDeleteEmployeeById(id);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const restoreEmployee = async (id: string) => {
  const employee = await restoreEmployeeById(id);

  if (!employee) {
    throw new AppError("Deleted employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const changeEmployeeStatus = async (
  id: string,
  status: EmployeeDocument["status"],
  requester: AuthenticatedUser,
) => {
  const currentEmployee = await getEmployeeOrThrow(id);
  assertHrCanModifyEmployee(currentEmployee, requester);

  const employee = await updateEmployeeStatusById(id, status);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const changeEmployeeRole = async (
  id: string,
  role: EmployeeDocument["role"],
  requester: AuthenticatedUser,
) => {
  const currentEmployee = await getEmployeeOrThrow(id);
  assertHrCanModifyEmployee(currentEmployee, requester);
  assertHrCanUseRole(role, requester);

  if (
    requester.role === "SUPER_ADMIN" &&
    requester.email === currentEmployee.email &&
    role !== "SUPER_ADMIN"
  ) {
    throw new AppError("SUPER_ADMIN cannot downgrade themselves.", HTTP_STATUS.BAD_REQUEST);
  }

  const employee = await updateEmployeeRoleById(id, role);

  if (!employee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(employee);
};

export const assignEmployeeManager = async (
  id: string,
  managerId: string | null | undefined,
) => {
  const employee = await getEmployeeOrThrow(id);

  if (!managerId) {
    if (!employee.manager) {
      throw new AppError("Employee already has no assigned manager.", HTTP_STATUS.BAD_REQUEST);
    }

    const updatedEmployee = await updateEmployeeManagerById(id, null);
    return toEmployeeRecord(updatedEmployee ?? employee);
  }

  if (id === managerId) {
    throw new AppError("You cannot assign an employee as their own manager.", HTTP_STATUS.BAD_REQUEST);
  }

  const manager = await findEmployeeById(managerId);

  if (!manager) {
    throw new AppError("Manager not found.", HTTP_STATUS.NOT_FOUND);
  }

  if (manager.deleted || manager.status !== "ACTIVE") {
    throw new AppError("Manager must be an active employee.", HTTP_STATUS.BAD_REQUEST);
  }

  if (employee.manager && toId(employee.manager) === managerId) {
    throw new AppError("Employee already reports to this manager.", HTTP_STATUS.BAD_REQUEST);
  }

  const allEmployees = await findAllEmployees();
  const childrenMap = createChildrenMap(allEmployees);
  const descendantIds = getDescendantIds(id, childrenMap);

  if (descendantIds.has(managerId)) {
    throw new AppError("Circular reporting detected.", HTTP_STATUS.BAD_REQUEST);
  }

  const updatedEmployee = await updateEmployeeManagerById(id, managerId);

  if (!updatedEmployee) {
    throw new AppError("Employee not found.", HTTP_STATUS.NOT_FOUND);
  }

  return toEmployeeRecord(updatedEmployee, createEmployeeMap(allEmployees));
};

export const getManagerCandidates = async (id: string) => {
  const employee = await getEmployeeOrThrow(id);
  const allEmployees = await findAllEmployees();
  const childrenMap = createChildrenMap(allEmployees);
  const descendantIds = getDescendantIds(id, childrenMap);
  const currentManagerId = getManagerId(employee);
  const candidates = await findManagerCandidates();

  return candidates
    .filter((candidate) => {
      const candidateId = getDocumentId(candidate);

      return (
        candidateId !== id &&
        candidateId !== currentManagerId &&
        !descendantIds.has(candidateId)
      );
    })
    .map(toEmployeeSummary);
};

export const getEmployeeReportees = async (
  id: string,
  requester: AuthenticatedUser,
): Promise<ReporteesResult> => {
  const employee = await getEmployeeOrThrow(id);
  assertEmployeeAccess(employee, requester);

  if (requester.role === "EMPLOYEE") {
    throw new AppError("You are not authorized to view reportees.", HTTP_STATUS.FORBIDDEN);
  }

  const allEmployees = await findAllEmployees();
  const employeeMap = createEmployeeMap(allEmployees);
  const childrenMap = createChildrenMap(allEmployees);
  const directReportees = (childrenMap.get(id) ?? []).map((reportee) =>
    buildTreeNode(reportee, employeeMap, childrenMap),
  );

  return {
    directReportees,
    nestedReportees: flattenTree(directReportees),
  };
};

export const getOrganizationTree = async () => {
  const allEmployees = await findAllEmployees();
  const employeeMap = createEmployeeMap(allEmployees);
  const childrenMap = createChildrenMap(allEmployees);

  return (childrenMap.get("ROOT") ?? []).map((employee) =>
    buildTreeNode(employee, employeeMap, childrenMap),
  );
};

export const getEmployeeChain = async (id: string, requester: AuthenticatedUser) => {
  const employee = await getEmployeeOrThrow(id);
  assertEmployeeAccess(employee, requester);

  const allEmployees = await findAllEmployees();
  const employeeMap = createEmployeeMap(allEmployees);
  const chain: EmployeeSummary[] = [];
  let cursor: EmployeeDocument | undefined = employee;
  const visitedIds = new Set<string>();

  while (cursor) {
    const cursorId = getDocumentId(cursor);

    if (visitedIds.has(cursorId)) {
      break;
    }

    visitedIds.add(cursorId);
    chain.unshift(toEmployeeSummary(cursor));
    const managerId = getManagerId(cursor);
    cursor = managerId ? employeeMap.get(managerId) : undefined;
  }

  return chain;
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

export const ensureEmployeeExistsForAuthenticatedUser = async (requester: AuthenticatedUser) => {
  return findEmployeeByEmailIncludingDeleted(requester.email);
};
