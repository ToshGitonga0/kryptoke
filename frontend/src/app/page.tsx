"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Globe,
  Leaf,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import AuthModal from "@/components/landing/AuthModal";
import { useAuthStore } from "@/lib/store/authStore";

import "./landing-page.css";

/* ── Static ticker data ─────────────────────────────────────────── */

const TICKER_ITEMS = [
  { sym: "BTC", name: "Bitcoin", price: "6,524,000", chg: "+2.4%", up: true },
  { sym: "ETH", name: "Ethereum", price: "352,800", chg: "+1.8%", up: true },
  { sym: "SOL", name: "Solana", price: "22,150", chg: "+3.2%", up: true },
  { sym: "BNB", name: "BNB", price: "74,600", chg: "-0.5%", up: false },
  { sym: "XRP", name: "XRP", price: "75.4", chg: "+1.5%", up: true },
  { sym: "ADA", name: "Cardano", price: "54.8", chg: "-1.2%", up: false },
  { sym: "MATIC", name: "Polygon", price: "111.3", chg: "+0.7%", up: true },
  { sym: "USDT", name: "Tether", price: "130.1", chg: "0.0%", up: true },
];

const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  BNB: "#F3BA2F",
  XRP: "#00AAE4",
  ADA: "#0033AD",
  MATIC: "#8247E5",
  USDT: "#26A17B",
};

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    desc: "Multi-layer encryption, 2FA, and cold storage for your digital assets.",
    color: "hsl(153 42% 45%)",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    desc: "Market and limit orders filled in milliseconds. No lag, no slippage surprises.",
    color: "hsl(43 90% 55%)",
  },
  {
    icon: Globe,
    title: "M-Pesa Integration",
    desc: "Deposit and withdraw KES directly via M-Pesa. No wire transfers, no waiting.",
    color: "hsl(210 80% 55%)",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Professional charts, portfolio P&L, and trade history — all in one dashboard.",
    color: "hsl(280 60% 60%)",
  },
];

const STATS = [
  { label: "Trading Volume (24h)", value: "KES 4.2B+" },
  { label: "Registered Traders", value: "120,000+" },
  { label: "Supported Assets", value: "8 Pairs" },
  { label: "Uptime", value: "99.98%" },
];

/* ── Coin icon ────────────────────────────────────────────────────
   The color is the only genuinely dynamic value here, so it's passed
   through as a CSS variable rather than a full inline style object. */

