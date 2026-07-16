import { HTTP_STATUS } from "../constants/http-status";
import {
  addEmployee,
  changeEmployeeStatus,
  editEmployee,
  getEmployee,
  getOwnEmployeeProfile,
  listEmployees,
  normalizeEmployeePayload,
  removeEmployee,
} from "../services/employee.service";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";
import { toUploadedEmployeeImageUrl } from "../middlewares/upload.middleware";
import type { EmployeeListQuery } from "../types/employee";

const getRequester = (requestUser: Express.Request["user"]) => {
  if (!requestUser) {
    throw new AppError("Authentication is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  return requestUser;
};

const mergeEmployeePayloadWithUpload = <TPayload extends Record<string, unknown>>(
  payload: TPayload,
  file: Express.Multer.File | undefined,
) => {
  const profileImage = toUploadedEmployeeImageUrl(file);

  if (!profileImage) {
    return payload;
  }

  return {
    ...payload,
    profileImage,
  };
};

export const getEmployees = asyncHandler(async (request, response) => {
  const employees = await listEmployees(
    request.query as unknown as EmployeeListQuery,
    getRequester(request.user),
  );

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employees, "Employees retrieved."));
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
  const payload = normalizeEmployeePayload(mergeEmployeePayloadWithUpload(request.body, request.file));
  const employee = await addEmployee(payload);

  response.status(HTTP_STATUS.CREATED).json(createSuccessResponse(employee, "Employee created."));
});

export const updateEmployee = asyncHandler(async (request, response) => {
  const payload = normalizeEmployeePayload(mergeEmployeePayloadWithUpload(request.body, request.file));
  const employee = await editEmployee(request.params.id, payload);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee updated."));
});

export const deleteEmployee = asyncHandler(async (request, response) => {
  const employee = await removeEmployee(request.params.id);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee deleted."));
});

export const updateEmployeeStatus = asyncHandler(async (request, response) => {
  const employee = await changeEmployeeStatus(request.params.id, request.body.status);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(employee, "Employee status updated."));
});
