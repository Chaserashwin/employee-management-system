"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/features/search/hooks/use-global-search";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";

export function GlobalSearch() {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 250);
  const searchQuery = useGlobalSearch(debouncedQuery, role === "SUPER_ADMIN" || role === "HR");
  const employees = searchQuery.data?.employees ?? [];

  if (role === "EMPLOYEE") {
    return null;
  }

  return (
    <div className="relative hidden w-full max-w-md md:block">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
        className="pl-9"
        placeholder="Search employees"
        aria-label="Global employee search"
      />

      {isFocused && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border bg-background shadow-lg">
          {searchQuery.isLoading ? (
            <p className="p-3 text-sm text-muted-foreground">Searching...</p>
          ) : employees.length > 0 ? (
            <div className="max-h-80 overflow-y-auto p-1">
              {employees.map((employee) => (
                <Link
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                  href={`/employees/${employee.id}`}
                  key={employee.id}
                  onClick={() => setQuery("")}
                >
                  <span className="block font-medium">{employee.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {employee.employeeId} - {employee.email} - {employee.department}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-3 text-sm text-muted-foreground">No employees found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
