import type { RequestHandler } from "express";

import { HTTP_STATUS } from "../constants/http-status";
import {
  hasPermission,
  PERMISSIONS,
  type Permission,
} from "../constants/permissions";
import type { UserRole } from "../constants/user";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { verifyAuthToken } from "../utils/jwt";

const USER_ROLES: UserRole[] = ["SUPER_ADMIN", "HR", "EMPLOYEE"];

const isUserRole = (value: Permission | UserRole): value is UserRole => {
  return USER_ROLES.includes(value as UserRole);
};

const parseBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    return undefined;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return undefined;
  }

  return token;
};

export const authenticate = asyncHandler(async (request, _response, next) => {
  const token = parseBearerToken(request.headers.authorization);

  if (!token) {
    throw new AppError("Authentication token is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  const decodedToken = verifyAuthToken(token);
  const user = await UserModel.findById(decodedToken.id).exec();

  if (!user) {
    throw new AppError("Authenticated user no longer exists.", HTTP_STATUS.UNAUTHORIZED);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("User account is inactive.", HTTP_STATUS.FORBIDDEN);
  }

  request.user = {
    email: user.email,
    id: user.id,
    role: user.role,
  };

  next();
});

export const authorize =
  (...requirements: Array<Permission | UserRole>): RequestHandler =>
  (request, _response, next) => {
    if (!request.user) {
      next(new AppError("Authentication is required.", HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const user = request.user;
    const isAuthorized =
      requirements.length === 0 ||
      requirements.some((requirement) =>
        isUserRole(requirement)
          ? user.role === requirement
          : hasPermission(user.role, requirement),
      );

    if (!isAuthorized) {
      next(new AppError("You are not authorized to access this resource.", HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };

export { PERMISSIONS };
