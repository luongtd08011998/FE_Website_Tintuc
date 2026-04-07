import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
} from "@/types";

export const tagService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Tag>>>("/tags", { params }),

  getById: (id: number) => axiosInstance.get<ApiResponse<Tag>>(`/tags/${id}`),

  create: (body: CreateTagRequest) =>
    axiosInstance.post<ApiResponse<Tag>>("/tags", body),

  update: (body: UpdateTagRequest) =>
    axiosInstance.put<ApiResponse<Tag>>("/tags", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/tags/${id}`),
};
