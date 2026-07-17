"use client";

import { useParams, useRouter } from "next/navigation";

import { RoleGate } from "@/components/layout/role-gate";
import { EmployeeForm } from "@/features/employees/components/employee-form";
import { useEmployee, useUpdateEmployee } from "@/features/employees/hooks/use-employees";
import type { EmployeeFormValues } from "@/features/employees/validation/employee-form.schema";
import { showToast } from "@/lib/toast";
import type { EmployeeFormPayload } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

const toPayload = (values: EmployeeFormValues): EmployeeFormPayload => ({
  ...values,
  email: values.email.trim().toLowerCase(),
  profileImage: values.profileImage?.item(0) ?? undefined,
  removeProfileImage: values.removeProfileImage ?? false,
});

function EditEmployeeContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const employeeQuery = useEmployee(params.id);
  const updateEmployeeMutation = useUpdateEmployee(params.id);

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      const employee = await updateEmployeeMutation.mutateAsync(toPayload(values));
      showToast.success("Employee updated.");
      router.push(`/employees/${employee.id}`);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Edit Employee</h1>
        <p className="text-sm text-muted-foreground">Update employee profile details.</p>
      </div>
      {employeeQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(employeeQuery.error)}
        </div>
      ) : null}
      <EmployeeForm
        mode="edit"
        employee={employeeQuery.data}
        isSubmitting={updateEmployeeMutation.isPending || employeeQuery.isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function EditEmployeePage() {
  return (
    <RoleGate allowedRoles={["SUPER_ADMIN", "HR"]}>
      <EditEmployeeContent />
    </RoleGate>
  );
}
