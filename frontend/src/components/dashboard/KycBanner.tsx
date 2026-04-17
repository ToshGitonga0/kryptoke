"use client";
/**
 * KycBanner — shown on /dashboard when the user's KYC is pending or rejected.
 * Dismissible per session (state lives in component, resets on navigation).
 */
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type KYCStatus = "pending" | "verified" | "rejected";

const CONFIG: Record<
  Exclude<KYCStatus, "verified">,
  {
    Icon:      React.ElementType;
    iconColor: string;
    bg:        string;
    border:    string;
    title:     string;
    body:      string;
    cta:       string;
    ctaHref:   string;
  }
> = {
  pending: {
    Icon:      Clock,
    iconColor: "text-amber-400",
    bg:        "bg-amber-500/8 dark:bg-amber-500/10",
    border:    "border-amber-500/30",
    title:     "Identity Verification Pending",
    body:      "Complete your KYC verification to unlock full trading limits and withdrawals.",
    cta:       "Verify Now",
    ctaHref:   "/profile#kyc",
  },
  rejected: {
    Icon:      AlertTriangle,
    iconColor: "text-red-400",
    bg:        "bg-red-500/8 dark:bg-red-500/10",
    border:    "border-red-500/30",
    title:     "Verification Rejected",
    body:      "Your KYC submission was not accepted. Please re-submit with valid documents.",
    cta:       "Re-submit",
    ctaHref:   "/profile#kyc",
  },
};

export function KycBanner() {
  const user      = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);

  // Only show for pending / rejected
  const status = user?.kyc_status as KYCStatus | undefined;
  if (!user || !status || status === "verified" || dismissed) return null;

  const cfg = CONFIG[status as keyof typeof CONFIG];
  if (!cfg) return null;

  const { Icon, iconColor, bg, border, title, body, cta, ctaHref } = cfg;

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all",
        bg,
        border
      )}
      role="alert"
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        <Icon size={18} className={iconColor} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{body}</p>
      </div>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={cn(
          "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
          "text-xs font-bold border transition-all duration-150",
          status === "rejected"
            ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
            : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
        )}
      >
        <CheckCircle2 size={12} />
        {cta}
      </Link>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded-md hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}