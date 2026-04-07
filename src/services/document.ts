import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from "@/types";

export const documentService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Document>>>("/documents", {
      params,
    }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Document>>(`/documents/${id}`),

  getByArticleId: (articleId: number) =>
    axiosInstance.get<ApiResponse<Document[]>>(
      `/documents/article/${articleId}`,
    ),

  create: (body: CreateDocumentRequest) =>
    axiosInstance.post<ApiResponse<Document>>("/documents", body),

  update: (body: UpdateDocumentRequest) =>
    axiosInstance.put<ApiResponse<Document>>("/documents", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/documents/${id}`),
};
