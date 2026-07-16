"use client";

import { useRouter } from "next/navigation";

import { EmployeeForm } from "@/features/employees/components/employee-form";
import { useCreateEmployee } from "@/features/employees/hooks/use-employees";
import type { EmployeeFormValues } from "@/features/employees/validation/employee-form.schema";
import { useAuth } from "@/hooks/use-auth";
import { showToast } from "@/lib/toast";
import type { EmployeeFormPayload } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

const toPayload = (values: EmployeeFormValues): EmployeeFormPayload => ({
  ...values,
  email: values.email.trim().toLowerCase(),
  profileImage: values.profileImage?.item(0) ?? undefined,
});

export default function NewEmployeePage() {
  const router = useRouter();
  const { role } = useAuth();
  const createEmployeeMutation = useCreateEmployee();

  if (role === "EMPLOYEE") {
    return (
      <div className="rounded-lg border bg-background p-6">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your role can view only your own employee profile.
        </p>
      </div>
    );
  }

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
  );
}
