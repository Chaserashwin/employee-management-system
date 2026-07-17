import { z } from "zod";

import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from "@/constants/employee";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const employeeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number with 7 to 20 characters."),
  department: z.string().trim().min(1, "Department is required."),
  designation: z.string().trim().min(1, "Designation is required."),
  salary: z.number({ invalid_type_error: "Salary is required." }).min(0, "Salary must be zero or greater."),
  joiningDate: z.string().trim().min(1, "Joining date is required."),
  role: z.enum(EMPLOYEE_ROLES),
  status: z.enum(EMPLOYEE_STATUSES),
  profileImage: z.instanceof(FileList).optional(),
  removeProfileImage: z.boolean().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
