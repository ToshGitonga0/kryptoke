"use client";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { notificationsApi } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useSidebarStore } from "@/lib/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const user   = useAuthStore((s) => s.user);
  const toggle = useSidebarStore((s) => s.toggle);
  const { unreadCount, setUnreadCount } = useNotificationStore();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "K";

  const firstName = user?.full_name?.split(" ")[0];

  // Poll notifications every 30s to keep badge count fresh
  const { data: notifData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn:  () => notificationsApi.list(0, 1),
    refetchInterval: 30_000,
    enabled: !!user,
  });

  useEffect(() => {
    if (notifData) setUnreadCount(notifData.unread_count);
  }, [notifData, setUnreadCount]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-card/80 backdrop-blur-xl border-b border-border">

      {/* ── Left ────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu size={18} />
        </button>

        {firstName && (
          <span className="hidden md:block text-sm text-muted-foreground">
            Welcome back,{" "}
            <span className="font-bold text-foreground">{firstName}</span>
            {" "}🌿
          </span>
        )}
      </div>

      {/* ── Right ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5">

        {/* Notification bell */}
        {/* <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-jungle-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 border border-[var(--card)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link> */}

        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark"
            ? <Sun  size={16} className="text-jungle-400" />
            : <Moon size={16} />
          }
        </button>

        {/* Avatar */}
        <Link href="/settings" className="relative ml-1">
          <div className={cn(
            "w-8 h-8 rounded-xl bg-jungle-600 flex items-center justify-center",
            "text-white text-xs font-black border-2 border-jungle-500/40",
            "shadow-md shadow-jungle-900/30 hover:border-jungle-400/60 transition-colors"
          )}>
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-jungle-400 border-2 border-[var(--card)]" />
        </Link>
      </div>

    </header>
  );
}