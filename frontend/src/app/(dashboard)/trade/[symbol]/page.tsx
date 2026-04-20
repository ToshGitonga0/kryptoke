// "use client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import { marketsApi } from "@/lib/api/markets";
// import { ordersApi } from "@/lib/api/orders";
// import { walletsApi } from "@/lib/api/wallets";
// import { cn, formatKES } from "@/lib/utils";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { Activity, TrendingDown, TrendingUp, Wallet } from "lucide-react";
// import { useParams } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import {
//   Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
// } from "recharts";

// import { useTradeStore } from "@/lib/store/tradeStore";
// import { useEffect } from "react";


// /* ── Custom tooltip ─────────────────────────────────────── */
// const ChartTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
//       <p className="text-muted-foreground mb-0.5">{label}</p>
//       <p className="font-mono font-semibold text-jungle-400">
//         {payload[0]?.value?.toLocaleString("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 2 })}
//       </p>
//     </div>
//   );
// };

// /* ── Stat pill ──────────────────────────────────────────── */
// const StatPill = ({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) => (
//   <div className="flex flex-col gap-0.5">
//     <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
//     <span className={cn("text-sm font-semibold text-foreground", mono && "font-mono")}>{value}</span>
//   </div>
// );

// /* ══════════════════════════════════════════════════════════ */
// export default function TradePage() {
//   const params = useParams();
//   const symbol = (params?.symbol as string)?.toUpperCase() ?? "BTC";
//   const qc     = useQueryClient();
//   const [side, setSide] = useState<"buy" | "sell">("buy");
//   const [qty,  setQty]  = useState("");

//   const { data: assets  } = useQuery({ queryKey: ["assets"],  queryFn: marketsApi.listAssets  });
//   const { data: wallets } = useQuery({ queryKey: ["wallets"], queryFn: walletsApi.getWallets  });
//   const asset     = assets?.assets?.find((a: any) => a.symbol === symbol);
//   const kesWallet = wallets?.wallets?.find((w: any) => w.currency === "KES");

//   // inside TradePage(), after the symbol line:
//   const setLastSymbol = useTradeStore((s) => s.setLastSymbol);
//   useEffect(() => { setLastSymbol(symbol); }, [symbol]);


//   const { data: history, isLoading: histLoading } = useQuery({
//     queryKey: ["history", asset?.id],
//     queryFn:  () => marketsApi.getPriceHistory(symbol, 90),
//     enabled:  !!asset?.id,
//   });

//   const chartData = history?.history?.map((p: any) => ({
//     time:  new Date(p.timestamp).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
//     price: parseFloat(p.close),
//   })) ?? [];

//   const execPrice = parseFloat(asset?.current_price || "0");
//   const total     = execPrice * parseFloat(qty || "0");
//   const fee       = total * 0.001;
//   const pct       = parseFloat(asset?.price_change_24h || "0");
//   const pos       = pct >= 0;

//   /* price range from chart data */
//   const prices     = chartData.map((d: any) => d.price);
//   const chartHigh  = prices.length ? Math.max(...prices) : 0;
//   const chartLow   = prices.length ? Math.min(...prices) : 0;

//   const trade = useMutation({
//     mutationFn: async () => {
//       if (!asset || !qty || parseFloat(qty) <= 0) throw new Error("Enter a valid quantity");
//       return ordersApi.placeOrder({ asset_id: asset.id, side, order_type: "market", quantity: parseFloat(qty) });
//     },
//     onSuccess: () => {
//       toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty} ${symbol}!`);
//       setQty("");
//       qc.invalidateQueries({ queryKey: ["wallets"] });
//       qc.invalidateQueries({ queryKey: ["portfolio"] });
//     },
//     onError: (e: any) => toast.error(e?.response?.data?.detail ?? e.message),
//   });

//   return (
//     <div className="space-y-4 max-w-2xl">

//       {/* ── Hero header ─────────────────────────────────── */}
//       <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-5">
//         {/* subtle green glow */}
//         <div className={cn(
//           "absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none",
//           pos ? "bg-jungle-500" : "bg-red-500"
//         )} />

