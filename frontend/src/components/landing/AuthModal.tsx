"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, Leaf, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store/authStore";
import { extractApiError } from "@/lib/api/auth";

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Kiambu","Kajiado",
  "Uasin Gishu","Nyeri","Meru","Kisii","Kakamega","Machakos",
  "Siaya","Bungoma","Embu","Kericho","Migori","Vihiga","Other",
];

interface AuthModalProps {
  defaultTab?: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ defaultTab = "login", onClose }: AuthModalProps) {
  const router   = useRouter();
  const login    = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [tab, setTab]   = useState<"login" | "register">(defaultTab);
  const [showPw, setShowPw] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    full_name: "", email: "", phone_number: "", password: "", county: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
      toast.success("Welcome back!");
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(extractApiError(err));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(regForm);
      toast.success("Account created! Welcome to KryptoKE 🌿");
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(extractApiError(err));
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4, 12, 8, 0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal panel */}
      <div className="animate-modal-in relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(220 18% 13%) 0%, hsl(220 18% 10%) 100%)",
          border: "1px solid hsl(220 14% 22%)",
          boxShadow: "0 32px 80px rgb(0 0 0 / 0.6), 0 0 0 1px rgb(255 255 255 / 0.04)",
        }}>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, hsl(153 42% 45%) 40%, hsl(153 52% 55%) 60%, transparent 100%)" }} />

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/8 transition-all">
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 px-8 pt-8 pb-6">
          <div className="w-8 h-8 rounded-lg bg-jungle-500/20 flex items-center justify-center">
            <Leaf size={16} className="text-jungle-400" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white">KryptoKE</span>
        </div>

        {/* Tabs */}
        <div className="mx-8 mb-6 grid grid-cols-2 rounded-xl p-1"
          style={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 14% 18%)" }}>
          {(["login","register"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="relative py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-200"
              style={{
                color: tab === t ? "white" : "hsl(215 15% 50%)",
                background: tab === t ? "hsl(220 18% 18%)" : "transparent",
                boxShadow: tab === t ? "0 2px 8px rgb(0 0 0 / 0.3), inset 0 1px 0 rgb(255 255 255 / 0.06)" : "none",
              }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="px-8 pb-8">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email</label>
                <input type="email" required value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="james.mwangi@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                  style={{
                    background: "hsl(220 18% 8%)",
                    border: "1px solid hsl(220 14% 20%)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "hsl(153 42% 45% / 0.7)"; e.target.style.boxShadow = "0 0 0 3px hsl(153 42% 45% / 0.12)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "hsl(220 14% 20%)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required value={loginForm.password}
                    onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                    style={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 14% 20%)" }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(153 42% 45% / 0.7)"; e.target.style.boxShadow = "0 0 0 3px hsl(153 42% 45% / 0.12)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "hsl(220 14% 20%)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(153 42% 38%), hsl(153 52% 48%))", color: "white", boxShadow: "0 4px 16px hsl(153 42% 40% / 0.35)" }}>
                {isLoading ? "Signing in…" : (<>Sign In <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></>)}
              </button>
              <p className="text-center text-xs text-gray-600 pt-1">
                No account?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-jungle-400 hover:text-jungle-300 font-medium transition-colors">
                  Create one free
                </button>
              </p>
              <p className="text-center text-xs text-gray-700 border-t border-white/5 pt-3">
                Demo: james.mwangi@gmail.com / Customer@2024!
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              {[
                { name:"full_name",    label:"Full Name",      type:"text",     placeholder:"James Mwangi"    },
                { name:"email",        label:"Email",          type:"email",    placeholder:"james@gmail.com" },
                { name:"phone_number", label:"Phone (M-Pesa)", type:"tel",      placeholder:"+254712345678"   },
                { name:"password",     label:"Password",       type:"password", placeholder:"Min 8 characters"},
              ].map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{field.label}</label>
                  <input name={field.name} type={field.type} required
                    value={(regForm as any)[field.name]}
                    onChange={(e) => setRegForm((f) => ({ ...f, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                    style={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 14% 20%)" }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(153 42% 45% / 0.7)"; e.target.style.boxShadow = "0 0 0 3px hsl(153 42% 45% / 0.12)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "hsl(220 14% 20%)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">County</label>
                <select value={regForm.county}
                  onChange={(e) => setRegForm((f) => ({ ...f, county: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-all appearance-none"
                  style={{ background: "hsl(220 18% 8%)", border: "1px solid hsl(220 14% 20%)", color: regForm.county ? "white" : "hsl(215 15% 40%)" }}>
                  <option value="">Select county…</option>
                  {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full mt-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(153 42% 38%), hsl(153 52% 48%))", color: "white", boxShadow: "0 4px 16px hsl(153 42% 40% / 0.35)" }}>
                {isLoading ? "Creating account…" : (<>Get Started <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></>)}
              </button>
              <p className="text-center text-xs text-gray-600">
                Have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-jungle-400 hover:text-jungle-300 font-medium transition-colors">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
