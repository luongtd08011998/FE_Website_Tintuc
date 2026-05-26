import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  NotificationItem,
  NotificationStatistics,
  NotificationListParams,
} from "@/types";

export const notificationService = {
  getStatistics: () =>
    axiosInstance.get<ApiResponse<NotificationStatistics>>(
      "/admin/notifications/statistics",
    ),

  getAll: (params?: NotificationListParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<NotificationItem>>>(
      "/admin/notifications",
      { params },
    ),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<NotificationItem>>(
      `/admin/notifications/${id}`,
    ),

  resend: (id: number) =>
    axiosInstance.post<ApiResponse<NotificationItem>>(
      `/admin/notifications/${id}/resend`,
    ),
};
