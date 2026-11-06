"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Zap,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Database,
  BarChart3,
  Layers,
  FileCheck,
  Stethoscope,
  Activity,
  Calendar,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchRecords } from "@/lib/crud";

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

export const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: "vitanix-claim",
    name: "Vitanix Claim",
    category: "Hospital Claim",
    subCategory: "Healthcare Solution",
    clientSubtitle: "Healthcare Management • 2026",
    shortDesc:
      "ระบบบริหารจัดการและเบิกจ่ายค่ารักษาพยาบาลอัตโนมัติ เชื่อมต่อข้อมูลสิทธิการรักษาและประกันภัยครบวงจร ช่วยลดขั้นตอนการตรวจสอบเอกสารและเพิ่มความแม่นยำในการเคลม",
    fullDesc:
      "Vitanix Claim ระบบบริหารจัดการและเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะสำหรับโรงพยาบาลและสถานพยาบาลระดับองค์กร ช่วยให้การเคลมสิทธิการรักษาพยาบาล (e-Claim, ประกันสุขภาพ, สิทธิราชการ) เป็นไปอย่างถูกต้อง แม่นยำ และรวดเร็ว พร้อมระบบ Pre-audit ตรวจสอบความถูกต้องของเวชระเบียนและเอกสารก่อนส่งเคลม ลดอัตราการถูกปฏิเสธเคลมได้อย่างมีนัยสำคัญ",
    coverImage: "/images/vitanix-dashboard-hd.png",
    videoUrl:
      "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
    features: [
      "Real-time Validation for OP-CR, PPFS & Fund Rules",
      "Seamless HIS & Insurer Policy Integration",
      "Automated ICD-10 & ICD-9 Coding Check",
      "Business Intelligence & Denial Analytics",
    ],
    metrics: [
      { label: "ความแม่นยำในการส่งข้อมูลเคลม", value: "99.8%" },
      { label: "เจ้าหน้าที่จัดการงานเคลมได้เร็วขึ้น", value: "2.4x" },
    ],
    feature1Badge: "PRE-AUDIT & VALIDATION SYSTEM",
    feature1Title: "Automated Healthcare Claim Validation & Pre-Audit System",
    feature1Desc:
      "ระบบช่วยตรวจสอบความถูกต้องของเวชระเบียนและเงื่อนไขกองทุนสุขภาพภาครัฐและเอกชนล่วงหน้า (Pre-audit) ตรวจสอบความถูกต้องของรหัสโรค ICD-10, ICD-9-CM และสิทธิการรักษาแบบอัตโนมัติก่อนส่งเคลม ลดขั้นตอนการทำงานของเจ้าหน้าที่และลดอัตราการถูกปฏิเสธเคลม (Denial Rate) ได้อย่างมีนัยสำคัญ\n\nเชื่อมต่อข้อมูลกับระบบสารสนเทศโรงพยาบาล (HIS) แบบไร้รอยต่อ พร้อมระบบแจ้งเตือนข้อผิดพลาดและแนะนำการแก้ไขทันที",
    feature1Bullets: [
      "Real-time Validation for OP-CR, PPFS & Fund Rules",
      "Seamless HIS & Insurer Policy Integration",
      "Automated ICD-10 & ICD-9 Coding Check",
    ],
    feature1Image: "/images/vitanix-dashboard-hd.png",
    feature2Badge: "HOSPITAL FINANCIAL BENEFITS",
    feature2Title: "Why Hospital Financial Teams Choose Vitanix Claim?",
    feature2Desc:
      "ลดความเสี่ยงในการสูญเสียรายได้จากการเบิกจ่ายไม่ทันเวลาหรือถูกตัดสิทธิ์ ช่วยให้ฝ่ายการเงินและเวชระเบียนมองเห็นสถานะการเคลมและลูกหนี้ค่ารักษาพยาบาลแบบ Real-time Dashboard ครอบคลุมสิทธิ สปสช., ประกันสังคม, ข้าราชการ และประกันเอกชน",
    feature2Highlights: [
      {
        title: "ลดความผิดพลาดก่อนส่งเบิก",
        desc: "ตัดปัญหาการถูกปฏิเสธเคลมหรือถูกตัดสิทธิ์ซ้ำซ้อนด้วยกฎ Pre-Audit",
      },
      {
        title: "อัตราความสำเร็จ Pre-Audit สูง",
        desc: "เพิ่มโอกาสรับเงินชดเชยค่ารักษาพยาบาลเต็มจำนวนอย่างแม่นยำ",
      },
      {
        title: "ลดรอบระยะเวลาการเบิกจ่าย",
        desc: "เพิ่มกระแสเงินสดหมุนเวียน (Cash Flow) ให้โรงพยาบาลได้รวดเร็วขึ้น",
      },
    ],
    feature2Tags: [
      "Fund Management",
      "E-Claim Validation",
      "Real-Time Analytics",
      "Financial Intelligence",
      "Fast Reimbursement",
    ],
    feature2Image: "/images/vitanix-dashboard-hd.png",
  },
  {
    id: "pharmacy-stock",
    name: "Pharmacy & Stock Solution",
    category: "Pharmacy & Stock",
    subCategory: "Hospital Logistics",
    clientSubtitle: "Smart Pharmacy • 2026",
    shortDesc:
      "ระบบบริหารจัดการคลังยา เวชภัณฑ์ และฉลากยาอัจฉริยะ ป้องกันยาหมดอายุ แจ้งเตือน Drug Interaction และบริหารจุดสั่งซื้ออัตโนมัติ",
    fullDesc:
      "ระบบบริหารจัดการห้องยาและคลังเวชภัณฑ์โรงพยาบาลแบบเรียลไทม์ รองรับการตัดยอดสต็อกตามคำสั่งแพทย์จากหน้าตรวจ (OPD/IPD) เชื่อมต่อเครื่องพิมพ์ฉลากยาและตู้จ่ายยาอัตโนมัติ",
    coverImage: "/images/vitanix-dashboard-hd.png",
    features: [
      "Real-time Stock Depletion & Lot Tracking",
      "Drug Allergy & Interaction Pre-warning",
      "Automated Re-order Point Calculation",
    ],
  },
  {
    id: "queue-triage",
    name: "Smart Queue & Triage System",
    category: "Queue & Triage",
    subCategory: "Patient Flow Solution",
    clientSubtitle: "Patient Experience • 2026",
    shortDesc:
      "ระบบคัดกรองและบริหารจัดการคิวอัจฉริยะ จัดสรรคิวตรวจตามระดับความเร่งด่วน พร้อมแจ้งเตือนคิวผ่านจอแสดงผลและสมาร์ตโฟน",
    fullDesc:
      "ระบบบริหารคิวอัจฉริยะที่เชื่อมโยงจุดคัดกรอง หน้าห้องตรวจ ห้องปฏิบัติการ และจุดการเงินเข้าด้วยกัน ลดความแออัดในโรงพยาบาล และเพิ่มความพึงพอใจให้แก่ผู้รับบริการ",
    coverImage: "/images/vitanix-dashboard-hd.png",
    features: [
      "Smart Triage ESI Level 1-5 Integration",
      "Mobile Queue Tracking & LINE Notification",
      "Centralized Multi-Department Display Board",
    ],
  },
  {
    id: "panacea-his",
    name: "Panacea Plus Hospital Solution (HIS)",
    category: "Hospital HIS",
    subCategory: "Cloud Hospital SaaS",
    clientSubtitle: "Core Hospital HIS • 2026",
    shortDesc:
      "โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร Standard Module 30 ระบบ และ Special Module 34 ระบบ ครอบคลุมงานเวชระเบียน, ตรวจสอบสิทธิ, OPD, IPD, ห้องยา และการเงิน",
    fullDesc:
      "Panacea Plus Hospital Solution (PPHS) ออกแบบในลักษณะ One System & Software as a Service (On Cloud) รองรับการเชื่อมต่อข้อมูลผู้ป่วย แผนกเวชระเบียน พยาธิวิทยา รังสีวิทยา และระบบบัญชีหลังบ้านอย่างสมบูรณ์แบบ",
    coverImage: "/images/pphs-banner.jpg",
    features: [
      "Front & Back HIS Standard (30 Modules)",
      "Special Clinical Modules (34 Modules)",
      "Cloud-Native SaaS Infrastructure",
    ],
  },
  {
    id: "emr-tablet",
    name: "Smart EMR Tablet & Mobile Patients",
    category: "EMR Tablet",
    subCategory: "Mobile Health",
    clientSubtitle: "Mobile Clinical & PHR • 2026",
    shortDesc:
      "ระบบเวชระเบียนอิเล็กทรอนิกส์สำหรับแพทย์และพยาบาลบนแท็บเล็ต พร้อมแอปพลิเคชันสำหรับผู้ป่วย ตรวจสอบผลตรวจ จองคิวออนไลน์ และบันทึกประวัติสุขภาพ",
    fullDesc:
      "โซลูชันเปลี่ยนผ่านโรงพยาบาลสู่ยุคไร้กระดาษ (Paperless Hospital) ด้วยระบบ EMR Tablet สำหรับการราวน์วอร์ดของแพทย์ (Doctor Inpatient Care, Nurse Note) เชื่อมโยงกับแอปพลิเคชันมือถือสำหรับคนไข้",
    coverImage: "/images/showcase-laptop.png",
    features: [
      "Doctor Inpatient Care & Round Ward UI",
      "Nurse Note & Real-time Vitals Charting",
      "Patient Mobile Application (PHR/EHR)",
    ],
  },
  {
    id: "telemedicine",
    name: "Telemedicine & Remote Care",
    category: "Telemedicine",
    subCategory: "Virtual Health Clinic",
    clientSubtitle: "Remote Patient Care • 2026",
    shortDesc:
      "ระบบการแพทย์ทางไกล ปรึกษาแพทย์ผ่านวิดีโอคอลความปลอดภัยสูง เชื่อมต่อประวัติการรักษา EMR และระบบจัดส่งยาถึงบ้าน (Health Rider)",
    fullDesc:
      "ยกระดับการให้บริการทางการแพทย์สู่บ้านผู้ป่วยด้วยระบบ Telemedicine ครบวงจร รองรับวิดีโอคอลมาตรฐานการแพทย์ บันทึกประวัติและผลการตรวจลง EMR ทันที",
    coverImage: "/images/vitanix-dashboard-hd.png",
    features: [
      "Encrypted High-Definition Video Consultation",
      "Direct EMR Record & Prescription Integration",
      "Integrated Delivery Tracking (Health Rider)",
    ],
  },
  {
    id: "financial-billing",
    name: "Financial & Billing Intelligence",
    category: "Financial & Billing",
    subCategory: "Revenue Cycle Management",
    clientSubtitle: "Hospital Revenue • 2026",
    shortDesc:
      "ระบบการเงิน บัญชีลูกหนี้ และวิเคราะห์รายรับโรงพยาบาล ตรวจสอบสถานะการจ่ายเงินจากกองทุน และติดตามยอดค้างชำระอัตโนมัติ",
    fullDesc:
      "ระบบบริหารการเงินและลูกหนี้ค่ารักษาพยาบาล (Revenue Cycle Management) ที่เชื่อมโยงกับระบบเคลมและบัญชีโรงพยาบาล ช่วยให้ฝ่ายบริหารเห็นกระแสเงินสดและสถิติการเบิกจ่ายได้ชัดเจน",
    coverImage: "/images/vitanix-dashboard-hd.png",
    features: [
      "Centralized Revenue Cycle Dashboard",
      "Automated Aging AR Reconciliation",
      "Detailed Fund Settlement Reports",
    ],
  },
];

