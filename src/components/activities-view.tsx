"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  Calendar,
  Play,
  Search,
  ArrowRight,
  MapPin,
  X,
  Building2,
} from "lucide-react";
import {
  ActivityItem,
  CATEGORY_OPTIONS,
  formatThaiDate,
  getActivityVideoThumbnailUrl,
  getCategoryLabel,
  getCategoryBadgeClass,
} from "@/lib/activities";
import { ActivityDetail } from "@/components/activity-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ActivitiesViewProps {
  initialActivities?: ActivityItem[];
  initialTotal?: number;
}

export function ActivitiesView({
  initialActivities = [],
  initialTotal,
}: ActivitiesViewProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [total, setTotal] = useState<number>(initialTotal ?? initialActivities.length);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        const res = await fetch(`/api/activities?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setActivities(json.data || []);
          setTotal(typeof json.total === "number" ? json.total : (json.data || []).length);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [selectedCategory, searchQuery]);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#F0F7FF] via-white to-[#E4F0FF] border-b border-slate-200/70 pt-10 sm:pt-14 pb-20 sm:pb-24">
        {/* Subtle Background Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl"
        />

        <div className="relative z-10 w-[94%] max-w-[1600px] mx-auto px-2 sm:px-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0066FF] text-xs font-bold tracking-wider uppercase">
              <Megaphone className="w-3.5 h-3.5" />
              NEWS &amp; ACTIVITIES
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-tight">
              ข่าวสารและกิจกรรมองค์กร
            </h1>
            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-[#0066FF] to-sky-400" />
            <p className="max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
              อัปเดตข่าวสาร กิจกรรม งานสัมมนา เวิร์กช็อป และความเคลื่อนไหวของบริษัท
              พร้อมเรื่องราวดี ๆ จากทีมงานและพันธมิตรของเราทั่วประเทศ
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-blue-900/10 ring-1 ring-slate-200/80 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/office-hq-new.jpg"
                alt="อาคารสำนักงานใหญ่ บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Dock */}
      <div className="w-[94%] max-w-[1440px] mx-auto px-2 sm:px-4 -mt-10 sm:-mt-12 relative z-20 mb-8 sm:mb-10">
        <div className="bg-white/95 backdrop-blur-md border border-white rounded-3xl p-3 sm:p-4 shadow-lg shadow-blue-900/10 grid grid-cols-1 md:grid-cols-[260px_1fr_auto] gap-3 items-center">
          <div className="min-w-0">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
              triggerClassName="h-11 rounded-full border-slate-200 bg-white px-4 shadow-none"
            />
          </div>

          <div className="relative min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข่าวสารหรือกิจกรรม..."
              aria-label="ค้นหาข่าวสารหรือกิจกรรม"
              className="h-11 pl-11 pr-10 rounded-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-slate-600"
                aria-label="ล้างคำค้นหา"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 h-11 px-4 rounded-full bg-[#eaf3ff] text-[#075fdc] text-xs font-extrabold whitespace-nowrap">
            <Megaphone className="h-4 w-4" />
            <span>{total.toLocaleString("th-TH")} รายการ</span>
          </div>
        </div>
      </div>

      <section className="w-[94%] max-w-[1600px] mx-auto px-2 sm:px-4">
        {/* Activities Grid */}
        {loading && activities.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-slate-500 font-medium">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</p>
          {(selectedCategory !== "all" || searchQuery) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              แสดงกิจกรรมทั้งหมด
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => {
            const thaiDate = formatThaiDate(act.event_date);
            const categoryLabel = getCategoryLabel(act.category);
            const isVideo = act.category === "video" || Boolean(act.video_url);
            const videoThumb = !act.cover_image_url ? getActivityVideoThumbnailUrl(act.video_url) : null;

            return (
              <article
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {act.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={act.cover_image_url}
                      alt={act.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : videoThumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={videoThumb}
                      alt={act.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : act.video_url ? (
                    <video
                      src={`${act.video_url}#t=0.5`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Megaphone className="w-10 h-10" />
                    </div>
                  )}

                  {/* Top-Left Date Badge */}
                  {thaiDate && (
                    <div
                      suppressHydrationWarning
                      className="absolute top-3 left-3 bg-[#0A2540]/80 backdrop-blur-md text-white text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                      <span>{thaiDate}</span>
                    </div>
                  )}

                  {/* Bottom-Left Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md shadow-xs ${getCategoryBadgeClass(
                        act.category
                      )}`}
                    >
                      {categoryLabel}
                    </span>
                  </div>

                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-[#0062FF] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {act.location && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </p>
                    )}
                    {act.customerName && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{act.customerName}</span>
                      </p>
                    )}
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#0062FF] transition-colors line-clamp-2 leading-snug min-h-[2.85rem]">
                      {act.title}
                    </h3>
                    {act.short_description && (
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {act.short_description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0062FF]">
                    <span>{isVideo ? "รับชมวิดีโอ" : "ชมภาพและรายละเอียดกิจกรรม"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        )}
      </section>

      {selectedActivity && (
        <ActivityDetail activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
    </div>
  );
}
