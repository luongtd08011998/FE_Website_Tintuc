import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/types";

export const permissionService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Permission>>>("/permissions", {
      params,
    }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Permission>>(`/permissions/${id}`),

  create: (body: CreatePermissionRequest) =>
    axiosInstance.post<ApiResponse<Permission>>("/permissions", body),

  update: (body: UpdatePermissionRequest) =>
    axiosInstance.put<ApiResponse<Permission>>("/permissions", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/permissions/${id}`),
};
