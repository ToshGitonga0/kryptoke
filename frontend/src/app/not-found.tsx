/**
 * KryptoKE — Custom 404 page (Next.js App Router).
 * Rendered automatically for any unmatched route.
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--background)" }}
    >
      {/* Glow orb */}
      <div
        aria-hidden
        className="absolute w-[420px] h-[420px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "hsl(153 42% 45%)" }}
      />

      {/* 404 numeral */}
      <p
        className="text-[120px] font-black leading-none tracking-tighter select-none"
        style={{
          background:
            "linear-gradient(135deg, hsl(153 42% 55%) 0%, hsl(153 42% 35%) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </p>

      {/* Message */}
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                     bg-jungle-600 hover:bg-jungle-500 text-white shadow-lg shadow-jungle-900/30
                     transition-all duration-150 hover:-translate-y-0.5"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold
                     border border-border text-muted-foreground
                     hover:bg-muted hover:text-foreground
                     transition-all duration-150 hover:-translate-y-0.5"
        >
          View Markets
        </Link>
      </div>

      {/* Subtle footer note */}
      <p className="mt-12 text-xs text-muted-foreground opacity-50">
        KryptoKE — Kenya's Premier Crypto Trading Platform 🌿
      </p>
    </div>
  );
}