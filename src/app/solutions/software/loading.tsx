import React from "react";
import { Loader2, Monitor } from "lucide-react";

export default function SoftwareLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <section className="bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] border-b border-slate-200/80 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 space-y-6">
          <div className="space-y-3 max-w-3xl">
            <div className="h-6 w-36 bg-blue-100 rounded-full animate-pulse" />
            <div className="h-10 sm:h-12 w-2/3 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
          </div>

          {/* Solution Tabs Skeleton */}
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            <div className="h-11 w-48 bg-white border border-slate-200 rounded-full animate-pulse" />
            <div className="h-11 w-48 bg-blue-600/30 rounded-full animate-pulse" />
            <div className="h-11 w-36 bg-white border border-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-8 sm:py-12">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>กำลังโหลดข้อมูลระบบสารสนเทศและการใช้งาน...</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Program List Skeleton) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (Browser Mockup Skeleton) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md overflow-hidden animate-pulse">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="h-3 w-48 bg-slate-200 rounded ml-2" />
                  </div>
                </div>
                <div className="aspect-[16/10] w-full bg-slate-100 flex items-center justify-center">
                  <Monitor className="w-16 h-16 text-slate-200" />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-96 bg-slate-100 rounded" />
                </div>
                <div className="h-10 w-36 bg-blue-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

