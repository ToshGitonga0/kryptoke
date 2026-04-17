"use client";
import { KycBanner } from "@/components/dashboard/KycBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { marketsApi } from "@/lib/api/markets";
import { portfolioApi } from "@/lib/api/portfolio";
import { walletsApi } from "@/lib/api/wallets";
import { cn, formatKES, formatPct } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight, BarChart3, Leaf,
  TrendingDown, TrendingUp, Wallet,
} from "lucide-react";
import Link from "next/link";

/* ── Stat card ───────────────────────────────────────────── */
const StatCard = ({
  label, value, sub, icon: Icon, color, loading, glow,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string;
  loading: boolean; glow?: string;
}) => (
  <Card className={cn(
    "relative overflow-hidden hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg cursor-default"
  )}>
    {glow && (
      <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none", glow)} />
    )}
    <CardContent className="pt-5 pb-4 relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", `${glow ?? "bg-muted"}` , "bg-opacity-10 border border-white/5")}>
          <Icon size={14} className={color} />
        </div>
      </div>
      {loading
        ? <Skeleton className="h-7 w-28" />
        : <p className={cn("text-xl font-black font-mono tracking-tight", color)}>{value}</p>
      }
      {sub && (
        <p className="text-xs text-muted-foreground mt-1 font-mono">{sub}</p>
      )}
    </CardContent>
  </Card>
);

/* ── Asset row skeleton ──────────────────────────────────── */
const AssetRowSkeleton = () => (
  <tr className="border-b border-border">
    {[120, 80, 60, 80].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <Skeleton className={`h-4 w-[${w}px]`} />
      </td>
    ))}
  </tr>
);

/* ══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { data: assets,    isLoading: assetsLoading    } = useQuery({ queryKey: ["assets"],    queryFn: marketsApi.listAssets    });
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({ queryKey: ["portfolio"], queryFn: portfolioApi.getPortfolio });
  const { data: wallets,   isLoading: walletsLoading   } = useQuery({ queryKey: ["wallets"],   queryFn: walletsApi.getWallets    });

  const kesWallet   = wallets?.wallets?.find((w: any) => w.currency === "KES");
  const totalPnl    = parseFloat(portfolio?.total_pnl || "0");
  const pnlPositive = totalPnl >= 0;
  const isLoading   = walletsLoading || portfolioLoading;

  const stats = [
    {
      label: "KES Balance",
      value: formatKES(kesWallet?.balance || "0"),
      icon:  Wallet,
      color: "text-jungle-400",
      glow:  "bg-jungle-500",
    },
    {
      label: "Portfolio Value",
      value: formatKES(portfolio?.total_value || "0"),
      icon:  BarChart3,
      color: "text-jungle-400",
      glow:  "bg-jungle-500",
    },
    {
      label: "Total P&L",
      value: formatKES(portfolio?.total_pnl || "0"),
      sub:   formatPct(portfolio?.total_pnl_pct || "0"),
      icon:  pnlPositive ? TrendingUp : TrendingDown,
      color: pnlPositive ? "positive" : "negative",
      glow:  pnlPositive ? "bg-jungle-500" : "bg-red-500",
    },
    // holdings may not be part of the typed PortfolioPublic in some responses
    // cast to any for a robust runtime check
    {
      label: "Holdings",
      value: `${Array.isArray((portfolio as any)?.holdings) ? (portfolio as any).holdings.length : 0} assets`,
      icon:  Leaf,
      color: "text-jungle-400",
      glow:  "bg-jungle-500",
    },
  ];

  return (
    <div className="space-y-5">
      
      <KycBanner />

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome to KryptoKE — your Kenyan crypto hub 🌿
          </p>
        </div>
        <Link
          href="/markets"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-jungle-400 hover:text-jungle-300 transition-colors"
        >
          View markets <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* ── Stats grid ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      {/* ── Market overview ───────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card">

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center">
              <BarChart3 size={14} className="text-jungle-400" />
            </div>
            <p className="text-sm font-bold">Market Overview</p>
          </div>
          <Link
            href="/markets"
            className="flex items-center gap-1 text-xs font-semibold text-jungle-400 hover:text-jungle-300 transition-colors"
          >
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Asset", "Price (KES)", "24h Change", "Volume (KES)"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 first:pl-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assetsLoading
                ? Array.from({ length: 6 }).map((_, i) => <AssetRowSkeleton key={i} />)
                : assets?.assets?.slice(0, 8).map((a: any) => {
                    const pct = parseFloat(a.price_change_24h || "0");
                    const pos = pct >= 0;
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-150 cursor-pointer group"
                      >
                        {/* asset */}
                        <td className="px-4 pl-6 py-3.5">
                          <Link href={`/trade/${a.symbol}`} className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center text-xs font-black text-jungle-400 shrink-0">
                              {a.symbol.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm group-hover:text-jungle-400 transition-colors">{a.symbol}</p>
                              <p className="text-xs text-muted-foreground">{a.name}</p>
                            </div>
                          </Link>
                        </td>

                        {/* price */}
                        <td className="px-4 py-3.5 font-mono font-semibold">
                          {formatKES(a.current_price, 2)}
                        </td>

                        {/* 24h change */}
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border font-mono",
                            pos
                              ? "bg-jungle-500/10 text-jungle-400 border-jungle-500/25"
                              : "bg-red-500/10 text-red-400 border-red-500/25"
                          )}>
                            {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {pos ? "+" : ""}{pct.toFixed(2)}%
                          </span>
                        </td>

                        {/* volume */}
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                          {formatKES(a.volume_24h || "0", 0)}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* footer CTA */}
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <Link
            href="/markets"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-jungle-400 transition-colors w-full"
          >
            View all markets <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

    </div>
  );
}