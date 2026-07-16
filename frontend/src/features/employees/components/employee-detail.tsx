"use client";

import { GitFork, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { ManagerAssignmentDialog } from "@/features/employees/components/manager-assignment-dialog";
import {
  useEmployeeChain,
  useEmployeeReportees,
  useUpdateEmployeeManager,
  useUpdateEmployeeRole,
} from "@/features/employees/hooks/use-employees";
import {
  formatEmployeeDate,
  formatEmployeeSalary,
} from "@/features/employees/utils/employee-format";
import { useAuth } from "@/hooks/use-auth";
import { showToast } from "@/lib/toast";
import type { UserRole } from "@/types/auth";
import type { Employee } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

type EmployeeDetailProps = {
  employee?: Employee;
  isLoading: boolean;
};

export function EmployeeDetail({ employee, isLoading }: EmployeeDetailProps) {
  const { role } = useAuth();
  const [isManagerDialogOpen, setIsManagerDialogOpen] = useState(false);
  const updateManagerMutation = useUpdateEmployeeManager();
  const updateRoleMutation = useUpdateEmployeeRole();
  const chainQuery = useEmployeeChain(employee?.id ?? "", Boolean(employee));
  const reporteesQuery = useEmployeeReportees(
    employee?.id ?? "",
    Boolean(employee && (role === "SUPER_ADMIN" || role === "HR")),
  );
  const canEdit =
    role === "SUPER_ADMIN" || (role === "HR" && employee?.role !== "SUPER_ADMIN");
  const canAssignManager = role === "SUPER_ADMIN";
  const canManageRole = role === "SUPER_ADMIN";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-lg border border-dashed bg-background px-4 py-14 text-center">
        <p className="text-sm font-medium">Employee not found</p>
      </div>
    );
  }

  const fields = [
    ["Employee ID", employee.employeeId],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Department", employee.department],
    ["Designation", employee.designation],
    ["Manager", employee.manager?.name ?? "Unassigned"],
    ["Salary", formatEmployeeSalary(employee.salary)],
    ["Joining Date", formatEmployeeDate(employee.joiningDate)],
    ["Role", employee.role],
    ["Status", employee.status],
  ];

  const handleManagerAssignment = async (managerId: string | null) => {
    try {
      await updateManagerMutation.mutateAsync({
        id: employee.id,
        payload: {
          managerId,
        },
      });
      showToast.success("Manager updated.");
      setIsManagerDialogOpen(false);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  const handleRoleChange = async (nextRole: UserRole) => {
    if (employee.role === nextRole) {
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({
        id: employee.id,
        payload: {
          role: nextRole,
        },
      });
      showToast.success("Employee role updated.");
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <EmployeeAvatar employee={employee} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">{employee.name}</h1>
            <p className="text-sm text-muted-foreground">{employee.designation}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssignManager ? (
            <Button variant="outline" onClick={() => setIsManagerDialogOpen(true)}>
              <GitFork className="size-4" aria-hidden="true" />
              Assign Manager
            </Button>
          ) : null}
          {canEdit ? (
            <Button asChild>
              <Link href={`/employees/${employee.id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg tracking-normal">Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(([label, value]) => (
            <div className="rounded-md border p-3" key={label}>
              <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
              {label === "Status" ? (
                <Badge className="mt-2" variant={value === "ACTIVE" ? "success" : "warning"}>
                  {value}
                </Badge>
              ) : label === "Role" && canManageRole ? (
                <Select
                  className="mt-2"
                  value={employee.role}
                  disabled={updateRoleMutation.isPending}
                  onChange={(event) => void handleRoleChange(event.currentTarget.value as UserRole)}
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="HR">HR</option>
                  <option value="EMPLOYEE">EMPLOYEE</option>
                </Select>
              ) : (
                <p className="mt-2 text-sm font-medium">{value}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Reporting Chain</CardTitle>
          </CardHeader>
          <CardContent>
            {chainQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : chainQuery.data && chainQuery.data.length > 0 ? (
              <div className="space-y-2">
                {chainQuery.data.map((chainEmployee, index) => (
                  <div className="flex items-center gap-3 rounded-md border p-3" key={chainEmployee.id}>
                    <EmployeeAvatar employee={chainEmployee} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{chainEmployee.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {chainEmployee.employeeId} - {chainEmployee.designation}
                      </p>
                    </div>
                    <Badge variant={index === chainQuery.data.length - 1 ? "default" : "muted"}>
                      {index === chainQuery.data.length - 1 ? "Self" : "Manager"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reporting chain available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Reportees</CardTitle>
          </CardHeader>
          <CardContent>
            {reporteesQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : reporteesQuery.data ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Direct</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {reporteesQuery.data.directReportees.length}
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Nested</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {reporteesQuery.data.nestedReportees.length}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reportees are visible to HR and SUPER_ADMIN roles.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ManagerAssignmentDialog
        employee={employee}
        isOpen={isManagerDialogOpen}
        isPending={updateManagerMutation.isPending}
        onAssign={handleManagerAssignment}
        onCancel={() => setIsManagerDialogOpen(false)}
      />
    </div>
  );
}
