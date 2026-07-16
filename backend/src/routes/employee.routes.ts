import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
  getMyEmployeeProfile,
  updateEmployee,
  updateEmployeeStatus,
} from "../controllers/employee.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { uploadProfileImage } from "../middlewares/upload.middleware";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware";
import {
  createEmployeeSchema,
  employeeIdParamSchema,
  employeeListQuerySchema,
  employeeStatusSchema,
  updateEmployeeSchema,
} from "../validators/employee.validator";

export const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get("/", validateQuery(employeeListQuerySchema), getEmployees);
employeeRouter.get("/me", getMyEmployeeProfile);
employeeRouter.get("/:id", validateParams(employeeIdParamSchema), getEmployeeById);

employeeRouter.post(
  "/",
  authorize("SUPER_ADMIN", "HR"),
  uploadProfileImage,
  validateBody(createEmployeeSchema),
  createEmployee,
);

employeeRouter.put(
  "/:id",
  authorize("SUPER_ADMIN", "HR"),
  validateParams(employeeIdParamSchema),
  uploadProfileImage,
  validateBody(updateEmployeeSchema),
  updateEmployee,
);

employeeRouter.delete(
  "/:id",
  authorize("SUPER_ADMIN"),
  validateParams(employeeIdParamSchema),
  deleteEmployee,
);

employeeRouter.patch(
  "/:id/status",
  authorize("SUPER_ADMIN", "HR"),
  validateParams(employeeIdParamSchema),
  validateBody(employeeStatusSchema),
  updateEmployeeStatus,
);
