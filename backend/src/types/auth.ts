import type { UserRole, UserStatus } from "../constants/user";

export type AuthTokenPayload = {
  email: string;
  id: string;
  role: UserRole;
};

export type AuthenticatedUser = AuthTokenPayload;

export type SafeUser = {
  email: string;
  id: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export type LoginResult = {
  token: string;
  user: SafeUser;
};
