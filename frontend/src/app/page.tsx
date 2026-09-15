// frontend/src/app/page.tsx
"use client";
import AuthModal from "@/components/landing/AuthModal";
import { useAuthStore } from "@/lib/store/authStore";
import { ArrowRight, BarChart3, ChevronRight, Globe, Leaf, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./landing.css";

/* ── Static ticker data ─────────────────────────────────────────── */
const TICKER_ITEMS = [
  { sym:"BTC",  name:"Bitcoin",  price:"6,524,000", chg:"+2.4%", up:true  },
  { sym:"ETH",  name:"Ethereum", price:"352,800",   chg:"+1.8%", up:true  },
  { sym:"SOL",  name:"Solana",   price:"22,150",    chg:"+3.2%", up:true  },
  { sym:"BNB",  name:"BNB",      price:"74,600",    chg:"-0.5%", up:false },
  { sym:"XRP",  name:"XRP",      price:"75.4",      chg:"+1.5%", up:true  },
  { sym:"ADA",  name:"Cardano",  price:"54.8",      chg:"-1.2%", up:false },
  { sym:"MATIC","name":"Polygon",price:"111.3",     chg:"+0.7%", up:true  },
  { sym:"USDT", name:"Tether",   price:"130.1",     chg:"0.0%",  up:true  },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Bank-Grade Security", desc: "Multi-layer encryption, 2FA, and cold storage for your digital assets.", tone: "success" as const },
  { icon: Zap,         title: "Instant Execution",    desc: "Market and limit orders filled in milliseconds. No lag, no slippage surprises.", tone: "warning" as const },
  { icon: Globe,       title: "M-Pesa Integration",   desc: "Deposit and withdraw KES directly via M-Pesa. No wire transfers, no waiting.", tone: "chart-2" as const },
  { icon: BarChart3,   title: "Real-Time Analytics",  desc: "Professional charts, portfolio P&L, and trade history — all in one dashboard.", tone: "chart-4" as const },
];

const STATS = [
  { label: "Trading Volume (24h)", value: "KES 4.2B+" },
  { label: "Registered Traders",   value: "120,000+"  },
  { label: "Supported Assets",     value: "8 Pairs"   },
  { label: "Uptime",               value: "99.98%"    },
];

/* ── Coin icon — literal per-asset brand colors, not part of the app theme ── */
function CoinIcon({ sym, size = 28 }: { sym: string; size?: number }) {
  const colors: Record<string, string> = {
    BTC:"#F7931A", ETH:"#627EEA", SOL:"#9945FF",
    BNB:"#F3BA2F", XRP:"#00AAE4", ADA:"#0033AD",
    MATIC:"#8247E5", USDT:"#26A17B",
  };
  const bg = colors[sym] ?? "var(--primary)";
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:`${bg}20`, border:`1.5px solid ${bg}40`,
      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize: size * 0.38, fontWeight:700, color: bg, fontFamily:"IBM Plex Mono,monospace" }}>
        {sym.charAt(0)}
      </span>
    </div>
  );
}

