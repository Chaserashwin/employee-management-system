import { env } from "@/lib/env";
import type { Employee } from "@/types/employee";

export const formatEmployeeDate = (value: string) => {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatEmployeeSalary = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
};

export const getEmployeeImageUrl = (employee: Pick<Employee, "profileImage">) => {
  if (!employee.profileImage) {
    return undefined;
  }

  if (employee.profileImage.startsWith("http")) {
    return employee.profileImage;
  }

  return `${env.NEXT_PUBLIC_API_URL ?? ""}${employee.profileImage}`;
};