export const SOLUTION_CATEGORY_TABS = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing" },
  { id: "hardware", label: "Hardware Solution", href: "/#case-studies" },
  { id: "software", label: "Software Solution", href: "/solutions/software", active: true },
  { id: "network", label: "Network Solution", href: "/#case-studies" },
  { id: "medical", label: "Medical Equipment", href: "/#case-studies" },
  { id: "iot", label: "Smart Solution (IoT)", href: "/#case-studies" },
];

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
  const fallback = DEFAULT_PROGRAMS[i % DEFAULT_PROGRAMS.length];

  const parseBullets = (val: string[] | string | undefined, fallbackBullets?: string[]) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === "string" && val.trim()) return val.split("\n").map((s) => s.trim()).filter(Boolean);
    return fallbackBullets;
  };

  const parseHighlights = (val: string[] | string | undefined, fallbackHigh?: { title: string; desc: string }[]) => {
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
    return fallbackHigh;
  };

  const parseTags = (val: string[] | string | undefined, fallbackTags?: string[]) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === "string" && val.trim()) {
      return val.includes(",")
        ? val.split(",").map((s) => s.trim()).filter(Boolean)
        : val.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return fallbackTags;
  };

  return {
    id: `software-${r.id}`,
    name: r.name || fallback.name,
    category:
      (r.program_code && r.program_code !== "Software")
        ? r.program_code
        : (r.category_id && r.category_id !== "Software"
          ? r.category_id
          : fallback.category),
    subCategory: r.client_subtitle || fallback.subCategory,
    clientSubtitle: r.client_subtitle || fallback.clientSubtitle,
    shortDesc: r.short_description || fallback.shortDesc,
    fullDesc: r.full_description || fallback.fullDesc,
    coverImage: r.cover_image_url || fallback.coverImage || "/images/vitanix-dashboard-hd.png",
    videoUrl: r.video_url || fallback.videoUrl,
    features: parseBullets(r.key_features, fallback.features),
    metrics: fallback.metrics,
    feature1Badge: r.feature_1_badge || fallback.feature1Badge,
    feature1Title: r.feature_1_title || fallback.feature1Title,
    feature1Desc: r.feature_1_desc || fallback.feature1Desc,
    feature1Bullets: parseBullets(r.feature_1_bullets, fallback.feature1Bullets),
    feature1Image: r.feature_1_image || fallback.feature1Image,
    feature2Badge: r.feature_2_badge || fallback.feature2Badge,
    feature2Title: r.feature_2_title || fallback.feature2Title,
    feature2Desc: r.feature_2_desc || fallback.feature2Desc,
    feature2Highlights: parseHighlights(r.feature_2_highlights, fallback.feature2Highlights),
    feature2Tags: parseTags(r.feature_2_tags, fallback.feature2Tags),
    feature2Image: r.feature_2_image || fallback.feature2Image,
  };
}

