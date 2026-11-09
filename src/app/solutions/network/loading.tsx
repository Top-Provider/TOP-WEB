import React from "react";
import { Loader2, Server } from "lucide-react";

export default function NetworkLoading() {
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
            <div className="h-11 w-44 bg-white border border-slate-200 rounded-full animate-pulse" />
            <div className="h-11 w-40 bg-white border border-slate-200 rounded-full animate-pulse" />
            <div className="h-11 w-40 bg-white border border-slate-200 rounded-full animate-pulse" />
            <div className="h-11 w-48 bg-blue-600/30 rounded-full animate-pulse" />
            <div className="h-11 w-36 bg-white border border-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton (Sidebar + Grid) */}
      <section className="py-8 sm:py-10">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="lg:col-span-9 space-y-6">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>กำลังโหลดรายการอุปกรณ์ Server & Network...</span>
                </div>
                <div className="h-9 w-64 bg-white border border-slate-200 rounded-full animate-pulse" />
              </div>

              {/* 6 Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse shadow-2xs"
                  >
                    <div className="w-full aspect-[4/3] bg-slate-100 rounded-xl flex items-center justify-center">
                      <Server className="w-8 h-8 text-slate-200" />
                    </div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    <div className="space-y-1.5 pt-2">
                      <div className="h-2.5 bg-slate-100 rounded w-full" />
                      <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                      <div className="h-8 w-16 bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

