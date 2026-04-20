"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/lib/api/orders";
import { cn, formatKES } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const STATUS_CLASS: Record<string, string> = {
  open:             "bg-jungle-500/10 text-jungle-500 border-jungle-500/20",
  filled:           "bg-jungle-500/10 text-jungle-500 border-jungle-500/20",
  partially_filled: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  cancelled:        "bg-muted text-muted-foreground border-border",
};

const PER_PAGE = 20;

export default function OrdersPage() {
  const qc   = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn:  () => ordersApi.listOrders((page - 1) * PER_PAGE, PER_PAGE),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? "Cancel failed"),
  });

  const orders     = data?.orders ?? [];
  const total      = data?.total  ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Your complete order history</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Order History</CardTitle>
          <span className="text-sm text-muted-foreground">{total} total</span>
        </CardHeader>
        <Separator />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Asset","Side","Type","Qty","Price","Total","Fee","Status","Date",""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 first:pl-6 last:pr-6 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : orders.map((o: any) => (
                    <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 pl-6 py-3.5 font-semibold font-mono">{o.asset?.symbol ?? "—"}</td>
                      <td className={cn("px-4 py-3.5 font-semibold capitalize", o.side === "buy" ? "text-jungle-500" : "text-red-500")}>{o.side}</td>
                      <td className="px-4 py-3.5 capitalize text-muted-foreground">{o.order_type}</td>
                      <td className="px-4 py-3.5 font-mono tabular-nums">{parseFloat(o.quantity).toFixed(6)}</td>
                      <td className="px-4 py-3.5 font-mono tabular-nums">{formatKES(o.price, 2)}</td>
                      <td className="px-4 py-3.5 font-mono tabular-nums font-medium">
                        {formatKES(String(parseFloat(o.price) * parseFloat(o.filled_quantity || o.quantity)), 2)}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-muted-foreground text-xs">{formatKES(o.fee, 2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                          STATUS_CLASS[o.status] ?? STATUS_CLASS.cancelled)}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(o.created_at), "dd MMM yy HH:mm")}
                      </td>
                      <td className="px-4 pr-6 py-3.5">
                        {o.status === "open" && (
                          <button onClick={() => cancel.mutate(o.id)} disabled={cancel.isPending} title="Cancel"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan={10} className="py-14 text-center text-muted-foreground">No orders yet — go trade!</td></tr>
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
