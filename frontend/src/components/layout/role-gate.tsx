"use client";

import type { ReactNode } from "react";

import { AccessDenied } from "@/components/common/access-denied";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { isLoading, role } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }

  return children;
}
