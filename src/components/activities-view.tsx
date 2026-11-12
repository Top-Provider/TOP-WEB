"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Megaphone,
  Calendar,
  Lightbulb,
  PlayCircle,
  Play,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  MapPin,
  Tag,
  X,
  Share2,
} from "lucide-react";
import { ActivityItem } from "@/app/api/activities/route";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ActivitiesViewProps {
  initialActivities?: ActivityItem[];
}

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: LayoutGrid },
  { id: "news", label: "ข่าวประชาสัมพันธ์", icon: Megaphone },
  { id: "event", label: "กิจกรรม & อีเวนต์", icon: Calendar },
  { id: "tech", label: "ความรู้และเทคโนโลยี", icon: Lightbulb },
  { id: "video", label: "วิดีโอ", icon: PlayCircle },
];

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const monthName = THAI_MONTHS[monthIdx] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = THAI_MONTHS[d.getMonth()];
      const year = d.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function ActivitiesView({ initialActivities = [] }: ActivitiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Active detail modal
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Filter & sort activities
  const filteredActivities = useMemo(() => {
    let list = initialActivities.filter((act) => {
      // Category filter (mapping culture/exhibition/csr to event/tech/news if needed)
      if (selectedCategory !== "all") {
        if (selectedCategory === "event") {
          if (act.category !== "event" && act.category !== "culture" && act.category !== "csr") {
            return false;
          }
        } else if (selectedCategory === "tech") {
          if (act.category !== "tech" && act.category !== "training") {
            return false;
          }
        } else if (selectedCategory === "news") {
          if (act.category !== "news" && act.category !== "exhibition") {
            return false;
          }
        } else if (act.category !== selectedCategory) {
          return false;
        }
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const title = (act.title || "").toLowerCase();
      const titleEn = (act.title_en || "").toLowerCase();
      const desc = (act.short_description || "").toLowerCase();
      const loc = (act.location || "").toLowerCase();
      const tags = (act.tags || []).join(" ").toLowerCase();

      return (
        title.includes(term) ||
        titleEn.includes(term) ||
        desc.includes(term) ||
        loc.includes(term) ||
        tags.includes(term)
      );
    });

    // Sort by event_date / id
    list = [...list].sort((a, b) => {
      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
      if (sortOrder === "desc") {
        return dateB - dateA || b.id - a.id;
      }
      return dateA - dateB || a.id - b.id;
    });

    return list;
  }, [initialActivities, selectedCategory, searchTerm, sortOrder]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "news":
        return "ข่าวประชาสัมพันธ์";
      case "event":
      case "culture":
      case "csr":
        return "กิจกรรม & อีเวนต์";
      case "tech":
      case "training":
        return "ความรู้และเทคโนโลยี";
      case "video":
        return "วิดีโอ";
      case "exhibition":
        return "งานสัมมนา & นิทรรศการ";
      default:
        return category;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "news":
        return "bg-sky-500/90 text-white";
      case "event":
      case "culture":
      case "csr":
        return "bg-blue-600/90 text-white";
      case "tech":
      case "training":
        return "bg-indigo-600/90 text-white";
      case "video":
        return "bg-cyan-600/90 text-white";
      default:
        return "bg-slate-700/90 text-white";
    }
  };

  const openModal = (act: ActivityItem) => {
    setActiveActivity(act);
    setActiveImageIndex(0);
  };

  const activeImages = useMemo(() => {
    if (!activeActivity) return [];
    return [
      activeActivity.cover_image_url,
      ...(activeActivity.gallery_images || []),
    ].filter(Boolean) as string[];
  }, [activeActivity]);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* ========================================================================= */}
      {/* Filter Tabs & Sort Dropdown Row */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#0062FF] text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0062FF] border border-slate-200/90 shadow-2xs"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Search & Sort */}
        <div className="flex items-center gap-3 self-end lg:self-auto w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาบทความ, ข่าวสาร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <span className="text-slate-400">เรียงตาม :</span>
              <span className="font-semibold text-slate-800">
                {sortOrder === "desc" ? "ล่าสุด" : "เก่าสุด"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder("desc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    sortOrder === "desc"
                      ? "text-[#0062FF] bg-blue-50 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  ล่าสุด (ใหม่สุด)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder("asc");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    sortOrder === "asc"
                      ? "text-[#0062FF] bg-blue-50 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  เก่าสุด (ก่อนหน้า)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-Column Activities & News Cards Grid */}
      {/* ========================================================================= */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ไม่พบข่าวสารหรือกิจกรรมที่ค้นหา</h3>
          <p className="text-sm text-slate-500 mt-1.5">
            ลองปรับเปลี่ยนคำค้นหาหรือเลือกดูหมวดหมู่อื่นๆ
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
            }}
            className="mt-4 rounded-full text-xs"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredActivities.map((act) => {
            const isVideo = act.category === "video";
            const thaiDate = formatThaiDate(act.event_date);
            const categoryLabel = getCategoryLabel(act.category);

            return (
              <article
                key={act.id}
                onClick={() => openModal(act)}
                className="group relative bg-white rounded-[24px] overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Cover Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {act.cover_image_url ? (
                    <img
                      src={act.cover_image_url}
                      alt={act.title}
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

                  {/* Video Play Button Overlay */}
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
                    <h3 className="font-bold text-slate-900 text-base sm:text-[17px] group-hover:text-[#0062FF] transition-colors line-clamp-2 leading-snug min-h-[2.85rem]">
                      {act.title}
                    </h3>

                    {act.short_description && (
                      <p className="text-xs sm:text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                        {act.short_description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0062FF] group-hover:underline flex items-center gap-1">
                      <span>{isVideo ? "ดูวิดีโอ" : "อ่านรายละเอียดเพิ่มเติม"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>

                    <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50/60 text-[#0062FF] group-hover:bg-[#0062FF] group-hover:text-white group-hover:border-[#0062FF] flex items-center justify-center transition-all duration-200 shadow-2xs">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lightbox / Detail Modal */}
      {/* ========================================================================= */}
      {activeActivity && (
        <Modal
          isOpen={!!activeActivity}
          onClose={() => setActiveActivity(null)}
          title={activeActivity.title}
          maxWidth="4xl"
        >
          <div className="space-y-6 py-2">
            {/* Gallery Viewer */}
            {activeImages.length > 0 && (
              <div className="space-y-3">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-lg">
                  <img
                    src={activeImages[activeImageIndex] || activeImages[0]}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                  />

                  {/* Arrows */}
                  {activeImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) =>
                            prev === 0 ? activeImages.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="ก่อนหน้า"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) =>
                            prev === activeImages.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="ถัดไป"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Counter */}
                  <span className="absolute bottom-3 right-3 bg-slate-900/75 text-white text-xs px-2.5 py-1 rounded-full font-mono">
                    {activeImageIndex + 1} / {activeImages.length}
                  </span>
                </div>

                {/* Thumbnails strip */}
                {activeImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {activeImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImageIndex(i)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === i
                            ? "border-[#0062FF] ring-2 ring-blue-500/20 opacity-100"
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
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(
                    activeActivity.category
                  )}`}
                >
                  {getCategoryLabel(activeActivity.category)}
                </span>

                {activeActivity.event_date && (
                  <span
                    suppressHydrationWarning
                    className="text-xs text-slate-600 flex items-center gap-1.5 font-medium"
                  >
                    <Calendar className="w-4 h-4 text-[#0062FF]" />
                    {formatThaiDate(activeActivity.event_date)}
                  </span>
                )}

                {activeActivity.location && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0062FF]" />
                    {activeActivity.location}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeActivity.title}
                </h2>
                {activeActivity.title_en && (
                  <p className="text-sm text-slate-500 mt-1">{activeActivity.title_en}</p>
                )}
              </div>

              {activeActivity.short_description && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-sm text-slate-700 leading-relaxed font-medium">
                  {activeActivity.short_description}
                </div>
              )}

              {activeActivity.content && (
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
                  {activeActivity.content}
                </div>
              )}

              {activeActivity.tags && activeActivity.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                  {activeActivity.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1 font-medium"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveActivity(null)}
                className="rounded-xl cursor-pointer"
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
