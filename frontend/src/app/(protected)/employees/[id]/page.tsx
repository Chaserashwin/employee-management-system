"use client";

import { useParams } from "next/navigation";

import { RoleGate } from "@/components/layout/role-gate";
import { EmployeeDetail } from "@/features/employees/components/employee-detail";
import { useEmployee } from "@/features/employees/hooks/use-employees";
import { getApiErrorMessage } from "@/utils/api-error";

function EmployeeDetailsContent() {
  const params = useParams<{ id: string }>();
  const employeeQuery = useEmployee(params.id);

  return (
    <div className="space-y-5">
      {employeeQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(employeeQuery.error)}
        </div>
      ) : null}
      <EmployeeDetail employee={employeeQuery.data} isLoading={employeeQuery.isLoading} />
    </div>
  );
}

export default function EmployeeDetailsPage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <EmployeeDetailsContent />
    </RoleGate>
  );
}
