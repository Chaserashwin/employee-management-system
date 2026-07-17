"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { showToast } from "@/lib/toast";

export function AccessDenied() {
  const router = useRouter();
  const { isLoading, role } = useAuth();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (isLoading || role !== "EMPLOYEE") {
      return;
    }

    if (!hasShownToast.current) {
      showToast.info("You don't have permission to access that page.");
      hasShownToast.current = true;
    }

    router.replace("/profile");
  }, [isLoading, role, router]);

  if (isLoading || role === "EMPLOYEE") {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="rounded-lg border bg-background p-6">
      <h1 className="text-lg font-semibold">Access denied</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