//         <div className="relative flex items-start justify-between gap-4 flex-wrap">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-2xl bg-jungle-500/15 border border-jungle-500/25 flex items-center justify-center text-xl font-black text-jungle-400">
//               {symbol.charAt(0)}
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-2xl font-black tracking-tight">{symbol}</h1>
//                 <span className="text-sm text-muted-foreground font-medium">{asset?.name}</span>
//               </div>
//               {asset
//                 ? <div className="flex items-center gap-2 mt-0.5">
//                     <span className="font-mono text-2xl font-bold">{formatKES(asset.current_price, 2)}</span>
//                     <span className={cn(
//                       "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
//                       pos
//                         ? "bg-jungle-500/15 text-jungle-400 border border-jungle-500/25"
//                         : "bg-red-500/15 text-red-400 border border-red-500/25"
//                     )}>
//                       {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
//                       {pos ? "+" : ""}{pct.toFixed(2)}%
//                     </span>
//                   </div>
//                 : <Skeleton className="h-8 w-40 mt-1" />
//               }
//             </div>
//           </div>

//           {/* stat pills */}
//           <div className="flex items-center gap-5 flex-wrap text-right sm:text-left">
//             <StatPill label="90D High" value={chartHigh ? formatKES(String(chartHigh), 2) : "—"} />
//             <StatPill label="90D Low"  value={chartLow  ? formatKES(String(chartLow),  2) : "—"} />
//             <StatPill label="KES Balance" value={kesWallet ? formatKES(kesWallet.balance, 2) : "—"} />
//           </div>
//         </div>
//       </div>

//       {/* ── Chart ───────────────────────────────────────── */}
//       <Card className="overflow-hidden">
//         <CardHeader className="pb-0 pt-4 px-5">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-sm font-semibold flex items-center gap-2">
//               <Activity size={14} className="text-jungle-400" />
//               Price History · 90 Days
//             </CardTitle>
//             <span className="text-xs text-muted-foreground">KES</span>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0 pt-2">
//           {histLoading
//             ? <div className="h-52 flex items-center justify-center">
//                 <Skeleton className="h-44 w-[95%] mx-auto rounded-xl" />
//               </div>
//             : <ResponsiveContainer width="100%" height={208}>
//                 <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%"   stopColor={pos ? "#40916c" : "#ef4444"} stopOpacity={0.35} />
//                       <stop offset="100%" stopColor={pos ? "#40916c" : "#ef4444"} stopOpacity={0}    />
//                     </linearGradient>
//                   </defs>
//                   <XAxis
//                     dataKey="time"
//                     tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
//                     tickLine={false}
//                     axisLine={false}
//                     interval="preserveStartEnd"
//                   />
//                   <YAxis
//                     hide
//                     domain={[(d: number) => d * 0.995, (d: number) => d * 1.005]}
//                   />
//                   <Tooltip content={<ChartTooltip />} cursor={{ stroke: pos ? "#40916c" : "#ef4444", strokeWidth: 1, strokeDasharray: "4 2" }} />
//                   <Area
//                     type="monotone"
//                     dataKey="price"
//                     stroke={pos ? "#40916c" : "#ef4444"}
//                     strokeWidth={2}
//                     fill="url(#greenGrad)"
//                     dot={false}
//                     activeDot={{ r: 4, fill: pos ? "#40916c" : "#ef4444", strokeWidth: 0 }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//           }
//         </CardContent>
//       </Card>

//       {/* ── Order form ──────────────────────────────────── */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="text-base font-bold">Place Order</CardTitle>
//         </CardHeader>
//         <Separator />
//         <CardContent className="pt-4 space-y-4">

//           {/* Buy / Sell toggle */}
//           <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted ">
//             {(["buy", "sell"] as const).map((s) => (
//               <button
//                 key={s}
//                 onClick={() => setSide(s)}
//                 className={cn(
//                   "py-2 rounded-lg text-sm font-bold capitalize transition-all duration-200",
//                   side === s
//                     ? s === "buy"
//                       ? "bg-jungle-600 text-white shadow-md shadow-jungle-900/30"
//                       : "bg-red-500 text-white shadow-md shadow-red-900/30"
//                     : "text-muted-foreground hover:text-foreground"
//                 )}
//               >
//                 {s === "buy" ? "Buy" : "Sell"} {symbol}
//               </button>
//             ))}
//           </div>

//           {/* Quantity input */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Quantity ({symbol})</label>
//             <div className="relative">
//               <Input
//                 type="number" min="0" step="0.000001"
//                 value={qty}
//                 onChange={(e) => setQty(e.target.value)}
//                 placeholder="0.00000000"
//                 className="font-mono pr-16"
//               />
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
//                 {symbol}
//               </span>
//             </div>
//           </div>

