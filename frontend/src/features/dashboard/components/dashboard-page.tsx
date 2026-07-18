"use client";

import { Building2, GitFork, Plus, UserRound, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { formatEmployeeDate } from "@/features/employees/utils/employee-format";
import { DashboardChart } from "@/features/dashboard/components/dashboard-chart";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { getApiErrorMessage } from "@/utils/api-error";

const cardConfig = [
  ["Total Employees", "totalEmployees", Users],
  ["Active Employees", "activeEmployees", UserRound],
  ["Inactive Employees", "inactiveEmployees", UserRound],
  ["Departments", "departments", Building2],
  ["Managers", "managers", GitFork],
  ["Recent Hires", "recentHires", Plus],
] as const;

const quickActions = [
  { href: "/employees/new", label: "Add Employee", icon: Plus },
  { href: "/employees", label: "Employee List", icon: Users },
  { href: "/organization", label: "Organization Tree", icon: GitFork },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function DashboardPage() {
  const dashboardQuery = useDashboardSummary();
  const dashboard = dashboardQuery.data;
  const { prefetchEmployeeRoute, prefetchRoute, startRouteNavigation } = useRoutePrefetch();
  const recentEmployees = dashboard?.recentEmployees ?? [];
  const mobileRecentEmployees = recentEmployees.slice(0, 3);

  const renderRecentEmployee = (employee: (typeof recentEmployees)[number]) => (
    <Link
      className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
      href={`/employees/${employee.id}`}
      key={employee.id}
      onClick={() => startRouteNavigation(`/employees/${employee.id}`)}
      onFocus={() => prefetchEmployeeRoute(employee, `/employees/${employee.id}`)}
      onMouseEnter={() => prefetchEmployeeRoute(employee, `/employees/${employee.id}`)}
    >
      <EmployeeAvatar employee={employee} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{employee.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {employee.employeeId} - {employee.department}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <Badge variant="muted">{employee.role}</Badge>
        <span className="mt-1 block text-xs text-muted-foreground">
          {formatEmployeeDate(employee.joiningDate)}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-normal sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Workforce overview, trends, and quick access to common EMS workflows.
        </p>
      </div>

      {dashboardQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(dashboardQuery.error)}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cardConfig.map(([title, key, Icon]) => (
          <Card key={key}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex min-h-20 items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
                  {dashboardQuery.isLoading ? (
                    <Skeleton className="mt-3 h-7 w-14 sm:h-8 sm:w-16" />
                  ) : (
                    <p className="mt-2 text-2xl font-semibold sm:text-3xl">
                      {dashboard?.cards[key] ?? 0}
                    </p>
                  )}
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:size-10">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-4">
        <div className="min-w-0 max-w-[calc(100vw-1.5rem)] space-y-4 sm:max-w-none sm:space-y-5 xl:col-span-3">
          <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-2">
            <DashboardChart
              title="Department Distribution"
              type="bar"
              data={dashboard?.charts.departmentDistribution ?? []}
            />
            <DashboardChart
              title="Employees by Role"
              type="pie"
              data={dashboard?.charts.employeesByRole ?? []}
            />
            <DashboardChart
              title="Monthly Joining Trend"
              type="line"
              data={dashboard?.charts.monthlyJoiningTrend ?? []}
            />
            <DashboardChart
              title="Employee Status"
              type="pie"
              data={dashboard?.charts.employeeStatus ?? []}
            />
          </div>
        </div>

        <div className="min-w-0 max-w-[calc(100vw-1.5rem)] space-y-4 sm:max-w-none sm:space-y-5">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base tracking-normal">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 p-4 pt-0 sm:p-6 sm:pt-0">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button
                    variant="outline"
                    className="h-10 justify-start sm:h-9"
                    asChild
                    key={action.href}
                  >
                    <Link
                      href={action.href}
                      onClick={() => startRouteNavigation(action.href)}
                      onFocus={() => prefetchRoute(action.href)}
                      onMouseEnter={() => prefetchRoute(action.href)}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base tracking-normal">Recent Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
              {dashboardQuery.isLoading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : recentEmployees.length > 0 ? (
                <>
                  <div className="space-y-3 sm:hidden">
                    {mobileRecentEmployees.map(renderRecentEmployee)}
                    {recentEmployees.length > 3 ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link
                          href="/employees"
                          onClick={() => startRouteNavigation("/employees")}
                          onFocus={() => prefetchRoute("/employees")}
                          onMouseEnter={() => prefetchRoute("/employees")}
                        >
                          <Users className="size-4" aria-hidden="true" />
                          View All
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                  <div className="hidden space-y-3 sm:block">
                    {recentEmployees.map(renderRecentEmployee)}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No recent employees found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
