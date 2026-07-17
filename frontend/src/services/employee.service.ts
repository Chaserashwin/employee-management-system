import { apiClient } from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  DirectReportsResult,
  Employee,
  EmployeeBulkIdsPayload,
  EmployeeCsvImportPreview,
  EmployeeCsvImportResult,
  EmployeeFormPayload,
  EmployeeListParams,
  EmployeeListResult,
  EmployeeManagerPayload,
  EmployeeRolePayload,
  EmployeeSummary,
  EmployeeStatusPayload,
  ReporteesResult,
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

  if (payload.removeProfileImage) {
    formData.append("removeProfileImage", "true");
  }

  return formData;
};

const toCsvFormData = (file: File) => {
  const formData = new FormData();

  formData.append("file", file);

  return formData;
};

export const employeeService = {
  async getEmployees(params: EmployeeListParams) {
    const response = await apiClient.get<ApiResponse<EmployeeListResult>>("/api/employees", {
      params,
    });

    return response.data.data;
  },
  async getDeletedEmployees(params: EmployeeListParams) {
    const response = await apiClient.get<ApiResponse<EmployeeListResult>>(
      "/api/employees/recycle-bin",
      {
        params,
      },
    );

    return response.data.data;
  },
  async getEmployee(id: string) {
    const response = await apiClient.get<ApiResponse<Employee>>(`/api/employees/${id}`);

    return response.data.data;
  },
  async getMyProfile() {
    const response = await apiClient.get<ApiResponse<Employee>>("/api/employees/me");

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
  async restoreEmployee(id: string) {
    const response = await apiClient.patch<ApiResponse<Employee>>(`/api/employees/${id}/restore`);

    return response.data.data;
  },
  async restoreEmployees(payload: EmployeeBulkIdsPayload) {
    const response = await apiClient.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
      "/api/employees/recycle-bin/restore",
      payload,
    );

    return response.data.data;
  },
  async permanentlyDeleteEmployee(id: string) {
    const response = await apiClient.delete<ApiResponse<Employee>>(
      `/api/employees/recycle-bin/${id}`,
    );

    return response.data.data;
  },
  async permanentlyDeleteEmployees(payload: EmployeeBulkIdsPayload) {
    const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
      "/api/employees/recycle-bin",
      {
        data: payload,
      },
    );

    return response.data.data;
  },
  async updateEmployeeStatus(id: string, payload: EmployeeStatusPayload) {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/api/employees/${id}/status`,
      payload,
    );

    return response.data.data;
  },
  async updateEmployeeRole(id: string, payload: EmployeeRolePayload) {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/api/employees/${id}/role`,
      payload,
    );

    return response.data.data;
  },
  async updateEmployeeManager(id: string, payload: EmployeeManagerPayload) {
    const response = await apiClient.patch<ApiResponse<Employee>>(
      `/api/employees/${id}/manager`,
      payload,
    );

    return response.data.data;
  },
  async getManagerCandidates(id: string) {
    const response = await apiClient.get<ApiResponse<EmployeeSummary[]>>(
      `/api/employees/${id}/manager-candidates`,
    );

    return response.data.data;
  },
  async getReportees(id: string) {
    const response = await apiClient.get<ApiResponse<ReporteesResult>>(
      `/api/employees/${id}/reportees`,
    );

    return response.data.data;
  },
  async getDirectReports(id: string) {
    const response = await apiClient.get<ApiResponse<DirectReportsResult>>(
      `/api/employees/${id}/direct-reports`,
    );

    return response.data.data;
  },
  async getChain(id: string) {
    const response = await apiClient.get<ApiResponse<EmployeeSummary[]>>(
      `/api/employees/${id}/chain`,
    );

    return response.data.data;
  },
  async previewEmployeeImport(file: File) {
    const response = await apiClient.post<ApiResponse<EmployeeCsvImportPreview>>(
      "/api/employees/import/preview",
      toCsvFormData(file),
    );

    return response.data.data;
  },
  async importEmployees(file: File) {
    const response = await apiClient.post<ApiResponse<EmployeeCsvImportResult>>(
      "/api/employees/import",
      toCsvFormData(file),
    );

    return response.data.data;
  },
  async downloadImportTemplate() {
    const response = await apiClient.get<Blob>("/api/employees/import/template", {
      responseType: "blob",
    });

    return response.data;
  },
};
