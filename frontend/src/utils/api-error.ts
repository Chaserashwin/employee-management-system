import axios from "axios";

import type { ApiResponse } from "@/types/api";

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? "Request failed. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed. Please try again.";
};
