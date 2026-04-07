import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types";

export interface FileUploadResponse {
  fileName: string;
  folder: string;
  fileUrl: string;
  size: number;
  uploadedAt: string;
}

const BACKEND_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"
).replace("/api/v1", "");

/** Chuyển relative URL từ backend thành absolute URL */
export function getFileUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http")) return fileUrl;
  return `${BACKEND_ORIGIN}${fileUrl}`;
}

export const fileService = {
  upload: (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return axiosInstance.post<ApiResponse<FileUploadResponse>>(
      "/files",
      formData,
      { headers: { "Content-Type": null } },
    );
  },
};
