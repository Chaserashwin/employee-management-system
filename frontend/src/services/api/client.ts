import axios, { type AxiosError } from "axios";

import { env } from "@/lib/env";
import { authTokenStorage } from "@/services/auth-token";

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | undefined;

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

const isLoginRequest = (url: string | undefined) => {
  return Boolean(url?.includes("/api/auth/login"));
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler) => {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined;
    }
  };
};

apiClient.interceptors.request.use((config) => {
  const token = authTokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isLoginRequest(error.config?.url)) {
      authTokenStorage.clearToken();
      unauthorizedHandler?.();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  },
);