function CoinIcon({ sym, size = 28 }: { sym: string; size?: number }) {
  const color = COIN_COLORS[sym] ?? "#40916c";

  return (
    <div
      className="coin-icon"
      style={{ "--coin-color": color, "--coin-size": `${size}px` } as React.CSSProperties}
    >
      <span className="coin-icon__letter" style={{ fontSize: size * 0.38 }}>
        {sym.charAt(0)}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [visible, setVisible] = useState(false);

  /* Redirect if already authed */
  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  /* Stagger-in on mount */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const tickerLoop = [...TICKER_ITEMS, ...TICKER_ITEMS]; // seamless loop
  const visibleClass = visible ? "is-visible" : "";

  return (
    <div className="landing-page">
      {/* ── Ambient glow blobs ── */}
      <div className="landing-page__ambient" aria-hidden="true">
        <div className="landing-page__glow landing-page__glow--top-left" />
        <div className="landing-page__glow landing-page__glow--right" />
        <div className="landing-page__glow landing-page__glow--bottom-left" />
      </div>

      {/* ── Navbar ── */}
      <nav className="landing-nav" aria-label="Primary">
        <div className="landing-nav__brand">
          <div className="landing-nav__logo">
            <Leaf size={15} />
          </div>
          <span className="landing-nav__name">KryptoKE</span>
          <span className="landing-nav__badge">Kenya</span>
        </div>
        <div className="landing-nav__actions">
          <button
            type="button"
            className="landing-nav__signin"
            onClick={() => setModal("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className="landing-nav__cta"
            onClick={() => setModal("register")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Live ticker strip ── */}
      <div className="market-ticker" aria-hidden="true">
        <div className="market-ticker__track">
          {tickerLoop.map((item, i) => (
            <div key={`${item.sym}-${i}`} className="market-ticker__item">
              <CoinIcon sym={item.sym} size={20} />
              <span className="market-ticker__symbol">{item.sym}</span>
              <span className="market-ticker__price">KES {item.price}</span>
              <span
                className={`market-ticker__change ${
                  item.up ? "market-ticker__change--up" : "market-ticker__change--down"
                }`}
              >
                {item.chg}
              </span>
              <span className="market-ticker__dot">·</span>
            </div>
          ))}
        </div>
      </div>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero__content">
            <div className={`hero__eyebrow ${visibleClass}`}>
              <span className="hero__eyebrow-dot" />
              Live Markets · 8 Crypto Pairs in KES
            </div>

            <h1 className={`hero__title ${visibleClass}`}>
              Trade Crypto
              <br />
              <span className="hero__title-accent">Built for Kenya.</span>
            </h1>

            <p className={`hero__description ${visibleClass}`}>
              Buy and sell Bitcoin, Ethereum, Solana and more — priced in KES,
              funded via M-Pesa. Professional-grade trading for every Kenyan investor.
            </p>

            <div className={`hero__actions ${visibleClass}`}>
              <button
                type="button"
                className="hero__cta-primary"
                onClick={() => setModal("register")}
              >
                Start Trading Free
                <ArrowRight size={15} className="hero__cta-primary-icon" />
              </button>
              <button
                type="button"
                className="hero__cta-secondary"
                onClick={() => setModal("login")}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* ── Hero stats ── */}
          <div className={`hero-stats ${visibleClass}`}>
            {STATS.map(({ label, value }) => (
              <div key={label} className="hero-stat">
                <p className="hero-stat__value">{value}</p>
                <p className="hero-stat__label">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Live Prices Section ── */}
        <section className="market-section" aria-labelledby="market-overview-heading">
          <div className="market-section__header">
            <div>
              <h2 id="market-overview-heading" className="market-section__title">
                Market Overview
              </h2>
              <p className="market-section__subtitle">All prices in Kenyan Shillings (KES)</p>
            </div>
            <button
              type="button"
              className="market-section__link"
              onClick={() => setModal("register")}
            >
              Trade now <ChevronRight size={14} />
            </button>
          </div>

          <div className="market-table" role="table" aria-label="Market prices">
            <div className="market-table__header" role="row">
              <span role="columnheader">Asset</span>
              <span role="columnheader" className="market-table__header-cell--right">
                Price (KES)
              </span>
              <span role="columnheader" className="market-table__header-cell--right">
                24h Change
              </span>
              <span role="columnheader" className="market-table__header-cell--action">
                Action
              </span>
            </div>

            {TICKER_ITEMS.map((item, i) => (
              <div
                key={item.sym}
                role="row"
                className="market-table__row"
                style={
                  {
                    "--row-bg": i % 2 === 0 ? "var(--lp-bg-raised)" : "var(--lp-bg-raised-alt)",
                  } as React.CSSProperties
                }
              >
                <div className="market-table__asset" role="cell">
                  <CoinIcon sym={item.sym} size={32} />
                  <div>
                    <p className="market-table__symbol">{item.sym}</p>
                    <p className="market-table__name">{item.name}</p>
                  </div>
                </div>

                <div className="market-table__price" role="cell">
                  {item.price}
                </div>

                <div
                  className={`market-table__change ${
                    item.up ? "market-table__change--up" : "market-table__change--down"
                  }`}
                  role="cell"
                >
                  {item.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {item.chg}
                </div>

                <div className="market-table__action" role="cell">
                  <button
                    type="button"
                    className="market-table__trade-btn"
                    onClick={() => setModal("register")}
                    aria-label={`Trade ${item.name}`}
                  >
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="features" aria-labelledby="features-heading">
          <div className="features__header">
            <h2 id="features-heading" className="features__title">
              Everything you need to trade like a pro
            </h2>
            <p className="features__description">
              Built from the ground up for Kenyan investors. Fast, secure,
              and deeply integrated with local payment rails.
            </p>
          </div>

          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <article
                key={title}
                className="feature-card"
                style={
                  {
                    "--feature-color": color,
                    "--delay": `${(i + 1) * 100}ms`,
                  } as React.CSSProperties
                }
              >
                <div className="feature-card__icon">
                  <Icon size={20} />
                </div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__description">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <Leaf size={16} />
            <span className="landing-footer__name">KryptoKE</span>
            <span className="landing-footer__tagline">· Kenya's Crypto Exchange</span>
          </div>
          <p className="landing-footer__copyright">
            © {new Date().getFullYear()} KryptoKE. For demo purposes only. Not financial advice.
          </p>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {modal && <AuthModal defaultTab={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
