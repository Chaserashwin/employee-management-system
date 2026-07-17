import { RoleGate } from "@/components/layout/role-gate";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default function DashboardRoutePage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <DashboardPage />
    </RoleGate>
  );
}
