export const USER_ROLES = ["SUPER_ADMIN", "HR", "EMPLOYEE"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
