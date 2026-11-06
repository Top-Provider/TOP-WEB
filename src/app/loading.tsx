import React from "react";
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Animated Brand Pulse */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-blue-500/10 blur-md pointer-events-none -z-10 animate-ping opacity-75" />
        </div>

        {/* Text indicators */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-slate-800 tracking-tight">
            TOP PROVIDER SYSTEM
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
            กำลังโหลดข้อมูลจากระบบ...
          </p>
        </div>
      </div>
    </div>
  );
}

