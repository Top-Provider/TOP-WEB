"use client";

import React from "react";
import { ServerCrash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalPageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
          <ServerCrash className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">
            ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            ระบบไม่สามารถติดต่อฐานข้อมูลหรือเซิร์ฟเวอร์ได้ชั่วคราว
            กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง
          </p>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            ลองเชื่อมต่อใหม่
          </Button>
        </div>
      </div>
    </div>
  );
}
