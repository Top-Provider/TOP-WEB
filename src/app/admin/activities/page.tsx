"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Image as ImageIcon,
  Tag,
  Star,
  RefreshCw,
  Eye,
  Upload,
  X,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectOption } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUpload } from "@/components/ui/image-upload";
import { GalleryUpload } from "@/components/ui/gallery-upload";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { fetchRecords, saveRecord } from "@/lib/crud";
import { ActivityItem } from "@/app/api/activities/route";

const DEFAULT_CATEGORY_OPTIONS: SelectOption[] = [
  { value: "product_innovation", label: "Product Innovation" },
  { value: "hr_development", label: "การพัฒนาบุคลากร" },
  { value: "partner", label: "Partner" },
  { value: "customer", label: "Customer" },
  { value: "seminar", label: "การสัมมนา" },
  { value: "activity_partner", label: "กิจกรรม & Partner" },
  { value: "activity_customer", label: "กิจกรรม & Customer" },
  { value: "orientation", label: "Orientation" },
  { value: "workshop", label: "Workshop" },
  { value: "awards", label: "งานรับรางวัล" },
  { value: "distributor", label: "แต่งตั้งเป็นตัวแทนจำหน่าย" },
  { value: "certification", label: "แต่งตั้งรับรองผลิตภัณฑ์" },
  { value: "religious", label: "พิธีทางศาสนา" },
  { value: "company_internal", label: "กิจกรรมภายในบริษัท" },
];

