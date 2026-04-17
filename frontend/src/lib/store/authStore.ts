import { create } from "zustand";
import type { UserPublic } from "@/types";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  user:            UserPublic | null;
  token:           string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  // actions
  init:     () => void;
  login:    (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout:   () => void;
  fetchMe:  () => Promise<void>;
  setUser:  (user: UserPublic) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  token:           null,
  isLoading:       false,
  isAuthenticated: false,

  // Called once on mount inside AuthProvider — reads localStorage client-side only
  init: () => {
    if (typeof window === "undefined") return;
    const token   = localStorage.getItem("kryptoke_token");
    const userStr = localStorage.getItem("kryptoke_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserPublic;
        set({ token, user, isAuthenticated: true });
      } catch {
        // corrupted storage — wipe it
        localStorage.removeItem("kryptoke_token");
        localStorage.removeItem("kryptoke_user");
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("kryptoke_token", data.access_token);
      localStorage.setItem("kryptoke_user", JSON.stringify(data.user));
      set({ token: data.access_token, user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const data = await authApi.register(formData);
      localStorage.setItem("kryptoke_token", data.access_token);
      localStorage.setItem("kryptoke_user", JSON.stringify(data.user));
      set({ token: data.access_token, user: data.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("kryptoke_token");
    localStorage.removeItem("kryptoke_user");
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Re-validates token with the server — call on sensitive pages or after profile edits
  fetchMe: async () => {
    try {
      const user = await authApi.me();
      localStorage.setItem("kryptoke_user", JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  setUser: (user) => {
    localStorage.setItem("kryptoke_user", JSON.stringify(user));
    set({ user });
  },
}));
