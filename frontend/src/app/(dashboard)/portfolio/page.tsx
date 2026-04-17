// "use client";
// import { Skeleton } from "@/components/ui/skeleton";
// import { portfolioApi } from "@/lib/api/portfolio";
// import { cn, formatKES, formatPct } from "@/lib/utils";
// import { useQuery } from "@tanstack/react-query";
// import {
//   BarChart3, Briefcase, TrendingDown, TrendingUp, Zap,
// } from "lucide-react";
// import Link from "next/link";

// /* ── Summary card ────────────────────────────────────────── */
// const SummaryCard = ({
//   label, value, sub, color, glow, loading,
// }: {
//   label: string; value: string; sub?: string;
//   color?: string; glow?: string; loading: boolean;
// }) => (
//   <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-5">
//     {glow && (
//       <div className={cn("absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none", glow)} />
//     )}
//     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 relative">
//       {label}
//     </p>
//     {loading
//       ? <Skeleton className="h-8 w-32" />
//       : <p className={cn("text-2xl font-black font-mono tracking-tight relative", color ?? "text-foreground")}>
//           {value}
//         </p>
//     }
//     {sub && !loading && (
//       <p className={cn("text-xs font-mono mt-1 relative", color ?? "text-muted-foreground")}>{sub}</p>
//     )}
//   </div>
// );

// /* ── Holding skeleton ────────────────────────────────────── */
// const HoldingSkeleton = () => (
//   <div className="p-4 flex items-center gap-3 border-b border-border">
//     <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
//     <div className="flex-1 space-y-2">
//       <Skeleton className="h-4 w-28" />
//       <Skeleton className="h-3 w-44" />
//       <Skeleton className="h-1.5 w-full rounded-full" />
//     </div>
//   </div>
// );

// /* ══════════════════════════════════════════════════════════ */
// export default function PortfolioPage() {
//   const { data, isLoading } = useQuery({
//     queryKey: ["portfolio"],
//     queryFn:  portfolioApi.getPortfolio,
//     refetchInterval: 30_000,
//   });

//   const holdings    = data?.items ?? [];
//   const totalValue  = parseFloat(data?.total_value ?? "0");
//   const totalPnl    = parseFloat(data?.total_pnl   ?? "0");
//   const pnlPositive = totalPnl >= 0;

//   return (
//     <div className="space-y-5 max-w-2xl">

//       {/* ── Page header ───────────────────────────────── */}
//       <div>
//         <h1 className="text-2xl font-black tracking-tight">Portfolio</h1>
//         <p className="text-sm text-muted-foreground mt-0.5">
//           Your crypto holdings and performance
//         </p>
//       </div>

//       {/* ── Summary cards ─────────────────────────────── */}
//       <div className="grid grid-cols-2 gap-3">
//         <SummaryCard
//           label="Total Value"
//           value={formatKES(data?.total_value ?? "0", 2)}
//           glow="bg-jungle-500"
//           color="text-jungle-400"
//           loading={isLoading}
//         />
//         <SummaryCard
//           label="Total P&L"
//           value={`${pnlPositive ? "+" : ""}${formatKES(data?.total_pnl ?? "0", 2)}`}
//           sub={formatPct(data?.total_pnl_pct ?? "0")}
//           glow={pnlPositive ? "bg-jungle-500" : "bg-red-500"}
//           color={pnlPositive ? "positive" : "negative"}
//           loading={isLoading}
//         />
//       </div>

//       {/* ── Holdings ──────────────────────────────────── */}
//       <div className="rounded-2xl overflow-hidden border border-border bg-card">

//         {/* header */}
//         <div className="flex items-center justify-between px-5 py-4 border-b border-border">
//           <div className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center">
//               <Briefcase size={14} className="text-jungle-400" />
//             </div>
//             <p className="text-sm font-bold">Holdings</p>
//             {!isLoading && (
//               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
//                 {holdings.length}
//               </span>
//             )}
//           </div>
//           {!isLoading && holdings.length > 0 && (
//             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
//               <BarChart3 size={12} />
//               {formatKES(String(totalValue), 0)} total
//             </div>
//           )}
//         </div>

