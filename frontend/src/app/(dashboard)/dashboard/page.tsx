// frontend/src/app/(dashboard)/dashboard/page.tsx
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
import "./dashboard.css";

type Tone = "success" | "danger";

/* ── Stat card ───────────────────────────────────────────── */
const StatCard = ({
  label, value, sub, icon: Icon, tone, loading,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; tone: Tone;
  loading: boolean;
}) => (
  <Card className="dashboard-stat-card">
    <div
      className="dashboard-stat-card__glow"
      style={{ background: `color-mix(in oklch, var(--${tone === "danger" ? "destructive" : "success"}) 60%, transparent)` }}
    />
    <CardContent className="dashboard-stat-card__body">
      <div className="dashboard-stat-card__head">
        <p className="dashboard-stat-card__label">{label}</p>
        <div className={cn("dashboard-stat-card__icon", tone === "danger" ? "dashboard-stat-card__icon--danger" : "dashboard-stat-card__icon--success")}>
          <Icon size={14} />
        </div>
      </div>
      {loading
        ? <Skeleton className="h-7 w-28" />
        : <p className={cn("dashboard-stat-card__value", tone === "danger" ? "dashboard-stat-card__value--danger" : "dashboard-stat-card__value--success")}>{value}</p>
      }
      {sub && <p className="dashboard-stat-card__sub">{sub}</p>}
    </CardContent>
  </Card>
);

/* ── Asset row skeleton ──────────────────────────────────── */
const AssetRowSkeleton = () => (
  <tr className="border-b border-border">
    {[120, 80, 60, 80].map((w, i) => (
      <td key={i} className="dashboard-skeleton-cell">
        <Skeleton className="h-4" style={{ width: w }} />
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

  const stats: Array<{ label: string; value: string; sub?: string; icon: React.ElementType; tone: Tone }> = [
    { label: "KES Balance",     value: formatKES(kesWallet?.balance || "0"),        icon: Wallet,   tone: "success" },
    { label: "Portfolio Value", value: formatKES(portfolio?.total_value || "0"),    icon: BarChart3, tone: "success" },
    {
      label: "Total P&L",
      value: formatKES(portfolio?.total_pnl || "0"),
      sub:   formatPct(portfolio?.total_pnl_pct || "0"),
      icon:  pnlPositive ? TrendingUp : TrendingDown,
      tone:  pnlPositive ? "success" : "danger",
    },
    {
      label: "Holdings",
      value: `${Array.isArray((portfolio as any)?.holdings) ? (portfolio as any).holdings.length : 0} assets`,
      icon:  Leaf,
      tone:  "success",
    },
  ];

  return (
    <div className="space-y-5">
      <KycBanner />

      {/* ── Page header ───────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Dashboard</h1>
          <p className="dashboard-header__subtitle">Welcome to KryptoKE — your Kenyan crypto hub 🌿</p>
        </div>
        <Link href="/markets" className="dashboard-header__link">
          View markets <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* ── Stats grid ────────────────────────────────── */}
      <div className="dashboard-stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      {/* ── Market overview ───────────────────────────── */}
      <div className="dashboard-market-panel">
        <div className="dashboard-market-panel__head">
          <div className="dashboard-market-panel__head-left">
            <div className="dashboard-market-panel__icon">
              <BarChart3 size={14} className="text-primary" />
            </div>
            <p className="dashboard-market-panel__title">Market Overview</p>
          </div>
          <Link href="/markets" className="dashboard-market-panel__link">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        <div className="dashboard-market-panel__scroll">
          <table className="dashboard-market-panel__table">
            <thead>
              <tr className="border-b border-border">
                {["Asset", "Price (KES)", "24h Change", "Volume (KES)"].map((h) => (
                  <th key={h} className="dashboard-market-panel__th">{h}</th>
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
                      <tr key={a.id} className="dashboard-asset-row">
                        <td className="dashboard-asset-cell">
                          <Link href={`/trade/${a.symbol}`} className="dashboard-asset-link">
                            <div className="dashboard-asset-icon">{a.symbol.charAt(0)}</div>
                            <div>
                              <p className="dashboard-asset-symbol">{a.symbol}</p>
                              <p className="dashboard-asset-name">{a.name}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="dashboard-asset-price-cell">{formatKES(a.current_price, 2)}</td>
                        <td className="dashboard-asset-change-cell">
                          <span className={cn(pos ? "badge-success" : "badge-danger")}>
                            {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {pos ? "+" : ""}{pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="dashboard-asset-volume-cell">{formatKES(a.volume_24h || "0", 0)}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        <div className="dashboard-market-panel__footer">
          <Link href="/markets" className="dashboard-market-panel__footer-link">
            View all markets <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
