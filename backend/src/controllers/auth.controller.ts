import { HTTP_STATUS } from "../constants/http-status";
import { getCurrentUser, loginUser } from "../services/auth.service";
import { AppError } from "../utils/app-error";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";

export const login = asyncHandler(async (request, response) => {
  const loginResult = await loginUser(request.body);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(loginResult, "Login successful."));
});

export const logout = asyncHandler(async (_request, response) => {
  response.status(HTTP_STATUS.OK).json(createSuccessResponse(null, "Logout successful."));
});

export const me = asyncHandler(async (request, response) => {
  if (!request.user) {
    throw new AppError("Authentication is required.", HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await getCurrentUser(request.user.id);

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(user, "Current user retrieved."));
});
