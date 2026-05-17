import axiosInstance from "@/lib/axios";
import type { ApiResponse, Road } from "@/types";

export const roadService = {
  getAll: async () => {
    return axiosInstance.get<ApiResponse<Road[]>>("/admin/roads");
  },
};
