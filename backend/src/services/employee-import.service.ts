import "../types/express";
import "multer";

import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_DESIGNATIONS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  type EmployeeRole,
  type EmployeeStatus,
} from "../constants/employee";
import {
  createEmptyEmployeeCsvData,
  EMPLOYEE_CSV_HEADERS,
  EMPLOYEE_CSV_REQUIRED_COLUMNS,
  getEmployeeCsvFieldKey,
  getEmployeeCsvHeaderLabel,
  type CsvEmployeeData,
  type EmployeeCsvFieldKey,
} from "../constants/employee-csv";
import { HTTP_STATUS } from "../constants/http-status";
import { ACTIVE_EMPLOYEE_FILTER } from "../repositories/employee.repository";
import { EmployeeModel, type EmployeeDocument } from "../models/employee.model";
import type { AuthenticatedUser } from "../types/auth";
import type {
  EmployeeCsvImportPreview,
  EmployeeCsvImportResult,
  EmployeeCsvImportRow,
  EmployeePayload,
  EmployeeRecord,
  EmployeeSummary,
} from "../types/employee";
import { AppError } from "../utils/app-error";
import { createEmployeeCsvDate, parseEmployeeCsvDate } from "../utils/employee-csv-date";

type ValidatedImportRow = EmployeeCsvImportRow & {
  managerEmployeeId: string | null;
  payload: EmployeePayload;
  parsedJoiningDate: Date | null;
};

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export { EMPLOYEE_CSV_HEADERS, EMPLOYEE_CSV_REQUIRED_HEADERS } from "../constants/employee-csv";

export const EMPLOYEE_CSV_TEMPLATE_HEADERS = EMPLOYEE_CSV_HEADERS;

const requiredFieldKeys = EMPLOYEE_CSV_REQUIRED_COLUMNS.map((column) => column.key);

const normalizeLookupValue = (value: string) => value.trim().toLowerCase();

const normalizeAllowedValue = <TValue extends string>(
  value: string,
  allowedValues: readonly TValue[],
) => {
  const normalizedValue = normalizeLookupValue(value);

  return allowedValues.find((allowedValue) => normalizeLookupValue(allowedValue) === normalizedValue);
};