export default function LandingPage() {
  const router          = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [modal, setModal]   = useState<"login" | "register" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]; // seamless loop

  return (
    <div className="landing">
      {/* ── Ambient glow blobs ── */}
      <div className="landing__glow">
        <div className="landing__glow-blob landing__glow-blob--1" />
        <div className="landing__glow-blob landing__glow-blob--2" />
        <div className="landing__glow-blob landing__glow-blob--3" />
      </div>

      {/* ── Navbar ── */}
      <nav className="landing__nav">
        <div className="landing__nav-brand">
          <div className="landing__logo-mark">
            <Leaf size={15} className="text-primary-foreground" />
          </div>
          <span className="landing__logo-text">KryptoKE</span>
          <span className="landing__logo-badge">Kenya</span>
        </div>
        <div className="landing__nav-actions">
          <button onClick={() => setModal("login")} className="btn-ghost landing__nav-link">
            Sign In
          </button>
          <button onClick={() => setModal("register")} className="btn-primary">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Live ticker strip ── */}
      <div className="landing__ticker">
        <div className="landing__ticker-track">
          {doubled.map((item, i) => (
            <div key={i} className="landing__ticker-item">
              <CoinIcon sym={item.sym} size={20} />
              <span className="landing__ticker-symbol">{item.sym}</span>
              <span className="landing__ticker-price">KES {item.price}</span>
              <span className={`landing__ticker-change ${item.up ? "positive" : "negative"}`}>{item.chg}</span>
              <span className="landing__ticker-dot">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className={`landing__hero ${visible ? "is-visible" : ""}`}>
        <div className="landing__hero-copy">
          <div className="landing__hero-badge">
            <span className="landing__hero-badge-dot" />
            Live Markets · 8 Crypto Pairs in KES
          </div>

          <h1 className="landing__hero-title">
            Trade Crypto
            <br />
            <span className="landing__hero-title-accent">Built for Kenya.</span>
          </h1>

          <p className="landing__hero-subtitle">
            Buy and sell Bitcoin, Ethereum, Solana and more — priced in KES,
            funded via M-Pesa. Professional-grade trading for every Kenyan investor.
          </p>

          <div className="landing__hero-actions">
            <button onClick={() => setModal("register")} className="landing__cta-primary">
              Start Trading Free
              <ArrowRight size={15} className="landing__cta-primary-icon" />
            </button>
            <button onClick={() => setModal("login")} className="landing__cta-secondary">
              Sign In
            </button>
          </div>
        </div>

        {/* ── Hero stats ── */}
        <div className="landing__stats">
          {STATS.map(({ label, value }) => (
            <div key={label} className="landing__stat-card">
              <p className="landing__stat-value">{value}</p>
              <p className="landing__stat-label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Prices Section ── */}
      <section className="landing__section">
        <div className="landing__section-header">
          <div>
            <h2 className="landing__section-title">Market Overview</h2>
            <p className="landing__section-subtitle">All prices in Kenyan Shillings (KES)</p>
          </div>
          <button onClick={() => setModal("register")} className="landing__section-link">
            Trade now <ChevronRight size={14} />
          </button>
        </div>
        <div className="landing__market-table">
          <div className="landing__market-head">
            <span>Asset</span>
            <span className="landing__market-head-cell--right">Price (KES)</span>
            <span className="landing__market-head-cell--right">24h Change</span>
            <span className="landing__market-head-cell--action">Action</span>
          </div>
          {TICKER_ITEMS.map((item) => (
            <div key={item.sym} className="landing__market-row">
              <div className="landing__market-asset">
                <CoinIcon sym={item.sym} size={32} />
                <div>
                  <p className="landing__market-symbol">{item.sym}</p>
                  <p className="landing__market-name">{item.name}</p>
                </div>
              </div>
              <div className="landing__market-price-cell">
                <p className="landing__market-price">{item.price}</p>
              </div>
              <div className="landing__market-change-cell">
                {item.up ? <TrendingUp size={13} className="text-success" /> : <TrendingDown size={13} className="text-destructive" />}
                <span className={`landing__market-change ${item.up ? "positive" : "negative"}`}>{item.chg}</span>
              </div>
              <div className="landing__market-action-cell">
                <button onClick={() => setModal("register")} className="landing__market-trade-btn">
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="landing__section">
        <div className="landing__features-header">
          <h2 className="landing__features-title">Everything you need to trade like a pro</h2>
          <p className="landing__features-subtitle">
            Built from the ground up for Kenyan investors. Fast, secure,
            and deeply integrated with local payment rails.
          </p>
        </div>
        <div className="landing__features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, tone }) => (
            <div key={title} className="landing__feature-card">
              <div
                className="landing__feature-icon"
                style={{
                  background: `color-mix(in oklch, var(--${tone}) 15%, transparent)`,
                  borderColor: `color-mix(in oklch, var(--${tone}) 30%, transparent)`,
                }}
              >
                <Icon size={20} style={{ color: `var(--${tone})` }} />
              </div>
              <h3 className="landing__feature-title">{title}</h3>
              <p className="landing__feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <Leaf size={16} className="landing__footer-icon" />
            <span className="landing__footer-name">KryptoKE</span>
            <span className="landing__footer-tag">· Kenya's Crypto Exchange</span>
          </div>
          <p className="landing__footer-copy">
            © {new Date().getFullYear()} KryptoKE. For demo purposes only. Not financial advice.
          </p>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {modal && <AuthModal defaultTab={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
