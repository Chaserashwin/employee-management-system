import type { ApiResponse } from "../types/api";

export const createSuccessResponse = <TData>(
  data: TData,
  message = "Success.",
): ApiResponse<TData> => ({
  data,
  message,
  success: true,
});

export const createErrorResponse = (message: string, error?: unknown): ApiResponse<null> => ({
  data: null,
  message,
  success: false,
  ...(error === undefined ? {} : { error }),
});
