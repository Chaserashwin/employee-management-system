import type { ErrorRequestHandler } from "express";
import multer from "multer";

import { env } from "../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";
import { serializeError } from "../utils/error";
import { logger } from "../utils/logger";
import { createErrorResponse } from "../utils/response";

type BodyParserError = SyntaxError & {
  status?: number;
  type?: string;
};

const isBodyParserError = (error: unknown): error is BodyParserError => {
  return error instanceof SyntaxError && (error as BodyParserError).status === HTTP_STATUS.BAD_REQUEST;
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const isAppError = error instanceof AppError;
  const isParseError = isBodyParserError(error);
  const isUploadError = error instanceof multer.MulterError;
  const statusCode = isAppError
    ? error.statusCode
    : isParseError
      ? HTTP_STATUS.BAD_REQUEST
      : isUploadError
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = isAppError
    ? error.message
    : isParseError
      ? "Invalid JSON payload."
      : isUploadError
        ? error.message
        : "Internal server error";

  if ((!isAppError || !error.isOperational) && !isParseError && !isUploadError) {
    logger.error(message, error);
  }

  response
    .status(statusCode)
    .json(createErrorResponse(message, env.nodeEnv === "production" ? undefined : serializeError(error)));
};
