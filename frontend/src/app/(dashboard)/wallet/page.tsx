"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { walletsApi } from "@/lib/api/wallets";
import { cn, formatKES } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

const TYPE_META: Record<string, { label: string; colorClass: string }> = {
  deposit:    { label: "Deposit",    colorClass: "text-jungle-500" },
  withdrawal: { label: "Withdrawal", colorClass: "text-red-500"     },
  trade_buy:  { label: "Buy Trade",  colorClass: "text-jungle-500" },
  trade_sell: { label: "Sell Trade", colorClass: "text-red-500"     },
  fee:        { label: "Fee",        colorClass: "text-yellow-500"  },
};

export default function WalletPage() {
  const qc = useQueryClient();
  const [currency, setCurrency] = useState("KES");
  const [amount,   setAmount]   = useState("");
  const [ref,      setRef]      = useState("");
  const [loading,  setLoading]  = useState(false);

  const { data: wallets } = useQuery({ queryKey: ["wallets"],      queryFn: walletsApi.getWallets });
  const { data: txData }  = useQuery({ queryKey: ["transactions"], queryFn: () => walletsApi.getTransactions(0, 20) });

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      await walletsApi.deposit(currency, amount, ref || undefined);
      toast.success(`Deposited ${amount} ${currency}!`);
      setAmount(""); setRef("");
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your balances and deposits</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(wallets?.wallets ?? []).map((w) => (
          <Card key={w.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {w.currency.charAt(0)}
                </div>
                <span className="text-sm font-medium">{w.currency}</span>
              </div>
              <p className="font-mono font-bold">
                {w.currency === "KES" ? formatKES(w.balance, 2) : parseFloat(w.balance).toFixed(6)}
              </p>
              {parseFloat(w.locked_balance) > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Locked: {parseFloat(w.locked_balance).toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Deposit / Withdraw tabs */}
        <Card>
          <Tabs defaultValue="deposit">
            <CardHeader className="pb-0">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
            </CardHeader>
            <Separator className="mt-3" />
            <CardContent className="pt-4">
              <TabsContent value="deposit" className="mt-0">
                <form onSubmit={handleDeposit} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
                      {["KES","USDT","BTC","ETH"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" min="0" step="0.01" value={amount}
                      onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">M-Pesa Reference (optional)</label>
                    <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. QGH7XXXXX" />
                  </div>
                  <Button type="submit" disabled={loading || !amount} className="w-full">
                    {loading ? "Processing…" : "Deposit"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="withdraw" className="mt-0">
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Withdrawal via M-Pesa coming soon.
                </p>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <Separator />
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {(txData?.transactions ?? []).length === 0
              ? <p className="py-10 text-center text-sm text-muted-foreground">No transactions yet.</p>
              : (txData?.transactions ?? []).map((tx) => {
                  const meta = TYPE_META[tx.type] ?? { label: tx.type, colorClass: "text-foreground" };
                  return (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("en-KE")}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-mono font-semibold", meta.colorClass)}>
                          {tx.currency === "KES" ? formatKES(tx.amount, 2) : `${parseFloat(tx.amount).toFixed(6)} ${tx.currency}`}
                        </p>
                        <span className="badge-green text-xs">{tx.status}</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </Card>
      </div>
    </div>
  );
}
