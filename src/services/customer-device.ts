import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  PaginatedData,
  CustomerDeviceItem,
  CustomerDeviceListParams,
} from "@/types";

export const customerDeviceService = {
  getAll: (params?: CustomerDeviceListParams) =>
    axiosInstance.get<ApiResponse<PaginatedData<CustomerDeviceItem>>>(
      "/admin/customer-devices",
      { params },
    ),
};
