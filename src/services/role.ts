import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types";

export const roleService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Role>>>("/roles", { params }),

  getById: (id: number) => axiosInstance.get<ApiResponse<Role>>(`/roles/${id}`),

  create: (body: CreateRoleRequest) =>
    axiosInstance.post<ApiResponse<Role>>("/roles", body),

  update: (body: UpdateRoleRequest) =>
    axiosInstance.put<ApiResponse<Role>>("/roles", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/roles/${id}`),
};
