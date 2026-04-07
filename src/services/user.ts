import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types";

export const userService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<User>>>("/users", { params }),

  getById: (id: number) => axiosInstance.get<ApiResponse<User>>(`/users/${id}`),

  create: (body: CreateUserRequest) =>
    axiosInstance.post<ApiResponse<User>>("/users", body),

  update: (body: UpdateUserRequest) =>
    axiosInstance.put<ApiResponse<User>>("/users", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/users/${id}`),
};
