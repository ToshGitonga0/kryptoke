import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKES(amount: string | number, decimals = 2): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "KES 0.00";
  return new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES", minimumFractionDigits: decimals,
  }).format(n);
}

export function formatCrypto(amount: string | number, symbol: string, decimals = 8): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return `0 ${symbol}`;
  const significant = n < 0.01 ? n.toFixed(decimals) : n.toFixed(Math.min(decimals, 6));
  return `${significant} ${symbol}`;
}

export function formatPct(value: string | number, decimals = 2): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "0.00%";
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function formatDate(date: string): string {
  const { format } = require("date-fns");
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function timeAgo(date: string): string {
  const { formatDistanceToNow } = require("date-fns");
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isPriceUp(change: string | number): boolean {
  const n = typeof change === "string" ? parseFloat(change) : change;
  return n >= 0;
}
