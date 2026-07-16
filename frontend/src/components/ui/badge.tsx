import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "muted" | "success" | "warning";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-primary/20 bg-primary/10 text-primary",
        variant === "muted" && "border-border bg-muted text-muted-foreground",
        variant === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        variant === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-700",
        className,
      )}
      {...props}
    />
  );
}
