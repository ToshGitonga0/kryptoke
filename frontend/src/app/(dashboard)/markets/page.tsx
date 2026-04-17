"use client";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { marketsApi } from "@/lib/api/markets";
import { cn, formatKES } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Search, TrendingDown, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ── Skeleton row ────────────────────────────────────────── */
const RowSkeleton = () => (
  <tr className="border-b border-border">
    {[24, 140, 100, 80, 100, 100, 60].map((w, i) => (
      <td key={i} className="px-4 py-3.5 first:pl-6 last:pr-6">
        <Skeleton className={`h-4 w-[${w}px]`} />
      </td>
    ))}
  </tr>
);

/* ══════════════════════════════════════════════════════════ */
export default function MarketsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn:  marketsApi.listAssets,
    refetchInterval: 30_000,
  });

  const assets = (data?.assets ?? []).filter((a: any) =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Markets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live crypto prices in KES · updates every 30s
          </p>
        </div>

        {/* live pulse indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-jungle-400 bg-jungle-500/10 border border-jungle-500/20 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jungle-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-jungle-400" />
          </span>
          Live
        </div>
      </div>

      {/* ── Table card ────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-border bg-card">

        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center">
              <BarChart3 size={14} className="text-jungle-400" />
            </div>
            <p className="text-sm font-bold">All Assets</p>
            {!isLoading && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                {assets.length}
              </span>
            )}
          </div>

          {/* search */}
          <div className="relative w-full sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets…"
              className="pl-8 h-8 text-sm bg-muted/50 border-border focus:bg-card"
            />
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["#", "Asset", "Price (KES)", "24h Change", "Market Cap", "Volume 24h", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3 first:pl-6 last:pr-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
                : assets.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-muted-foreground text-sm">
                        No assets found for &ldquo;{search}&rdquo;
                      </td>
                    </tr>
                  )
                  : assets.map((a: any, idx: number) => {
                      const pct = parseFloat(a.price_change_24h || "0");
                      const pos = pct >= 0;
                      return (
                        <tr
                          key={a.id}
                          className="group border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-150"
                        >
                          {/* index */}
                          <td className="px-4 pl-6 py-3.5 text-muted-foreground text-xs font-mono">
                            {idx + 1}
                          </td>

                          {/* asset */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center text-xs font-black text-jungle-400 shrink-0">
                                {a.symbol.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold group-hover:text-jungle-400 transition-colors">{a.symbol}</p>
                                <p className="text-xs text-muted-foreground">{a.name}</p>
                              </div>
                            </div>
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

                          {/* market cap */}
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                            {formatKES(a.market_cap || "0", 0)}
                          </td>

                          {/* volume */}
                          <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                            {formatKES(a.volume_24h || "0", 0)}
                          </td>

                          {/* action */}
                          <td className="px-4 pr-6 py-3.5">
                            <Link
                              href={`/trade/${a.symbol}`}
                              className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150",
                                "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0",
                                "bg-jungle-600 hover:bg-jungle-500 text-white shadow-md shadow-jungle-900/20"
                              )}
                            >
                              <Zap size={11} />
                              Trade
                            </Link>
                          </td>
                        </tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>

        {/* footer */}
        {!isLoading && assets.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Showing {assets.length} asset{assets.length !== 1 ? "s" : ""} · Prices in KES
            </p>
          </div>
        )}
      </div>
    </div>
  );
}