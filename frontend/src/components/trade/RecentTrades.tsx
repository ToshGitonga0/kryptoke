"use client";
import { marketsApi } from "@/lib/api/markets";
import { cn, formatKES } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  symbol: string;
}

export default function RecentTrades({ symbol }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-trades", symbol],
    queryFn:  () => marketsApi.getRecentTrades(symbol),
    refetchInterval: 5_000,
  });

  const trades: any[] = data?.trades ?? [];

  if (isLoading) {
    return (
      <div className="space-y-1 p-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <span className="text-sm">No trades yet for {symbol}</span>
        <span className="text-xs mt-1 opacity-60">Be the first to trade!</span>
      </div>
    );
  }

  const colHdr = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";
  const numCls = "font-mono text-xs tabular-nums";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-border">
        <span className={colHdr}>Side</span>
        <span className={cn(colHdr, "text-right")}>Price (KES)</span>
        <span className={cn(colHdr, "text-right")}>Amount</span>
        <span className={cn(colHdr, "text-right")}>Time</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((t: any, i: number) => {
          const isBuy = t.side === "buy";
          return (
            <div
              key={i}
              className="grid grid-cols-4 gap-2 px-4 py-[5px] hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0"
            >
              <span className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                isBuy ? "positive" : "negative"
              )}>
                {isBuy
                  ? <ArrowUpRight size={12} />
                  : <ArrowDownLeft size={12} />
                }
                {isBuy ? "Buy" : "Sell"}
              </span>
              <span className={cn(numCls, "text-right", isBuy ? "positive" : "negative")}>
                {formatKES(parseFloat(t.price), 2)}
              </span>
              <span className={cn(numCls, "text-right text-foreground")}>
                {parseFloat(t.quantity).toFixed(5)}
              </span>
              <span className={cn(numCls, "text-right text-muted-foreground")}>
                {format(new Date(t.executed_at), "HH:mm:ss")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}