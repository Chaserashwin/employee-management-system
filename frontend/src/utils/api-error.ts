import axios from "axios";

import type { ApiResponse } from "@/types/api";

type ApiErrorBody = ApiResponse<unknown> & {
  error?: {
    message?: string;
    name?: string;
  };
};

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("API request failed.", {
        code: error.code,
        data: error.response?.data,
        message: error.message,
        method: error.config?.method,
        status: error.response?.status,
        url: error.config?.url,
      });
    }

    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }

    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check backend and database connectivity.";
    }

    if (!error.response) {
      return "Network error. Please check that the backend is running and reachable.";
    }

    return `Request failed with status ${error.response.status}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed. Please try again.";
};