//           {/* Order summary */}
//           {qty && parseFloat(qty) > 0 && (
//             <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2 text-sm">
//               {[
//                 { label: "Market Price",  value: formatKES(String(execPrice), 2) },
//                 { label: "Subtotal",      value: formatKES(String(total),     2) },
//                 { label: "Fee (0.1%)",    value: formatKES(String(fee),       2) },
//               ].map(({ label, value }) => (
//                 <div key={label} className="flex justify-between items-center">
//                   <span className="text-muted-foreground">{label}</span>
//                   <span className="font-mono">{value}</span>
//                 </div>
//               ))}
//               <Separator className="my-1" />
//               <div className="flex justify-between items-center font-bold">
//                 <span>{side === "buy" ? "You pay" : "You receive"}</span>
//                 <span className={cn(
//                   "font-mono text-base",
//                   side === "buy" ? "positive" : "negative"
//                 )}>
//                   {formatKES(String(side === "buy" ? total + fee : total - fee), 2)}
//                 </span>
//               </div>
//             </div>
//           )}

//           {/* Balance row */}
//           {kesWallet && (
//             <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
//               <Wallet size={12} />
//               <span>Available Balance:</span>
//               <span className="font-mono font-semibold text-foreground ml-auto">
//                 {formatKES(kesWallet.balance, 2)}
//               </span>
//             </div>
//           )}

//           {/* Submit */}
//           <Button
//             className={cn(
//               "w-full font-bold h-11 rounded-xl text-white transition-all",
//               side === "buy"
//                 ? "bg-jungle-600 hover:bg-jungle-500 shadow-lg shadow-jungle-900/20"
//                 : "bg-red-500 hover:bg-red-400 shadow-lg shadow-red-900/20"
//             )}
//             disabled={trade.isPending || !qty || parseFloat(qty) <= 0}
//             onClick={() => trade.mutate()}
//           >
//             {trade.isPending
//               ? "Processing…"
//               : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





"use client";
import OrderBook from "@/components/trade/OrderBook";
import RecentTrades from "@/components/trade/RecentTrades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { marketsApi } from "@/lib/api/markets";
import { ordersApi } from "@/lib/api/orders";
import { walletsApi } from "@/lib/api/wallets";
import { useTradeStore } from "@/lib/store/tradeStore";
import { cn, formatKES } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  BookOpen,
  RefreshCw, TrendingDown, TrendingUp
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Area, AreaChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

// ── Time ranges ─────────────────────────────────────────────────────
const RANGES = [
  { label: "1H",  days: 0.042 },
  { label: "24H", days: 1     },
  { label: "7D",  days: 7     },
  { label: "1M",  days: 30    },
  { label: "3M",  days: 90    },
] as const;

// ── Tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-mono font-bold text-jungle-400">
        {formatKES(payload[0]?.value, 2)}
      </p>
    </div>
  );
};

// ── Stat pill ────────────────────────────────────────────────────────
const Stat = ({ label, value, positive }: { label: string; value: string; positive?: boolean }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{label}</span>
    <span className={cn(
      "text-sm font-mono font-semibold",
      positive === true  && "text-jungle-400",
      positive === false && "text-red-400",
      positive === undefined && "text-foreground"
    )}>{value}</span>
  </div>
);

// ── Book/Trades tab ─────────────────────────────────────────────────
type DepthTab = "book" | "trades" | "chart";

