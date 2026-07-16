import {
  getDistribution,
  getEmployeeDashboardCounts,
  getMonthlyJoiningTrend,
  getRecentEmployees,
} from "../repositories/dashboard.repository";
import { findAllEmployees, searchEmployees } from "../repositories/employee.repository";
import type { DashboardSummary, GlobalSearchResult } from "../types/dashboard";
import type { EmployeeDocument } from "../models/employee.model";

const toSummary = (employee: EmployeeDocument) => ({
  department: employee.department,
  designation: employee.designation,
  email: employee.email,
  employeeId: employee.employeeId,
  id: employee.id as string,
  joiningDate: employee.joiningDate,
  name: employee.name,
  phone: employee.phone,
  profileImage: employee.profileImage,
  role: employee.role,
  status: employee.status,
});

const toRecord = (employee: EmployeeDocument, employeeMap: Map<string, EmployeeDocument>) => ({
  ...toSummary(employee),
  createdAt: employee.createdAt,
  deleted: employee.deleted,
  manager: employee.manager
    ? employeeMap.get(String(employee.manager))
      ? toSummary(employeeMap.get(String(employee.manager)) as EmployeeDocument)
      : null
    : null,
  salary: employee.salary,
  updatedAt: employee.updatedAt,
});

const toBuckets = (values: Array<{ _id: string; value: number }>) =>
  values.map((item) => ({
    label: item._id || "Unassigned",
    value: item.value,
  }));

const getMonthLabel = (year: number, month: number) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, month - 1, 1));
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [
    cards,
    departmentDistribution,
    employeesByRole,
    employeeStatus,
    monthlyJoiningTrend,
    recentEmployees,
    allEmployees,
  ] = await Promise.all([
    getEmployeeDashboardCounts(),
    getDistribution("department"),
    getDistribution("role"),
    getDistribution("status"),
    getMonthlyJoiningTrend(),
    getRecentEmployees(),
    findAllEmployees(),
  ]);
  const employeeMap = new Map(allEmployees.map((employee) => [employee.id as string, employee]));

  return {
    cards,
    charts: {
      departmentDistribution: toBuckets(departmentDistribution),
      employeesByRole: toBuckets(employeesByRole),
      employeeStatus: toBuckets(employeeStatus),
      monthlyJoiningTrend: monthlyJoiningTrend.map((item) => ({
        label: getMonthLabel(item._id.year, item._id.month),
        value: item.value,
      })),
    },
    recentEmployees: recentEmployees.map((employee) => toRecord(employee, employeeMap)),
  };
};

export const getGlobalSearchResults = async (query: string): Promise<GlobalSearchResult> => {
  if (!query.trim()) {
    return {
      employees: [],
    };
  }

  const employees = await searchEmployees(query.trim(), 8);

  return {
    employees: employees.map(toSummary),
  };
};
