"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import {
  BadgeCheck, CalendarDays, CreditCard, Moon,
  Pencil,
  Shield,
  Star, Sun, User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import toast from "react-hot-toast";

/* ── Section wrapper ─────────────────────────────────────── */
const Section = ({ icon: Icon, title, description, children }: {
  icon: React.ElementType; title: string; description?: string; children: React.ReactNode;
}) => (
  <Card className="overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
      <div className="w-8 h-8 rounded-lg bg-jungle-500/10 border border-jungle-500/20 flex items-center justify-center">
        <Icon size={15} className="text-jungle-400" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-none">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

/* ── Info row ────────────────────────────────────────────── */
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium capitalize">{value ?? "—"}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { theme, setTheme } = useTheme();

  const [form, setForm] = useState({
    full_name:    user?.full_name    ?? "",
    phone_number: user?.phone_number ?? "",
    county:       user?.county       ?? "",
  });
  const [loading, setLoading] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "K";

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.patch("/users/me", form);
      setUser(data);
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">

      {/* ── Page header ───────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* ── Profile hero ──────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-5">
        {/* ambient glow */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-jungle-500 blur-3xl opacity-10 pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-jungle-500/30">
              <AvatarFallback className="bg-jungle-600 text-white font-black text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-jungle-500 border-2 border-[var(--card)] flex items-center justify-center">
              <Pencil size={9} className="text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-black text-lg leading-tight truncate">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                user?.kyc_status === "verified"
                  ? "bg-jungle-500/10 text-jungle-400 border-jungle-500/25"
                  : "bg-yellow-500/10 text-yellow-500 border-yellow-500/25"
              )}>
                <BadgeCheck size={10} />
                KYC {user?.kyc_status}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border capitalize">
                <Star size={9} />
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit profile ──────────────────────────────── */}
      <Section icon={User} title="Profile" description="Update your personal information">
        <form onSubmit={handleUpdate} className="space-y-4">
          {[
            { name: "full_name",    label: "Full Name",    type: "text", placeholder: "John Doe"        },
            { name: "phone_number", label: "Phone Number", type: "tel",  placeholder: "+254 7XX XXX XXX" },
            { name: "county",       label: "County",       type: "text", placeholder: "Nairobi"         },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </label>
              <Input
                type={type}
                placeholder={placeholder}
                value={(form as any)[name]}
                onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-jungle-600 hover:bg-jungle-500 text-white font-bold h-10 rounded-xl shadow-lg shadow-jungle-900/20"
          >
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </Section>

      {/* ── Account info ──────────────────────────────── */}
      <Section icon={Shield} title="Account Info">
        <div className="space-y-0">
          <InfoRow
            label="Role"
            value={user?.role}
          />
          <div className="flex items-center justify-between py-2.5 border-b border-border">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CalendarDays size={13} /> Member Since
            </span>
            <span className="text-sm font-medium">{user?.created_at?.split("T")[0] ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CreditCard size={13} /> Credit Score
            </span>
            <span className={cn(
              "text-sm font-bold font-mono px-2 py-0.5 rounded-lg",
              (user?.credit_score ?? 0) >= 700
                ? "bg-jungle-500/10 text-jungle-400"
                : "bg-yellow-500/10 text-yellow-500"
            )}>
              {user?.credit_score ?? "—"}
            </span>
          </div>
        </div>
      </Section>

      {/* ── Appearance ────────────────────────────────── */}
      <Section icon={theme === "dark" ? Moon : Sun} title="Appearance" description="Toggle light and dark mode">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200",
                theme === t
                  ? "bg-card text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "dark" ? <Moon size={14} /> : <Sun size={14} />}
              {t}
            </button>
          ))}
        </div>
      </Section>

    </div>
  );
}