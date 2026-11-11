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
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { ActivityItem } from "@/app/api/activities/route";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ActivitiesSectionProps {
  initialActivities?: ActivityItem[];
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    title: "TOP PROVIDER Annual Outing & Team Building 2026",
    title_en: "Annual Outing & Team Synergy Workshop 2026",
    category: "culture",
    event_date: "2026-03-20",
    location: "โรงแรมและรีสอร์ต อ่าวนาง จ.กระบี่",
    short_description: "กิจกรรมกระชับความสัมพันธ์ประจำปี รวมพลังทีมวิศวกรและบุคลากรทุกฝ่ายเพื่อสร้างสรรค์โซลูชันโรงพยาบาลแห่งอนาคต",
    cover_image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    ],
    tags: ["Team Building", "Annual Outing"],
    is_featured: true,
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    title: "ร่วมแสดงนวัตกรรมระบบ Smart Hospital ในงาน Thailand HealthTech Expo 2026",
    title_en: "Exhibiting Smart Hospital & HIS Solutions at Thailand HealthTech Expo 2026",
    category: "exhibition",
    event_date: "2026-02-15",
    location: "ศูนย์การประชุมแห่งชาติสิริกิติ์ (QSNCC)",
    short_description: "นำเสนอสถาปัตยกรรมระบบเชื่อมโยงข้อมูลสุขภาพ PPHS, HIS และ HL7/FHIR Enterprise Gateway แก่ผู้บริหารโรงพยาบาลชั้นนำ",
    cover_image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    ],
    tags: ["HealthTech", "Smart Hospital"],
    is_featured: true,
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    title: "โครงการปันน้ำใจ มอบระบบสารสนเทศและคอมพิวเตอร์แก่ รพ.สต. พื้นที่ห่างไกล",
    title_en: "CSR: Donating IT Equipment & Systems to Remote Healthcare Centers",
    category: "csr",
    event_date: "2026-01-28",
    location: "โรงพยาบาลส่งเสริมสุขภาพตำบล จ.น่าน",
    short_description: "ส่งมอบอุปกรณ์ระบบเครือข่าย เครื่องพิมพ์เวชระเบียน และซอฟต์แวร์บริหารจัดการยา เพื่อเพิ่มประสิทธิภาพการดูแลผู้ป่วยในชุมชน",
    cover_image_url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    ],
    tags: ["CSR", "Healthcare Support"],
    is_featured: false,
    is_active: true,
    sort_order: 3,
  },
];

export function ActivitiesSection({ initialActivities }: ActivitiesSectionProps = {}) {
  const activities =
    initialActivities && initialActivities.length > 0 ? initialActivities : DEFAULT_ACTIVITIES;

  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "culture":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "exhibition":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "csr":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "training":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/80";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "culture":
        return "วัฒนธรรม & Outing";
      case "exhibition":
        return "สัมมนา & นิทรรศการ";
      case "csr":
        return "เพื่อสังคม (CSR)";
      case "training":
        return "อบรม & พัฒนาทักษะ";
      default:
        return category;
    }
  };

  const openModal = (act: ActivityItem) => {
    setActiveActivity(act);
    setActiveGalleryIndex(0);
  };

  const activeImages = activeActivity
    ? ([
        activeActivity.cover_image_url,
        ...(activeActivity.gallery_images || []),
      ].filter(Boolean) as string[])
    : [];

  return (
    <section id="activities" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
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
                onClick={() => openModal(act)}
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
                          {act.event_date}
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
      {activeActivity && (
        <Modal
          isOpen={!!activeActivity}
          onClose={() => setActiveActivity(null)}
          title={activeActivity.title}
          maxWidth="3xl"
        >
          <div className="space-y-4 py-2">
            {/* Gallery Viewer */}
            {activeImages.length > 0 && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                  <img
                    src={activeImages[activeGalleryIndex] || activeImages[0]}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                  />
                  {activeImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGalleryIndex((prev) =>
                            prev === 0 ? activeImages.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="ก่อนหน้า"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveGalleryIndex((prev) =>
                            prev === activeImages.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="ถัดไป"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 bg-slate-900/75 text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">
                    {activeGalleryIndex + 1} / {activeImages.length}
                  </span>
                </div>

                {/* Thumbnails */}
                {activeImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveGalleryIndex(i)}
                        className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeGalleryIndex === i
                            ? "border-blue-600 ring-2 ring-blue-500/20 opacity-100"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info details */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                    activeActivity.category
                  )}`}
                >
                  {getCategoryLabel(activeActivity.category)}
                </span>
                {activeActivity.event_date && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {activeActivity.event_date}
                  </span>
                )}
                {activeActivity.location && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {activeActivity.location}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeActivity.title}</h2>
                {activeActivity.title_en && (
                  <p className="text-xs text-slate-400 mt-0.5">{activeActivity.title_en}</p>
                )}
              </div>

              {activeActivity.short_description && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {activeActivity.short_description}
                </div>
              )}

              {activeActivity.content && (
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeActivity.content}
                </div>
              )}

              {activeActivity.tags && activeActivity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {activeActivity.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <Link
                href="/activities"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                เปิดดูในหน้ากิจกรรมเต็ม <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveActivity(null)}
                className="rounded-xl"
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

