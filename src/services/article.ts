import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/types";

export const articleService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Article>>>("/articles", {
      params,
    }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Article>>(`/articles/${id}`),

  create: (body: CreateArticleRequest) =>
    axiosInstance.post<ApiResponse<Article>>("/articles", body),

  update: (body: UpdateArticleRequest) =>
    axiosInstance.put<ApiResponse<Article>>("/articles", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/articles/${id}`),
};
