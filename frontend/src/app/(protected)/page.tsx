import { RoleGate } from "@/components/layout/role-gate";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default function HomePage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <DashboardPage />
    </RoleGate>
  );
}
