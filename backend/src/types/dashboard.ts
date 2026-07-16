import type { EmployeeRecord, EmployeeSummary } from "./employee";

export type AnalyticsBucket = {
  label: string;
  value: number;
};

export type DashboardSummary = {
  cards: {
    activeEmployees: number;
    departments: number;
    inactiveEmployees: number;
    managers: number;
    recentHires: number;
    totalEmployees: number;
  };
  charts: {
    departmentDistribution: AnalyticsBucket[];
    employeesByRole: AnalyticsBucket[];
    employeeStatus: AnalyticsBucket[];
    monthlyJoiningTrend: AnalyticsBucket[];
  };
  recentEmployees: EmployeeRecord[];
};

export type GlobalSearchResult = {
  employees: EmployeeSummary[];
};