export interface SoftwareSolutionViewProps {
  initialRecords?: Record<string, unknown>[];
  initialPrograms?: ProgramItem[];
}

export function SoftwareSolutionView({ initialRecords, initialPrograms }: SoftwareSolutionViewProps = {}) {
  // แปลงข้อมูลฝั่ง Client เพื่อไม่ให้เกิด RSC Cross-boundary function invocation
  const initialList = useMemo(() => {
    if (initialPrograms && initialPrograms.length > 0) return initialPrograms;
    if (initialRecords && initialRecords.length > 0) {
      return initialRecords.map((r, i) => mapSoftwareRecordToProgram(r as any, i));
    }
    return [];
  }, [initialRecords, initialPrograms]);

  const hasInitial = initialList.length > 0;
  const [programs, setPrograms] = useState<ProgramItem[]>(initialList);
  const [loading, setLoading] = useState(!hasInitial);
  const [selectedId, setSelectedId] = useState<string>(
    initialList[0]?.id || ""
  );

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [categoryTabs, setCategoryTabs] = useState(SOLUTION_CATEGORY_TABS);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.categories) && json.categories.length > 0) {
          const dynamicTabs = json.categories
            .filter((c: { is_active?: boolean }) => c.is_active !== false)
            .map((c: { category_id: string; name: string }) => {
              const rawId = (c.category_id || "").toLowerCase();
              let href = "/#case-studies";
              if (rawId === "printing") href = "/solutions/printing";
              else if (rawId === "software") href = "/solutions/software";

              return {
                id: rawId,
                label: c.name || c.category_id,
                href,
                active: rawId === "software",
              };
            });
          if (dynamicTabs.length > 0) setCategoryTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  // Dynamic fetch from Supabase TB_PRODUCT_SOFTWARE (เฉพาะเมื่อยังไม่มีข้อมูลจาก SSR)
  useEffect(() => {
    if (hasInitial && programs.length > 0) {
      return;
    }

    fetchRecords<{
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
        console.log("Could not load software programs from API:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeProgram =
    programs.find((p) => p.id === selectedId) || programs[0] || DEFAULT_PROGRAMS[0];

  const scrollToDetails = () => {
    const el = document.getElementById("details-deep-dive");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP SOLUTION CATEGORY TABS (Matching the Reference Image Header)       */}
      {/* ========================================================================= */}
      <div className="w-full pt-4 pb-2">
        <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
            {categoryTabs.map((tab) => {
              const isActive = tab.active;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch={true}
                  className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#0062FF] text-white shadow-sm shadow-blue-600/30 font-semibold border border-[#0062FF]"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO SHOWCASE: SIDEBAR PROGRAM SELECTOR + BROWSER DASHBOARD MOCKUP    */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (3 cols on XL): Vertical Program Menu */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
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
                  {[1, 2].map((i) => (
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
                const isSelected = prog.id === activeProgram.id;
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
              }))}
            </div>
          </div>

          {/* Right Column (9 cols on XL): Browser Mockup & Overview Card */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Mac Browser Window Mockup */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/60 overflow-hidden">
              {/* Window Header */}
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
                    Live Demo Preview
                  </span>
                </div>
              </div>

              {/* Window Content: High-Resolution Dashboard Mockup */}
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

            {/* Info Summary & Smooth-Scroll CTA Card */}
            <Card className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {activeProgram.category}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeProgram.name}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {activeProgram.shortDesc}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button
                  onClick={scrollToDetails}
                  className="rounded-full bg-[#0062FF] hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 shadow-sm shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEEP-DIVE SECTIONS: WHITE BACKGROUND CONTAINER (Requested by User)    */}
      {/* ========================================================================= */}
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
                  {activeProgram.clientSubtitle || "Healthcare Solution • Enterprise Solution"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  Enterprise Solution
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {activeProgram.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {activeProgram.fullDesc}
              </p>
            </div>

            <div className="shrink-0">
              <Button
                asChild
                className="rounded-full bg-[#0062FF] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 shadow-md shadow-blue-600/20"
              >
                <Link href="/#contact" className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Sales</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Feature Block 1 (Text Left, Image Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (6 cols): Text, Description & Bullet points */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block">
                {activeProgram.feature1Badge || "PRE-AUDIT & VALIDATION SYSTEM"}
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {activeProgram.feature1Title || "Automated Healthcare Claim Validation & Pre-Audit System"}
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
                {activeProgram.feature1Desc ||
                  "ระบบช่วยตรวจสอบความถูกต้องของเวชระเบียนและเงื่อนไขกองทุนสุขภาพภาครัฐและเอกชนล่วงหน้า (Pre-audit) ตรวจสอบความถูกต้องของรหัสโรค ICD-10, ICD-9-CM และสิทธิการรักษาแบบอัตโนมัติก่อนส่งเคลม ลดขั้นตอนการทำงานของเจ้าหน้าที่และลดอัตราการถูกปฏิเสธเคลม (Denial Rate) ได้อย่างมีนัยสำคัญ\n\nเชื่อมต่อข้อมูลกับระบบสารสนเทศโรงพยาบาล (HIS) แบบไร้รอยต่อ พร้อมระบบแจ้งเตือนข้อผิดพลาดและแนะนำการแก้ไขทันที"}
              </div>

              <div className="space-y-2.5 pt-2">
                {(
                  activeProgram.feature1Bullets || [
                    "Real-time Validation for OP-CR, PPFS & Fund Rules",
                    "Seamless HIS & Insurer Policy Integration",
                    "Automated ICD-10 & ICD-9 Coding Check",
                  ]
                ).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (6 cols): System Screenshot Card */}
            <div className="lg:col-span-6">
              <Card className="rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden bg-slate-50 p-2 group">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/60">
                  <Image
                    src={activeProgram.feature1Image || activeProgram.coverImage || "/images/vitanix-dashboard-hd.png"}
                    alt={activeProgram.feature1Title || activeProgram.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Feature Block 2 (Image Left, Text Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column (6 cols): System Analytics Chart Screenshot */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <Card className="rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 overflow-hidden bg-slate-50 p-2 group">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-white border border-slate-200/60">
                  <Image
                    src={activeProgram.feature2Image || activeProgram.coverImage || "/images/vitanix-dashboard-hd.png"}
                    alt={activeProgram.feature2Title || activeProgram.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              </Card>
            </div>

            {/* Right Column (6 cols): Text & Benefit Highlights */}
            <div className="lg:col-span-6 space-y-4 order-1 lg:order-2">
              <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase block">
                {activeProgram.feature2Badge || "HOSPITAL FINANCIAL BENEFITS"}
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {activeProgram.feature2Title || `Why Hospital Financial Teams Choose ${activeProgram.name}?`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeProgram.feature2Desc ||
                  "ลดความเสี่ยงในการสูญเสียรายได้จากการเบิกจ่ายไม่ทันเวลาหรือถูกตัดสิทธิ์ ช่วยให้ฝ่ายการเงินและเวชระเบียนมองเห็นสถานะการเคลมและลูกหนี้ค่ารักษาพยาบาลแบบ Real-time Dashboard ครอบคลุมสิทธิ สปสช., ประกันสังคม, ข้าราชการ และประกันเอกชน"}
              </p>

              <div className="space-y-3 pt-2">
                {(
                  activeProgram.feature2Highlights || [
                    {
                      title: "ลดความผิดพลาดก่อนส่งเบิก",
                      desc: "ตัดปัญหาการถูกปฏิเสธเคลมหรือถูกตัดสิทธิ์ซ้ำซ้อนด้วยกฎ Pre-Audit",
                    },
                    {
                      title: "อัตราความสำเร็จ Pre-Audit สูง",
                      desc: "เพิ่มโอกาสรับเงินชดเชยค่ารักษาพยาบาลเต็มจำนวนอย่างแม่นยำ",
                    },
                    {
                      title: "ลดรอบระยะเวลาการเบิกจ่าย",
                      desc: "เพิ่มกระแสเงินสดหมุนเวียน (Cash Flow) ให้โรงพยาบาลได้รวดเร็วขึ้น",
                    },
                  ]
                ).map((hl, idx) => (
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

              {/* Keyword tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(
                  activeProgram.feature2Tags || [
                    "Fund Management",
                    "E-Claim Validation",
                    "Real-Time Analytics",
                    "Financial Intelligence",
                    "Fast Reimbursement",
                  ]
                ).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium text-slate-600 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-full shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TECHNOLOGY GRID & CTA BANNER                                          */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 space-y-12 sm:space-y-16">

            {/* ========================================================================= */}
            {/* 6. TECHNOLOGY GRID: 4 CAPABILITY CARDS                                   */}
            {/* ========================================================================= */}
            <div className="space-y-8 pt-4">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                  TECHNOLOGY & CAPABILITIES
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Technology That Powers Smarter Hospital Claims
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  เทคโนโลยีล้ำสมัยที่อยู่เบื้องหลังการประมวลผลและการตรวจสอบข้อมูลเคลมระดับ Enterprise
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Card 1 */}
                <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Clinical E-Claiming Accuracy
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ตรวจสอบความสมบูรณ์ของรหัสโรค ICD-10, ICD-9-CM และเอกสารแนบตามเกณฑ์กองทุนอย่างแม่นยำ
                  </p>
                </Card>

                {/* Card 2 */}
                <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Real-time Rule Engine
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    ประมวลผลกฎเกณฑ์ประกันสุขภาพและเงื่อนไขกองทุนแบบ Real-time ทันทีที่เจ้าหน้าที่ลงข้อมูล
                  </p>
                </Card>

                {/* Card 3 */}
                <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Faster Reimbursement
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    เร่งรอบการรับเงินชดเชยจาก สปสช., ประกันสังคม และบริษัทประกันให้เร็วขึ้นกว่าเดิม
                  </p>
                </Card>

                {/* Card 4 */}
                <Card className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Continuous Rule Updates
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    อัปเดตหลักเกณฑ์การเบิกจ่ายและประกาศใหม่จากกองทุนสุขภาพภาครัฐอย่างต่อเนื่อง
                  </p>
                </Card>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 7. CALL TO ACTION BANNER (Vibrant Blue Enterprise)                       */}
            {/* ========================================================================= */}
            <div className="rounded-[32px] sm:rounded-[36px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
              {/* Subtle Glow Circle Effect */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
                  TOP PROVIDER ENTERPRISE
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                  พร้อมยกระดับองค์กรของคุณด้วยเทคโนโลยีที่ใช่หรือยัง?
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  ปรึกษาทีมผู้เชี่ยวชาญของ TOP PROVIDER เพื่อรับคำแนะนำ ออกแบบโซลูชัน หรือนัดหมายรับชมการสาธิตระบบ (Demo) ได้ทันที
                </p>

              <div className="pt-3">
                <Button
                  asChild
                  className="rounded-full bg-white hover:bg-slate-100 text-[#0062FF] font-bold text-xs sm:text-sm px-7 py-3.5 shadow-md transition-all"
                >
                  <Link href="/#contact" className="flex items-center gap-2">
                    <span>Contact Our Team</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

