import axiosInstance from "@/lib/axios";
import type { ApiResponse, PaginatedData, Media, MediaParams } from "@/types";

export const mediaService = {
  upload: (file: File, title?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }
    return axiosInstance.post<ApiResponse<Media>>("/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getAll: (params: MediaParams) => {
    return axiosInstance.get<ApiResponse<PaginatedData<Media>>>("/media", {
      params,
    });
  },

  getById: (id: number) => {
    return axiosInstance.get<ApiResponse<Media>>(`/media/${id}`);
  },

  delete: (id: number) => {
    return axiosInstance.delete<ApiResponse<null>>(`/media/${id}`);
  },
};
