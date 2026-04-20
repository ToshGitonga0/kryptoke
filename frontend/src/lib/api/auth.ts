import { apiClient } from "./client";
import type { Token, UserPublic } from "@/types";

// FastAPI 422 returns detail as [{type, loc, msg, input}], not a string.
// This helper always returns a plain string safe to pass to toast.error().
export function extractApiError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => `${e.loc?.slice(-1)[0]}: ${e.msg}`).join(", ");
  }
  return "Something went wrong";
}

export const authApi = {
  // Backend uses OAuth2PasswordRequestForm — must send form-encoded with `username` field
  login: async (email: string, password: string): Promise<Token> => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const { data } = await apiClient.post<Token>("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },

  register: async (payload: {
    email: string; password: string; full_name: string;
    phone_number: string; county?: string;
  }): Promise<Token> => {
    const { data } = await apiClient.post<Token>("/auth/register", payload);
    return data;
  },

  me: async (): Promise<UserPublic> => {
    const { data } = await apiClient.get<UserPublic>("/auth/me");
    return data;
  },

  updateProfile: async (payload: {
    full_name?: string; phone_number?: string; county?: string;
  }): Promise<UserPublic> => {
    const { data } = await apiClient.patch<UserPublic>("/users/me", payload);
    return data;
  },

  changePassword: async (payload: {
    current_password: string; new_password: string;
  }): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/auth/change-password", payload);
    return data;
  },
};
