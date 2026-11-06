import React from "react";
import { Loader2, Package } from "lucide-react";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Banner Skeleton */}
      <section className="bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-200/80 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="max-w-3xl space-y-3">
            <div className="h-6 w-32 bg-blue-100/70 rounded-full animate-pulse" />
            <div className="h-10 sm:h-12 w-3/4 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* Main Catalog Skeleton */}
      <section className="py-8 sm:py-10">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          {/* Controls Bar Skeleton */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-28 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-72 bg-slate-100 rounded-xl animate-pulse" />
          </div>

          {/* Loading status bar */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>กำลังโหลดแคตตาล็อกสินค้า...</span>
            </div>
          </div>

          {/* 8 Product Cards Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse shadow-2xs"
              >
                <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-slate-200" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-slate-100 rounded" />
                </div>
                <div className="h-4 w-5/6 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                  <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

