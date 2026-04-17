"use client";
import { cn, formatKES } from "@/lib/utils";
import { useEffect, useState } from "react";

interface OrderLevel {
  price: number;
  qty:   number;
  total: number;
  depth: number; // 0-100, for the depth bar
}

interface Props {
  currentPrice: number;
  symbol:       string;
}

function generateLevels(
  basePrice: number,
  side: "ask" | "bid",
  levels = 12
): OrderLevel[] {
  const spread = basePrice * 0.0008;
  let cumTotal = 0;
  const raw: Omit<OrderLevel, "depth">[] = Array.from({ length: levels }, (_, i) => {
    const offset    = spread * (i + 1) * (0.3 + Math.random() * 0.7);
    const price     = side === "ask" ? basePrice + offset : basePrice - offset;
    const qty       = Math.max(0.001, (Math.random() * 1.5 + 0.05) * (1 - i * 0.04));
    cumTotal       += qty;
    return { price, qty, total: cumTotal };
  });

  const maxTotal = raw[raw.length - 1].total;
  return raw.map((r) => ({ ...r, depth: (r.total / maxTotal) * 100 }));
}

export default function OrderBook({ currentPrice, symbol }: Props) {
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [bids, setBids] = useState<OrderLevel[]>([]);

  useEffect(() => {
    if (!currentPrice) return;

    const refresh = () => {
      const newAsks = generateLevels(currentPrice, "ask", 12).reverse();
      const newBids = generateLevels(currentPrice, "bid", 12);
      setAsks(newAsks);
      setBids(newBids);
    };

    refresh();
    const timer = setInterval(refresh, 2500);
    return () => clearInterval(timer);
  }, [currentPrice]);

  const colHdr = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";
  const numCls = "font-mono text-xs tabular-nums";

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 px-4 py-2 border-b border-border">
        <span className={colHdr}>Price (KES)</span>
        <span className={cn(colHdr, "text-right")}>Amount ({symbol})</span>
        <span className={cn(colHdr, "text-right")}>Total</span>
      </div>

      {/* Asks (sell orders) — displayed top-to-bottom, lowest ask at bottom */}
      <div className="flex-1 overflow-hidden flex flex-col justify-end px-1 py-1 space-y-0">
        {asks.map((level, i) => (
          <div key={i} className="relative grid grid-cols-3 gap-2 px-3 py-[3px] rounded hover:bg-red-500/5 transition-colors">
            {/* depth bar */}
            <div
              className="absolute inset-y-0 right-0 bg-red-500/8 rounded"
              style={{ width: `${level.depth}%` }}
            />
            <span className={cn(numCls, "text-red-400 relative z-10")}>
              {formatKES(level.price, 2)}
            </span>
            <span className={cn(numCls, "text-right relative z-10 text-foreground")}>
              {level.qty.toFixed(4)}
            </span>
            <span className={cn(numCls, "text-right relative z-10 text-muted-foreground")}>
              {level.total.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center gap-3 py-2 border-y border-border bg-muted/30">
        <span className="text-sm font-black text-foreground font-mono">
          {formatKES(currentPrice, 2)}
        </span>
        {asks.length > 0 && bids.length > 0 && (
          <span className="text-[10px] text-muted-foreground font-mono">
            Spread: {formatKES(asks[asks.length - 1]?.price - bids[0]?.price, 2)}
          </span>
        )}
      </div>

      {/* Bids (buy orders) */}
      <div className="flex-1 overflow-hidden px-1 py-1 space-y-0">
        {bids.map((level, i) => (
          <div key={i} className="relative grid grid-cols-3 gap-2 px-3 py-[3px] rounded hover:bg-jungle-500/5 transition-colors">
            <div
              className="absolute inset-y-0 right-0 bg-jungle-500/8 rounded"
              style={{ width: `${level.depth}%` }}
            />
            <span className={cn(numCls, "text-jungle-400 relative z-10")}>
              {formatKES(level.price, 2)}
            </span>
            <span className={cn(numCls, "text-right relative z-10 text-foreground")}>
              {level.qty.toFixed(4)}
            </span>
            <span className={cn(numCls, "text-right relative z-10 text-muted-foreground")}>
              {level.total.toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}