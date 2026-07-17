"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from "@/constants/employee";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "@/features/employees/validation/employee-form.schema";
import { getEmployeeImageUrl } from "@/features/employees/utils/employee-format";
import { useAuth } from "@/hooks/use-auth";
import type { Employee } from "@/types/employee";

const toDateInputValue = (value: string | undefined) => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

const getDefaultValues = (employee?: Employee): EmployeeFormValues => ({
  department: employee?.department ?? "",
  designation: employee?.designation ?? "",
  email: employee?.email ?? "",
  joiningDate: toDateInputValue(employee?.joiningDate),
  name: employee?.name ?? "",
  phone: employee?.phone ?? "",
  role: employee?.role ?? "EMPLOYEE",
  salary: employee?.salary ?? 0,
  status: employee?.status ?? "ACTIVE",
  removeProfileImage: false,
});

type EmployeeFormProps = {
  employee?: Employee;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
};

export function EmployeeForm({ employee, isSubmitting, mode, onSubmit }: EmployeeFormProps) {
  const { role: currentUserRole } = useAuth();
  const canManageRoles = currentUserRole === "SUPER_ADMIN";
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<EmployeeFormValues>({
    defaultValues: getDefaultValues(employee),
    resolver: zodResolver(employeeFormSchema),
  });
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(() =>
    employee ? getEmployeeImageUrl(employee) : undefined,
  );
  const selectedProfileImage = watch("profileImage");
  const removeProfileImage = watch("removeProfileImage");
  const profileImageInput = register("profileImage");
  const existingProfileImageUrl = employee ? getEmployeeImageUrl(employee) : undefined;

  useEffect(() => {
    reset(getDefaultValues(employee));
    setPreviewUrl(existingProfileImageUrl);

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
  }, [employee, existingProfileImageUrl, reset]);

  useEffect(() => {
    register("removeProfileImage");
  }, [register]);

  const handleRemoveProfileImage = () => {
    const selectedFile = selectedProfileImage?.item(0);

    setValue("profileImage", undefined, { shouldDirty: true });

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }

    if (selectedFile && existingProfileImageUrl && !removeProfileImage) {
      setPreviewUrl(existingProfileImageUrl);
      return;
    }

    setPreviewUrl(undefined);
    setValue("removeProfileImage", mode === "edit" && Boolean(existingProfileImageUrl), {
      shouldDirty: true,
    });
  };

  useEffect(() => {
    const selectedFile = selectedProfileImage?.item(0);

    if (!selectedFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setValue("removeProfileImage", false, { shouldDirty: true });

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedProfileImage, setValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg tracking-normal">
          {mode === "create" ? "Create Employee" : "Edit Employee"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
            {errors.phone ? (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register("department")}
              aria-invalid={Boolean(errors.department)}
            />
            {errors.department ? (
              <p className="text-sm text-destructive">{errors.department.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              {...register("designation")}
              aria-invalid={Boolean(errors.designation)}
            />
            {errors.designation ? (
              <p className="text-sm text-destructive">{errors.designation.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              min={0}
              step={1}
              {...register("salary", { valueAsNumber: true })}
              aria-invalid={Boolean(errors.salary)}
            />
            {errors.salary ? (
              <p className="text-sm text-destructive">{errors.salary.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="joiningDate">Joining Date</Label>
            <Input
              id="joiningDate"
              type="date"
              {...register("joiningDate")}
              aria-invalid={Boolean(errors.joiningDate)}
            />
            {errors.joiningDate ? (
              <p className="text-sm text-destructive">{errors.joiningDate.message}</p>
            ) : null}
          </div>

          {canManageRoles ? (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" {...register("role")} aria-invalid={Boolean(errors.role)}>
                {EMPLOYEE_ROLES.map((employeeRole) => (
                  <option value={employeeRole} key={employeeRole}>
                    {employeeRole}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <input type="hidden" {...register("role")} />
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")} aria-invalid={Boolean(errors.status)}>
              {EMPLOYEE_STATUSES.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Image</Label>
            {previewUrl ? (
              <div className="relative size-20">
                <div
                  aria-label="Profile image preview"
                  className="size-20 rounded-md border bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url("${previewUrl}")` }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 size-6 rounded-full shadow"
                  onClick={handleRemoveProfileImage}
                  aria-label="Remove profile image"
                >
                  <X className="size-3" aria-hidden="true" />
                </Button>
              </div>
            ) : null}
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              {...profileImageInput}
              ref={(element) => {
                profileImageInput.ref(element);
                profileImageInputRef.current = element;
              }}
            />
          </div>

          <div className="flex justify-end gap-2 lg:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              {mode === "create" ? "Create Employee" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
