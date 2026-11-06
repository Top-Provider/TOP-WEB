"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ถ้าล็อกอินอยู่แล้ว ให้ redirect ไปที่ /admin ทันที
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/admin");
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();

    // 1. รองรับ Username หรือ Email:
    // ถ้าพิมพ์ username เพียวๆ (เช่น admin) ให้แปลงเป็นอีเมลอัตโนมัติ (เช่น admin@topprovider.co.th) เพื่อส่งให้ Supabase Auth
    const emailToAuth = cleanUsername.includes("@")
      ? cleanUsername
      : `${cleanUsername}@topprovider.co.th`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: password,
      });

      if (error) {
        // กรณี credentials ไม่ถูกต้อง
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("Email not confirmed")
        ) {
          setErrorMessage("ชื่อผู้ใช้งาน (Username) หรือรหัสผ่านไม่ถูกต้อง");
        } else {
          setErrorMessage(`ไม่สามารถเข้าสู่ระบบได้: ${error.message}`);
        }
      } else if (data?.user) {
        // บันทึกชื่อ username ไว้แสดงผลใน layout
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_username", username.trim());
        }
        router.push("/admin");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Box using UI Card */}
      <Card className="w-full max-w-md shadow-2xl shadow-black/40 border border-slate-100 relative z-10 p-2 sm:p-4">
        {/* Brand Header */}
        <CardHeader className="text-center space-y-2 items-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 border border-blue-100/80 mb-2">
            <div className="relative h-7 w-20">
              <Image
                src="/images/logo.png"
                alt="TOP PROVIDER"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            เข้าสู่ระบบแอดมิน
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            TOP PROVIDER SYSTEM • Back-Office Management
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Login Form using UI Input & Button */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <Input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น admin"
                  className="pl-10 h-11 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน (Password)
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 text-xs sm:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full text-xs sm:text-sm shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        {/* Security badge and Return Link */}
        <CardFooter className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured Admin Access</span>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← กลับไปหน้าเว็บไซต์หลัก
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
