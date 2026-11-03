"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, Loader2, Database, RefreshCw, KeyRound, Globe } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  category_id: string;
  name: string;
}

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [envCheck, setEnvCheck] = useState({
    hasUrl: false,
    hasKey: false,
    urlValue: "",
  });

  const checkConnection = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsConnected(null);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    setEnvCheck({
      hasUrl: Boolean(url && !url.includes("your-project-ref")),
      hasKey: Boolean(key && !key.includes("your-anon-key")),
      urlValue: url,
    });

    if (!url || url.includes("your-project-ref") || !key || key.includes("your-anon-key")) {
      setIsConnected(false);
      setErrorMessage("ยังไม่ได้ใส่ค่า NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local หรือยังเป็นค่าตัวอย่างอยู่");
      setLoading(false);
      return;
    }

    try {
      // ทดสอบ query ดึงข้อมูลจากตาราง tbm_product_categories
      const { data, error } = await supabase
        .from("tbm_product_categories")
        .select("id, category_id, name")
        .order("id", { ascending: true })
        .limit(10);

      if (error) {
        setIsConnected(false);
        setErrorMessage(`เชื่อมต่อเซิร์ฟเวอร์ได้ แต่ฐานข้อมูลแจ้งว่า: ${error.message} (Code: ${error.code})`);
      } else {
        setIsConnected(true);
        setCategories(data || []);
      }
    } catch (err: unknown) {
      setIsConnected(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ทดสอบการเชื่อมต่อ Supabase</h2>
              <p className="text-xs text-slate-500">ตรวจสอบไฟล์ .env.local และสถานะ Database</p>
            </div>
          </div>
          <button
            onClick={checkConnection}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="ทดสอบใหม่"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Status Card */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-medium">กำลังทดสอบยิง Query ไปยัง Supabase...</p>
          </div>
        ) : isConnected ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">เชื่อมต่อกับ Supabase สำเร็จแล้ว! 🎉</h3>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Next.js สามารถเชื่อมต่อไปยังฐานข้อมูลโปรเจกต์ของคุณ และดึงข้อมูลตารางออกมาได้ตามปกติ
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">ยังเชื่อมต่อไม่ได้</h3>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* ENV Checks Detail */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            สถานะค่า Configuration (.env.local)
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>NEXT_PUBLIC_SUPABASE_URL</span>
              </span>
              {envCheck.hasUrl ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ตั้งค่าแล้ว ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  ยังไม่ได้ใส่ ✗
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </span>
              {envCheck.hasKey ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  ตั้งค่าแล้ว ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                  ยังไม่ได้ใส่ ✗
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Returned Data Sample */}
        {isConnected && categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ข้อมูลทดสอบที่ดึงได้จากตาราง tbm_product_categories ({categories.length} แถว):
            </p>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 max-h-40 overflow-y-auto divide-y divide-slate-200/60 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="py-1.5 px-2 flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{c.category_id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← กลับหน้าแรก
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            ไปหน้าแอดมินหลังบ้าน →
          </Link>
        </div>
      </div>
    </div>
  );
}

