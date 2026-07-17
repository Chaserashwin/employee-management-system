import { HTTP_STATUS } from "../constants/http-status";
import {
  addEmployee,
  assignEmployeeManager,
  changeEmployeeRole,
  changeEmployeeStatus,
  editEmployee,
  editOwnEmployeeProfile,
  getEmployeeDirectReports,
  getEmployee,
  getEmployeeChain,
  getEmployeeReportees,
  getManagerCandidates,
  getOwnEmployeeProfile,
  listEmployees,
  listDeletedEmployees,
  normalizeEmployeePayload,
  permanentlyDeleteEmployee,
  permanentlyDeleteEmployees,
  removeEmployee,
  restoreEmployee,
  restoreEmployees,
} from "../services/employee.service";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";
import { toUploadedEmployeeImageUrl } from "../middlewares/upload.middleware";
import type { EmployeeListQuery, EmployeePayload, EmployeeUpdatePayload } from "../types/employee";
import {
  getEmployeeCsvTemplate,
  importEmployeeCsv,
  previewEmployeeCsvImport,
} from "../services/employee-import.service";

const getRequester = (requestUser: Express.Request["user"]) => {
  if (!requestUser) {
    throw new AppError("Authentication is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  return requestUser;
};

const mergeEmployeePayloadWithUpload = <TPayload extends EmployeePayload | EmployeeUpdatePayload>(
  payload: TPayload & { removeProfileImage?: boolean },
  file: Express.Multer.File | undefined,
): TPayload => {
  const { removeProfileImage, ...employeePayload } = payload;
  const profileImage = toUploadedEmployeeImageUrl(file);

  if (profileImage) {
    return {
      ...employeePayload,
      profileImage,
    } as TPayload;
  }

  if (removeProfileImage === true) {
    return {
      ...employeePayload,
      profileImage: null,
    } as TPayload;
  }

  return employeePayload as TPayload;
};

export const getEmployees = asyncHandler(async (request, response) => {
  const employees = await listEmployees(
    request.query as unknown as EmployeeListQuery,
    getRequester(request.user),
  );

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employees, "Employees retrieved."));
});

export const getDeletedEmployees = asyncHandler(async (request, response) => {
  const employees = await listDeletedEmployees(
    request.query as unknown as EmployeeListQuery,
    getRequester(request.user),
  );

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(employees, "Deleted employees retrieved."));
});

export const getEmployeeById = asyncHandler(async (request, response) => {
  const employee = await getEmployee(request.params.id, getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee retrieved."));
});

export const getMyEmployeeProfile = asyncHandler(async (request, response) => {
  const employee = await getOwnEmployeeProfile(getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee profile retrieved."));
});

export const createEmployee = asyncHandler(async (request, response) => {
  const payload = normalizeEmployeePayload(
    mergeEmployeePayloadWithUpload(request.body as EmployeePayload, request.file),
  );
  const employee = await addEmployee(payload, getRequester(request.user));

  response.status(HTTP_STATUS.CREATED).json(createSuccessResponse(employee, "Employee created."));
});

export const previewEmployeeImport = asyncHandler(async (request, response) => {
  const preview = await previewEmployeeCsvImport(request.file, getRequester(request.user));

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(preview, "Employee import preview generated."));
});

export const importEmployees = asyncHandler(async (request, response) => {
  const result = await importEmployeeCsv(request.file, getRequester(request.user));

  response
    .status(HTTP_STATUS.CREATED)
    .json(createSuccessResponse(result, "Employee import completed."));
});

export const downloadEmployeeImportTemplate = asyncHandler(async (_request, response) => {
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    'attachment; filename="employee-import-template.csv"',
  );
  response.status(HTTP_STATUS.OK).send(getEmployeeCsvTemplate());
});

export const updateEmployee = asyncHandler(async (request, response) => {
  const payload = normalizeEmployeePayload(
    mergeEmployeePayloadWithUpload(
      request.body as EmployeeUpdatePayload & { removeProfileImage?: boolean },
      request.file,
    ),
  );
  const employee = await editEmployee(request.params.id, payload, getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee updated."));
});

export const updateMyEmployeeProfile = asyncHandler(async (request, response) => {
  const payload = normalizeEmployeePayload(
    mergeEmployeePayloadWithUpload(
      request.body as EmployeeUpdatePayload & { removeProfileImage?: boolean },
      request.file,
    ),
  );
  const employee = await editOwnEmployeeProfile(getRequester(request.user), payload);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee profile updated."));
});

export const deleteEmployee = asyncHandler(async (request, response) => {
  const employee = await removeEmployee(request.params.id, getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee deleted."));
});

export const restoreDeletedEmployee = asyncHandler(async (request, response) => {
  const employee = await restoreEmployee(request.params.id);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee restored."));
});

export const restoreDeletedEmployees = asyncHandler(async (request, response) => {
  const result = await restoreEmployees(request.body.employeeIds);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(result, "Employees restored."));
});

export const permanentlyDeleteDeletedEmployee = asyncHandler(async (request, response) => {
  const employee = await permanentlyDeleteEmployee(request.params.id);

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(employee, "Employee permanently deleted."));
});

export const permanentlyDeleteDeletedEmployees = asyncHandler(async (request, response) => {
  const result = await permanentlyDeleteEmployees(request.body.employeeIds);

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(result, "Employees permanently deleted."));
});

export const updateEmployeeStatus = asyncHandler(async (request, response) => {
  const employee = await changeEmployeeStatus(
    request.params.id,
    request.body.status,
    getRequester(request.user),
  );

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee status updated."));
});

export const updateEmployeeRole = asyncHandler(async (request, response) => {
  const employee = await changeEmployeeRole(
    request.params.id,
    request.body.role,
    getRequester(request.user),
  );

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee role updated."));
});

export const updateEmployeeManager = asyncHandler(async (request, response) => {
  const employee = await assignEmployeeManager(
    request.params.id,
    request.body.managerId ?? null,
    getRequester(request.user),
  );

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee manager updated."));
});

export const getEmployeeManagerCandidates = asyncHandler(async (request, response) => {
  const employees = await getManagerCandidates(request.params.id);

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(employees, "Manager candidates retrieved."));
});

export const getEmployeeReporteesById = asyncHandler(async (request, response) => {
  const reportees = await getEmployeeReportees(request.params.id, getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(reportees, "Reportees retrieved."));
});

export const getEmployeeDirectReportsById = asyncHandler(async (request, response) => {
  const directReports = await getEmployeeDirectReports(
    request.params.id,
    getRequester(request.user),
  );

  response
    .status(HTTP_STATUS.OK)
    .json(createSuccessResponse(directReports, "Direct reports retrieved."));
});

export const getEmployeeChainById = asyncHandler(async (request, response) => {
  const chain = await getEmployeeChain(request.params.id, getRequester(request.user));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(chain, "Reporting chain retrieved."));
});
