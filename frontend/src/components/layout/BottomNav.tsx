"use client";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useTradeStore } from "@/lib/store/tradeStore";
import { cn } from "@/lib/utils";
import { BarChart3, Bell, Briefcase, LayoutDashboard, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname    = usePathname();
  const unread      = useNotificationStore((s) => s.unreadCount);
  const lastSymbol  = useTradeStore((s) => s.lastSymbol);

  const TABS = [
    { href: "/dashboard",            label: "Home",      Icon: LayoutDashboard },
    { href: "/markets",              label: "Markets",   Icon: BarChart3       },
    { href: `/trade/${lastSymbol}`,  label: "Trade",     Icon: TrendingUp      },
    { href: "/portfolio",            label: "Portfolio", Icon: Briefcase       },
    { href: "/wallet",               label: "Wallet",    Icon: Wallet          },
    { href: "/notifications",        label: "Alerts",    Icon: Bell, badge: unread },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ href, label, Icon, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors relative",
              active ? "text-jungle-400" : "text-muted-foreground"
            )}>
              <div className="relative">
                <Icon size={20} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 rounded-full bg-jungle-500 text-white text-[8px] font-black flex items-center justify-center px-0.5">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}