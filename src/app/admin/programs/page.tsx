"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import { toast } from "@/components/ui/toast";
import { saveRecord, fetchRecords } from "@/lib/crud";
import { DEFAULT_PROGRAMS } from "@/components/software-solution-view";
import { Plus, Search, Video, Layers, Edit, Trash2, Loader2, Sparkles, PlaySquare, CheckCircle2, Award, DownloadCloud } from "lucide-react";

interface ProgramFormState {
  name: string;
  category: string;
  subCategory: string;
  short_description: string;
  full_description: string;
  video_url: string;
  cover_image_url: string;
  key_features: string;
  metric_label: string;
  metric_value: string;
  is_active: boolean;

  // Feature Deep-Dive Section 1
  feature_1_badge: string;
  feature_1_title: string;
  feature_1_desc: string;
  feature_1_bullets: string;
  feature_1_image: string;

  // Feature Deep-Dive Section 2
  feature_2_badge: string;
  feature_2_title: string;
  feature_2_desc: string;
  feature_2_highlights: string;
  feature_2_tags: string;
  feature_2_image: string;
}

const defaultProgramState: ProgramFormState = {
  name: "",
  category: "Hospital Claim",
  subCategory: "Healthcare Solution",
  short_description: "",
  full_description: "",
  video_url: "",
  cover_image_url: "",
  key_features: "",
  metric_label: "",
  metric_value: "",
  is_active: true,

  // Feature 1
  feature_1_badge: "",
  feature_1_title: "",
  feature_1_desc: "",
  feature_1_bullets: "",
  feature_1_image: "",

  // Feature 2
  feature_2_badge: "",
  feature_2_title: "",
  feature_2_desc: "",
  feature_2_highlights: "",
  feature_2_tags: "",
  feature_2_image: "",
};

const SOLUTION_GROUP_OPTIONS = [
  { value: "Healthcare Solution", label: "Healthcare Solution (โซลูชันทางการแพทย์และสาธารณสุข)" },
  { value: "Paperless Solution", label: "Paperless Solution (โซลูชันระบบองค์กรไร้กระดาษ)" },
  { value: "E-Learning Platform", label: "E-Learning Platform (แพลตฟอร์มการเรียนรู้ออนไลน์)" },
  { value: "Disaster & Incident CMS", label: "Disaster & Incident CMS (ระบบจัดการเหตุฉุกเฉินและสาธารณภัย)" },
  { value: "Enterprise Portal", label: "Enterprise Portal (พอร์ทัลบริการข้อมูลองค์กร)" },
];

const PROGRAM_CATEGORY_OPTIONS = [
  { value: "Hospital Claim", label: "Hospital Claim (ระบบบริหารและเบิกจ่ายค่ารักษา)" },
  { value: "Smart IPD", label: "Smart IPD (ระบบบริหารจัดการผู้ป่วยในอัจฉริยะ)" },
  { value: "Smart Hospital", label: "Smart Hospital (ระบบบริหารโรงพยาบาลอัจฉริยะ)" },
  { value: "Public Health CMS", label: "Public Health CMS (ระบบสารสนเทศสุขภาพชุมชน/สาธารณสุข)" },
  { value: "Hospital HIS", label: "Hospital HIS (โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร)" },
  { value: "Pharmacy & Stock", label: "Pharmacy & Stock (คลังยาและเวชภัณฑ์)" },
  { value: "Queue & Triage", label: "Queue & Triage (คัดกรองและคิวอัตโนมัติ)" },
  { value: "Medical Record (EMR)", label: "Medical Record / EMR (เวชระเบียน)" },
  { value: "Telemedicine", label: "Telemedicine (การแพทย์ทางไกล)" },
  { value: "Financial & Billing", label: "Financial & Billing (การเงินและบัญชี)" },
];

const FILTER_GROUP_OPTIONS = [
  { value: "all", label: "ทุกกลุ่มโซลูชัน (All Groups)" },
  ...SOLUTION_GROUP_OPTIONS,
];

