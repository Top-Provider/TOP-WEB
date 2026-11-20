"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { SolutionCtaBanner } from "@/components/solution-cta-banner";
import { SolutionCategoryTabs } from "@/components/solution-category-tabs";
import {
  ShieldCheck,
  Cpu,
  Zap,
  RefreshCw,
  CheckCircle2,
  PhoneCall,
  ChevronRight,
  Award,
  Package,
  Loader2,
  Sparkles,
  Share2,
  Stethoscope,
  Layers,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";
import { fetchPublicRecords } from "@/lib/crud";

export interface ProgramItem {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  shortDesc: string;
  fullDesc: string;
  coverImage: string;
  videoUrl?: string;
  clientSubtitle?: string;
  features?: string[];
  metrics?: { label: string; value: string }[];
  feature1Badge?: string;
  feature1Title?: string;
  feature1Desc?: string;
  feature1Bullets?: string[];
  feature1Image?: string;
  feature2Badge?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature2Highlights?: { title: string; desc: string }[];
  feature2Tags?: string[];
  feature2Image?: string;
}

// ข้อมูล Fallback สำหรับ Vitanix Claim ในกรณีที่ฟิลด์ Feature ในฐานข้อมูลยังว่างอยู่
export const VITANIX_FALLBACK = {
  feature1Badge: "PRE-AUDIT & VALIDATION SYSTEM",
  feature1Title: "Automated Healthcare Claim Validation & Pre-Audit System",
  feature1Desc:
    "ระบบช่วยตรวจสอบความถูกต้องของเวชระเบียนและเงื่อนไขกองทุนสุขภาพภาครัฐและเอกชนล่วงหน้า (Pre-audit) ตรวจสอบความถูกต้องของรหัสโรค ICD-10, ICD-9-CM และสิทธิการรักษาแบบอัตโนมัติก่อนส่งเคลม\n\nพร้อมระบบตรวจจับข้อผิดพลาดแบบอัจฉริยะ ป้องกันการส่งเคลมซ้ำซ้อนหรือข้อมูลไม่ครบถ้วน ช่วยให้โรงพยาบาลได้รับการอนุมัติการจ่ายเงินที่รวดเร็วและแม่นยำยิ่งขึ้น",
  feature1Bullets: [
    "Real-time Validation for OP-CR, PPFS & Fund Rules",
    "Seamless HIS & Insurer Policy Integration",
    "Automated ICD-10 & ICD-9 Coding Check",
  ],
  feature1Image: "/images/showcase-laptop.png",
  feature2Badge: "HOSPITAL FINANCIAL BENEFITS",
  feature2Title: "Why Hospital Financial Teams Choose Vitanix Claim?",
  feature2Desc:
    "ลดความเสี่ยงในการสูญเสียรายได้จากการเบิกจ่ายไม่ทันเวลาหรือถูกตัดสิทธิ์ ช่วยให้ฝ่ายการเงินและเวชระเบียนมองเห็นสถานะการเคลมและลูกหนี้ค่ารักษาพยาบาลแบบ Real-time",
  feature2Highlights: [
    { title: "ลดความผิดพลาดก่อนส่งเบิก", desc: "ตัดปัญหาการถูกปฏิเสธเคลมหรือถูกตัดสิทธิ์ซ้ำซ้อนด้วยกฎ Pre-Audit" },
    { title: "อัตราความสำเร็จ Pre-Audit สูง", desc: "เพิ่มโอกาสรับเงินชดเชยค่ารักษาพยาบาลเต็มจำนวนอย่างแม่นยำ" },
    { title: "ลดรอบระยะเวลาการเบิกจ่าย", desc: "เพิ่มกระแสเงินสดหมุนเวียน (Cash Flow) ให้โรงพยาบาลได้รวดเร็วขึ้น" },
  ],
  feature2Tags: [
    "Denial Management",
    "Cash Flow Optimization",
    "Direct Billing Reconciliation",
  ],
  feature2Image: "/images/laptop_mockup.jpg",
};

// ค่าเริ่มต้นเป็น Array ว่าง ไม่ใช้ข้อมูล mock
export const DEFAULT_PROGRAMS: ProgramItem[] = [];

export function mapSoftwareRecordToProgram(
  r: {
    id: number;
    name?: string;
    category_id?: string;
    program_code?: string;
    client_subtitle?: string;
    short_description?: string;
    full_description?: string;
    cover_image_url?: string;
    video_url?: string;
    is_active?: boolean;
    key_features?: string[] | string;
    metric_label?: string;
    metric_value?: string;
    feature_1_badge?: string;
    feature_1_title?: string;
    feature_1_desc?: string;
    feature_1_bullets?: string[] | string;
    feature_1_image?: string;
    feature_2_badge?: string;
    feature_2_title?: string;
    feature_2_desc?: string;
    feature_2_highlights?: string[] | string;
    feature_2_tags?: string[] | string;
    feature_2_image?: string;
  },
  i: number = 0
): ProgramItem {
  const parseBullets = (val: string[] | string | undefined) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === "string" && val.trim()) return val.split("\n").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const parseHighlights = (val: string[] | string | undefined) => {
    if (Array.isArray(val) && val.length > 0) {
      return val.map((v) => {
        if (typeof v === "object" && v !== null && "title" in v) return v as { title: string; desc: string };
        const parts = String(v).split("|");
        return { title: parts[0]?.trim() || "", desc: parts[1]?.trim() || "" };
      });
    }
    if (typeof val === "string" && val.trim()) {
      return val
        .split("\n")
        .map((line) => {
          const parts = line.split("|");
          return { title: parts[0]?.trim() || "", desc: parts[1]?.trim() || "" };
        })
        .filter((h) => h.title);
    }
    return [];
  };

  const parseTags = (val: string[] | string | undefined) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === "string" && val.trim()) {
      return val.includes(",")
        ? val.split(",").map((s) => s.trim()).filter(Boolean)
        : val.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const category =
    r.program_code && r.program_code !== "Software"
      ? r.program_code
      : r.category_id && r.category_id !== "Software"
      ? r.category_id
      : "Healthcare Software";

  const subCategory = r.client_subtitle || category;
  const rawCover = r.cover_image_url || "";
  const coverImage = rawCover.startsWith("data:")
    ? `/api/software-image/${r.id}`
    : rawCover || "/images/vitanix-dashboard-hd.png";

  const metrics: { label: string; value: string }[] = [];
  if (r.metric_value) {
    metrics.push({
      value: r.metric_value,
      label: r.metric_label || "ความแม่นยำในการทำงาน",
    });
  }

  const features = parseBullets(r.key_features);
  const isVitanix = (r.name || "").toLowerCase().includes("vitanix");

  const parsedF1Bullets = parseBullets(r.feature_1_bullets);
  const f1Bullets = parsedF1Bullets.length > 0
    ? parsedF1Bullets
    : (isVitanix ? VITANIX_FALLBACK.feature1Bullets : undefined);

  const parsedF2Highlights = parseHighlights(r.feature_2_highlights);
  const f2Highlights = parsedF2Highlights.length > 0
    ? parsedF2Highlights
    : (isVitanix ? VITANIX_FALLBACK.feature2Highlights : undefined);

  const parsedF2Tags = parseTags(r.feature_2_tags);
  const f2Tags = parsedF2Tags.length > 0
    ? parsedF2Tags
    : (isVitanix ? VITANIX_FALLBACK.feature2Tags : undefined);

  const feature1Badge = r.feature_1_badge || (isVitanix ? VITANIX_FALLBACK.feature1Badge : "");
  const feature1Title = r.feature_1_title || (isVitanix ? VITANIX_FALLBACK.feature1Title : "");
  const feature1Desc = r.feature_1_desc || (isVitanix ? VITANIX_FALLBACK.feature1Desc : "");
  const rawF1Image = r.feature_1_image || "";
  const feature1Image = rawF1Image.startsWith("data:")
    ? `/api/software-image/${r.id}?field=feature_1_image`
    : rawF1Image && rawF1Image !== "/images/vitanix-dashboard.png"
    ? rawF1Image
    : coverImage || VITANIX_FALLBACK.feature1Image;

  const feature2Badge = r.feature_2_badge || (isVitanix ? VITANIX_FALLBACK.feature2Badge : "");
  const feature2Title = r.feature_2_title || (isVitanix ? VITANIX_FALLBACK.feature2Title : "");
  const feature2Desc = r.feature_2_desc || (isVitanix ? VITANIX_FALLBACK.feature2Desc : "");
  const rawF2Image = r.feature_2_image || "";
  const feature2Image = rawF2Image.startsWith("data:")
    ? `/api/software-image/${r.id}?field=feature_2_image`
    : rawF2Image &&
      rawF2Image !== "/images/vitanix-claim.png" &&
      rawF2Image !== "/images/vitanix-claim-analytics.png"
    ? rawF2Image
    : coverImage || VITANIX_FALLBACK.feature2Image;

  return {
    id: `software-${r.id}`,
    name: r.name || `ซอฟต์แวร์โปรแกรม #${r.id}`,
    category,
    subCategory,
    clientSubtitle: r.client_subtitle || "",
    shortDesc: r.short_description || "",
    fullDesc: r.full_description || r.short_description || "",
    coverImage,
    videoUrl: r.video_url || "",
    features: features.length > 0 ? features : undefined,
    metrics: metrics.length > 0 ? metrics : undefined,
    feature1Badge,
    feature1Title,
    feature1Desc,
    feature1Bullets: f1Bullets,
    feature1Image,
    feature2Badge,
    feature2Title,
    feature2Desc,
    feature2Highlights: f2Highlights,
    feature2Tags: f2Tags,
    feature2Image,
  };
}

