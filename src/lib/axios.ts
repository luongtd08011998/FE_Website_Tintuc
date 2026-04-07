import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      !originalRequest.url?.includes("/auth/login")
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
