import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types";

export const authService = {
  login: (body: LoginRequest) =>
    axiosInstance.post<ApiResponse<AuthTokens>>("/auth/login", body),

  register: (body: RegisterRequest) =>
    axiosInstance.post<ApiResponse<User>>("/auth/register", body),

  refreshToken: (refreshToken?: string) =>
    axiosInstance.post<ApiResponse<AuthTokens>>(
      "/auth/refresh",
      refreshToken ? { refreshToken } : {},
    ),

  logout: () => axiosInstance.post<ApiResponse<null>>("/auth/logout"),

  getMe: () => axiosInstance.get<ApiResponse<User>>("/auth/me"),
};