//         {/* list */}
//         <div className="divide-y divide-[var(--border)]">
//           {isLoading
//             ? Array.from({ length: 4 }).map((_, i) => <HoldingSkeleton key={i} />)
//             : holdings.length === 0
//               ? (
//                 <div className="py-16 flex flex-col items-center gap-3 text-center">
//                   <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
//                     <Briefcase size={20} className="text-muted-foreground" />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-sm">No holdings yet</p>
//                     <p className="text-xs text-muted-foreground mt-0.5">Start trading to build your portfolio</p>
//                   </div>
//                   <Link
//                     href="/markets"
//                     className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-jungle-600 hover:bg-jungle-500 text-white transition-colors"
//                   >
//                     <Zap size={12} /> Browse Markets
//                   </Link>
//                 </div>
//               )
//               : holdings.map((h: any) => {
//                   const value      = parseFloat(h.current_value ?? "0");
//                   const pnl        = parseFloat(h.pnl    ?? "0");
//                   const pnlPct     = parseFloat(h.pnl_pct ?? "0");
//                   const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
//                   const positive   = pnl >= 0;

//                   return (
//                     <div key={h.id} className="group p-4 hover:bg-muted/30 transition-colors">
//                       <div className="flex items-center gap-3">

//                         {/* icon */}
//                         <div className="w-10 h-10 rounded-xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center font-black text-jungle-400 shrink-0">
//                           {h.asset?.symbol?.charAt(0) ?? "?"}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           {/* row 1 — symbol + value */}
//                           <div className="flex items-center justify-between gap-2 mb-0.5">
//                             <p className="font-bold text-sm group-hover:text-jungle-400 transition-colors">
//                               {h.asset?.symbol}
//                             </p>
//                             <p className="font-mono font-bold text-sm">
//                               {formatKES(String(value), 2)}
//                             </p>
//                           </div>

//                           {/* row 2 — quantity + pnl */}
//                           <div className="flex items-center justify-between gap-2 mb-2.5">
//                             <span className="text-xs font-mono text-muted-foreground">
//                               {parseFloat(h.quantity).toFixed(6)} {h.asset?.symbol}
//                             </span>
//                             <span className={cn(
//                               "inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full border font-mono",
//                               positive
//                                 ? "bg-jungle-500/10 text-jungle-400 border-jungle-500/25"
//                                 : "bg-red-500/10 text-red-400 border-red-500/25"
//                             )}>
//                               {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
//                               {positive ? "+" : ""}{pnlPct.toFixed(2)}%
//                             </span>
//                           </div>

//                           {/* row 3 — allocation bar */}
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
//                               <div
//                                 className="h-full rounded-full bg-jungle-500 transition-all duration-500"
//                                 style={{ width: `${allocation}%` }}
//                               />
//                             </div>
//                             <span className="text-[10px] font-mono text-muted-foreground w-10 text-right shrink-0">
//                               {allocation.toFixed(1)}%
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* trade button */}
//                       <div className="mt-3 flex items-center justify-between">
//                         <span className="text-xs text-muted-foreground">
//                           P&L:{" "}
//                           <span className={cn("font-mono font-semibold", positive ? "positive" : "negative")}>
//                             {positive ? "+" : ""}{formatKES(String(pnl), 2)}
//                           </span>
//                         </span>
//                         <Link
//                           href={`/trade/${h.asset?.symbol}`}
//                           className={cn(
//                             "inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150",
//                             "opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0",
//                             "bg-jungle-600 hover:bg-jungle-500 text-white shadow-md shadow-jungle-900/20"
//                           )}
//                         >
//                           <Zap size={11} /> Trade
//                         </Link>
//                       </div>
//                     </div>
//                   );
//                 })
//           }
//         </div>

//         {/* footer */}
//         {!isLoading && holdings.length > 0 && (
//           <div className="px-5 py-3 border-t border-border bg-muted/30">
//             <p className="text-xs text-muted-foreground text-center">
//               {holdings.length} asset{holdings.length !== 1 ? "s" : ""} · updates every 30s
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { portfolioApi } from "@/lib/api/portfolio";
import { cn, formatKES, formatPct } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight, Briefcase, TrendingDown, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip,
  XAxis, YAxis,
} from "recharts";

