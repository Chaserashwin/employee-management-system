import type { UserRole } from "@/types/auth";

export const getPostLoginPath = (role: UserRole) => {
  return role === "EMPLOYEE" ? "/profile" : "/dashboard";
};
