import type { ErrorRequestHandler } from "express";

import { env } from "../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";
import { serializeError } from "../utils/error";
import { logger } from "../utils/logger";
import { createErrorResponse } from "../utils/response";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = isAppError ? error.message : "Internal server error";

  if (!isAppError || !error.isOperational) {
    logger.error(message, error);
  }

  response
    .status(statusCode)
    .json(createErrorResponse(message, env.nodeEnv === "production" ? undefined : serializeError(error)));
};
