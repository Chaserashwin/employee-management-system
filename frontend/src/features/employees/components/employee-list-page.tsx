"use client";

import { Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  EMPLOYEE_PAGE_SIZES,
  EMPLOYEE_ROLES,
  EMPLOYEE_SORT_FIELDS,
  EMPLOYEE_SORT_ORDERS,
  EMPLOYEE_STATUSES,
} from "@/constants/employee";
import { ConfirmDialog } from "@/features/employees/components/confirm-dialog";
import { EmployeeTable } from "@/features/employees/components/employee-table";
import {
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployeeStatus,
} from "@/features/employees/hooks/use-employees";
import { showToast } from "@/lib/toast";
import { getApiErrorMessage } from "@/utils/api-error";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import type { UserRole, UserStatus } from "@/types/auth";
import type { Employee, EmployeeListParams } from "@/types/employee";

export function EmployeeListPage() {
  const { role } = useAuth();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeRole, setEmployeeRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [sortBy, setSortBy] = useState<EmployeeListParams["sortBy"]>("joiningDate");
  const [sortOrder, setSortOrder] = useState<EmployeeListParams["sortOrder"]>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const debouncedSearch = useDebounce(search);

  const params = useMemo<EmployeeListParams>(
    () => ({
      department: department || undefined,
      limit,
      page,
      role: employeeRole || undefined,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: status || undefined,
    }),
    [debouncedSearch, department, employeeRole, limit, page, sortBy, sortOrder, status],
  );

  const employeesQuery = useEmployees(params);
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateStatusMutation = useUpdateEmployeeStatus();

  const canCreate = role === "SUPER_ADMIN" || role === "HR";
  const employees = employeesQuery.data?.data ?? [];
  const pagination = employeesQuery.data?.pagination;

  const resetPage = () => setPage(1);

  const handleDelete = async () => {
    if (!employeeToDelete) {
      return;
    }

    try {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
      showToast.success("Employee deleted.");
      setEmployeeToDelete(null);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  const handleStatusChange = async (employee: Employee, nextStatus: UserStatus) => {
    if (employee.status === nextStatus) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: employee.id,
        payload: {
          status: nextStatus,
        },
      });
      showToast.success("Employee status updated.");
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage employee records, status, and profile details.
          </p>
        </div>
        {canCreate ? (
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="size-4" aria-hidden="true" />
              New Employee
            </Link>
          </Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
                className="pl-9"
                placeholder="Name or email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                resetPage();
              }}
              placeholder="All"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={employeeRole}
              onChange={(event) => {
                setEmployeeRole(event.target.value as UserRole | "");
                resetPage();
              }}
            >
              <option value="">All</option>
              {EMPLOYEE_ROLES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | "");
                resetPage();
              }}
            >
              <option value="">All</option>
              {EMPLOYEE_STATUSES.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              id="sortBy"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as EmployeeListParams["sortBy"]);
                resetPage();
              }}
            >
              {EMPLOYEE_SORT_FIELDS.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Order</Label>
            <Select
              id="sortOrder"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as EmployeeListParams["sortOrder"]);
                resetPage();
              }}
            >
              {EMPLOYEE_SORT_ORDERS.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {employeesQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(employeesQuery.error)}
        </div>
      ) : null}

      <EmployeeTable
        currentUserRole={role}
        employees={employees}
        isLoading={employeesQuery.isLoading}
        onDelete={setEmployeeToDelete}
        onStatusChange={handleStatusChange}
        pendingStatusEmployeeId={updateStatusMutation.variables?.id}
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination
            ? `${pagination.totalRecords} records, page ${pagination.currentPage} of ${pagination.totalPages}`
            : "Loading records"}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              resetPage();
            }}
            className="h-9 w-24"
            aria-label="Page size"
          >
            {EMPLOYEE_PAGE_SIZES.map((pageSize) => (
              <option value={pageSize} key={pageSize}>
                {pageSize}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || employeesQuery.isFetching}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={
              !pagination || page >= pagination.totalPages || employeesQuery.isFetching
            }
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            {employeesQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(employeeToDelete)}
        title="Delete employee?"
        description={
          employeeToDelete
            ? `${employeeToDelete.name} will be hidden from employee lists. This does not permanently remove the record.`
            : ""
        }
        isPending={deleteEmployeeMutation.isPending}
        onCancel={() => setEmployeeToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
