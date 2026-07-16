import type { RequestHandler } from "express";

import { HTTP_STATUS } from "../constants/http-status";
import type { UserRole } from "../constants/user";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { verifyAuthToken } from "../utils/jwt";

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
  (...roles: UserRole[]): RequestHandler =>
  (request, _response, next) => {
    if (!request.user) {
      next(new AppError("Authentication is required.", HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    if (roles.length > 0 && !roles.includes(request.user.role)) {
      next(new AppError("You are not authorized to access this resource.", HTTP_STATUS.FORBIDDEN));
      return;
    }

    next();
  };
