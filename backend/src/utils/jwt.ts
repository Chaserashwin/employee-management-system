import jwt, { JsonWebTokenError, TokenExpiredError, type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import type { AuthTokenPayload } from "../types/auth";
import { AppError } from "./app-error";

const JWT_EXPIRES_IN: SignOptions["expiresIn"] = "7d";

const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new AppError("JWT secret is not configured.", HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }

  return env.jwtSecret;
};

const isAuthTokenPayload = (payload: unknown): payload is AuthTokenPayload => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<AuthTokenPayload>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.role === "string"
  );
};

export const signAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  try {
    const decodedToken = jwt.verify(token, getJwtSecret());

    if (!isAuthTokenPayload(decodedToken)) {
      throw new AppError("Invalid authentication token.", HTTP_STATUS.UNAUTHORIZED);
    }

    return decodedToken;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof TokenExpiredError) {
      throw new AppError("Authentication token has expired.", HTTP_STATUS.UNAUTHORIZED);
    }

    if (error instanceof JsonWebTokenError) {
      throw new AppError("Invalid authentication token.", HTTP_STATUS.UNAUTHORIZED);
    }

    throw error;
  }
};
