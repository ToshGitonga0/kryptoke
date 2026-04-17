"use client";
import AuthModal from "@/components/landing/AuthModal";
import { useAuthStore } from "@/lib/store/authStore";
import { ArrowRight, BarChart3, ChevronRight, Globe, Leaf, ShieldCheck, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  { label: "Registered Traders",   value: "120,000+"  },
  { label: "Supported Assets",     value: "8 Pairs"   },
  { label: "Uptime",               value: "99.98%"    },
];

/* ── Coin icon placeholder ───────────────────────────────────────── */
function CoinIcon({ sym, size = 28 }: { sym: string; size?: number }) {
  const colors: Record<string, string> = {
    BTC:"#F7931A", ETH:"#627EEA", SOL:"#9945FF",
    BNB:"#F3BA2F", XRP:"#00AAE4", ADA:"#0033AD",
    MATIC:"#8247E5", USDT:"#26A17B",
  };
  const bg = colors[sym] ?? "#40916c";
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

  /* Redirect if already authed */
  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  /* Stagger-in on mount */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]; // seamless loop

  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "hsl(220 20% 6%)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-glow absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(153 42% 45% / 0.12) 0%, transparent 70%)" }} />
        <div className="animate-glow animation-delay-300 absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(210 80% 55% / 0.08) 0%, transparent 70%)" }} />
        <div className="animate-glow animation-delay-600 absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(153 42% 35% / 0.07) 0%, transparent 70%)" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ borderBottom: "1px solid hsl(220 14% 12%)", background: "hsl(220 20% 6% / 0.8)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(153 42% 20%), hsl(153 42% 35%))", boxShadow: "0 0 16px hsl(153 42% 45% / 0.3)" }}>
            <Leaf size={15} className="text-jungle-300" />
          </div>
          <span className="text-base font-extrabold tracking-tight">KryptoKE</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background:"hsl(153 42% 45% / 0.12)", color:"hsl(153 42% 55%)", border:"1px solid hsl(153 42% 45% / 0.2)" }}>
            Kenya
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModal("login")}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </button>
          <button onClick={() => setModal("register")}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, hsl(153 42% 38%), hsl(153 52% 48%))", color:"white", boxShadow:"0 4px 14px hsl(153 42% 40% / 0.35)" }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Live ticker strip ── */}
      <div className="relative z-10 overflow-hidden py-2.5"
        style={{ background: "hsl(220 18% 9%)", borderBottom: "1px solid hsl(220 14% 13%)" }}>
        <div className="flex animate-ticker whitespace-nowrap gap-0">
          {doubled.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-5 shrink-0">
              <CoinIcon sym={item.sym} size={20} />
              <span className="text-xs font-semibold text-gray-300">{item.sym}</span>
              <span className="text-xs font-mono text-white">KES {item.price}</span>
              <span className={`text-xs font-bold font-mono ${item.up ? "positive" : "negative"}`}>
                {item.chg}
              </span>
              <span className="text-gray-700 ml-2">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-12 pt-24 pb-20 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          {/* Label pill */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 transition-all duration-700 ${visible ? "animate-fade-up" : "opacity-0"}`}
            style={{ background:"hsl(153 42% 45% / 0.1)", border:"1px solid hsl(153 42% 45% / 0.25)", color:"hsl(153 42% 60%)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-jungle-400 animate-pulse inline-block" />
            Live Markets · 8 Crypto Pairs in KES
          </div>

          {/* Headline */}
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 transition-all duration-700 ${visible ? "animate-fade-up animation-delay-100" : "opacity-0"}`}>
            Trade Crypto
            <br />
            <span style={{ background:"linear-gradient(135deg, hsl(153 42% 55%), hsl(153 62% 70%))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Built for Kenya.
            </span>
          </h1>

          <p className={`text-lg text-gray-400 leading-relaxed mb-10 max-w-xl transition-all duration-700 ${visible ? "animate-fade-up animation-delay-200" : "opacity-0"}`}>
            Buy and sell Bitcoin, Ethereum, Solana and more — priced in KES,
            funded via M-Pesa. Professional-grade trading for every Kenyan investor.
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap items-center gap-4 transition-all duration-700 ${visible ? "animate-fade-up animation-delay-300" : "opacity-0"}`}>
            <button onClick={() => setModal("register")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm group transition-all hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg, hsl(153 42% 36%), hsl(153 52% 46%))", color:"white", boxShadow:"0 6px 24px hsl(153 42% 40% / 0.4)" }}>
              Start Trading Free
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button onClick={() => setModal("login")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-gray-300 hover:text-white transition-all hover:-translate-y-0.5"
              style={{ background:"hsl(220 18% 12%)", border:"1px solid hsl(220 14% 20%)", boxShadow:"inset 0 1px 0 rgb(255 255 255 / 0.05)" }}>
              Sign In
            </button>
          </div>
        </div>

        {/* ── Hero stats ── */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 transition-all duration-700 ${visible ? "animate-fade-up animation-delay-400" : "opacity-0"}`}>
          {STATS.map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              style={{ background:"hsl(220 18% 10%)", border:"1px solid hsl(220 14% 16%)", boxShadow:"inset 0 1px 0 rgb(255 255 255 / 0.04)" }}>
              <p className="text-2xl font-extrabold tracking-tight text-white mb-1">{value}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Prices Section ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Market Overview</h2>
            <p className="text-sm text-gray-500 mt-1">All prices in Kenyan Shillings (KES)</p>
          </div>
          <button onClick={() => setModal("register")}
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-jungle-400 hover:text-jungle-300 transition-colors">
            Trade now <ChevronRight size={14} />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid hsl(220 14% 15%)" }}>
          {/* Table header */}
          <div className="grid grid-cols-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600"
            style={{ background:"hsl(220 18% 9%)", borderBottom:"1px solid hsl(220 14% 13%)" }}>
            <span>Asset</span><span className="text-right">Price (KES)</span>
            <span className="text-right">24h Change</span><span className="text-right hidden md:block">Action</span>
          </div>
          {TICKER_ITEMS.map((item, i) => (
            <div key={item.sym}
              className="grid grid-cols-4 px-5 py-4 items-center transition-all duration-150 cursor-pointer group"
              style={{
                background: i % 2 === 0 ? "hsl(220 18% 10%)" : "hsl(220 18% 10.5%)",
                borderBottom: i < TICKER_ITEMS.length - 1 ? "1px solid hsl(220 14% 13%)" : "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "hsl(220 18% 13%)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? "hsl(220 18% 10%)" : "hsl(220 18% 10.5%)"; }}>
              <div className="flex items-center gap-3">
                <CoinIcon sym={item.sym} size={32} />
                <div>
                  <p className="text-sm font-bold text-white">{item.sym}</p>
                  <p className="text-xs text-gray-600">{item.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-white">{item.price}</p>
              </div>
              <div className="text-right flex items-center justify-end gap-1.5">
                {item.up ? <TrendingUp size={13} className="text-jungle-400" /> : <TrendingDown size={13} className="text-red-400" />}
                <span className={`text-sm font-bold font-mono ${item.up ? "positive" : "negative"}`}>{item.chg}</span>
              </div>
              <div className="text-right hidden md:block">
                <button onClick={() => setModal("register")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  style={{ background:"hsl(153 42% 45% / 0.15)", color:"hsl(153 42% 55%)", border:"1px solid hsl(153 42% 45% / 0.25)" }}>
                  Trade
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">
            Everything you need to trade like a pro
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Built from the ground up for Kenyan investors. Fast, secure,
            and deeply integrated with local payment rails.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title}
              className={`rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-2xl animate-fade-up animation-delay-${(i + 1) * 100}`}
              style={{
                background:"hsl(220 18% 10%)",
                border:"1px solid hsl(220 14% 16%)",
                boxShadow:"inset 0 1px 0 rgb(255 255 255 / 0.04)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="text-base font-bold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t px-6 md:px-12 py-10"
        style={{ borderColor:"hsl(220 14% 13%)", background:"hsl(220 20% 5%)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-jungle-500" />
            <span className="text-sm font-extrabold tracking-tight text-gray-400">KryptoKE</span>
            <span className="text-gray-700 text-xs">· Kenya's Crypto Exchange</span>
          </div>
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} KryptoKE. For demo purposes only. Not financial advice.
          </p>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {modal && <AuthModal defaultTab={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