const CHART_COLORS = [
  "#22c55e","#3b82f6","#f59e0b","#ef4444",
  "#8b5cf6","#06b6d4","#f97316","#ec4899",
];

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="font-bold mb-0.5">{payload[0].name}</p>
      <p className="font-mono">{formatKES(payload[0].value, 2)}</p>
      <p className="text-muted-foreground">{payload[0].payload.pct?.toFixed(1)}%</p>
    </div>
  );
};

export default function PortfolioPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn:  portfolioApi.getPortfolio,
    refetchInterval: 15_000,
  });

  const portfolio    = data as any;
  const items        = portfolio?.items ?? [];
  const totalValue   = parseFloat(portfolio?.total_value    ?? "0");
  const totalInvested = parseFloat(portfolio?.total_invested ?? "0");
  const totalPnl     = parseFloat(portfolio?.total_pnl      ?? "0");
  const totalPnlPct  = parseFloat(portfolio?.total_pnl_pct  ?? "0");
  const isPnlPos     = totalPnl >= 0;

  // Pie chart data
  const pieData = useMemo(() =>
    items
      .filter((i: any) => parseFloat(i.current_value ?? "0") > 0)
      .map((i: any, idx: number) => ({
        name:  i.asset?.symbol ?? "?",
        value: parseFloat(i.current_value ?? "0"),
        pct:   totalValue > 0 ? parseFloat(i.current_value ?? "0") / totalValue * 100 : 0,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }))
  , [items, totalValue]);

  // Simulated P&L performance history (last 30 data points)
  const perfData = useMemo(() => {
    if (!totalValue) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const dayAgo = 30 - i;
      const noise  = 1 + (Math.random() - 0.5) * 0.04;
      return {
        day:   `D-${dayAgo}`,
        value: totalValue * (0.85 + (i / 30) * 0.15) * noise,
      };
    });
  }, [totalValue]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center">
          <Briefcase size={36} className="text-jungle-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black">Your portfolio is empty</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Start trading to build your crypto portfolio
          </p>
        </div>
        <Link href="/trade/BTC"
          className="btn-primary bg-jungle-600 hover:bg-jungle-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-jungle-900/20">
          Start Trading
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your holdings and performance at a glance
        </p>
      </div>

      {/* ── Hero stats ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-6">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-jungle-500 blur-3xl opacity-[0.08] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Total Portfolio Value
            </p>
            <p className="text-4xl font-black font-mono">{formatKES(totalValue, 2)}</p>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Invested</p>
              <p className="font-mono font-semibold">{formatKES(totalInvested, 2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">P&amp;L</p>
              <p className={cn("font-mono font-semibold flex items-center gap-1", isPnlPos ? "positive" : "negative")}>
                {isPnlPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatKES(totalPnl, 2)}
                <span className="text-xs">({formatPct(totalPnlPct)})</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Allocation pie */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-bold mb-4">Allocation</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <RTooltip content={<PieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span className="text-xs">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance area chart */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-bold mb-4">Performance (30d simulated)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={perfData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <RTooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
                      <p className="text-muted-foreground mb-0.5">{label}</p>
                      <p className="font-mono font-bold text-jungle-400">{formatKES(payload[0].value as number, 2)}</p>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#perfGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Holdings table ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-bold">Holdings</p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {items.map((item: any) => {
            const sym        = item.asset?.symbol ?? "?";
            const curVal     = parseFloat(item.current_value  ?? "0");
            const pnl        = parseFloat(item.unrealised_pnl ?? "0");
            const pnlPct     = parseFloat(item.unrealised_pnl_pct ?? "0");
            const qty        = parseFloat(item.quantity       ?? "0");
            const avgCost    = parseFloat(item.average_cost   ?? "0");
            const curPrice   = parseFloat(item.asset?.current_price ?? "0");
            const pos        = pnl >= 0;
            return (
              <Link
                key={item.id}
                href={`/trade/${sym}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-jungle-400">{sym.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{sym}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {qty.toFixed(6)} · avg {formatKES(avgCost, 2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm">{formatKES(curVal, 2)}</p>
                  <p className={cn("text-xs font-mono flex items-center justify-end gap-0.5", pos ? "positive" : "negative")}>
                    {pos
                      ? <ArrowUpRight size={11} />
                      : <ArrowUpRight size={11} className="rotate-180" />}
                    {formatKES(pnl, 2)} ({formatPct(pnlPct)})
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-mono text-sm">{formatKES(curPrice, 2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}