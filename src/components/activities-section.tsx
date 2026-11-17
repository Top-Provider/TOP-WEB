"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Camera,
  Star,
  Sparkles,



} from "lucide-react";
import { ActivityItem, getCategoryLabel, getCategoryBadgeClass, formatThaiDate } from "@/lib/activities";
import { ActivityDetail } from "@/components/activity-detail";



interface ActivitiesSectionProps {
  initialActivities?: ActivityItem[];
}

export function ActivitiesSection({ initialActivities }: ActivitiesSectionProps = {}) {
  const activities = initialActivities || [];
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const openModal = (activity: ActivityItem) => setActiveActivity(activity);
  return (
    <section id="activities" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#0066FF] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              OUR ACTIVITIES & HIGHLIGHTS • ข่าวสารและกิจกรรม
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
              กิจกรรมและภาพลักษณ์องค์กร
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 max-w-2xl">
              ติดตามเรื่องราวความร่วมมือ การออกบูธนิทรรศการนวัตกรรมระบบสารสนเทศโรงพยาบาล และกิจกรรมสร้างสรรค์เพื่อสังคม
            </p>
          </div>

          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 group transition-all"
          >
            <span>ดูกิจกรรมทั้งหมด (View All)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards Grid (3 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activities.slice(0, 3).map((act) => {
            const photoCount = (act.gallery_images?.length || 0) + (act.cover_image_url ? 1 : 0);

            return (
              <article
                key={act.id}
                role="button" tabIndex={0} aria-label={`ดูกิจกรรม: ${act.title}`} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openModal(act); } }} onClick={() => openModal(act)}
                className="group bg-[#F8FAFC] rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 hover:bg-white transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {act.cover_image_url ? (
                    <img
                      src={act.cover_image_url}
                      alt={act.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-2xs ${getCategoryBadgeClass(
                        act.category
                      )}`}
                    >
                      {getCategoryLabel(act.category)}
                    </span>
                    {act.is_featured && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        ไฮไลต์
                      </span>
                    )}
                  </div>

                  {photoCount > 1 && (
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-mono shadow">
                      <Camera className="w-3 h-3" />
                      {photoCount} รูป
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {act.event_date && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {formatThaiDate(act.event_date)}
                        </span>
                      )}
                      {act.location && (
                        <span className="flex items-center gap-1 truncate text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>

                    {act.short_description && (
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {act.short_description}
                      </p>
                    )}
                  </div>

                  {/* Read more button */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      ดูภาพกิจกรรม & รายละเอียด <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Modal: Activity Detail & Photo Lightbox */}
      {activeActivity && <ActivityDetail key={activeActivity.id} activity={activeActivity} onClose={() => setActiveActivity(null)} />}
    </section>
  );
}