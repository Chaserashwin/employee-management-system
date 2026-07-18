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
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <EmployeeAvatar employee={employee} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-normal sm:text-2xl">
            {employee.name}
          </h1>
          <p className="text-sm text-muted-foreground">{employee.designation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="muted">{user?.role ?? employee.role}</Badge>
            <Badge variant={employee.status === "ACTIVE" ? "success" : "warning"}>
              {employee.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base tracking-normal sm:text-lg">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 sm:gap-4 sm:p-6 sm:pt-0">
            {fields.map(([label, value]) => (
              <div className="rounded-md border p-3" key={label}>
                <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                <p className="mt-2 break-words text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-5">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base tracking-normal sm:text-lg">Reporting Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base tracking-normal sm:text-lg">
                <KeyRound className="size-4" aria-hidden="true" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" autoComplete="current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" />
              </div>
              <Button type="button" className="w-full sm:w-auto" disabled>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
