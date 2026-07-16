export type UserRole = "SUPER_ADMIN" | "HR" | "EMPLOYEE";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type AuthUser = {
  email: string;
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
