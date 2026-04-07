import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/types";

export const companyService = {
  getAll: (params?: PaginationParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<Company>>>("/companies", {
      params,
    }),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<Company>>(`/companies/${id}`),

  create: (body: CreateCompanyRequest) =>
    axiosInstance.post<ApiResponse<Company>>("/companies", body),

  update: (body: UpdateCompanyRequest) =>
    axiosInstance.put<ApiResponse<Company>>("/companies", body),

  delete: (id: number) =>
    axiosInstance.delete<ApiResponse<null>>(`/companies/${id}`),
};
