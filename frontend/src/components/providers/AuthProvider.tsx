"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

// Runs init() once after mount — safely reads localStorage client-side only.
// This is the only place init() is ever called.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return <>{children}</>;
}
