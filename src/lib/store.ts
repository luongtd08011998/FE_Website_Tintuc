import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      sidebarOpen: true,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => {
        set({ accessToken: token });
        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("accessToken", token);
          } else {
            localStorage.removeItem("accessToken");
          }
        }
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      logout: () => {
        set({ user: null, accessToken: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
