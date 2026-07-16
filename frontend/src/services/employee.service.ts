import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  Employee,
  EmployeeFormPayload,
  EmployeeListParams,
  EmployeeListResult,
  EmployeeStatusPayload,
} from "@/types/employee";

const toEmployeeFormData = (payload: EmployeeFormPayload) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("department", payload.department);
  formData.append("designation", payload.designation);
  formData.append("salary", String(payload.salary));
  formData.append("joiningDate", payload.joiningDate);
  formData.append("role", payload.role);
  formData.append("status", payload.status);

  if (payload.profileImage) {
    formData.append("profileImage", payload.profileImage);
  }

  return formData;
};

export const employeeService = {
  async getEmployees(params: EmployeeListParams) {
    const response = await apiClient.get<ApiResponse<EmployeeListResult>>("/api/employees", {
      params,
    });

    return response.data.data;
  },
  async getEmployee(id: string) {
    const response = await apiClient.get<ApiResponse<Employee>>(`/api/employees/${id}`);

    return response.data.data;
  },
  async createEmployee(payload: EmployeeFormPayload) {
    const response = await apiClient.post<ApiResponse<Employee>>(
      "/api/employees",
      toEmployeeFormData(payload),
    );

    return response.data.data;
  },
  async updateEmployee(id: string, payload: EmployeeFormPayload) {
    const response = await apiClient.put<ApiResponse<Employee>>(
      `/api/employees/${id}`,
      toEmployeeFormData(payload),
    );

    return response.data.data;
  },
  async deleteEmployee(id: string) {
    const response = await apiClient.delete<ApiResponse<Employee>>(`/api/employees/${id}`);

    return response.data.data;
  },
  async updateEmployeeStatus(id: string, payload: EmployeeStatusPayload) {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/api/employees/${id}/status`,
      payload,
    );

    return response.data.data;
  },
};
