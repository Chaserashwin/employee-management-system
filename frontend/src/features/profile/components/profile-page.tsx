"use client";

import { KeyRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { useEmployeeChain, useMyEmployeeProfile } from "@/features/employees/hooks/use-employees";
import {
  formatEmployeeDate,
  formatEmployeeSalary,
} from "@/features/employees/utils/employee-format";
import { useAuth } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/utils/api-error";

export function ProfilePage() {
  const { user } = useAuth();
  const profileQuery = useMyEmployeeProfile();
  const employee = profileQuery.data;
  const chainQuery = useEmployeeChain(employee?.id ?? "", Boolean(employee));

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {getApiErrorMessage(profileQuery.error)}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-lg border border-dashed bg-background p-8 text-center">
        <p className="text-sm font-medium">Profile not found</p>
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
    ["Joining Date", formatEmployeeDate(employee.joiningDate)],
    ["Salary", formatEmployeeSalary(employee.salary)],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border bg-background p-5 sm:flex-row sm:items-center">
        <EmployeeAvatar employee={employee} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-normal">{employee.name}</h1>
          <p className="text-sm text-muted-foreground">{employee.designation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="muted">{user?.role ?? employee.role}</Badge>
            <Badge variant={employee.status === "ACTIVE" ? "success" : "warning"}>
              {employee.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div className="rounded-md border p-3" key={label}>
                <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                <p className="mt-2 break-words text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg tracking-normal">Reporting Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chainQuery.isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : chainQuery.data && chainQuery.data.length > 0 ? (
                chainQuery.data.map((item) => (
                  <div className="flex items-center gap-3 rounded-md border p-3" key={item.id}>
                    <EmployeeAvatar employee={item} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.designation}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reporting chain available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg tracking-normal">
                <KeyRound className="size-4" aria-hidden="true" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" autoComplete="current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" />
              </div>
              <Button type="button" disabled>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
