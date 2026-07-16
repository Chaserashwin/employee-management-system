import type { RequestHandler } from "express";
import type { ZodError, ZodTypeAny } from "zod";

import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";

const formatValidationError = (error: ZodError) => {
  return error.issues.map((issue) => issue.message).join(" ");
};

export const validateBody =
  (schema: ZodTypeAny): RequestHandler =>
  (request, _response, next) => {
    const validationResult = schema.safeParse(request.body);

    if (!validationResult.success) {
      next(new AppError(formatValidationError(validationResult.error), HTTP_STATUS.BAD_REQUEST));
      return;
    }

    request.body = validationResult.data;
    next();
  };

export const validateBodyOrUploadedFile =
  (schema: ZodTypeAny): RequestHandler =>
  (request, _response, next) => {
    if (request.file && Object.keys(request.body as Record<string, unknown>).length === 0) {
      request.body = {};
      next();
      return;
    }

    validateBody(schema)(request, _response, next);
  };

export const validateQuery =
  (schema: ZodTypeAny): RequestHandler =>
  (request, _response, next) => {
    const validationResult = schema.safeParse(request.query);

    if (!validationResult.success) {
      next(new AppError(formatValidationError(validationResult.error), HTTP_STATUS.BAD_REQUEST));
      return;
    }

    request.query = validationResult.data as typeof request.query;
    next();
  };

export const validateParams =
  (schema: ZodTypeAny): RequestHandler =>
  (request, _response, next) => {
    const validationResult = schema.safeParse(request.params);

    if (!validationResult.success) {
      next(new AppError(formatValidationError(validationResult.error), HTTP_STATUS.BAD_REQUEST));
      return;
    }

    request.params = validationResult.data as typeof request.params;
    next();
  };