/* ══════════════════════════════════════════════════════════ */
export default function TradePage() {
  const params      = useParams();
  const symbol      = (params?.symbol as string)?.toUpperCase() ?? "BTC";
  const qc          = useQueryClient();
  const setLastSym  = useTradeStore((s) => s.setLastSymbol);

  const [side, setSide]           = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [qty, setQty]             = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [range, setRange]         = useState<typeof RANGES[number]>(RANGES[2]);
  const [depthTab, setDepthTab]   = useState<DepthTab>("book");

  useEffect(() => { setLastSym(symbol); }, [symbol, setLastSym]);

  // ── Data fetching ──────────────────────────────────────────────
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ["asset", symbol],
    queryFn:  () => marketsApi.getAsset(symbol),
    refetchInterval: 8_000,
  });

  const historyLimit = useMemo(() => Math.max(1, Math.ceil(range.days * 96)), [range]);
  const { data: historyData } = useQuery({
    queryKey: ["price-history", symbol, historyLimit],
    queryFn:  () => marketsApi.getPriceHistory(symbol, Math.min(historyLimit, 365)),
    refetchInterval: 30_000,
  });

  const { data: walletsData } = useQuery({
    queryKey: ["wallets"],
    queryFn:  walletsApi.getWallets,
  });

  const { data: assetsData } = useQuery({
    queryKey: ["assets"],
    queryFn:  marketsApi.listAssets,
  });

  // ── Derived values ─────────────────────────────────────────────
  const asset = assetData as any;
  const price = parseFloat(asset?.current_price ?? "0");
  const pct   = parseFloat(asset?.price_change_24h ?? "0");
  const isUp  = pct >= 0;

  const chartData = useMemo(() => {
    const history = historyData?.history ?? [];
    return history.map((h: any) => ({
      date:   format(new Date(h.timestamp), range.days <= 1 ? "HH:mm" : "dd/MM"),
      close:  parseFloat(h.close),
      open:   parseFloat(h.open),
      high:   parseFloat(h.high),
      low:    parseFloat(h.low),
      volume: parseFloat(h.volume),
    }));
  }, [historyData, range.days]);

  // KES wallet balance
  const kesWallet = (walletsData?.wallets ?? []).find((w: any) => w.currency === "KES");
  const cryptoWallet = (walletsData?.wallets ?? []).find((w: any) => w.currency === symbol);
  const kesBalance   = parseFloat(kesWallet?.balance ?? "0");
  const cryptoBalance = parseFloat(cryptoWallet?.balance ?? "0");

  // Asset UUID from list
  const assetId = useMemo(() => {
    return assetsData?.assets?.find((a: any) => a.symbol === symbol)?.id;
  }, [assetsData, symbol]);

  // Order total calculation
  const execPrice = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : price;
  const orderTotal = (parseFloat(qty) || 0) * execPrice;
  const tradingFee = orderTotal * 0.001;

  const insufficientFunds = side === "buy"
    ? kesBalance < orderTotal + tradingFee
    : cryptoBalance < (parseFloat(qty) || 0);

  // ── Place order ────────────────────────────────────────────────
  const { mutate: placeOrder, isPending: placing } = useMutation({
    mutationFn: (payload: any) => ordersApi.placeOrder(payload),
    onSuccess: () => {
      toast.success(`${side === "buy" ? "Buy" : "Sell"} order placed successfully!`);
      setQty("");
      setLimitPrice("");
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["recent-trades", symbol] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Order failed. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!assetId) return toast.error("Asset not found");
    if (!qty || parseFloat(qty) <= 0) return toast.error("Enter a valid quantity");
    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0))
      return toast.error("Enter a valid limit price");

    placeOrder({
      asset_id:   assetId,
      side,
      order_type: orderType,
      quantity:   parseFloat(qty),
      price:      orderType === "limit" ? parseFloat(limitPrice) : undefined,
    });
  };

  // Quick fill % of balance
  const fillPct = (pct: number) => {
    if (side === "buy") {
      const available = kesBalance * pct;
      const maxQty    = execPrice > 0 ? available / execPrice : 0;
      setQty(maxQty.toFixed(6));
    } else {
      setQty((cryptoBalance * pct).toFixed(6));
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Symbol header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center text-base font-black text-jungle-400 shrink-0">
            {symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{symbol}</h1>
              <span className="text-sm text-muted-foreground">{asset?.name}</span>
            </div>
            {assetLoading
              ? <Skeleton className="h-7 w-44 mt-1" />
              : (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-black font-mono">{formatKES(price, 2)}</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border font-mono",
                    isUp ? "bg-jungle-500/10 text-jungle-400 border-jungle-500/25"
                         : "bg-red-500/10 text-red-400 border-red-500/25"
                  )}>
                    {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isUp ? "+" : ""}{pct.toFixed(2)}%
                  </span>
                </div>
              )
            }
          </div>
        </div>

        {/* 24h stats row */}
        <div className="flex flex-wrap items-center gap-5 text-muted-foreground">
          <Stat label="24h High"   value={formatKES(asset?.current_price ? price * 1.02 : 0, 2)} />
          <Stat label="24h Low"    value={formatKES(asset?.current_price ? price * 0.97 : 0, 2)} />
          <Stat label="24h Vol"    value={formatKES(asset?.volume_24h ?? 0, 0)} />
          <Stat label="Market Cap" value={formatKES(asset?.market_cap ?? 0, 0)} />
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">

        {/* ── Left: chart + depth ────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Chart card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Chart header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-jungle-400" />
                <span className="text-sm font-bold">Price Chart</span>
                <span className="relative flex h-1.5 w-1.5 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jungle-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-jungle-400" />
                </span>
              </div>
              {/* Range selector */}
              <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRange(r)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-md transition-all",
                      range.label === r.label
                        ? "bg-jungle-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart body */}
            <div className="h-72 px-2 pt-3 pb-1">
              {chartData.length === 0
                ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw size={20} className="animate-spin text-muted-foreground" />
                  </div>
                )
                : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        tickLine={false} axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        tickLine={false} axisLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1_000_000) return `${(v/1_000_000).toFixed(1)}M`;
                          if (v >= 1_000)    return `${(v/1_000).toFixed(0)}K`;
                          return v.toFixed(0);
                        }}
                        width={60}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={isUp ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fill="url(#priceGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: isUp ? "#22c55e" : "#ef4444", strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          </div>

          {/* Depth / Trades card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {([
                { id: "book",   label: "Order Book", Icon: BookOpen       },
                { id: "trades", label: "Live Trades", Icon: Activity      },
              ] as const).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setDepthTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-5 py-3 text-xs font-bold border-b-2 transition-all",
                    depthTab === id
                      ? "border-jungle-400 text-jungle-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            <div className="h-[420px] overflow-hidden">
              {depthTab === "book"
                ? <OrderBook currentPrice={price} symbol={symbol} />
                : <RecentTrades symbol={symbol} />
              }
            </div>
          </div>
        </div>

        {/* ── Right: order form ─────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden h-fit sticky top-16">

          {/* Buy / Sell tabs */}
          <div className="grid grid-cols-2">
            {(["buy", "sell"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={cn(
                  "py-3.5 text-sm font-black uppercase tracking-wider transition-all",
                  side === s
                    ? s === "buy"
                      ? "bg-jungle-600 text-white"
                      : "bg-red-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-4">

            {/* Order type */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {(["market", "limit"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all",
                    orderType === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Balance display */}
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  {side === "buy" ? "Available KES" : `Available ${symbol}`}
                </span>
                <span className="font-mono font-bold text-foreground">
                  {side === "buy"
                    ? `KES ${kesBalance.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `${cryptoBalance.toFixed(6)} ${symbol}`
                  }
                </span>
              </div>
            </div>

            {/* Limit price (only for limit orders) */}
            {orderType === "limit" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Limit Price (KES)
                </label>
                <Input
                  type="number"
                  placeholder={formatKES(price, 2)}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Amount ({symbol})
              </label>
              <Input
                type="number"
                placeholder="0.00000"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="font-mono text-base"
              />

              {/* Quick fill buttons */}
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {[0.25, 0.5, 0.75, 1].map((p) => (
                  <button
                    key={p}
                    onClick={() => fillPct(p)}
                    className="py-1 text-[10px] font-bold rounded-lg bg-muted hover:bg-[var(--muted-foreground)]/20 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {p * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* Order summary */}
            {qty && parseFloat(qty) > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono font-semibold">{formatKES(execPrice, 2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-semibold">{formatKES(orderTotal, 2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fee (0.1%)</span>
                  <span className="font-mono text-muted-foreground">
                    {formatKES(tradingFee, 2)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-sm">
                  <span className="font-bold">Total</span>
                  <span className="font-mono font-black">
                    {side === "buy"
                      ? formatKES(orderTotal + tradingFee, 2)
                      : `${parseFloat(qty).toFixed(6)} ${symbol}`}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={placing || !qty || parseFloat(qty) <= 0 || insufficientFunds}
              className={cn(
                "w-full h-12 font-black text-base uppercase tracking-wide rounded-xl shadow-lg transition-all",
                side === "buy"
                  ? "bg-jungle-600 hover:bg-jungle-500 text-white shadow-jungle-900/20"
                  : "bg-red-500 hover:bg-red-400 text-white shadow-red-900/20"
              )}
            >
              {placing
                ? "Placing…"
                : insufficientFunds
                  ? "Insufficient Balance"
                  : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`
              }
            </Button>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              All trades are executed immediately at market price.
              KryptoKE charges a flat 0.1% trading fee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}