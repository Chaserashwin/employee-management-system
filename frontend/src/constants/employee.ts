export const EMPLOYEE_ROLES = ["SUPER_ADMIN", "HR", "EMPLOYEE"] as const;

export const EMPLOYEE_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export const EMPLOYEE_SORT_FIELDS = [
  {
    label: "Joining Date",
    value: "joiningDate",
  },
  {
    label: "Employee Name",
    value: "name",
  },
] as const;

export const EMPLOYEE_SORT_ORDERS = [
  {
    label: "Descending",
    value: "desc",
  },
  {
    label: "Ascending",
    value: "asc",
  },
] as const;

export const EMPLOYEE_PAGE_SIZES = [5, 10, 20, 50] as const;
