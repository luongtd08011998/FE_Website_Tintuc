import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const AUTH_NO_BEARER_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isAuthNoBearer = AUTH_NO_BEARER_PATHS.some((p) => url.includes(p));

  if (typeof window !== "undefined") {
    if (isAuthNoBearer) {
      // Prevent stale/invalid Bearer token from triggering resource-server 401
      // on public auth endpoints (login/register/refresh).
      if (config.headers) {
        delete (config.headers as Record<string, unknown>).Authorization;
      }
      return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !AUTH_NO_BEARER_PATHS.some((p) => originalRequest.url?.includes(p))
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
