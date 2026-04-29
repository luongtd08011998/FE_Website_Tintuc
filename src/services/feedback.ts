import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  FeedbackItem,
  FeedbackDetail,
  FeedbackStatistics,
  FeedbackListParams,
  UpdateFeedbackStatusRequest,
  CreateFeedbackReplyRequest,
  FeedbackReply,
} from "@/types";

export const feedbackService = {
  getStatistics: () =>
    axiosInstance.get<ApiResponse<FeedbackStatistics>>(
      "/admin/feedbacks/statistics",
    ),

  getAll: (params?: FeedbackListParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<FeedbackItem>>>(
      "/admin/feedbacks",
      { params },
    ),

  getById: (id: number) =>
    axiosInstance.get<ApiResponse<FeedbackDetail>>(`/admin/feedbacks/${id}`),

  updateStatus: (id: number, body: UpdateFeedbackStatusRequest) =>
    axiosInstance.put<ApiResponse<FeedbackItem>>(
      `/admin/feedbacks/${id}/status`,
      body,
    ),

  addReply: (id: number, body: CreateFeedbackReplyRequest) =>
    axiosInstance.post<ApiResponse<FeedbackReply>>(
      `/admin/feedbacks/${id}/replies`,
      body,
    ),

  getReplies: (id: number) =>
    axiosInstance.get<ApiResponse<FeedbackReply[]>>(
      `/admin/feedbacks/${id}/replies`,
    ),
};
