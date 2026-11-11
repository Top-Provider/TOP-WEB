"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Tag,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Layers,
  Sparkles,
  Camera,
  Share2,
} from "lucide-react";
import { ActivityItem } from "@/app/api/activities/route";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ActivitiesViewProps {
  initialActivities: ActivityItem[];
}

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: "✨" },
  { id: "culture", label: "วัฒนธรรม & Outing", icon: "🏢" },
  { id: "exhibition", label: "สัมมนา & นิทรรศการ", icon: "🏥" },
  { id: "csr", label: "เพื่อสังคม (CSR)", icon: "🤝" },
  { id: "training", label: "อบรม & พัฒนาทักษะ", icon: "🎓" },
];

export function ActivitiesView({ initialActivities }: ActivitiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeActivity, setActiveActivity] = useState<ActivityItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // กรองข้อมูลกิจกรรม
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((act) => {
      if (selectedCategory !== "all" && act.category !== selectedCategory) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const title = act.title.toLowerCase();
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
  }, [initialActivities, selectedCategory, searchTerm]);

  // Featured activity (กิจกรรมไฮไลต์ตัวแรก)
  const featuredActivity = useMemo(() => {
    return initialActivities.find((a) => a.is_featured) || initialActivities[0];
  }, [initialActivities]);

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
    const found = CATEGORIES.find((c) => c.id === category);
    return found ? found.label : category;
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
    <div className="space-y-12">
      {/* ========================================================================= */}
      {/* Featured Highlight Activity (Hero Card) */}
      {/* ========================================================================= */}
      {featuredActivity && selectedCategory === "all" && !searchTerm && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Image side */}
            <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[420px] overflow-hidden group">
              {featuredActivity.cover_image_url ? (
                <img
                  src={featuredActivity.cover_image_url}
                  alt={featuredActivity.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow flex items-center gap-1.5 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  ไฮไลต์กิจกรรมเด่น
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs rounded-full border border-white/20">
                  {getCategoryLabel(featuredActivity.category)}
                </span>
              </div>
            </div>

            {/* Content side */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200/80">
                  {featuredActivity.event_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {featuredActivity.event_date}
                    </span>
                  )}
                  {featuredActivity.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      {featuredActivity.location}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {featuredActivity.title}
                </h2>

                {featuredActivity.title_en && (
                  <p className="text-sm text-blue-200/70 font-light">
                    {featuredActivity.title_en}
                  </p>
                )}

                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {featuredActivity.short_description || featuredActivity.content}
                </p>

                {featuredActivity.tags && featuredActivity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {featuredActivity.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-[11px] bg-white/10 text-blue-100 border border-white/15"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  onClick={() => openModal(featuredActivity)}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 px-6 py-2.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  ดูอัลบั้มภาพ & รายละเอียด
                </Button>
                {(featuredActivity.gallery_images?.length || 0) > 0 && (
                  <span className="text-xs text-blue-300/80">
                    📸 มีภาพ {featuredActivity.gallery_images.length + 1} รูป
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* Category Filter Tabs & Search Bar */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม, สถานที่, แท็ก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Activities Grid */}
      {/* ========================================================================= */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ไม่พบกิจกรรมที่ค้นหา</h3>
          <p className="text-sm text-slate-500 mt-1">
            ลองเปลี่ยนหมวดหมู่หรือคำค้นหาเพื่อดูข้อมูลกิจกรรมอื่นๆ
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory("all");
              setSearchTerm("");
            }}
            className="mt-4 rounded-xl text-xs"
          >
            ล้างตัวกรองทั้งหมด
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredActivities.map((act) => {
            const photoCount = (act.gallery_images?.length || 0) + (act.cover_image_url ? 1 : 0);

            return (
              <article
                key={act.id}
                onClick={() => openModal(act)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 flex flex-col cursor-pointer"
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

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-xs ${getCategoryBadgeClass(
                        act.category
                      )}`}
                    >
                      {getCategoryLabel(act.category)}
                    </span>
                    {act.is_featured && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
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

                {/* Content body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Date & Location */}
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

                    {act.title_en && (
                      <p className="text-xs text-slate-400 line-clamp-1">{act.title_en}</p>
                    )}

                    {act.short_description && (
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {act.short_description}
                      </p>
                    )}
                  </div>

                  {/* Tags & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(act.tags || []).slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      อ่านต่อ <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lightbox / Full Gallery Modal */}
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
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                    activeActivity.category
                  )}`}
                >
                  {getCategoryLabel(activeActivity.category)}
                </span>

                {activeActivity.event_date && (
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {activeActivity.event_date}
                  </span>
                )}

                {activeActivity.location && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
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
                variant="outline"
                onClick={() => setActiveActivity(null)}
                className="rounded-xl"
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

