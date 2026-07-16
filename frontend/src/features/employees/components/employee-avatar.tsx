import { UserRound } from "lucide-react";

import { getEmployeeImageUrl } from "@/features/employees/utils/employee-format";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types/employee";

type EmployeeAvatarProps = {
  employee: Pick<Employee, "name" | "profileImage">;
  size?: "sm" | "md" | "lg";
};

export function EmployeeAvatar({ employee, size = "md" }: EmployeeAvatarProps) {
  const imageUrl = getEmployeeImageUrl(employee);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground",
        size === "sm" && "size-9",
        size === "md" && "size-11",
        size === "lg" && "size-20",
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={employee.name} className="size-full object-cover" />
      ) : (
        <UserRound className={cn(size === "lg" ? "size-8" : "size-5")} aria-hidden="true" />
      )}
    </div>
  );
}
