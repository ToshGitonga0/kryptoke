"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Clock, KeyRound, UserCircle, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Kiambu","Machakos","Kajiado",
  "Uasin Gishu","Nyeri","Meru","Kisii","Kakamega","Other",
];

const KYC_CONFIG = {
  verified: { label:"Verified", cls:"badge-green",  Icon:CheckCircle, border:"border-jungle-500/30", bg:"bg-jungle-500/5", desc:"Full trading access enabled."                  },
  pending:  { label:"Pending",  cls:"badge-yellow", Icon:Clock,       border:"border-yellow-500/30", bg:"bg-yellow-500/5",  desc:"Submit your ID to unlock full trading limits."  },
  rejected: { label:"Rejected", cls:"badge-red",    Icon:XCircle,     border:"border-red-500/30",    bg:"bg-red-500/5",     desc:"Verification failed. Please contact support."   },
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({
    full_name:    user?.full_name    ?? "",
    phone_number: user?.phone_number ?? "",
    county:       user?.county       ?? "",
  });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "K";

  const kyc = KYC_CONFIG[user?.kyc_status as keyof typeof KYC_CONFIG] ?? KYC_CONFIG.pending;

  const updateProfile = useMutation({
    mutationFn: (d: typeof profile) => authApi.updateProfile(d),
    onSuccess:  (updated) => { toast.success("Profile updated!"); setUser(updated); },
    onError:    (e: any)  => toast.error(e?.response?.data?.detail ?? "Update failed"),
  });

  const changePw = useMutation({
    mutationFn: (d: { current_password: string; new_password: string }) => authApi.changePassword(d),
    onSuccess:  () => { toast.success("Password changed!"); setPwForm({ current_password: "", new_password: "", confirm: "" }); },
    onError:    (e: any) => toast.error(e?.response?.data?.detail ?? "Failed"),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    changePw.mutate({ current_password: pwForm.current_password, new_password: pwForm.new_password });
  };

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your identity and security</p>
      </div>

      <div className={cn("flex items-start gap-3 rounded-xl border p-4", kyc.border, kyc.bg)}>
        <kyc.Icon size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">KYC Status: <span className={kyc.cls}>{kyc.label}</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">{kyc.desc}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><UserCircle size={16} className="text-muted-foreground" /><CardTitle className="text-base">Account Info</CardTitle></div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="mt-1 capitalize text-xs">{user?.role}</Badge>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            {[
              ["National ID",  user?.national_id ?? "Not set"],
              ["Member Since", user?.created_at ? new Date(user.created_at).toLocaleDateString("en-KE") : "—"],
              ["Credit Score", `${user?.credit_score ?? "—"}`],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Edit Profile</CardTitle><CardDescription>Update your display name, phone and county</CardDescription></CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Full Name</label>
            <Input value={profile.full_name} onChange={(e) => setProfile((f) => ({ ...f, full_name: e.target.value }))} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Phone Number</label>
            <Input type="tel" value={profile.phone_number} onChange={(e) => setProfile((f) => ({ ...f, phone_number: e.target.value }))} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium">County</label>
            <select value={profile.county} onChange={(e) => setProfile((f) => ({ ...f, county: e.target.value }))} className="input">
              <option value="">Select county</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button disabled={updateProfile.isPending} onClick={() => updateProfile.mutate(profile)} className="w-full">
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><KeyRound size={16} className="text-muted-foreground" /><CardTitle className="text-base">Change Password</CardTitle></div>
          <CardDescription>Use a strong password of at least 8 characters</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { key: "current_password", label: "Current Password"     },
              { key: "new_password",     label: "New Password"         },
              { key: "confirm",          label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <Input type="password" value={(pwForm as any)[key]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  required minLength={key === "current_password" ? 1 : 8} />
              </div>
            ))}
            <Button type="submit" disabled={changePw.isPending} variant="outline" className="w-full">
              {changePw.isPending ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
