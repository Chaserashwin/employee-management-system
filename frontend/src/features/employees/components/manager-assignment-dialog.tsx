"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { useManagerCandidates } from "@/features/employees/hooks/use-employees";
import type { Employee, EmployeeSummary } from "@/types/employee";

type ManagerAssignmentDialogProps = {
  employee: Employee;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onAssign: (managerId: string | null) => void;
};

export function ManagerAssignmentDialog({
  employee,
  isOpen,
  isPending = false,
  onAssign,
  onCancel,
}: ManagerAssignmentDialogProps) {
  const [search, setSearch] = useState("");
  const candidatesQuery = useManagerCandidates(employee.id, isOpen);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return candidatesQuery.data ?? [];
    }

    return (candidatesQuery.data ?? []).filter((candidate) =>
      [candidate.name, candidate.employeeId, candidate.department, candidate.designation]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [candidatesQuery.data, search]);

  if (!isOpen) {
    return null;
  }

  const renderCandidate = (candidate: EmployeeSummary) => (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      key={candidate.id}
      disabled={isPending}
      onClick={() => onAssign(candidate.id)}
    >
      <EmployeeAvatar employee={candidate} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{candidate.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {candidate.employeeId} - {candidate.designation}
        </span>
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-lg border bg-background p-5 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manager-dialog-title"
      >
        <div className="space-y-1">
          <h2 id="manager-dialog-title" className="text-base font-semibold">
            Assign manager
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose an active employee who will manage {employee.name}.
          </p>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Search candidates"
            aria-label="Search manager candidates"
          />
        </div>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {candidatesQuery.isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : filteredCandidates.length > 0 ? (
            filteredCandidates.map(renderCandidate)
          ) : (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No eligible managers found.
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || !employee.manager}
            onClick={() => onAssign(null)}
          >
            Clear Manager
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
