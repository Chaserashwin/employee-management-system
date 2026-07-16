import { RoleGate } from "@/components/layout/role-gate";
import { OrganizationPage } from "@/features/organization/components/organization-page";

export default function OrganizationRoutePage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <OrganizationPage />
    </RoleGate>
  );
}
