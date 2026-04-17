"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { walletsApi } from "@/lib/api/wallets";
import { cn, formatKES } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const TYPE_META: Record<string, { label: string; colorClass: string; isIn: boolean }> = {
  deposit:    { label: "Deposit",    colorClass: "text-jungle-500", isIn: true  },
  withdrawal: { label: "Withdrawal", colorClass: "text-red-500",     isIn: false },
  trade_buy:  { label: "Buy Trade",  colorClass: "text-jungle-500", isIn: true  },
  trade_sell: { label: "Sell Trade", colorClass: "text-red-500",     isIn: false },
  fee:        { label: "Fee",        colorClass: "text-yellow-500",  isIn: false },
};
const STATUS_CLASS: Record<string, string> = {
  completed: "bg-jungle-500/10 text-jungle-500 border-jungle-500/20",
  failed:    "bg-red-500/10 text-red-500 border-red-500/20",
  pending:   "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};
const PER_PAGE = 20;

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page],
    queryFn:  () => walletsApi.getTransactions((page - 1) * PER_PAGE, PER_PAGE),
  });

  const txns       = data?.transactions ?? [];
  const total      = data?.total        ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Full history of deposits, withdrawals and trades</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
          <span className="text-sm text-muted-foreground">{total} total</span>
        </CardHeader>
        <Separator />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Type","Amount","Currency","Status","Description","Reference","Date"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-6 last:pr-6 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : txns.map((t) => {
                    const meta = TYPE_META[t.type] ?? { label: t.type, colorClass: "text-foreground", isIn: true };
                    return (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="px-4 pl-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                              meta.isIn ? "bg-jungle-500/10 text-jungle-500" : "bg-red-500/10 text-red-500")}>
                              {meta.isIn ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                            </div>
                            <span className="font-medium">{meta.label}</span>
                          </div>
                        </td>
                        <td className={cn("px-4 py-3.5 font-mono font-semibold tabular-nums", meta.colorClass)}>
                          {meta.isIn ? "+" : "−"}
                          {t.currency === "KES" ? formatKES(t.amount, 2) : `${parseFloat(t.amount).toFixed(6)} ${t.currency}`}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-muted-foreground">{t.currency}</td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                            STATUS_CLASS[t.status] ?? STATUS_CLASS.pending)}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs max-w-[160px] truncate">{t.description ?? "—"}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{t.reference ?? "—"}</td>
                        <td className="px-4 pr-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(t.created_at), "dd MMM yy HH:mm")}
                        </td>
                      </tr>
                    );
                  })}
              {!isLoading && txns.length === 0 && (
                <tr><td colSpan={7} className="py-14 text-center text-muted-foreground">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-border">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