const DEFAULT_FORM: Omit<ActivityItem, "id"> = {
  title: "",
  title_en: "",
  category: "product_innovation",
  event_date: "",
  location: "",
  short_description: "",
  content: "",
  cover_image_url: "",
  gallery_images: [],
  tags: [],
  is_featured: false,
  is_active: true,
  sort_order: 0,
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>(DEFAULT_CATEGORY_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [featuredOnlyFilter, setFeaturedOnlyFilter] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ActivityItem, "id">>(DEFAULT_FORM);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewActivity, setViewActivity] = useState<ActivityItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  // โหลดรายการกิจกรรมและหมวดหมู่
  const loadData = async () => {
    setLoading(true);
    try {
      const [res, opts] = await Promise.all([
        fetch("/api/activities?all=true"),
        fetchRecords<{ value: string; label: string }>({
          table: "TBM_PROGRAM_OPTIONS",
          orderBy: "display_order",
          orderDir: "asc",
        }),
      ]);

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setActivities(json.data);
      }

      if (Array.isArray(opts)) {
        const actOpts = opts.filter(
          (o: Record<string, unknown>) => o.option_type === "activity_type"
        );
        if (actOpts.length > 0) {
          setCategoryOptions(
            actOpts.map((o) => ({
              value: o.value,
              label: o.label || o.value,
            }))
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Load Activities Error]:", msg);
      toast.error(`ไม่สามารถโหลดข้อมูลกิจกรรมได้: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Categories for Select Component
  const filterCategorySelectOptions: SelectOption[] = useMemo(() => {
    return [
      { value: "all", label: "ทุกหมวดหมู่ (All Categories)" },
      ...categoryOptions,
    ];
  }, [categoryOptions]);

  // Filter Data
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Status Filter
      if (statusFilter === "active" && !act.is_active) return false;
      if (statusFilter === "inactive" && act.is_active) return false;

      // 2. Category Filter
      if (categoryFilter !== "all" && act.category !== categoryFilter) return false;

      // 3. Featured Filter
      if (featuredOnlyFilter && !act.is_featured) return false;

      // 4. Search Term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const titleTh = act.title.toLowerCase();
      const titleEn = (act.title_en || "").toLowerCase();
      const desc = (act.short_description || "").toLowerCase();
      const loc = (act.location || "").toLowerCase();
      const tags = (act.tags || []).join(" ").toLowerCase();

      return (
        titleTh.includes(term) ||
        titleEn.includes(term) ||
        desc.includes(term) ||
        loc.includes(term) ||
        tags.includes(term)
      );
    });
  }, [activities, searchTerm, categoryFilter, statusFilter, featuredOnlyFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      event_date: new Date().toISOString().split("T")[0],
    });
    setTagsInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (act: ActivityItem) => {
    setEditingId(act.id);
    setFormData({
      title: act.title,
      title_en: act.title_en || "",
      category: act.category,
      event_date: act.event_date || new Date().toISOString().split("T")[0],
      location: act.location || "",
      short_description: act.short_description || "",
      content: act.content || "",
      cover_image_url: act.cover_image_url || "",
      gallery_images: act.gallery_images || [],
      tags: act.tags || [],
      is_featured: act.is_featured,
      is_active: act.is_active,
      sort_order: act.sort_order ?? 0,
    });
    setTagsInput((act.tags || []).join(", "));
    setShowModal(true);
  };

  // บันทึกกิจกรรม (POST / PUT ผ่าน /api/activities)
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("กรุณากรอกชื่อกิจกรรมภาษาไทย");
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: parsedTags,
      };

      if (editingId) {
        const res = await fetch("/api/activities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "แก้ไขไม่สำเร็จ");
        toast.success("แก้ไขข้อมูลกิจกรรมเรียบร้อยแล้ว");
      } else {
        const res = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "เพิ่มไม่สำเร็จ");
        toast.success("เพิ่มกิจกรรมใหม่เรียบร้อยแล้ว");
      }

      setShowModal(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`บันทึกไม่สำเร็จ: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // สลับสถานะ Active
  const handleToggleStatus = async (act: ActivityItem) => {
    try {
      const res = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: act.id, is_active: !act.is_active }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setActivities((prev) =>
        prev.map((a) => (a.id === act.id ? { ...a, is_active: !act.is_active } : a))
      );
      toast.success(
        `เปลี่ยนสถานะเป็น ${!act.is_active ? "เผยแพร่แล้ว" : "ซ่อนกิจกรรม"} เรียบร้อย`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ไม่สามารถเปลี่ยนสถานะได้: ${msg}`);
    }
  };

  // สลับสถานะ Featured
  const handleToggleFeatured = async (act: ActivityItem) => {
    try {
      const res = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: act.id, is_featured: !act.is_featured }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setActivities((prev) =>
        prev.map((a) => (a.id === act.id ? { ...a, is_featured: !act.is_featured } : a))
      );
      toast.success(
        !act.is_featured
          ? "ปักหมุดกิจกรรมไฮไลต์เรียบร้อย"
          : "ยกเลิกการปักหมุดกิจกรรมไฮไลต์เรียบร้อย"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ไม่สามารถเปลี่ยนสถานะได้: ${msg}`);
    }
  };

  // ลบข้อมูล
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/activities?id=${deleteConfirmId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success("ลบกิจกรรมเรียบร้อยแล้ว");
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ไม่สามารถลบกิจกรรมได้: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = activities.filter((a) => a.is_active).length;
  const featuredCount = activities.filter((a) => a.is_featured).length;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "news":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "event":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "tech":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "video":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "culture":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "exhibition":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "csr":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "training":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = categoryOptions.find((c) => c.value === category);
    if (found) return found.label.split(" (")[0];
    return category;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              จัดการกิจกรรมและข่าวสารองค์กร (TB_ACTIVITIES)
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            บันทึกภาพกิจกรรมบริษัท งานสัมมนา นิทรรศการ CSR และอัลบั้มรูปภาพสำหรับแสดงผลบนหน้าเว็บไซต์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มกิจกรรมใหม่
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              กิจกรรมทั้งหมด
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{activities.length} รายการ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
              เผยแพร่อยู่ (Active)
            </p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount} รายการ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              กิจกรรมไฮไลต์ (Featured)
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{featuredCount} รายการ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Star className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="ค้นหาชื่อกิจกรรม, สถานที่, รายละเอียด, แท็ก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl text-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="w-56">
            <Select
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={filterCategorySelectOptions}
              placeholder="ทุกหมวดหมู่..."
            />
          </div>

          {/* Toggle Featured Only */}
          <button
            type="button"
            onClick={() => setFeaturedOnlyFilter((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              featuredOnlyFilter
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            เฉพาะไฮไลต์
          </button>

          {/* Status Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(["all", "active", "inactive"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "all" ? "ทั้งหมด" : st === "active" ? "เผยแพร่" : "ซ่อน"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table List */}
      <Card className="border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">รูปภาพ & ข้อมูลกิจกรรม</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">วันที่ & สถานที่</th>
                <th className="py-3.5 px-4 text-center">ไฮไลต์</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>กำลังโหลดข้อมูลกิจกรรม...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-slate-300" />
                      <p className="font-medium text-slate-600">ไม่พบข้อมูลกิจกรรม</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm || categoryFilter !== "all" || featuredOnlyFilter
                          ? "ลองเปลี่ยนคำค้นหา หรือกดรีเซ็ตตัวกรอง"
                          : "กดปุ่ม 'เพิ่มกิจกรรมใหม่' เพื่อเริ่มต้นบันทึกข้อมูล"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act, idx) => {
                  return (
                    <tr key={act.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      {/* Image & Title */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {act.cover_image_url ? (
                              <img
                                src={act.cover_image_url}
                                alt={act.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                            {(act.gallery_images?.length || 0) > 0 && (
                              <span className="absolute bottom-0 right-0 bg-slate-900/75 text-white text-[9px] px-1 py-0.5 rounded-tl font-mono">
                                +{act.gallery_images.length}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                              {act.title}
                            </p>
                            {act.title_en && (
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                {act.title_en}
                              </p>
                            )}
                            {act.short_description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                                {act.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                            act.category
                          )}`}
                        >
                          {getCategoryLabel(act.category)}
                        </span>
                      </td>

                      {/* Date & Location */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.event_date || "-"}</span>
                        </div>
                        {act.location && (
                          <div className="flex items-center gap-1.5 text-slate-400 line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{act.location}</span>
                          </div>
                        )}
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(act)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            act.is_featured
                              ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะไฮไลต์"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              act.is_featured
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-400"
                            }`}
                          />
                          {act.is_featured ? "ไฮไลต์" : "ปกติ"}
                        </button>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(act)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            act.is_active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          title="คลิกเพื่อสลับสถานะ"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              act.is_active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {act.is_active ? "เผยแพร่" : "ซ่อน"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setViewActivity(act);
                              setActiveGalleryIndex(0);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ดูตัวอย่างกิจกรรม"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(act)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(act.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* Modal: Form Add / Edit */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "แก้ไขข้อมูลกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
        maxWidth="5xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={saving}
              className="rounded-xl px-5"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="activity-form"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "เพิ่มกิจกรรม"}
            </Button>
          </div>
        }
      >
        <form id="activity-form" onSubmit={handleSave} className="space-y-4 py-2">
          {/* ข้อมูลพื้นฐาน */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              1. ข้อมูลกิจกรรม (Activity Information)
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อกิจกรรม (ภาษาไทย) <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="เช่น TOP PROVIDER Annual Outing 2026 หรือ งานสัมมนาวิชาการ HealthTech"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อกิจกรรม (ภาษาอังกฤษ)
              </label>
              <Input
                placeholder="e.g. Annual Outing & Team Building 2026"
                value={formData.title_en}
                onChange={(e) => setFormData((p) => ({ ...p, title_en: e.target.value }))}
                className="bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  หมวดหมู่กิจกรรม <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onChange={(val) => setFormData((p) => ({ ...p, category: val }))}
                  options={categoryOptions}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  วันที่จัดกิจกรรม
                </label>
                <DatePicker
                  value={formData.event_date}
                  onChange={(val) => setFormData((p) => ({ ...p, event_date: val }))}
                  placeholder="เลือกวันที่จัดกิจกรรม..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ลำดับการแสดงผล (Sort Order)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
                  }
                  className="bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                สถานที่จัดกิจกรรม (Location)
              </label>
              <Input
                placeholder="เช่น โรงแรมและรีสอร์ต อ่าวนาง จ.กระบี่, ศูนย์การประชุมแห่งชาติสิริกิติ์"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="bg-white"
              />
            </div>
          </div>

          {/* รายละเอียดเนื้อหา */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คำอธิบายย่อ (Short Description)
              </label>
              <Textarea
                rows={2}
                placeholder="สรุปไฮไลต์ของกิจกรรมสั้นๆ 1-2 บรรทัด สำหรับแสดงผลในการ์ดหน้ารวม..."
                value={formData.short_description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, short_description: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                รายละเอียดเต็ม (Content / Story)
              </label>
              <Textarea
                rows={4}
                placeholder="รายละเอียดเรื่องราวกิจกรรม, บรรยากาศ, และผลลัพธ์ของกิจกรรม..."
                value={formData.content}
                onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ป้ายกำกับ (Tags) คั่นด้วยเครื่องหมายจุลภาค (,)
              </label>
              <Input
                placeholder="เช่น Team Building, Annual Outing, HealthTech, CSR"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          {/* รูปภาพหน้าปก (Cover Image) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <ImageUpload
              label="2. รูปภาพหน้าปกกิจกรรม (Cover Image)"
              description="คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่ (รองรับ JPG, PNG, WebP)"
              value={formData.cover_image_url || ""}
              onChange={(val) => setFormData((p) => ({ ...p, cover_image_url: val }))}
            />
          </div>

          {/* อัลบั้มรูปภาพกิจกรรม (Gallery Images) */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <GalleryUpload
              label="3. อัลบั้มภาพกิจกรรม (Photo Gallery)"
              description="คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่ (เลือกได้หลายไฟล์พร้อมกัน)"
              images={formData.gallery_images || []}
              onChange={(imgs) => setFormData((p) => ({ ...p, gallery_images: imgs }))}
            />
          </div>

          {/* สวิตช์เปิดใช้งาน & ปักหมุดไฮไลต์ */}
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ปักหมุดกิจกรรมไฮไลต์ (Featured Activity)
                </p>
                <p className="text-[11px] text-slate-400">
                  แสดงเด่นที่ด้านบนสุดของหน้ากิจกรรม
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_featured: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  สถานะการแสดงผล (Active Status)
                </p>
                <p className="text-[11px] text-slate-400">
                  หากปิดการใช้งาน กิจกรรมนี้จะไม่ปรากฏบนหน้าเว็บไซต์
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_active: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Modal: View Activity Detail & Lightbox */}
      {/* ========================================================================= */}
      {viewActivity && (
        <Modal
          isOpen={!!viewActivity}
          onClose={() => setViewActivity(null)}
          title="ตัวอย่างกิจกรรม"
          maxWidth="5xl"
        >
          <div className="py-2 space-y-4">
            {/* Main Image Display */}
            {(() => {
              const allImages = [
                viewActivity.cover_image_url,
                ...(viewActivity.gallery_images || []),
              ].filter(Boolean) as string[];

              const currentImage = allImages[activeGalleryIndex] || allImages[0];

              return (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                    {currentImage && (
                      <img
                        src={currentImage}
                        alt="Activity display"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {viewActivity.is_featured && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-white" />
                        กิจกรรมไฮไลต์
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveGalleryIndex(i)}
                          className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activeGalleryIndex === i
                              ? "border-blue-600 ring-2 ring-blue-500/20"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                    viewActivity.category
                  )}`}
                >
                  {getCategoryLabel(viewActivity.category)}
                </span>

                {viewActivity.event_date && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {viewActivity.event_date}
                  </span>
                )}

                {viewActivity.location && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {viewActivity.location}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900">{viewActivity.title}</h2>
              {viewActivity.title_en && (
                <p className="text-sm text-slate-500 mt-0.5">{viewActivity.title_en}</p>
              )}
            </div>

            {viewActivity.short_description && (
              <p className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {viewActivity.short_description}
              </p>
            )}

            {viewActivity.content && (
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {viewActivity.content}
              </div>
            )}

            {viewActivity.tags && viewActivity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {viewActivity.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setViewActivity(null)}
              className="w-full rounded-xl mt-4"
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* Modal: Confirm Delete */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="ยืนยันการลบกิจกรรม"
        maxWidth="sm"
      >
        <div className="py-2 space-y-4">
          <p className="text-sm text-slate-600">
            คุณต้องการลบกิจกรรมนี้ออกจากฐานข้อมูลใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              disabled={saving}
              className="rounded-xl"
            >
              ยกเลิก
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? "กำลังลบ..." : "ยืนยันลบ"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

