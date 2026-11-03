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
import { saveRecord, fetchRecords } from "@/lib/crud";
import { Plus, Search, Video, Layers, Edit, Trash2, Loader2, Sparkles, PlaySquare } from "lucide-react";

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
}

const defaultProgramState: ProgramFormState = {
  name: "",
  category: "Hospital Claim",
  subCategory: "Healthcare Solution",
  short_description: "",
  full_description: "",
  video_url: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
  cover_image_url: "",
  key_features: "Real-time Claim Tracking\nPre-audit & Error Detection\nAutomated e-Claim Processing",
  metric_label: "ความแม่นยำในการส่งข้อมูลเคลม",
  metric_value: "99.8%",
  is_active: true,
};

const PROGRAM_CATEGORY_OPTIONS = [
  { value: "Hospital Claim", label: "Hospital Claim (ระบบเบิกจ่ายค่ารักษา)" },
  { value: "Pharmacy & Stock", label: "Pharmacy & Stock (คลังยาและเวชภัณฑ์)" },
  { value: "Queue & Triage", label: "Queue & Triage (คัดกรองและคิวอัตโนมัติ)" },
  { value: "Medical Record (EMR)", label: "Medical Record / EMR (เวชระเบียน)" },
  { value: "Telemedicine", label: "Telemedicine (การแพทย์ทางไกล)" },
  { value: "Financial & Billing", label: "Financial & Billing (การเงินและบัญชี)" },
];

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: "Vitanix Claim",
      category: "Hospital Claim",
      subCategory: "Healthcare Solution",
      shortDesc: "ระบบบริหารจัดการและเบิกจ่ายค่ารักษาพยาบาลอัตโนมัติ เชื่อมต่อข้อมูลสิทธิการรักษาและประกันภัยครบวงจร",
      videoUrl: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
      coverImage: "/images/vitanix-claim.png",
      isActive: true,
    },
    {
      id: 2,
      name: "Panacea Plus Hospital Solution (HIS)",
      category: "Hospital HIS",
      subCategory: "Cloud Hospital SaaS",
      shortDesc: "โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร Standard Module 30 ระบบ และ Special Module 34 ระบบ",
      videoUrl: "",
      coverImage: "/images/pphs-banner.jpg",
      isActive: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProgramFormState>(defaultProgramState);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadPrograms = async () => {
    try {
      const records = await fetchRecords<{
        id: number;
        name: string;
        category_id: string;
        client_subtitle?: string;
        short_description?: string;
        video_url?: string;
        cover_image_url?: string;
        is_active?: boolean;
      }>({
        table: "TBM_PRODUCT_SOFTWARE",
        orderBy: "id",
        orderDir: "desc",
      });

      if (records && records.length > 0) {
        setPrograms(
          records.map((r) => ({
            id: r.id,
            name: r.name,
            category: r.category_id || "Hospital Claim",
            subCategory: r.client_subtitle || "Healthcare Solution",
            shortDesc: r.short_description || "",
            videoUrl: r.video_url || "",
            coverImage: r.cover_image_url || "/images/vitanix-claim.png",
            isActive: r.is_active ?? true,
          }))
        );
      }
    } catch (err) {
      console.log("Could not load programs from API (using fallback):", err);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(defaultProgramState);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("👉 [handleSubmit Programs] Submitting formData:", formData);

    if (!formData.name?.trim()) {
      alert("กรุณากรอกชื่อโปรแกรม (Program Name)");
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const payload = {
        name: formData.name,
        slug: slug || `prog-${Date.now()}`,
        category_id: formData.category,
        client_subtitle: formData.subCategory,
        short_description: formData.short_description,
        full_description: formData.full_description,
        video_url: formData.video_url,
        cover_image_url: formData.cover_image_url || "/images/vitanix-claim.png",
        key_features: formData.key_features.split("\n").filter(Boolean),
        metric_label: formData.metric_label,
        metric_value: formData.metric_value,
        is_active: formData.is_active,
      };

      // บันทึกผ่าน API เส้นเดียวกัน: /api/admin/save
      await saveRecord({
        table: "TBM_PRODUCT_SOFTWARE",
        action: editingId ? "update" : "insert",
        id: editingId || undefined,
        data: payload,
      });

      await loadPrograms();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("บันทึกโปรแกรมไม่สำเร็จ: " + msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันการลบโปรแกรม "${name}" ?`)) return;

    try {
      await saveRecord({
        table: "TBM_PRODUCT_SOFTWARE",
        action: "delete",
        id,
      });
      await loadPrograms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("ลบข้อมูลไม่สำเร็จ: " + msg);
    }
  };

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการโปรแกรม & ซอฟต์แวร์ (TBM_PRODUCT_PROGRAMS)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ข้อมูลโปรแกรม, ข้อความอธิบาย (Text), รูปภาพหน้าจอ, ลิงก์คลิปวิดีโอสาธิต (Video URL), และผลลัพธ์ตัวเลข
          </p>
        </div>

        <Button
          variant="emerald"
          onClick={handleOpenAdd}
          className="rounded-full px-5 py-2.5 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโปรแกรมใหม่ (Popup)</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อโปรแกรม, หมวดหมู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
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
              {filtered.map((item) => (
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
                            ...defaultProgramState,
                            name: item.name,
                            category: item.category,
                            subCategory: item.subCategory,
                            short_description: item.shortDesc,
                            video_url: item.videoUrl,
                            cover_image_url: item.coverImage,
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
              ))}
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
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ข้อมูลโปรแกรมและหมวดหมู่</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อโปรแกรม (Program Name) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="เช่น Vitanix Claim"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ป้ายหมวดหมู่ (Category Badge) *
                </label>
                <Select
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={PROGRAM_CATEGORY_OPTIONS}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หมวดหมู่ย่อย (Sub Category)
              </label>
              <Input
                type="text"
                placeholder="เช่น Healthcare Solution หรือ Cloud Hospital SaaS"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ข้อความอธิบายแบบย่อ (Short Description - แสดงหน้าแรก) *
              </label>
              <Textarea
                rows={2}
                required
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับการทำงานของระบบ"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
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
