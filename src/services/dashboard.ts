import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface DashboardSummary {
  totalUsers: number;
  totalCompanies: number;
  totalRoles: number;
  totalPermissions: number;
}

export const dashboardService = {
  getSummary: () =>
    axiosInstance.get<ApiResponse<DashboardSummary>>("/dashboard"),
};
