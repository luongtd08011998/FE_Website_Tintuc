import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types";

export const categoryService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Category>>>("/categories", {
      params,
    }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (body: CreateCategoryRequest) =>
    axiosInstance.post<ApiResponse<Category>>("/categories", body),

  update: (body: UpdateCategoryRequest) =>
    axiosInstance.put<ApiResponse<Category>>("/categories", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/categories/${id}`),
};
