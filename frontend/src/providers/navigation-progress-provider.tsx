"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type NavigationProgressContextValue = {
  finishNavigation: () => void;
  isNavigating: boolean;
  startNavigation: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextValue | undefined>(
  undefined,
);

type NavigationProgressProviderProps = {
  children: ReactNode;
};

export function NavigationProgressProvider({ children }: NavigationProgressProviderProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<number | null>(null);
  const previousPathnameRef = useRef(pathname);

  const clearTimers = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }

    if (completeTimeoutRef.current) {
      window.clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }
  }, []);

  const finishNavigation = useCallback(() => {
    clearTimers();
    setIsNavigating(false);
  }, [clearTimers]);

  const startNavigation = useCallback(() => {
    clearTimers();
    setIsNavigating(true);
    fallbackTimeoutRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      fallbackTimeoutRef.current = null;
    }, 15000);
  }, [clearTimers]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;

    if (!isNavigating) {
      return;
    }

    completeTimeoutRef.current = window.setTimeout(() => {
      setIsNavigating(false);
      completeTimeoutRef.current = null;
    }, 250);

    return () => {
      if (completeTimeoutRef.current) {
        window.clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = null;
      }
    };
  }, [isNavigating, pathname]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo<NavigationProgressContextValue>(
    () => ({
      finishNavigation,
      isNavigating,
      startNavigation,
    }),
    [finishNavigation, isNavigating, startNavigation],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 z-50 h-1 bg-primary transition-transform duration-300 ${
          isNavigating ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);

  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider.");
  }

  return context;
}
