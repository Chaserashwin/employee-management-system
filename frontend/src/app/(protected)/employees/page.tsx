import { RoleGate } from "@/components/layout/role-gate";
import { EmployeeListPage } from "@/features/employees/components/employee-list-page";

export default function EmployeesPage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <EmployeeListPage />
    </RoleGate>
  );
}
