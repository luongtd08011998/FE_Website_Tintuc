import axiosInstance from "@/lib/axios";
import type { ApiResponse, PaginatedData, AdminInvoice, AdminInvoiceParams } from "@/types";

export const invoiceService = {
  getAll: async (params?: AdminInvoiceParams) => {
    return axiosInstance.get<ApiResponse<PaginatedData<AdminInvoice>>>("/admin/invoices", {
      params,
    });
  },
};
