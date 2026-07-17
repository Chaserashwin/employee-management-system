"use client";

import type { ReactNode } from "react";

import { AppToaster } from "@/components/common/app-toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { NavigationProgressProvider } from "@/providers/navigation-progress-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <NavigationProgressProvider>
          <AuthProvider>
            {children}
            <AppToaster />
          </AuthProvider>
        </NavigationProgressProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
