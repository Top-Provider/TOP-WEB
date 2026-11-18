"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function HelpdeskLoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestedNext = searchParams.get("next") || "/helpdesk/new";
  const forceLogin = searchParams.get("force") === "true";
  const nextPath = requestedNext.startsWith("/helpdesk/new")
    ? requestedNext
    : "/helpdesk/new";

  useEffect(() => {
    if (forceLogin) {
      setCheckingSession(false);
      return;
    }
    fetch("/api/helpdesk/auth/session", { cache: "no-store" })
      .then((response) => {
        if (response.ok) {
          window.location.replace(nextPath);
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => setCheckingSession(false));
  }, [forceLogin, nextPath]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/helpdesk/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ไม่สามารถเข้าสู่ระบบได้");
      window.location.assign(nextPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm font-medium text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
        กำลังตรวจสอบการเข้าสู่ระบบ...
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-[0_30px_90px_rgba(30,64,175,0.18)] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(145deg,#075fe8,#0b84ff)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative">
          <div className="inline-flex rounded-2xl bg-white p-3 shadow-xl">
            <div className="relative h-8 w-24">
              <Image src="/images/logo.png" alt="TOP PROVIDER" fill className="object-contain" priority />
            </div>
          </div>
          <h1 className="mt-9 text-3xl font-extrabold leading-tight">ระบบแจ้งซ่อมออนไลน์</h1>
          <p className="mt-3 max-w-sm text-sm leading-7 text-blue-100">
            เข้าสู่ระบบเพื่อแจ้งปัญหาอุปกรณ์ ส่งรูปประกอบ และติดตามสถานะงานบริการได้อย่างเป็นระบบ
          </p>
        </div>
      </section>

      <section className="p-6 sm:p-10 lg:p-14">
        <div className="mx-auto max-w-md">
          <Link
            href="/service-solution"
            className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้า Service Solution
          </Link>

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <UserRound className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0d173d]">
            เข้าสู่ระบบผู้ใช้งาน
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            ใช้บัญชีที่ได้รับจากผู้ดูแลระบบเพื่อเข้าสู่แบบฟอร์มแจ้งซ่อม
          </p>

          {errorMessage && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-7 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Username หรืออีเมล
              </label>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="h-12 rounded-xl pl-10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="h-12 rounded-xl pl-10 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบเพื่อแจ้งซ่อม
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-7 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            บัญชีผู้ใช้งานไม่สามารถเข้าถึงหน้าจัดการของผู้ดูแลระบบได้
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HelpdeskLoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#dbeafe,transparent_32%),radial-gradient(circle_at_90%_85%,#e0f2fe,transparent_28%),#f8fbff] px-4 py-10 sm:px-6 lg:flex lg:items-center lg:py-16">
      <div className="mx-auto w-full max-w-5xl">
        <Suspense
          fallback={
            <div className="flex min-h-[500px] items-center justify-center text-sm text-slate-500">
              กำลังโหลดหน้าเข้าสู่ระบบ...
            </div>
          }
        >
          <HelpdeskLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
