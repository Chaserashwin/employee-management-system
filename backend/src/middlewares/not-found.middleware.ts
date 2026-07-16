import type { RequestHandler } from "express";

import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new AppError(`Route ${request.originalUrl} not found.`, HTTP_STATUS.NOT_FOUND));
};
