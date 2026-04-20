"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { useSidebarStore } from "@/lib/store/sidebarStore";
import { useTradeStore } from "@/lib/store/tradeStore";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
  Target,
  TrendingUp,
  User,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const { isOpen, close, toggle } = useSidebarStore();
  const lastSymbol = useTradeStore((s) => s.lastSymbol);

  const NAV_ITEMS = [
    { href: "/dashboard",            label: "Dashboard",     Icon: LayoutDashboard },
    { href: "/markets",              label: "Markets",       Icon: BarChart3       },
    { href: `/trade/${lastSymbol}`,  label: "Trade",         Icon: TrendingUp      },
    { href: "/portfolio",            label: "Portfolio",     Icon: Briefcase       },
    { href: "/wallet",               label: "Wallet",        Icon: Wallet          },
    { href: "/orders",               label: "Orders",        Icon: ClipboardList   },
    { href: "/transactions",         label: "Transactions",  Icon: CreditCard      },
    { href: "/alerts",               label: "Alerts",        Icon: Target          },
    { href: "/profile",              label: "Profile",       Icon: User            },
    { href: "/settings",             label: "Settings",      Icon: Settings        },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 768) close();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo + toggle */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b border-border shrink-0",
          isOpen ? "justify-between" : "justify-center"
        )}
      >
        {isOpen && (
          <div className="flex items-center gap-2">
            <Leaf className="text-jungle-400 shrink-0" size={22} />
            <span className="text-lg font-extrabold tracking-tight text-foreground whitespace-nowrap">
              KryptoKE
            </span>
          </div>
        )}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              title={!isOpen ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                !isOpen && "justify-center",
                active
                  ? "relative text-jungle-400 bg-jungle-500/10 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[60%] before:w-[3px] before:rounded-r-full before:bg-jungle-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-[2px]"
              )}
            >
              <div className="relative shrink-0">
                <Icon size={18} />
              </div>
              {isOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => {
            logout();
            close();
          }}
          title={!isOpen ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium w-full transition-colors",
            "text-muted-foreground hover:bg-red-500/10 hover:text-red-500",
            !isOpen && "justify-center"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 bg-card border-r border-border shadow-[1px_0_12px_rgb(0_0_0/0.04)]",
          "transition-all duration-200 ease-in-out overflow-hidden",
          isOpen ? "w-56" : "w-14"
        )}
      >
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {!isOpen ? null : (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <aside className="relative z-10 w-56 bg-card border-r border-border flex flex-col">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}