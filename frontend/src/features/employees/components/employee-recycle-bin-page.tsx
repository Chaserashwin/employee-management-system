"use client";

import { Loader2, RotateCcw, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EMPLOYEE_PAGE_SIZES,
  EMPLOYEE_ROLES,
  EMPLOYEE_SORT_FIELDS,
  EMPLOYEE_SORT_ORDERS,
  EMPLOYEE_STATUSES,
} from "@/constants/employee";
import { ConfirmDialog } from "@/features/employees/components/confirm-dialog";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import {
  useDeletedEmployees,
  usePermanentlyDeleteEmployee,
  usePermanentlyDeleteEmployees,
  useRestoreEmployee,
  useRestoreEmployees,
} from "@/features/employees/hooks/use-employees";
import { formatEmployeeDate } from "@/features/employees/utils/employee-format";
import { useDebounce } from "@/hooks/use-debounce";
import { showToast } from "@/lib/toast";
import type { UserRole, UserStatus } from "@/types/auth";
import type { Employee, EmployeeListParams } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

type PendingAction =
  | { employee?: Employee; type: "delete" }
  | { employee?: Employee; type: "restore" }
  | null;

export function EmployeeRecycleBinPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeRole, setEmployeeRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [sortBy, setSortBy] = useState<EmployeeListParams["sortBy"]>("joiningDate");
  const [sortOrder, setSortOrder] = useState<EmployeeListParams["sortOrder"]>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
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
  const deletedEmployeesQuery = useDeletedEmployees(params);
  const restoreEmployeeMutation = useRestoreEmployee();
  const restoreEmployeesMutation = useRestoreEmployees();
  const deleteEmployeeMutation = usePermanentlyDeleteEmployee();
  const deleteEmployeesMutation = usePermanentlyDeleteEmployees();
  const employees = useMemo(
    () => deletedEmployeesQuery.data?.items ?? deletedEmployeesQuery.data?.data ?? [],
    [deletedEmployeesQuery.data],
  );
  const pagination = deletedEmployeesQuery.data?.pagination;
  const selectedEmployeeIds = useMemo(() => [...selectedIds], [selectedIds]);
  const allVisibleSelected =
    employees.length > 0 && employees.every((employee) => selectedIds.has(employee.id));
  const selectedCount = selectedIds.size;
  const isPending =
    restoreEmployeeMutation.isPending ||
    restoreEmployeesMutation.isPending ||
    deleteEmployeeMutation.isPending ||
    deleteEmployeesMutation.isPending;

  useEffect(() => {
    setSelectedIds((currentIds) => {
      const visibleIds = new Set(employees.map((employee) => employee.id));
      const nextIds = new Set([...currentIds].filter((id) => visibleIds.has(id)));

      return nextIds.size === currentIds.size ? currentIds : nextIds;
    });
  }, [employees]);

  const resetPage = () => setPage(1);

  const toggleEmployee = (employeeId: string) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(employeeId)) {
        nextIds.delete(employeeId);
      } else {
        nextIds.add(employeeId);
      }

      return nextIds;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (allVisibleSelected) {
        employees.forEach((employee) => nextIds.delete(employee.id));
      } else {
        employees.forEach((employee) => nextIds.add(employee.id));
      }

      return nextIds;
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    try {
      if (pendingAction.type === "restore") {
        if (pendingAction.employee) {
          await restoreEmployeeMutation.mutateAsync(pendingAction.employee.id);
        } else {
          await restoreEmployeesMutation.mutateAsync({ employeeIds: selectedEmployeeIds });
        }

        showToast.success("Employee records restored.");
      } else if (pendingAction.employee) {
        await deleteEmployeeMutation.mutateAsync(pendingAction.employee.id);
        showToast.success("Employee permanently deleted.");
      } else {
        await deleteEmployeesMutation.mutateAsync({ employeeIds: selectedEmployeeIds });
        showToast.success("Employees permanently deleted.");
      }

      setSelectedIds(new Set());
      setPendingAction(null);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">Recycle Bin</h1>
          <p className="text-sm text-muted-foreground">
            Restore soft-deleted employees or permanently delete records.
          </p>
        </div>
        <Button variant="outline" className="w-full justify-center sm:w-auto" asChild>
          <Link href="/employees">Back to Employees</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
          <div className="space-y-2">
            <Label htmlFor="recycle-search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recycle-search"
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
            <Label htmlFor="recycle-department">Department</Label>
            <Input
              id="recycle-department"
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                resetPage();
              }}
              placeholder="All"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recycle-role">Role</Label>
            <Select
              id="recycle-role"
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
            <Label htmlFor="recycle-status">Status</Label>
            <Select
              id="recycle-status"
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
            <Label htmlFor="recycle-sortBy">Sort By</Label>
            <Select
              id="recycle-sortBy"
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
            <Label htmlFor="recycle-sortOrder">Order</Label>
            <Select
              id="recycle-sortOrder"
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

      {deletedEmployeesQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(deletedEmployeesQuery.error)}
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : "No rows selected"}
        </p>
        <div className="grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center sm:w-auto"
            disabled={selectedCount === 0 || isPending}
            onClick={() => setPendingAction({ type: "restore" })}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restore Selected
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full justify-center sm:w-auto"
            disabled={selectedCount === 0 || isPending}
            onClick={() => setPendingAction({ type: "delete" })}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete Selected
          </Button>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {deletedEmployeesQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-36 w-full" key={index} />
          ))
        ) : employees.length > 0 ? (
          employees.map((employee) => (
            <article className="rounded-lg border bg-background p-3 shadow-sm" key={employee.id}>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(employee.id)}
                  className="mt-1 size-5"
                  onChange={() => toggleEmployee(employee.id)}
                  aria-label={`Select ${employee.name}`}
                />
                <EmployeeAvatar employee={employee} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">{employee.name}</h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {employee.employeeId} - {employee.department}
                      </p>
                    </div>
                    <Badge variant={employee.status === "ACTIVE" ? "success" : "warning"}>
                      {employee.status}
                    </Badge>
                  </div>
                  <p className="mt-2 break-all text-xs text-muted-foreground">{employee.email}</p>
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 border-t pt-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">
                    Deleted At
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {employee.deletedAt ? formatEmployeeDate(employee.deletedAt) : "Unknown"}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => setPendingAction({ employee, type: "restore" })}
                    aria-label="Restore employee"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10"
                    onClick={() => setPendingAction({ employee, type: "delete" })}
                    aria-label="Permanently delete employee"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed bg-background px-4 py-10 text-center text-sm text-muted-foreground">
            No deleted employees found.
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border bg-background lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <Checkbox checked={allVisibleSelected} onChange={toggleAllVisible} />
                </th>
                <th className="px-4 py-3 font-medium">Profile</th>
                <th className="px-4 py-3 font-medium">Employee ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deleted At</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deletedEmployeesQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={9}>
                    <Loader2 className="mx-auto size-5 animate-spin" aria-hidden="true" />
                  </td>
                </tr>
              ) : employees.length > 0 ? (
                employees.map((employee) => (
                  <tr className="align-middle" key={employee.id}>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        aria-label={`Select ${employee.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <EmployeeAvatar employee={employee} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-medium">{employee.employeeId}</td>
                    <td className="px-4 py-3">{employee.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{employee.email}</td>
                    <td className="px-4 py-3">{employee.department}</td>
                    <td className="px-4 py-3">
                      <Badge variant={employee.status === "ACTIVE" ? "success" : "warning"}>
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {employee.deletedAt ? formatEmployeeDate(employee.deletedAt) : "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingAction({ employee, type: "restore" })}
                          aria-label="Restore employee"
                        >
                          <RotateCcw className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingAction({ employee, type: "delete" })}
                          aria-label="Permanently delete employee"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-muted-foreground" colSpan={9}>
                    No deleted employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination
            ? `${pagination.totalRecords} records, page ${pagination.currentPage} of ${pagination.totalPages}`
            : "Loading records"}
        </p>
        <div className="grid w-full grid-cols-[6rem_1fr_1fr] items-center gap-2 sm:flex sm:w-auto">
          <Select
            value={String(limit)}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              resetPage();
            }}
            className="h-10 w-full sm:h-9 sm:w-24"
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
            className="w-full sm:w-auto"
            disabled={!pagination?.hasPrevious || deletedEmployeesQuery.isFetching}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!pagination?.hasNext || deletedEmployeesQuery.isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            {deletedEmployeesQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.type === "restore" ? "Restore employee records?" : "Permanently delete?"}
        description={
          pendingAction?.type === "restore"
            ? pendingAction.employee
              ? `${pendingAction.employee.name} will be restored to employee lists and hierarchy views.`
              : `${selectedCount} employee records will be restored to active lists.`
            : pendingAction?.employee
              ? `${pendingAction.employee.name} will be permanently removed. This cannot be undone.`
              : `${selectedCount} employee records will be permanently removed. This cannot be undone.`
        }
        confirmLabel={pendingAction?.type === "restore" ? "Restore" : "Delete Permanently"}
        confirmVariant={pendingAction?.type === "restore" ? "default" : "destructive"}
        isPending={isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void handleConfirmAction()}
      />
    </div>
  );
}
