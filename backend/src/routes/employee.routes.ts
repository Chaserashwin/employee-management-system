import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  downloadEmployeeImportTemplate,
  getDeletedEmployees,
  getEmployeeDirectReportsById,
  getEmployeeChainById,
  getEmployeeById,
  getEmployeeManagerCandidates,
  getEmployeeReporteesById,
  getEmployees,
  getMyEmployeeProfile,
  importEmployees,
  permanentlyDeleteDeletedEmployee,
  permanentlyDeleteDeletedEmployees,
  previewEmployeeImport,
  restoreDeletedEmployees,
  restoreDeletedEmployee,
  updateEmployee,
  updateEmployeeManager,
  updateEmployeeRole,
  updateMyEmployeeProfile,
  updateEmployeeStatus,
} from "../controllers/employee.controller";
import { authenticate, authorize, PERMISSIONS } from "../middlewares/auth.middleware";
import { uploadEmployeeCsv, uploadProfileImage } from "../middlewares/upload.middleware";
import {
  validateBody,
  validateBodyOrUploadedFile,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  createEmployeeSchema,
  employeeBulkIdsSchema,
  employeeIdParamSchema,
  employeeListQuerySchema,
  employeeManagerSchema,
  employeeRoleSchema,
  employeeStatusSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator";

export const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get(
  "/",
  authorize(PERMISSIONS.EMPLOYEE_VIEW),
  validateQuery(employeeListQuerySchema),
  getEmployees,
);
employeeRouter.get(
  "/recycle-bin",
  authorize(PERMISSIONS.EMPLOYEE_RESTORE),
  validateQuery(employeeListQuerySchema),
  getDeletedEmployees,
);
employeeRouter.patch(
  "/recycle-bin/restore",
  authorize(PERMISSIONS.EMPLOYEE_RESTORE),
  validateBody(employeeBulkIdsSchema),
  restoreDeletedEmployees,
);
employeeRouter.delete(
  "/recycle-bin",
  authorize(PERMISSIONS.EMPLOYEE_DELETE),
  validateBody(employeeBulkIdsSchema),
  permanentlyDeleteDeletedEmployees,
);
employeeRouter.delete(
  "/recycle-bin/:id",
  authorize(PERMISSIONS.EMPLOYEE_DELETE),
  validateParams(employeeIdParamSchema),
  permanentlyDeleteDeletedEmployee,
);
employeeRouter.get(
  "/import/template",
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  downloadEmployeeImportTemplate,
);
employeeRouter.post(
  "/import/preview",
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  uploadEmployeeCsv,
  previewEmployeeImport,
);
employeeRouter.post(
  "/import",
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  uploadEmployeeCsv,
  importEmployees,
);
employeeRouter.get("/me", getMyEmployeeProfile);
employeeRouter.patch(
  "/me",
  authorize(PERMISSIONS.EMPLOYEE_UPDATE_OWN),
  uploadProfileImage,
  validateBodyOrUploadedFile(updateEmployeeSchema),
  updateMyEmployeeProfile,
);
employeeRouter.get(
  "/:id/reportees",
  authorize(PERMISSIONS.HIERARCHY_VIEW),
  validateParams(employeeIdParamSchema),
  getEmployeeReporteesById,
);
employeeRouter.get(
  "/:id/direct-reports",
  authorize(PERMISSIONS.HIERARCHY_VIEW),
  validateParams(employeeIdParamSchema),
  getEmployeeDirectReportsById,
);
employeeRouter.get("/:id/chain", validateParams(employeeIdParamSchema), getEmployeeChainById);
employeeRouter.get(
  "/:id/manager-candidates",
  authorize(PERMISSIONS.EMPLOYEE_ASSIGN_MANAGER),
  validateParams(employeeIdParamSchema),
  getEmployeeManagerCandidates,
);
employeeRouter.get("/:id", validateParams(employeeIdParamSchema), getEmployeeById);

employeeRouter.post(
  "/",
  authorize(PERMISSIONS.EMPLOYEE_CREATE),
  uploadProfileImage,
  validateBody(createEmployeeSchema),
  createEmployee,
);

employeeRouter.put(
  "/:id",
  authorize(PERMISSIONS.EMPLOYEE_UPDATE),
  validateParams(employeeIdParamSchema),
  uploadProfileImage,
  validateBodyOrUploadedFile(updateEmployeeSchema),
  updateEmployee,
);

employeeRouter.delete(
  "/:id",
  authorize(PERMISSIONS.EMPLOYEE_DELETE),
  validateParams(employeeIdParamSchema),
  deleteEmployee,
);

employeeRouter.patch(
  "/:id/restore",
  authorize(PERMISSIONS.EMPLOYEE_RESTORE),
  validateParams(employeeIdParamSchema),
  restoreDeletedEmployee,
);

employeeRouter.patch(
  "/:id/status",
  authorize(PERMISSIONS.EMPLOYEE_UPDATE),
  validateParams(employeeIdParamSchema),
  validateBody(employeeStatusSchema),
  updateEmployeeStatus,
);

employeeRouter.patch(
  "/:id/role",
  authorize(PERMISSIONS.EMPLOYEE_CHANGE_ROLE),
  validateParams(employeeIdParamSchema),
  validateBody(employeeRoleSchema),
  updateEmployeeRole,
);

employeeRouter.patch(
  "/:id/manager",
  authorize(PERMISSIONS.EMPLOYEE_ASSIGN_MANAGER),
  validateParams(employeeIdParamSchema),
  validateBody(employeeManagerSchema),
  updateEmployeeManager,
);
