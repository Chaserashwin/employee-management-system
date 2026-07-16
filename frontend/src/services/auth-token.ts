const AUTH_TOKEN_STORAGE_KEY = "ems.auth.token";

const isBrowser = () => typeof window !== "undefined";

export const authTokenStorage = {
  getToken() {
    if (!isBrowser()) {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },
  setToken(token: string) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  },
  clearToken() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },
};
