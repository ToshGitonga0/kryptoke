"use client";
/**
 * NotificationBell — header notification icon with a dropdown panel.
 *
 * Currently driven by static demo notifications.
 * To wire up a real API: replace DEMO_NOTIFICATIONS with a
 * useQuery call to /notifications and map the response.
 */
import { cn } from "@/lib/utils";
import { Bell, CheckCheck, Info, TrendingUp, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id:        string;
  type:      "info" | "trade" | "wallet" | "system";
  title:     string;
  body:      string;
  time:      string;
  read:      boolean;
}

const ICON_MAP: Record<Notification["type"], React.ElementType> = {
  info:   Info,
  trade:  TrendingUp,
  wallet: Wallet,
  system: Bell,
};

const COLOR_MAP: Record<Notification["type"], string> = {
  info:   "text-jungle-400",
  trade:  "text-jungle-400",
  wallet: "text-amber-400",
  system: "text-muted-foreground",
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id:    "n1",
    type:  "trade",
    title: "Market Open",
    body:  "BTC is up +3.2% in the last hour. Check the Trade page.",
    time:  "2 min ago",
    read:  false,
  },
  {
    id:    "n2",
    type:  "wallet",
    title: "Deposit Confirmed",
    body:  "Your KES 10,000 deposit has been credited to your wallet.",
    time:  "1 hr ago",
    read:  false,
  },
  {
    id:    "n3",
    type:  "info",
    title: "KYC Reminder",
    body:  "Complete your identity verification to unlock higher limits.",
    time:  "3 hr ago",
    read:  true,
  },
  {
    id:    "n4",
    type:  "system",
    title: "Welcome to KryptoKE 🌿",
    body:  "Your account is all set. Start trading Kenya's top crypto assets.",
    time:  "Yesterday",
    read:  true,
  },
];

export function NotificationBell() {
  const [open,   setOpen]   = useState(false);
  const [items,  setItems]  = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          open && "bg-muted text-foreground"
        )}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-jungle-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 border-2 border-[var(--card)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-80 rounded-2xl border border-border shadow-2xl overflow-hidden",
            "bg-card"
          )}
          style={{ boxShadow: "0 24px 48px rgb(0 0 0 / 0.35)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-jungle-400 hover:text-jungle-300 transition-colors"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
            {items.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm gap-2">
                <Bell size={24} className="opacity-30" />
                No notifications
              </li>
            ) : (
              items.map((n) => {
                const Icon  = ICON_MAP[n.type];
                const color = COLOR_MAP[n.type];
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3 transition-colors duration-100",
                      n.read ? "opacity-60" : "bg-jungle-500/5"
                    )}
                  >
                    {/* Type icon */}
                    <div className={cn("mt-0.5 shrink-0", color)}>
                      <Icon size={15} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold", !n.read && "text-foreground")}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
                        {n.time}
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => dismiss(n.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-all"
                      aria-label="Dismiss"
                    >
                      <X size={12} />
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground text-center">
              Real-time notifications — coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}