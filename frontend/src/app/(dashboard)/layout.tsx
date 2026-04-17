"use client";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router          = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/");
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]" style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(153 42% 45% / 0.05), transparent)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
