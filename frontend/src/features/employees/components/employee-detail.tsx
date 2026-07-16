"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import {
  formatEmployeeDate,
  formatEmployeeSalary,
} from "@/features/employees/utils/employee-format";
import { useAuth } from "@/hooks/use-auth";
import type { Employee } from "@/types/employee";

type EmployeeDetailProps = {
  employee?: Employee;
  isLoading: boolean;
};

export function EmployeeDetail({ employee, isLoading }: EmployeeDetailProps) {
  const { role } = useAuth();
  const canEdit = role === "SUPER_ADMIN" || role === "HR";

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
    ["Salary", formatEmployeeSalary(employee.salary)],
    ["Joining Date", formatEmployeeDate(employee.joiningDate)],
    ["Role", employee.role],
    ["Status", employee.status],
  ];

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
        {canEdit ? (
          <Button asChild>
            <Link href={`/employees/${employee.id}/edit`}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
        ) : null}
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
              ) : (
                <p className="mt-2 text-sm font-medium">{value}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
