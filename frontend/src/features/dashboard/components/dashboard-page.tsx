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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Workforce overview, trends, and quick access to common EMS workflows.
        </p>
      </div>

      {dashboardQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(dashboardQuery.error)}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cardConfig.map(([title, key, Icon]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
                  {dashboardQuery.isLoading ? (
                    <Skeleton className="mt-3 h-8 w-16" />
                  ) : (
                    <p className="mt-2 text-3xl font-semibold">{dashboard?.cards[key] ?? 0}</p>
                  )}
                </div>
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <div className="space-y-5 xl:col-span-3">
          <div className="grid gap-5 lg:grid-cols-2">
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

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base tracking-normal">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button variant="outline" className="justify-start" asChild key={action.href}>
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
            <CardHeader>
              <CardTitle className="text-base tracking-normal">Recent Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardQuery.isLoading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : dashboard && dashboard.recentEmployees.length > 0 ? (
                dashboard.recentEmployees.map((employee) => (
                  <Link
                    className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
                    href={`/employees/${employee.id}`}
                    key={employee.id}
                    onClick={() => startRouteNavigation(`/employees/${employee.id}`)}
                    onFocus={() => prefetchEmployeeRoute(employee, `/employees/${employee.id}`)}
                    onMouseEnter={() =>
                      prefetchEmployeeRoute(employee, `/employees/${employee.id}`)
                    }
                  >
                    <EmployeeAvatar employee={employee} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{employee.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {employee.employeeId} - {employee.department}
                      </span>
                    </span>
                    <span className="text-right">
                      <Badge variant="muted">{employee.role}</Badge>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatEmployeeDate(employee.joiningDate)}
                      </span>
                    </span>
                  </Link>
                ))
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
