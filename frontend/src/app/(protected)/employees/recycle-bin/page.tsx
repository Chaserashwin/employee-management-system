import { RoleGate } from "@/components/layout/role-gate";
import { EmployeeRecycleBinPage } from "@/features/employees/components/employee-recycle-bin-page";

export default function RecycleBinRoutePage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN"]}>
      <EmployeeRecycleBinPage />
    </RoleGate>
  );
}
