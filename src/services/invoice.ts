import axiosInstance from "@/lib/axios";
import type { ApiResponse, PaginatedData, AdminInvoice, AdminInvoiceParams } from "@/types";

export const invoiceService = {
  getAll: async (params?: AdminInvoiceParams) => {
    return axiosInstance.get<ApiResponse<PaginatedData<AdminInvoice>>>("/admin/invoices", {
      params,
    });
  },

  sendDebtReminder: async (yearMonth: string, monthInvoiceId?: number) => {
    return axiosInstance.post<ApiResponse<{ sentCount: number; skipCount: number }>>("/admin/invoices/send-debt-reminder", {
      yearMonth,
      monthInvoiceId: monthInvoiceId?.toString(),
    });
  },
};
