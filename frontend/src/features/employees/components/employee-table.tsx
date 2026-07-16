"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { formatEmployeeDate } from "@/features/employees/utils/employee-format";
import type { UserRole, UserStatus } from "@/types/auth";
import type { Employee } from "@/types/employee";

type EmployeeTableProps = {
  currentUserRole: UserRole | null;
  employees: Employee[];
  isLoading: boolean;
  onDelete: (employee: Employee) => void;
  onStatusChange: (employee: Employee, status: UserStatus) => void;
  pendingStatusEmployeeId?: string;
};

export function EmployeeTable({
  currentUserRole,
  employees,
  isLoading,
  onDelete,
  onStatusChange,
  pendingStatusEmployeeId,
}: EmployeeTableProps) {
  const canEdit = currentUserRole === "SUPER_ADMIN" || currentUserRole === "HR";
  const canDelete = currentUserRole === "SUPER_ADMIN";
  const canChangeStatus = currentUserRole === "SUPER_ADMIN" || currentUserRole === "HR";

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg border bg-background p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-14 w-full" key={index} />
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-background px-4 py-14 text-center">
        <p className="text-sm font-medium">No employees found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust search or filters, or create a new employee.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Profile</th>
              <th className="px-4 py-3 font-medium">Employee ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Designation</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joining Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((employee) => (
              <tr className="align-middle" key={employee.id}>
                <td className="px-4 py-3">
                  <EmployeeAvatar employee={employee} size="sm" />
                </td>
                <td className="px-4 py-3 font-medium">{employee.employeeId}</td>
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{employee.email}</td>
                <td className="px-4 py-3">{employee.department}</td>
                <td className="px-4 py-3">{employee.designation}</td>
                <td className="px-4 py-3">
                  <Badge variant="muted">{employee.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  {canChangeStatus ? (
                    <Select
                      className="h-8 min-w-28"
                      value={employee.status}
                      disabled={pendingStatusEmployeeId === employee.id}
                      onChange={(event) =>
                        onStatusChange(employee, event.currentTarget.value as UserStatus)
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </Select>
                  ) : (
                    <Badge variant={employee.status === "ACTIVE" ? "success" : "warning"}>
                      {employee.status}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">{formatEmployeeDate(employee.joiningDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild aria-label="View employee">
                      <Link href={`/employees/${employee.id}`}>
                        <Eye className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    {canEdit && !(currentUserRole === "HR" && employee.role === "SUPER_ADMIN") ? (
                      <Button variant="ghost" size="icon" asChild aria-label="Edit employee">
                        <Link href={`/employees/${employee.id}/edit`}>
                          <Pencil className="size-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(employee)}
                        aria-label="Delete employee"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