const FILTER_CATEGORY_OPTIONS = [
  { value: "all", label: "ทุกหมวดหมู่ซอฟต์แวร์ (All Categories)" },
  ...PROGRAM_CATEGORY_OPTIONS,
];

interface ProgramItemData {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  shortDesc: string;
  fullDesc: string;
  videoUrl: string;
  coverImage: string;
  keyFeatures: string;
  metricLabel: string;
  metricValue: string;
  isActive: boolean;
  feature1Badge: string;
  feature1Title: string;
  feature1Desc: string;
  feature1Bullets: string;
  feature1Image: string;
  feature2Badge: string;
  feature2Title: string;
  feature2Desc: string;
  feature2Highlights: string;
  feature2Tags: string;
  feature2Image: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProgramFormState>(defaultProgramState);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [solutionGroupOptions, setSolutionGroupOptions] = useState(SOLUTION_GROUP_OPTIONS);
  const [programCategoryOptions, setProgramCategoryOptions] = useState(PROGRAM_CATEGORY_OPTIONS);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords<{
        id: number;
        name: string;
        category_id: string;
        program_code?: string;
        client_subtitle?: string;
        short_description?: string;
        full_description?: string;
        video_url?: string;
        cover_image_url?: string;
        key_features?: string[] | string;
        metric_label?: string;
        metric_value?: string;
        is_active?: boolean;
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
        orderDir: "desc",
      });

      if (records && records.length > 0) {
        setPrograms(
          records.map((r) => {
            const formatArray = (val: string[] | string | undefined) => {
              if (Array.isArray(val)) return val.join("\n");
              return val || "";
            };
            const formatTags = (val: string[] | string | undefined) => {
              if (Array.isArray(val)) return val.join(", ");
              return val || "";
            };

            return {
              id: r.id,
              name: r.name,
              category:
                (r.program_code && r.program_code !== "Software")
                  ? r.program_code
                  : (r.category_id && r.category_id !== "Software"
                    ? r.category_id
                    : "Hospital Claim"),
              subCategory: r.client_subtitle || "Healthcare Solution",
              shortDesc: r.short_description || "",
              fullDesc: r.full_description || "",
              videoUrl: r.video_url || "",
              coverImage: r.cover_image_url || "/images/vitanix-claim.png",
              keyFeatures: formatArray(r.key_features) || defaultProgramState.key_features,
              metricLabel: r.metric_label || defaultProgramState.metric_label,
              metricValue: r.metric_value || defaultProgramState.metric_value,
              isActive: r.is_active ?? true,

              feature1Badge: r.feature_1_badge || "",
              feature1Title: r.feature_1_title || "",
              feature1Desc: r.feature_1_desc || "",
              feature1Bullets: formatArray(r.feature_1_bullets),
              feature1Image: r.feature_1_image || "",

              feature2Badge: r.feature_2_badge || "",
              feature2Title: r.feature_2_title || "",
              feature2Desc: r.feature_2_desc || "",
              feature2Highlights: formatArray(r.feature_2_highlights),
              feature2Tags: formatTags(r.feature_2_tags),
              feature2Image: r.feature_2_image || "",
            };
          })
        );
      } else {
        // Fallback to DEFAULT_PROGRAMS so the admin page displays all initial programs (e.g. Vitanix Claim)
        setPrograms(
          DEFAULT_PROGRAMS.map((p, idx) => ({
            id: idx + 1,
            name: p.name,
            category: p.category,
            subCategory: p.subCategory,
            shortDesc: p.shortDesc,
            fullDesc: p.fullDesc,
            videoUrl: p.videoUrl || "",
            coverImage: p.coverImage || "/images/vitanix-claim.png",
            keyFeatures: p.features?.join("\n") || defaultProgramState.key_features,
            metricLabel: p.metrics?.[0]?.label || defaultProgramState.metric_label,
            metricValue: p.metrics?.[0]?.value || defaultProgramState.metric_value,
            isActive: true,
            feature1Badge: p.feature1Badge || "",
            feature1Title: p.feature1Title || "",
            feature1Desc: p.feature1Desc || "",
            feature1Bullets: p.feature1Bullets?.join("\n") || "",
            feature1Image: p.feature1Image || "",
            feature2Badge: p.feature2Badge || "",
            feature2Title: p.feature2Title || "",
            feature2Desc: p.feature2Desc || "",
            feature2Highlights: p.feature2Highlights?.map((h) => `${h.title} | ${h.desc}`).join("\n") || "",
            feature2Tags: p.feature2Tags?.join(", ") || "",
            feature2Image: p.feature2Image || "",
          }))
        );
      }
    } catch (err) {
      console.log("Could not load programs from API, using default programs:", err);
      setPrograms(
        DEFAULT_PROGRAMS.map((p, idx) => ({
          id: idx + 1,
          name: p.name,
          category: p.category,
          subCategory: p.subCategory,
          shortDesc: p.shortDesc,
          fullDesc: p.fullDesc,
          videoUrl: p.videoUrl || "",
          coverImage: p.coverImage || "/images/vitanix-claim.png",
          keyFeatures: p.features?.join("\n") || defaultProgramState.key_features,
          metricLabel: p.metrics?.[0]?.label || defaultProgramState.metric_label,
          metricValue: p.metrics?.[0]?.value || defaultProgramState.metric_value,
          isActive: true,
          feature1Badge: p.feature1Badge || "",
          feature1Title: p.feature1Title || "",
          feature1Desc: p.feature1Desc || "",
          feature1Bullets: p.feature1Bullets?.join("\n") || "",
          feature1Image: p.feature1Image || "",
          feature2Badge: p.feature2Badge || "",
          feature2Title: p.feature2Title || "",
          feature2Desc: p.feature2Desc || "",
          feature2Highlights: p.feature2Highlights?.map((h) => `${h.title} | ${h.desc}`).join("\n") || "",
          feature2Tags: p.feature2Tags?.join(", ") || "",
          feature2Image: p.feature2Image || "",
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDefaultTemplate = (programKey: string = "vitanix-claim") => {
    const p = DEFAULT_PROGRAMS.find((item) => item.id === programKey) || DEFAULT_PROGRAMS[0];
    if (!p) return;
    setFormData({
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      short_description: p.shortDesc,
      full_description: p.fullDesc,
      video_url: p.videoUrl || "",
      cover_image_url: p.coverImage || "/images/vitanix-claim.png",
      key_features: p.features?.join("\n") || "",
      metric_label: p.metrics?.[0]?.label || "ความแม่นยำในการส่งข้อมูลเคลม",
      metric_value: p.metrics?.[0]?.value || "99.8%",
      is_active: true,
      feature_1_badge: p.feature1Badge || "",
      feature_1_title: p.feature1Title || "",
      feature_1_desc: p.feature1Desc || "",
      feature_1_bullets: p.feature1Bullets?.join("\n") || "",
      feature_1_image: p.feature1Image || "",
      feature_2_badge: p.feature2Badge || "",
      feature_2_title: p.feature2Title || "",
      feature_2_desc: p.feature2Desc || "",
      feature_2_highlights: p.feature2Highlights?.map((h) => `${h.title} | ${h.desc}`).join("\n") || "",
      feature_2_tags: p.feature2Tags?.join(", ") || "",
      feature_2_image: p.feature2Image || "",
    });
  };

  const handleSyncDefaultsToDb = async () => {
    if (!confirm("คุณต้องการนำเข้าข้อมูลโปรแกรมเริ่มต้นทั้งหมด (Vitanix Claim, HIS ฯลฯ) เข้าสู่ฐานข้อมูล Supabase ใช่หรือไม่?")) return;
    try {
      setIsSaving(true);
      for (const p of DEFAULT_PROGRAMS) {
        await saveRecord({
          table: "TB_PRODUCT_SOFTWARE",
          action: "insert",
          data: {
            name: p.name,
            slug: p.id,
            category_id: "Software",
            program_code: p.category,
            client_subtitle: p.subCategory || "Healthcare Solution",
            short_description: p.shortDesc,
            full_description: p.fullDesc,
            video_url: p.videoUrl || "",
            cover_image_url: p.coverImage || "/images/vitanix-claim.png",
            key_features: p.features || [],
            metric_label: p.metrics?.[0]?.label || "ความแม่นยำในการส่งข้อมูลเคลม",
            metric_value: p.metrics?.[0]?.value || "99.8%",
            is_active: true,
            feature_1_badge: p.feature1Badge || "",
            feature_1_title: p.feature1Title || "",
            feature_1_desc: p.feature1Desc || "",
            feature_1_bullets: p.feature1Bullets || [],
            feature_1_image: p.feature1Image || "/images/vitanix-dashboard-hd.png",
            feature_2_badge: p.feature2Badge || "",
            feature_2_title: p.feature2Title || "",
            feature_2_desc: p.feature2Desc || "",
            feature_2_highlights: p.feature2Highlights?.map((h) => `${h.title} | ${h.desc}`) || [],
            feature_2_tags: p.feature2Tags || [],
            feature_2_image: p.feature2Image || "/images/vitanix-dashboard-hd.png",
          },
        });
      }
      toast.success("นำเข้าข้อมูลโปรแกรมเริ่มต้นเข้าฐานข้อมูล Supabase เรียบร้อยแล้ว!");
      await loadPrograms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err), "เกิดข้อผิดพลาดในการนำเข้า");
    } finally {
      setIsSaving(false);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await fetch("/api/admin/program-options");
      const json = await res.json();
      if (json && json.success) {
        if (Array.isArray(json.solutionGroups) && json.solutionGroups.length > 0) {
          setSolutionGroupOptions(json.solutionGroups);
        }
        if (Array.isArray(json.programCategories) && json.programCategories.length > 0) {
          setProgramCategoryOptions(json.programCategories);
        }
      }
    } catch (err) {
      console.log("Could not load program options from API:", err);
    }
  };

  useEffect(() => {
    loadPrograms();
    loadOptions();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(defaultProgramState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateProgramForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "กรุณากรอกชื่อโปรแกรม (Program Name)";
    }
    if (!formData.category?.trim()) {
      errors.category = "กรุณาเลือกหมวดหมู่ซอฟต์แวร์ (Software Category)";
    }
    if (!formData.subCategory?.trim()) {
      errors.subCategory = "กรุณาเลือกกลุ่มโซลูชันหลัก (Solution Group)";
    }
    if (!formData.short_description?.trim()) {
      errors.short_description = "กรุณากรอกข้อความอธิบายแบบย่อ (Short Description)";
    }

    setFormErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const elementMap: Record<string, string> = {
        name: "program-name-input",
        category: "program-category-select",
        subCategory: "program-subcategory-select",
        short_description: "program-short-desc-input",
      };

      const targetId = elementMap[firstKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            const focusable =
              el.tagName === "INPUT" || el.tagName === "TEXTAREA"
                ? el
                : el.querySelector("input, select, button");
            if (focusable && "focus" in focusable) {
              (focusable as HTMLElement).focus();
            } else {
              el.focus();
            }
          }
        }, 150);
      }

      toast.warning(errors[firstKey], "กรุณากรอกข้อมูลที่จำเป็น");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("[handleSubmit Programs] Submitting formData:", formData);

    if (!validateProgramForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const payload = {
        name: formData.name,
        slug: slug || `prog-${Date.now()}`,
        category_id: "Software",
        program_code: formData.category,
        client_subtitle: formData.subCategory || "Healthcare Solution",
        short_description: formData.short_description,
        full_description: formData.full_description,
        video_url: formData.video_url,
        cover_image_url: formData.cover_image_url || "/images/vitanix-claim.png",
        key_features: formData.key_features.split("\n").map((s) => s.trim()).filter(Boolean),
        metric_label: formData.metric_label,
        metric_value: formData.metric_value,
        is_active: formData.is_active,

        // Feature 1
        feature_1_badge: formData.feature_1_badge,
        feature_1_title: formData.feature_1_title,
        feature_1_desc: formData.feature_1_desc,
        feature_1_bullets: formData.feature_1_bullets.split("\n").map((s) => s.trim()).filter(Boolean),
        feature_1_image: formData.feature_1_image || "/images/vitanix-dashboard-hd.png",

        // Feature 2
        feature_2_badge: formData.feature_2_badge,
        feature_2_title: formData.feature_2_title,
        feature_2_desc: formData.feature_2_desc,
        feature_2_highlights: formData.feature_2_highlights.split("\n").map((s) => s.trim()).filter(Boolean),
        feature_2_tags: formData.feature_2_tags.split(",").map((s) => s.trim()).filter(Boolean),
        feature_2_image: formData.feature_2_image || "/images/vitanix-dashboard-hd.png",
      };

      // บันทึกผ่าน API เส้นเดียวกัน: /api/admin/save
      await saveRecord({
        table: "TB_PRODUCT_SOFTWARE",
        action: editingId ? "update" : "insert",
        id: editingId || undefined,
        data: payload,
      });

      await loadPrograms();
      setIsModalOpen(false);
      toast.success(
        editingId ? "อัปเดตข้อมูลโปรแกรมเรียบร้อยแล้ว" : "เพิ่มโปรแกรมใหม่เรียบร้อยแล้ว",
        "สำเร็จ"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg, "บันทึกโปรแกรมไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันการลบโปรแกรม "${name}" ?`)) return;

    try {
      await saveRecord({
        table: "TB_PRODUCT_SOFTWARE",
        action: "delete",
        id,
      });
      await loadPrograms();
      toast.success(`ลบโปรแกรม "${name}" เรียบร้อยแล้ว`, "สำเร็จ");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg, "ลบข้อมูลไม่สำเร็จ");
    }
  };

  const filterGroupOptions = [
    { value: "all", label: "ทุกกลุ่มโซลูชัน (All Groups)" },
    ...solutionGroupOptions,
  ];

  const filterCategoryOptions = [
    { value: "all", label: "ทุกหมวดหมู่ซอฟต์แวร์ (All Categories)" },
    ...programCategoryOptions,
  ];

  const filtered = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || p.category === selectedCategory;
    const matchesGroup =
      selectedGroup === "all" || p.subCategory === selectedGroup;
    return matchesSearch && matchesCat && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการโปรแกรม & ซอฟต์แวร์
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ข้อมูลโปรแกรม, ข้อความอธิบาย (Text), รูปภาพหน้าจอ, ลิงก์คลิปวิดีโอสาธิต (Video URL), และผลลัพธ์ตัวเลข
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleSyncDefaultsToDb}
            disabled={isSaving}
            className="rounded-full px-4 py-2.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs"
            title="นำเข้าข้อมูลโปรแกรมเริ่มต้นทั้งหมดเข้าฐานข้อมูล Supabase"
          >
            <DownloadCloud className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">นำเข้าข้อมูลเริ่มต้น (Sync DB)</span>
          </Button>

          <Button
            variant="emerald"
            onClick={handleOpenAdd}
            className="rounded-full px-5 py-2.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มข้อมูล</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs relative z-30 overflow-visible">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อโปรแกรม..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-60">
            <Select
              value={selectedGroup}
              onChange={(val) => setSelectedGroup(val)}
              options={filterGroupOptions}
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={filterCategoryOptions}
            />
          </div>
        </div>
      </Card>

      {/* Programs List Table */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">ชื่อโปรแกรม</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">วิดีโอสาธิต (Video)</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>กำลังโหลดข้อมูลโปรแกรมจากฐานข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    {search ? "ไม่พบโปรแกรมที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูลโปรแกรมในระบบ"}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                        <Image
                          src={item.coverImage || "/images/vitanix-claim.png"}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{item.shortDesc}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-100">
                        {item.category}
                      </span>
                      <p className="text-slate-400 text-[10px] mt-1">{item.subCategory}</p>
                    </td>
                    <td className="py-3 px-4">
                      {item.videoUrl ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold border border-rose-100">
                          <Video className="w-3 h-3" />
                          <span>มีคลิปวิดีโอ</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">ไม่มีวิดีโอ</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        เปิดแสดงผล
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditingId(item.id);
                            setFormData({
                              name: item.name,
                              category: item.category,
                              subCategory: item.subCategory,
                              short_description: item.shortDesc,
                              full_description: item.fullDesc,
                              video_url: item.videoUrl,
                              cover_image_url: item.coverImage,
                              key_features: item.keyFeatures,
                              metric_label: item.metricLabel,
                              metric_value: item.metricValue,
                              is_active: item.isActive,
                              feature_1_badge: item.feature1Badge || "",
                              feature_1_title: item.feature1Title || "",
                              feature_1_desc: item.feature1Desc || "",
                              feature_1_bullets: item.feature1Bullets || "",
                              feature_1_image: item.feature1Image || "",
                              feature_2_badge: item.feature2Badge || "",
                              feature_2_title: item.feature2Title || "",
                              feature_2_desc: item.feature2Desc || "",
                              feature_2_highlights: item.feature2Highlights || "",
                              feature_2_tags: item.feature2Tags || "",
                              feature_2_image: item.feature2Image || "",
                            });
                            setIsModalOpen(true);
                          }}
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4 text-slate-500 hover:text-emerald-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* POPUP MODAL: ฟอร์มเพิ่ม / แก้ไขโปรแกรม Program & Video                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "แก้ไขโปรแกรมซอฟต์แวร์" : "เพิ่มโปรแกรมใหม่ (Product Program)"}
        description="กรอกข้อความอธิบาย (Text), รูปภาพหน้าจอ, ลิงก์คลิปวิดีโอ (YouTube/MP4)"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Quick Template Selector */}
          {!editingId && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-blue-900">
                  ดึงข้อมูลโปรแกรมตัวอย่างมาใส่ฟอร์มอัตโนมัติ:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadDefaultTemplate("vitanix-claim")}
                  className="h-8 text-xs bg-white text-blue-700 border-blue-300 hover:bg-blue-50 rounded-xl cursor-pointer"
                >
                  ดึงข้อมูล Vitanix Claim
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleLoadDefaultTemplate("panacea-his")}
                  className="h-8 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  Panacea HIS
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ข้อมูลโปรแกรมและหมวดหมู่</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อโปรแกรม (Program Name) <span className="text-rose-500 font-bold">*</span>
                </label>
                <Input
                  id="program-name-input"
                  type="text"
                  required
                  placeholder="เช่น Vitanix Claim"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`h-10 text-xs sm:text-sm rounded-xl transition-all ${formErrors.name ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/30" : ""
                    }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หมวดหมู่ซอฟต์แวร์ / โมดูลระบบ (Software Category) <span className="text-rose-500 font-bold">*</span>
                </label>
                <Select
                  id="program-category-select"
                  value={formData.category}
                  onChange={(val) => {
                    setFormData({ ...formData, category: val });
                    if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  options={programCategoryOptions}
                  className={formErrors.category ? "ring-2 ring-rose-300 rounded-xl" : ""}
                />
                {formErrors.category && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                กลุ่มโซลูชันหลัก (Solution Group / Domain) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Select
                id="program-subcategory-select"
                value={formData.subCategory || "Healthcare Solution"}
                onChange={(val) => {
                  setFormData({ ...formData, subCategory: val });
                  if (formErrors.subCategory) setFormErrors((prev) => ({ ...prev, subCategory: "" }));
                }}
                options={solutionGroupOptions}
                className={formErrors.subCategory ? "ring-2 ring-rose-300 rounded-xl" : ""}
              />
              {formErrors.subCategory && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {formErrors.subCategory}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ข้อความอธิบายแบบย่อ (Short Description - แสดงหน้าแรก) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Textarea
                id="program-short-desc-input"
                rows={2}
                required
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับการทำงานของระบบ"
                value={formData.short_description}
                onChange={(e) => {
                  setFormData({ ...formData, short_description: e.target.value });
                  if (formErrors.short_description) setFormErrors((prev) => ({ ...prev, short_description: "" }));
                }}
                className={`text-xs sm:text-sm rounded-xl leading-relaxed transition-all ${formErrors.short_description ? "border-rose-500 ring-2 ring-rose-200 bg-rose-50/30" : ""
                  }`}
              />
              {formErrors.short_description && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {formErrors.short_description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ข้อความอธิบายแบบเต็ม (Full Description - แสดงใน Popup)
              </label>
              <Textarea
                rows={3}
                placeholder="รายละเอียดและประโยชน์ของโปรแกรมฉบับเต็ม"
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
            </div>
          </div>

          {/* สื่อ Media: รูปภาพ (Component ImageUpload) และ วิดีโอ */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-rose-500" />
              <span>สื่อวิดีโอ & รูปภาพหน้าจอ (Video & Images)</span>
            </h4>

            {/* Component Video Upload (แนบไฟล์วิดีโอจากเครื่อง หรือใส่ลิงก์ YouTube) */}
            <VideoUpload
              value={formData.video_url}
              onChange={(val) => setFormData({ ...formData, video_url: val })}
              label="วิดีโอคลิปสาธิตระบบ (Demo Video)"
              description="เลือกไฟล์วิดีโอจากเครื่อง (MP4, WebM) หรือสลับไปใส่ลิงก์ YouTube"
            />

            {/* Component Image Upload สำหรับโปรแกรม */}
            <ImageUpload
              value={formData.cover_image_url}
              onChange={(val) => setFormData({ ...formData, cover_image_url: val })}
              label="รูปภาพหน้าจอโปรแกรม (Cover Image)"
              description="เลือกไฟล์หน้าจอโปรแกรมจากเครื่อง หรือใส่ URL"
            />
          </div>

          {/* ฟีเจอร์เด่น & ตัวเลขสถิติ */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>ฟีเจอร์เด่น & ตัวเลขวัดผล (Key Features & Metrics)</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Key Features (พิมพ์แยกบรรทัดละ 1 ข้อ)
              </label>
              <Textarea
                rows={3}
                placeholder="Real-time Claim Tracking&#10;Pre-audit & Error Detection"
                value={formData.key_features}
                onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                className="text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ตัวเลขสถิติ (Value)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น 99.8% หรือ 2.4x"
                  value={formData.metric_value}
                  onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  คำอธิบายตัวเลข (Label)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น ความแม่นยำในการส่งข้อมูลเคลม"
                  value={formData.metric_label}
                  onChange={(e) => setFormData({ ...formData, metric_label: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* ข้อมูลฟีเจอร์เชิงลึกส่วนที่ 1 (Feature Deep-Dive 1: Pre-Audit Showcase) */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ข้อมูลฟีเจอร์เชิงลึกส่วนที่ 1 (Feature Deep-Dive 1: Pre-Audit)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ป้ายหัวข้อฟีเจอร์ 1 (Badge Tag)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น PRE-AUDIT & VALIDATION SYSTEM"
                  value={formData.feature_1_badge}
                  onChange={(e) => setFormData({ ...formData, feature_1_badge: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หัวข้อหลักฟีเจอร์ 1 (Title)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น Automated Healthcare Claim Validation & Pre-Audit System"
                  value={formData.feature_1_title}
                  onChange={(e) => setFormData({ ...formData, feature_1_title: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เนื้อหาอธิบายฟีเจอร์ 1 (Description)
              </label>
              <Textarea
                rows={3}
                placeholder="รายละเอียดการทำงานของระบบ เช่น การตรวจสอบเวชระเบียน เงื่อนไขกองทุน และการเชื่อมโยงระบบ HIS"
                value={formData.feature_1_desc}
                onChange={(e) => setFormData({ ...formData, feature_1_desc: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รายการจุดเด่นฟีเจอร์ 1 (Bullet Points - พิมพ์แยกบรรทัดละ 1 ข้อ)
              </label>
              <Textarea
                rows={3}
                placeholder="Real-time Validation for OP-CR, PPFS & Fund Rules&#10;Seamless HIS & Insurer Policy Integration&#10;Automated ICD-10 & ICD-9 Coding Check"
                value={formData.feature_1_bullets}
                onChange={(e) => setFormData({ ...formData, feature_1_bullets: e.target.value })}
                className="text-xs sm:text-sm rounded-xl"
              />
            </div>

            <ImageUpload
              value={formData.feature_1_image}
              onChange={(val) => setFormData({ ...formData, feature_1_image: val })}
              label="รูปภาพหน้าจอระบบ ฟีเจอร์ 1 (Feature 1 Screenshot)"
              description="ภาพหน้าจอแสดงตารางหรือกระบวนการทำงานของฟีเจอร์นี้"
            />
          </div>

          {/* ================================================================= */}
          {/* ข้อมูลฟีเจอร์เชิงลึกส่วนที่ 2 (Feature Deep-Dive 2: Benefits & Highlights) */}
          {/* ================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>ข้อมูลฟีเจอร์เชิงลึกส่วนที่ 2 (Feature Deep-Dive 2: Benefits)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ป้ายหัวข้อฟีเจอร์ 2 (Badge Tag)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น HOSPITAL FINANCIAL BENEFITS"
                  value={formData.feature_2_badge}
                  onChange={(e) => setFormData({ ...formData, feature_2_badge: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หัวข้อคำถาม / จุดขายฟีเจอร์ 2 (Title)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น Why Hospital Financial Teams Choose Vitanix Claim?"
                  value={formData.feature_2_title}
                  onChange={(e) => setFormData({ ...formData, feature_2_title: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เนื้อหาอธิบายประโยชน์ 2 (Description)
              </label>
              <Textarea
                rows={3}
                placeholder="อธิบายว่าโรงพยาบาลได้ประโยชน์อะไร ลดความเสี่ยงทางการเงิน หรือช่วยเพิ่มสภาพคล่องอย่างไร"
                value={formData.feature_2_desc}
                onChange={(e) => setFormData({ ...formData, feature_2_desc: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                3 กล่องไฮไลท์ผลลัพธ์ (รูปแบบ: หัวข้อ | คำอธิบายย่อ แยกบรรทัดละข้อ)
              </label>
              <Textarea
                rows={3}
                placeholder="ลดความผิดพลาดก่อนส่งเบิก | ตัดปัญหาการถูกปฏิเสธเคลมหรือถูกตัดสิทธิ์ซ้ำซ้อนด้วยกฎ Pre-Audit&#10;อัตราความสำเร็จ Pre-Audit สูง | เพิ่มโอกาสรับเงินชดเชยค่ารักษาพยาบาลเต็มจำนวนอย่างแม่นยำ&#10;ลดรอบระยะเวลาการเบิกจ่าย | เพิ่มกระแสเงินสดหมุนเวียน (Cash Flow) ให้โรงพยาบาลได้รวดเร็วขึ้น"
                value={formData.feature_2_highlights}
                onChange={(e) => setFormData({ ...formData, feature_2_highlights: e.target.value })}
                className="text-xs sm:text-sm rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                คำสำคัญและแท็ก (Keyword Tags - คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <Input
                type="text"
                placeholder="Fund Management, E-Claim Validation, Real-Time Analytics, Fast Reimbursement"
                value={formData.feature_2_tags}
                onChange={(e) => setFormData({ ...formData, feature_2_tags: e.target.value })}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <ImageUpload
              value={formData.feature_2_image}
              onChange={(val) => setFormData({ ...formData, feature_2_image: val })}
              label="รูปภาพหน้าจอระบบ ฟีเจอร์ 2 (Feature 2 Screenshot / Analytics)"
              description="ภาพหน้าจอแดชบอร์ดสถิติ กราฟ หรือการรายงานผลของระบบ"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full px-5 text-xs font-medium"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="emerald"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full px-6 text-xs font-semibold shadow-md shadow-emerald-500/25"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกข้อมูลโปรแกรม</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
