"use client";

import { useRouter } from "next/navigation";

import { RoleGate } from "@/components/layout/role-gate";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { useCreateEmployee } from "@/features/employees/hooks/use-employees";
import type { EmployeeFormValues } from "@/features/employees/validation/employee-form.schema";
import { showToast } from "@/lib/toast";
import type { EmployeeFormPayload } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

const toPayload = (values: EmployeeFormValues): EmployeeFormPayload => ({
  ...values,
  email: values.email.trim().toLowerCase(),
  profileImage: values.profileImage?.item(0) ?? undefined,
  removeProfileImage: false,
});

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployeeMutation = useCreateEmployee();

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      const employee = await createEmployeeMutation.mutateAsync(toPayload(values));
      showToast.success("Employee created.");
      router.push(`/employees/${employee.id}`);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Create Employee</h1>
          <p className="text-sm text-muted-foreground">Add a new employee record.</p>
        </div>
        <EmployeeForm
          mode="create"
          isSubmitting={createEmployeeMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </RoleGate>
  );
}