const parseCsv = (content: string) => {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let isInsideQuotes = false;
  const normalizedContent = content.replace(/^\uFEFF/, "");

  for (let index = 0; index < normalizedContent.length; index += 1) {
    const character = normalizedContent[index];
    const nextCharacter = normalizedContent[index + 1];

    if (character === "\"") {
      if (isInsideQuotes && nextCharacter === "\"") {
        currentCell += "\"";
        index += 1;
      } else {
        isInsideQuotes = !isInsideQuotes;
      }

      continue;
    }

    if (character === "," && !isInsideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !isInsideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
};

export const getEmployeeCsvHeaderIndexes = (headerRow: string[]) => {
  const headerIndexes = new Map<EmployeeCsvFieldKey, number>();

  headerRow.forEach((header, index) => {
    const key = getEmployeeCsvFieldKey(header);

    if (key && !headerIndexes.has(key)) {
      headerIndexes.set(key, index);
    }
  });

  const missingHeaders = requiredFieldKeys.filter((key) => !headerIndexes.has(key));

  if (missingHeaders.length > 0) {
    throw new AppError(
      `Missing required CSV headers: ${missingHeaders.map(getEmployeeCsvHeaderLabel).join(", ")}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return headerIndexes;
};

const rowToEmployeeData = (
  row: string[],
  headerIndexes: Map<EmployeeCsvFieldKey, number>,
): CsvEmployeeData => {
  const data = createEmptyEmployeeCsvData();

  for (const [key, index] of headerIndexes.entries()) {
    data[key] = row[index]?.trim() ?? "";
  }

  data.email = data.email.toLowerCase();
  data.role = data.role.toUpperCase();
  data.status = data.status.toUpperCase();

  return data;
};

const createSummary = (
  rows: EmployeeCsvImportRow[],
  imported = 0,
): EmployeeCsvImportPreview["summary"] => {
  const duplicates = rows.filter((row) => row.isDuplicate).length;
  const valid = rows.filter((row) => row.isValid).length;
  const invalid = rows.length - valid;

  return {
    duplicates,
    imported,
    invalid,
    rows: rows.length,
    skipped: imported > 0 ? rows.length - imported : invalid,
    valid,
  };
};

const toId = (employee: EmployeeDocument) => employee.id as string;

const getManagerId = (employee: EmployeeDocument) => {
  return employee.manager ? String(employee.manager) : null;
};

const toEmployeeSummary = (employee: EmployeeDocument): EmployeeSummary => ({
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  employeeId: employee.employeeId,
  id: toId(employee),
  joiningDate: employee.joiningDate,
  name: employee.name,
  phone: employee.phone,
  profileImage: employee.profileImage,
  role: employee.role,
  status: employee.status,
});

const toEmployeeRecord = (
  employee: EmployeeDocument,
  employeeMap: Map<string, EmployeeDocument>,
): EmployeeRecord => ({
  createdAt: employee.createdAt,
  deleted: employee.deleted || employee.isDeleted,
  deletedAt: employee.deletedAt ?? null,
  deletedBy: employee.deletedBy ? String(employee.deletedBy) : null,
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  employeeId: employee.employeeId,
  id: toId(employee),
  isDeleted: employee.deleted || employee.isDeleted,
  joiningDate: employee.joiningDate,
  manager: employee.manager && employeeMap.get(String(employee.manager))
    ? toEmployeeSummary(employeeMap.get(String(employee.manager)) as EmployeeDocument)
    : null,
  name: employee.name,
  phone: employee.phone,
  profileImage: employee.profileImage,
  role: employee.role,
  salary: employee.salary,
  status: employee.status,
  updatedAt: employee.updatedAt,
});

const validateImportRows = async (content: string, requester: AuthenticatedUser) => {
  const parsedRows = parseCsv(content);

  if (parsedRows.length === 0) {
    throw new AppError("CSV file is empty.", HTTP_STATUS.BAD_REQUEST);
  }

  const [headerRow, ...dataRows] = parsedRows;
  const headerIndexes = getEmployeeCsvHeaderIndexes(headerRow);
  const rows: ValidatedImportRow[] = dataRows.map((row, index) => {
    const data = rowToEmployeeData(row, headerIndexes);
    const parsedJoiningDate = parseEmployeeCsvDate(data.joiningDate);

    return {
      data,
      errors: [],
      isDuplicate: false,
      isValid: false,
      managerEmployeeId: null,
      payload: {
        department: data.department,
        designation: data.designation,
        email: data.email,
        employeeId: data.employeeId,
        joiningDate: parsedJoiningDate ?? createEmployeeCsvDate(1970, 1, 1),
        manager: null,
        name: data.name,
        phone: data.phone,
        profileImage: data.profileImage || undefined,
        role: data.role as EmployeeRole,
        salary: Number(data.salary),
        status: data.status as EmployeeStatus,
      },
      parsedJoiningDate,
      rowNumber: index + 2,
    };
  });

  const seenEmails = new Map<string, number>();
  const seenEmployeeIds = new Map<string, number>();

  for (const row of rows) {
    for (const key of requiredFieldKeys) {
      if (!row.data[key]) {
        row.errors.push(`${getEmployeeCsvHeaderLabel(key)} is required.`);
      }
    }

    const emailKey = normalizeLookupValue(row.data.email);
    const employeeIdKey = normalizeLookupValue(row.data.employeeId);

    if (emailKey && seenEmails.has(emailKey)) {
      row.errors.push(`Duplicate Email in CSV; first seen on row ${seenEmails.get(emailKey)}.`);
      row.isDuplicate = true;
    } else if (emailKey) {
      seenEmails.set(emailKey, row.rowNumber);
    }

    if (employeeIdKey && seenEmployeeIds.has(employeeIdKey)) {
      row.errors.push(
        `Duplicate Employee ID in CSV; first seen on row ${seenEmployeeIds.get(employeeIdKey)}.`,
      );
      row.isDuplicate = true;
    } else if (employeeIdKey) {
      seenEmployeeIds.set(employeeIdKey, row.rowNumber);
    }

    if (row.data.email && !emailRegex.test(row.data.email)) {
      row.errors.push("Email must be valid.");
    }

    if (row.data.phone && !phoneRegex.test(row.data.phone)) {
      row.errors.push("Phone must be 7 to 20 characters and contain only digits, spaces, +, -, or parentheses.");
    }

    const department = normalizeAllowedValue(row.data.department, EMPLOYEE_DEPARTMENTS);
    if (row.data.department && !department) {
      row.errors.push(`Department must be one of: ${EMPLOYEE_DEPARTMENTS.join(", ")}.`);
    }

    const designation = normalizeAllowedValue(row.data.designation, EMPLOYEE_DESIGNATIONS);
    if (row.data.designation && !designation) {
      row.errors.push(`Designation must be one of: ${EMPLOYEE_DESIGNATIONS.join(", ")}.`);
    }

    const status = normalizeAllowedValue(row.data.status, EMPLOYEE_STATUSES);
    if (row.data.status && !status) {
      row.errors.push("Status must be ACTIVE or INACTIVE.");
    }

    const role = normalizeAllowedValue(row.data.role, EMPLOYEE_ROLES);
    if (row.data.role && !role) {
      row.errors.push("Role must be SUPER_ADMIN, HR, or EMPLOYEE.");
    }

    if (requester.role === "HR" && role && role !== "EMPLOYEE") {
      row.errors.push("HR users can import EMPLOYEE role rows only.");
    }

    const salary = Number(row.data.salary);
    if (row.data.salary && (!Number.isFinite(salary) || salary < 0)) {
      row.errors.push("Salary must be a valid non-negative number.");
    }

    if (row.data.joiningDate && !row.parsedJoiningDate) {
      row.errors.push("Joining Date must be a valid date.");
    }

    row.payload = {
      ...row.payload,
      department: department ?? row.data.department,
      designation: designation ?? row.data.designation,
      joiningDate: row.parsedJoiningDate ?? row.payload.joiningDate,
      role: (role ?? row.data.role) as EmployeeRole,
      salary,
      status: (status ?? row.data.status) as EmployeeStatus,
    };
  }

  const emails = [...seenEmails.keys()];
  const employeeIds = rows.map((row) => row.data.employeeId).filter(Boolean);
  const existingEmployees = await EmployeeModel.find({
    $or: [{ email: { $in: emails } }, { employeeId: { $in: employeeIds } }],
  }).exec();
  const existingByEmail = new Set(existingEmployees.map((employee) => employee.email.toLowerCase()));
  const existingByEmployeeId = new Set(
    existingEmployees.map((employee) => employee.employeeId.toLowerCase()),
  );

  for (const row of rows) {
    if (existingByEmail.has(normalizeLookupValue(row.data.email))) {
      row.errors.push("Duplicate email already exists.");
      row.isDuplicate = true;
    }

    if (existingByEmployeeId.has(normalizeLookupValue(row.data.employeeId))) {
      row.errors.push("Duplicate employee ID already exists.");
      row.isDuplicate = true;
    }
  }

  const importRowsByEmail = new Map(
    rows.map((row) => [normalizeLookupValue(row.data.email), row]),
  );
  const importRowsByEmployeeId = new Map(
    rows.map((row) => [normalizeLookupValue(row.data.employeeId), row]),
  );
  const managerReferenceValues = [...new Set(rows.map((row) => row.data.manager).filter(Boolean))];
  const managerReferences = managerReferenceValues.map(normalizeLookupValue);
  const existingManagers = await EmployeeModel.find({
    $or: [{ email: { $in: managerReferences } }, { employeeId: { $in: managerReferenceValues } }],
  }).exec();
  const existingManagersByReference = new Map<string, EmployeeDocument>();

  for (const manager of existingManagers) {
    existingManagersByReference.set(normalizeLookupValue(manager.email), manager);
    existingManagersByReference.set(normalizeLookupValue(manager.employeeId), manager);
  }

  const managerByEmployeeId = new Map<string, string>();

  for (const row of rows) {
    if (!row.data.manager) {
      continue;
    }

    const managerReference = normalizeLookupValue(row.data.manager);

    if (
      managerReference === normalizeLookupValue(row.data.employeeId) ||
      managerReference === normalizeLookupValue(row.data.email)
    ) {
      row.errors.push("Manager cannot be the same employee.");
      continue;
    }

    const existingManager = existingManagersByReference.get(managerReference);

    if (existingManager) {
      if (
        existingManager.deleted ||
        existingManager.isDeleted ||
        existingManager.status !== "ACTIVE"
      ) {
        row.errors.push("Manager must be an active, non-deleted employee.");
        continue;
      }

      row.managerEmployeeId = existingManager.employeeId;
      managerByEmployeeId.set(row.data.employeeId, existingManager.employeeId);
      continue;
    }

    const importManager =
      importRowsByEmployeeId.get(managerReference) ?? importRowsByEmail.get(managerReference);

    if (!importManager) {
      row.errors.push("Manager must reference an existing employee email/ID or another CSV row.");
      continue;
    }

    if (importManager.errors.length > 0) {
      row.errors.push("Manager row is invalid and cannot be assigned.");
      continue;
    }

    if (importManager.payload.status !== "ACTIVE") {
      row.errors.push("Manager must be ACTIVE.");
      continue;
    }

    row.managerEmployeeId = importManager.data.employeeId;
    managerByEmployeeId.set(row.data.employeeId, importManager.data.employeeId);
  }

  for (const row of rows) {
    if (row.errors.length > 0) {
      continue;
    }

    const visitedIds = new Set<string>();
    let cursor: string | undefined = row.data.employeeId;

    while (cursor) {
      if (visitedIds.has(cursor)) {
        row.errors.push("Circular reporting detected in CSV rows.");
        break;
      }

      visitedIds.add(cursor);
      cursor = managerByEmployeeId.get(cursor);
    }
  }

  for (const row of rows) {
    row.isValid = row.errors.length === 0;
  }

  return rows;
};

export const previewEmployeeCsvImport = async (
  file: Express.Multer.File | undefined,
  requester: AuthenticatedUser,
): Promise<EmployeeCsvImportPreview> => {
  if (!file) {
    throw new AppError("CSV file is required.", HTTP_STATUS.BAD_REQUEST);
  }

  const rows = await validateImportRows(file.buffer.toString("utf8"), requester);

  return {
    rows,
    summary: createSummary(rows),
  };
};

export const importEmployeeCsv = async (
  file: Express.Multer.File | undefined,
  requester: AuthenticatedUser,
): Promise<EmployeeCsvImportResult> => {
  if (!file) {
    throw new AppError("CSV file is required.", HTTP_STATUS.BAD_REQUEST);
  }

  const rows = await validateImportRows(file.buffer.toString("utf8"), requester);
  const validRows = rows.filter((row) => row.isValid);
  const createdByEmployeeId = new Map<string, EmployeeDocument>();
  const existingManagerEmployeeIds = [
    ...new Set(
      validRows
        .map((row) => row.managerEmployeeId)
        .filter((employeeId): employeeId is string => Boolean(employeeId)),
    ),
  ];
  const existingManagers = await EmployeeModel.find({
    ...ACTIVE_EMPLOYEE_FILTER,
    employeeId: { $in: existingManagerEmployeeIds },
  }).exec();
  const managersByEmployeeId = new Map(
    existingManagers.map((manager) => [manager.employeeId, manager]),
  );

  for (const row of validRows) {
    const employee = await EmployeeModel.create({
      ...row.payload,
      deleted: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      manager: null,
    });

    createdByEmployeeId.set(employee.employeeId, employee);
  }

  for (const row of validRows) {
    if (!row.managerEmployeeId) {
      continue;
    }

    const employee = createdByEmployeeId.get(row.payload.employeeId ?? "");
    const manager =
      createdByEmployeeId.get(row.managerEmployeeId) ??
      managersByEmployeeId.get(row.managerEmployeeId);

    if (!employee || !manager) {
      continue;
    }

    await EmployeeModel.findByIdAndUpdate(employee.id, { manager: manager.id }, { new: true }).exec();
  }

  const createdIds = [...createdByEmployeeId.values()].map((employee) => employee.id);
  const importedEmployees = await EmployeeModel.find({ _id: { $in: createdIds } }).exec();
  const managerIds = [
    ...new Set(
      importedEmployees
        .map(getManagerId)
        .filter((managerId): managerId is string => Boolean(managerId)),
    ),
  ];
  const managers = managerIds.length > 0
    ? await EmployeeModel.find({ _id: { $in: managerIds } }).exec()
    : [];
  const employeeMap = new Map(
    [...importedEmployees, ...managers].map((employee) => [employee.id as string, employee]),
  );

  return {
    importedEmployees: importedEmployees.map((employee) => toEmployeeRecord(employee, employeeMap)),
    rows,
    summary: createSummary(rows, importedEmployees.length),
  };
};

export const getEmployeeCsvTemplate = () => {
  const sampleRows = [
    [
      "EMS-0101",
      "Priya Shah",
      "priya.shah@ems.com",
      "+1 555 1101",
      "Engineering",
      "Tech Lead",
      "125000",
      "2024-05-01",
      "ACTIVE",
      "EMPLOYEE",
      "admin@ems.com",
      "",
    ],
    [
      "EMS-0102",
      "Daniel Brooks",
      "daniel.brooks@ems.com",
      "+1 555 1102",
      "QA",
      "QA Engineer",
      "84000",
      "2023-09-18",
      "ACTIVE",
      "EMPLOYEE",
      "EMS-0101",
      "",
    ],
  ];
  const escapeCell = (value: string) => {
    if (!/[",\n\r]/.test(value)) {
      return value;
    }

    return `"${value.replace(/"/g, "\"\"")}"`;
  };

  return [EMPLOYEE_CSV_HEADERS, ...sampleRows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");
};