export interface SoftwareSolutionViewProps {
  initialRecords?: Record<string, unknown>[];
  initialPrograms?: ProgramItem[];
}

export function SoftwareSolutionView({ initialRecords, initialPrograms }: SoftwareSolutionViewProps = {}) {
  const initialList = useMemo(() => {
    if (initialPrograms && initialPrograms.length > 0) return initialPrograms;
    if (initialRecords && initialRecords.length > 0) {
      return initialRecords.map((r, i) => mapSoftwareRecordToProgram(r as Parameters<typeof mapSoftwareRecordToProgram>[0], i));
    }
    return [];
  }, [initialRecords, initialPrograms]);

  const hasInitial = initialList.length > 0;
  const [programs, setPrograms] = useState<ProgramItem[]>(initialList);
  const [loading, setLoading] = useState(!hasInitial);
  const [selectedId, setSelectedId] = useState<string>(initialList[0]?.id || "");

  // Client-side fetch fallback
  useEffect(() => {
    if (hasInitial && programs.length > 0) {
      return;
    }

    fetchPublicRecords<{
      id: number;
      name: string;
      category_id?: string;
      program_code?: string;
      client_subtitle?: string;
      short_description?: string;
      full_description?: string;
      cover_image_url?: string;
      video_url?: string;
      is_active?: boolean;
      key_features?: string[] | string;
      metric_label?: string;
      metric_value?: string;
      feature_1_badge?: string;
      feature_1_title?: string;
      feature_1_desc?: string;
      feature_1_bullets?: string[] | string;
      feature_1_image?: string;
      feature_2_badge?: string;
      feature_2_title?: string;
      feature_2_desc?: string;
      feature_2_highlights?: string[] | string;
      feature_2_tags?: string[] | string;
      feature_2_image?: string;
    }>({
      table: "TB_PRODUCT_SOFTWARE",
      orderBy: "id",
      orderDir: "asc",
    })
      .then((records) => {
        if (records && records.length > 0) {
          const mapped: ProgramItem[] = records.map((r, i) => mapSoftwareRecordToProgram(r, i));
          setPrograms(mapped);
          setSelectedId((prev) => {
            if (prev && mapped.some((p) => p.id === prev)) return prev;
            return mapped[0]?.id || "";
          });
        }
      })
      .catch((err) => {
        console.error("Could not load software programs from DB:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hasInitial, programs.length]);

  const activeProgram =
    programs.find((p) => p.id === selectedId) || programs[0] || null;

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* 1. TOP SOLUTION CATEGORY TABS */}
      <SolutionCategoryTabs activeId="software" />

      {/* 2. HERO SHOWCASE: SIDEBAR PROGRAM SELECTOR + BROWSER DASHBOARD */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-8 sm:pt-10">
        {programs.length === 0 && !loading ? (
          <div className="rounded-3xl bg-white border border-slate-200/90 p-12 text-center my-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีข้อมูลโปรแกรมซอฟต์แวร์</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              ขณะนี้ยังไม่มีข้อมูลโปรแกรมซอฟต์แวร์ในระบบฐานข้อมูล คุณสามารถเพิ่มข้อมูลได้ที่ระบบจัดการแอดมิน
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* MOBILE PROGRAM SELECTOR (lg:hidden) */}
            <div className="lg:hidden col-span-1 w-full space-y-1.5 mb-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  เลือกโปรแกรมซอฟต์แวร์ :
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {programs.length} ระบบ
                </span>
              </div>
              <Select
                value={selectedId}
                onChange={(val) => setSelectedId(val)}
                options={programs.map((prog, idx) => ({
                  value: prog.id,
                  label: `${idx + 1}. ${prog.name}`,
                }))}
                placeholder="เลือกโปรแกรมซอฟต์แวร์..."
                triggerClassName="rounded-full text-xs sm:text-sm font-semibold shadow-2xs h-10 px-4"
              />
            </div>

            {/* Left Column (3 cols on XL): Vertical Program Menu (Desktop) */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs lg:sticky lg:top-24">
              <div className="pb-3 border-b border-slate-100 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    HEALTHCARE SOFTWARE
                  </p>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    โปรแกรมและซอฟต์แวร์
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {loading && programs.length === 0 ? "..." : `${programs.length} ระบบ`}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {loading && programs.length === 0 ? (
                  <div className="space-y-2 py-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full p-3 rounded-2xl border border-slate-100 bg-slate-50/70 animate-pulse flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-slate-200 shrink-0" />
                          <div className="space-y-1.5">
                            <div className="w-24 h-3.5 bg-slate-200 rounded-md" />
                            <div className="w-16 h-2.5 bg-slate-100 rounded-md" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  programs.map((prog, idx) => {
                    const isSelected = activeProgram ? prog.id === activeProgram.id : false;
                    return (
                      <button
                        key={prog.id}
                        onClick={() => setSelectedId(prog.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/90 text-blue-900 border border-blue-300 shadow-xs"
                            : "bg-white hover:bg-slate-50/90 text-slate-700 border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-500 border border-slate-200/60 group-hover:bg-slate-200"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-xs sm:text-[13px] font-semibold truncate ${
                                isSelected ? "text-blue-950 font-bold" : "text-slate-800"
                              }`}
                            >
                              {prog.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {prog.category}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected
                              ? "text-blue-600 translate-x-0.5"
                              : "text-slate-300 group-hover:text-slate-500"
                          }`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column (9 cols on XL): Browser Preview & Overview Card */}
            {loading && !activeProgram ? (
              <div className="lg:col-span-8 xl:col-span-9 min-h-[500px] rounded-3xl bg-white border border-slate-200/90 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                <MedicalCrossLoader size="md" />
              </div>
            ) : activeProgram ? (
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                {/* Mac Browser Window Mockup */}
                <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/60 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
                        topprovider.co.th/solutions/software/{activeProgram.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        Live System Preview
                      </span>
                    </div>
                  </div>

                  <div className="relative aspect-[16/10] w-full bg-white overflow-hidden group">
                    <Image
                      src={activeProgram.coverImage || "/images/vitanix-dashboard-hd.png"}
                      alt={activeProgram.name}
                      fill
                      priority
                      className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 3. DEEP-DIVE SECTIONS: DETAILED PROGRAM INFO */}
      {activeProgram && (
        <div
          id="details-deep-dive"
          className="w-full bg-white border-y border-slate-200/80 py-16 sm:py-20 my-12 sm:my-16"
        >
          <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 space-y-16 sm:space-y-20">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {activeProgram.clientSubtitle || activeProgram.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    Enterprise Solution
                  </span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {activeProgram.name}
                </h2>
                {(activeProgram.fullDesc || activeProgram.shortDesc) && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed whitespace-pre-line">
                    {activeProgram.fullDesc || activeProgram.shortDesc}
                  </p>
                )}
              </div>
            </div>

            {/* Feature Block 1 (Optional, from DB) */}
            {(activeProgram.feature1Title || activeProgram.feature1Desc || (activeProgram.feature1Bullets && activeProgram.feature1Bullets.length > 0)) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                <div className="lg:col-span-6 space-y-4">
                  {activeProgram.feature1Badge && (
                    <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block">
                      {activeProgram.feature1Badge}
                    </span>
                  )}
                  {activeProgram.feature1Title && (
                    <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                      {activeProgram.feature1Title}
                    </h3>
                  )}
                  {activeProgram.feature1Desc && (
                    <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
                      {activeProgram.feature1Desc}
                    </div>
                  )}

                  {activeProgram.feature1Bullets && activeProgram.feature1Bullets.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      {activeProgram.feature1Bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6">
                  <Card className="rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden bg-slate-50 p-2 group">
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/60">
                      <Image
                        src={activeProgram.feature1Image || activeProgram.coverImage || "/images/showcase-laptop.png"}
                        alt={activeProgram.feature1Title || activeProgram.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Feature Block 2 (Optional, from DB) */}
            {(activeProgram.feature2Title || activeProgram.feature2Desc || (activeProgram.feature2Highlights && activeProgram.feature2Highlights.length > 0)) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                <div className="lg:col-span-6 order-2 lg:order-1">
                  <Card className="rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden bg-slate-50 p-2 group">
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/60">
                      <Image
                        src={activeProgram.feature2Image || activeProgram.coverImage || "/images/laptop_mockup.jpg"}
                        alt={activeProgram.feature2Title || activeProgram.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
                  {activeProgram.feature2Badge && (
                    <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block">
                      {activeProgram.feature2Badge}
                    </span>
                  )}
                  {activeProgram.feature2Title && (
                    <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                      {activeProgram.feature2Title}
                    </h3>
                  )}
                  {activeProgram.feature2Desc && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {activeProgram.feature2Desc}
                    </p>
                  )}

                  {activeProgram.feature2Highlights && activeProgram.feature2Highlights.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {activeProgram.feature2Highlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3"
                        >
                          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                            {idx === 0 ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : idx === 1 ? (
                              <Award className="w-4 h-4" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900">
                              {hl.title}
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-500">
                              {hl.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeProgram.feature2Tags && activeProgram.feature2Tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeProgram.feature2Tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-slate-600 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-full shadow-2xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TECHNOLOGY GRID & CTA BANNER */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 space-y-12 sm:space-y-16">
        <div className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block">
              WHY CHOOSE VITANIX CLAIM
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Technology That Powers Smarter
              <br />
              Hospital Claims
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              ออกแบบมาเพื่อช่วยให้โรงพยาบาลบริหารจัดการงานเคลมทุกกองทุนได้อย่างแม่นยำ ลดการติด C
              <br className="hidden sm:inline" /> และเพิ่มสภาพคล่องทางการเงินอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Clinical &amp; Coding Accuracy
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ตรวจสอบรหัสโรค (ICD-10) หัตถการ (ICD-9) และมาตรฐานข้อมูล 16 แฟ้มตามเกณฑ์แต่ละกองทุนได้อย่างแม่นยำก่อนส่งเบิก
              </p>
            </Card>

            <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Seamless HIS Integration
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                เชื่อมต่อข้อมูลการรักษา สิทธิผู้ป่วย และรายการยาจากระบบ HIS เข้าสู่ระบบเคลมทุกกองทุนและประกันภัยได้แบบไร้รอยต่อ
              </p>
            </Card>

            <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Faster Reimbursement
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ลดขั้นตอนการตรวจสอบเอกสารซ้ำซ้อนด้วยระบบ Pre-Audit อัตโนมัติ ช่วยลดอัตราการถูกปฏิเสธจ่าย (Rejected Claims) และเร่งรอบรับเงิน
              </p>
            </Card>

            <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Continuous Rule Updates
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                อัปเดตเงื่อนไขการเบิกจ่ายและเกณฑ์กองทุนสุขภาพ (สปสช., ประกันสังคม, ข้าราชการ) ให้เป็นปัจจุบันเสมอ พร้อมทีมผู้เชี่ยวชาญดูแล
              </p>
            </Card>
          </div>
        </div>

        {/* 5. CALL TO ACTION BANNER */}
        <SolutionCtaBanner />
      </div>
    </div>
  );
}
