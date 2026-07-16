import type { UserRole } from "./user";

export const PERMISSIONS = {
  EMPLOYEE_ASSIGN_MANAGER: "employee:assign-manager",
  EMPLOYEE_CHANGE_ROLE: "employee:change-role",
  EMPLOYEE_CREATE: "employee:create",
  EMPLOYEE_DELETE: "employee:delete",
  EMPLOYEE_RESTORE: "employee:restore",
  EMPLOYEE_UPDATE: "employee:update",
  EMPLOYEE_UPDATE_OWN: "employee:update-own",
  EMPLOYEE_VIEW: "employee:view",
  EMPLOYEE_VIEW_OWN: "employee:view-own",
  HIERARCHY_VIEW: "hierarchy:view",
  HIERARCHY_VIEW_OWN: "hierarchy:view-own",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  HR: [
    PERMISSIONS.EMPLOYEE_CHANGE_ROLE,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_UPDATE,
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.HIERARCHY_VIEW,
  ],
  EMPLOYEE: [
    PERMISSIONS.EMPLOYEE_UPDATE_OWN,
    PERMISSIONS.EMPLOYEE_VIEW_OWN,
    PERMISSIONS.HIERARCHY_VIEW_OWN,
  ],
};

export const hasPermission = (role: UserRole, permission: Permission) => {
  return ROLE_PERMISSIONS[role].includes(permission);
};
