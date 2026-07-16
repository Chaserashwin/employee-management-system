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
