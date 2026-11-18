"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/components/ui/toast";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";
import { saveRecord, fetchRecords } from "@/lib/crud";
import {
  Plus,
  Search,
  LayoutGrid,
  Edit,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  Code,
  Copy,
  Check,
  Eye,
} from "lucide-react";

export interface SolutionTopicItem {
  id?: number | string;
  tab_category: string;
  title: string;
  subtitle: string;
  counter_text?: string;
  short_description: string;
  full_description?: string;
  key_features: string[] | string;
  cover_image_url: string;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

const TAB_OPTIONS = [
  { value: "printing", label: "Printing & Supply Solution" },
  { value: "hardware", label: "Hardware Solution" },
  { value: "network", label: "Network Solution" },
  { value: "medical", label: "Medical Equipment" },
];

const DEFAULT_FORM: SolutionTopicItem = {
  tab_category: "printing",
  title: "",
  subtitle: "",
  short_description: "",
  full_description: "",
  key_features: "",
  cover_image_url: "",
  cta_text: "ดูสินค้าทั้งหมด",
  cta_link: "/solutions/printing",
  sort_order: 1,
  is_active: true,
};

export default function AdminSolutionTopicsPage() {
  const [topics, setTopics] = useState<SolutionTopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTabFilter, setSelectedTabFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<SolutionTopicItem>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const records = await fetchRecords({
        table: "TB_SOLUTION_TOPICS",
        orderBy: "sort_order",
        orderDir: "asc",
      });
      if (Array.isArray(records)) {
        setTopics(records as unknown as SolutionTopicItem[]);
      }
    } catch (err) {
      console.warn("TB_SOLUTION_TOPICS not ready yet or empty:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      tab_category: selectedTabFilter !== "all" ? selectedTabFilter : "printing",
      sort_order: topics.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: SolutionTopicItem) => {
    setEditingId(item.id || null);
    const featuresStr = Array.isArray(item.key_features)
      ? item.key_features.join("\n")
      : typeof item.key_features === "string"
      ? item.key_features
      : "";

    setFormData({
      ...item,
      key_features: featuresStr,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("กรุณาระบุชื่อหัวข้อโซลูชัน");
      return;
    }

    setSaving(true);
    try {
      const featuresArray =
        typeof formData.key_features === "string"
          ? formData.key_features
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : formData.key_features;

      const payload = {
        tab_category: formData.tab_category,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        short_description: formData.short_description.trim(),
        full_description: formData.full_description?.trim() || formData.short_description.trim(),
        key_features: featuresArray,
        cover_image_url: formData.cover_image_url || "/images/printer-product.png",
        cta_text: formData.cta_text.trim() || "ดูสินค้าทั้งหมด",
        cta_link: formData.cta_link.trim() || "/solutions",
        sort_order: Number(formData.sort_order) || 0,
        is_active: formData.is_active,
      };

      if (editingId) {
        await saveRecord({
          table: "TB_SOLUTION_TOPICS",
          action: "update",
          id: editingId,
          data: payload,
        });
        toast.success("อัปเดตการ์ดโซลูชันสำเร็จ");
      } else {
        await saveRecord({
          table: "TB_SOLUTION_TOPICS",
          action: "insert",
          data: payload,
        });
        toast.success("เพิ่มการ์ดโซลูชันใหม่สำเร็จ");
      }

      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`บันทึกไม่สำเร็จ: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await saveRecord({
        table: "TB_SOLUTION_TOPICS",
        action: "delete",
        id: deleteConfirmId,
      });
      toast.success("ลบการ์ดเรียบร้อยแล้ว");
      setDeleteConfirmId(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`ลบไม่สำเร็จ: ${msg}`);
    }
  };

  const filteredTopics = topics.filter((t) => {
    const matchCategory =
      selectedTabFilter === "all" || t.tab_category === selectedTabFilter;
    const matchSearch =
      searchTerm === "" ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.short_description && t.short_description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const sqlScript = `-- 1. คำสั่งสร้างตาราง TB_SOLUTION_TOPICS ใน Supabase
CREATE TABLE IF NOT EXISTS public."TB_SOLUTION_TOPICS" (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    tab_category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    counter_text VARCHAR(50),
    short_description TEXT,
    full_description TEXT,
    key_features JSONB DEFAULT '[]'::jsonb,
    cover_image_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. เปิดใช้งานความปลอดภัย RLS
ALTER TABLE public."TB_SOLUTION_TOPICS" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read TB_SOLUTION_TOPICS" ON public."TB_SOLUTION_TOPICS";
CREATE POLICY "Public Read TB_SOLUTION_TOPICS" 
ON public."TB_SOLUTION_TOPICS" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full Access TB_SOLUTION_TOPICS" ON public."TB_SOLUTION_TOPICS";
CREATE POLICY "Full Access TB_SOLUTION_TOPICS" 
ON public."TB_SOLUTION_TOPICS" FOR ALL USING (true);

-- 3. ข้อมูลเริ่มต้น (Seed Initial Topics)
INSERT INTO public."TB_SOLUTION_TOPICS" 
(tab_category, title, subtitle, short_description, key_features, cover_image_url, cta_text, cta_link, sort_order, is_active)
VALUES
('printing', 'Printer', '2026 • Printing & Supply Solution', 
 'ศูนย์รวมเครื่องพิมพ์คุณภาพสูงครบวงจรสำหรับองค์กรและสถานพยาบาล รองรับตั้งแต่การพิมพ์เอกสารสำนักงานความเร็วสูง ฉลากยา บาร์โค้ด ไปจนถึงสายรัดข้อมือผู้ป่วย (Wristband)', 
 '["Laser & Inkjet Printer", "Thermal & Wristband Printer", "Large Format & Dot Matrix"]'::jsonb, 
 '/images/printer-product.png', 'ดูสินค้า Printer ทั้งหมด', '/solutions/printing?group=Printer', 1, true),

('printing', 'Supply', '2026 • Printing & Supply Solution', 
 'ศูนย์รวมวัสดุสิ้นเปลืองการพิมพ์ครบวงจร ทั้งตลับหมึกเลเซอร์ (Toner Cartridge), ผ้าหมึกพิมพ์ดอทเมทริกซ์ (Ribbon), หมึกอิงค์เจ็ท, ริบบอนบาร์โค้ด และสายรัดข้อมือผู้ป่วย (Wristband)', 
 '["Laser Toner Cartridge (ตลับหมึกเลเซอร์)", "Ribbon & Barcode Label (ผ้าหมึกและริบบอน)", "Medical Wristband (สายรัดข้อมือผู้ป่วย)"]'::jsonb, 
 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Supply ทั้งหมด', '/solutions/printing?group=Supply', 2, true),

('hardware', 'Barcode & Scanner', '2026 • Barcode & Scanner Solution', 
 'ศูนย์รวมเครื่องอ่านบาร์โค้ดมือถือ (Handheld Barcode Scanner), เครื่องสแกนบาร์โค้ด 2 มิติเกรดการแพทย์ และเครื่องสแกนเนอร์ความเร็วสูง รองรับการสแกนฉลากยา สายรัดข้อมือ และเอกสารเวชระเบียนได้อย่างรวดเร็ว แม่นยำ', 
 '["Handheld Barcode Scanner (Casio, CipherLab)", "2D Medical Barcode Scanner (Honeywell, Opticon)", "High-Speed Document Scanner (Fujitsu, Canon)"]'::jsonb, 
 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Barcode & Scanner ทั้งหมด', '/solutions/hardware', 1, true),

('hardware', 'Computer & Display', '2026 • Computer & Display Workstations', 
 'จัดจำหน่ายและติดตั้งเครื่องคอมพิวเตอร์ประสิทธิภาพสูง All-in-One PC สำหรับงานสำนักงานและเกรดการแพทย์ ตัวเครื่องป้องกันน้ำและฝุ่น ทนต่อน้ำยาฆ่าเชื้อ พร้อมจอแสดงภาพ Display ขนาด 19 - 21.5 นิ้ว มาตรฐานสากล', 
 '["Computer All-in-One สำหรับงานสำนักงานและโรงพยาบาล", "Display จอแสดงภาพขนาด 19 นิ้ว และ 21.5 นิ้ว", "Fanless Antimicrobial Medical PC Housing", "IP65 Waterproof Front Bezel ป้องกันน้ำและของเหลว"]'::jsonb, 
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Computer & Display ทั้งหมด', '/solutions/hardware', 2, true),

('hardware', 'Equipment & Power', '2026 • UPS, Projector & Enterprise Equipment', 
 'ศูนย์รวมเครื่องสำรองไฟฟ้า (UPS) ประสิทธิภาพสูงเพื่อความต่อเนื่องของระบบไอทีโรงพยาบาล เครื่องฉายโปรเจกเตอร์ (Projector) ห้องประชุม และอุปกรณ์แท็บเล็ต กล้องพกพาสำหรับองค์กร (Mobile & Camera)', 
 '["เครื่องสำรองไฟฟ้าฉุกเฉิน (UPS) ประสิทธิภาพสูง", "เครื่องฉายภาพโปรเจกเตอร์ความสว่างสูงสำหรับห้องประชุม", "อุปกรณ์แท็บเล็ตและกล้องสำหรับองค์กร"]'::jsonb, 
 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Equipment & Power ทั้งหมด', '/solutions/hardware', 3, true),

('network', 'Server & Network Infrastructure', '2026 • Server & Network Infrastructure', 
 'วางระบบโครงสร้างพื้นฐานแม่ข่ายคอมพิวเตอร์และเครือข่ายสำหรับโรงพยาบาล จัดจำหน่าย Server Load Balancer, L2 Switch 16/24 Ports, Link Load Balancer และ Wireless Access Point ความเร็วสูง', 
 '["Server Load Balancer กระจายการทำงานเครื่องแม่ข่าย", "L2 Switch ขนาด 16 ช่อง และ 24 ช่อง", "Link Load Balancer & Wireless Access Point", "10Gbps High-Availability Architecture"]'::jsonb, 
 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Server ทั้งหมด', '/solutions/network', 1, true),

('network', 'SAN & NAS Storage Solutions', '2026 • Enterprise Storage & Backup', 
 'ศูนย์รวมระบบจัดเก็บข้อมูล SAN Storage และ NAS Storage ประสิทธิภาพสูง รองรับการจัดเก็บภาพทางการแพทย์ (PACS) ฐานข้อมูลเวชระเบียน และระบบสำรองข้อมูลอัตโนมัติ', 
 '["อุปกรณ์สำหรับจัดเก็บข้อมูลแบบ SAN Storage", "อุปกรณ์สำหรับจัดเก็บข้อมูลแบบ NAS Storage", "Sub-millisecond PACS Storage Access", "Automated Disaster Recovery Replication"]'::jsonb, 
 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1400&q=80', 'ดูสินค้า Storage ทั้งหมด', '/solutions/network', 2, true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    toast.success("คัดลอกคำสั่ง SQL แล้ว นำไปวางใน Supabase SQL Editor ได้เลย");
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-blue-600" />
            <span>จัดการการ์ดภาพรวมโซลูชัน (Solution Topics)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ปรับแต่งหัวข้อการ์ดภาพรวมโซลูชันในหน้าแรก เช่น Printer, Supply, Barcode, Computer, Server ฯลฯ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 text-sm font-semibold shadow-sm shadow-blue-600/20 gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการ์ดใหม่</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-slate-200">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={selectedTabFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTabFilter("all")}
            className="rounded-full text-xs font-medium"
          >
            ทั้งหมด ({topics.length})
          </Button>
          {TAB_OPTIONS.map((opt) => {
            const count = topics.filter((t) => t.tab_category === opt.value).length;
            return (
              <Button
                key={opt.value}
                variant={selectedTabFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTabFilter(opt.value)}
                className="rounded-full text-xs font-medium shrink-0"
              >
                {opt.label} ({count})
              </Button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อการ์ด, คำบรรยาย..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </Card>

      {/* Content Grid */}
      {loading ? (
        <AdminLoadingState label="กำลังโหลดข้อมูลการ์ดโซลูชัน..." />
      ) : filteredTopics.length === 0 ? (
        <Card className="py-16 text-center border-dashed border-slate-300">
          <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">ยังไม่มีการ์ดโซลูชัน</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            กดปุ่มด้านล่างเพื่อเพิ่มการ์ดภาพรวมโซลูชันแรก
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-700"
            >
              + เพิ่มการ์ดแรก
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const features = Array.isArray(topic.key_features)
              ? topic.key_features
              : typeof topic.key_features === "string"
              ? topic.key_features.split("\n").filter(Boolean)
              : [];

            return (
              <Card
                key={topic.id || topic.title}
                className="overflow-hidden border-slate-200/90 hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Cover */}
                <div className="relative h-44 bg-slate-100 overflow-hidden group">
                  <Image
                    src={topic.cover_image_url || "/images/printer-product.png"}
                    alt={topic.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90 text-blue-600 shadow-xs backdrop-blur-xs">
                      {topic.tab_category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        topic.is_active
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-500 text-white"
                      }`}
                    >
                      {topic.is_active ? "เปิดใช้งาน" : "ปิด"}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>ลำดับที่ {topic.sort_order}</span>
                      <span className="font-mono">{topic.subtitle}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {topic.short_description}
                    </p>

                    {/* Features list */}
                    {features.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {features.slice(0, 3).map((f, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded-md text-[10.5px] bg-blue-50 text-blue-700 font-medium border border-blue-100"
                          >
                            • {f}
                          </span>
                        ))}
                        {features.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{features.length - 3} ข้อ
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-blue-600 font-medium truncate max-w-[140px]">
                      {topic.cta_text || "ดูสินค้า"} ↗
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(topic)}
                        className="h-8 px-2.5 text-xs text-slate-600 hover:text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        แก้ไข
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(topic.id || null)}
                        className="h-8 px-2.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Topic */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "แก้ไขการ์ดโซลูชัน" : "เพิ่มการ์ดโซลูชันใหม่"}
        maxWidth="2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={saving}
              className="rounded-xl px-5 h-10 text-sm font-medium cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              form="solution-topic-form"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold shadow-sm shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
            </Button>
          </>
        }
      >
        <form id="solution-topic-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                โซลูชัน (Tab Category) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Select
                value={formData.tab_category}
                onChange={(val) => setFormData({ ...formData, tab_category: val })}
                options={TAB_OPTIONS}
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                ลำดับการแสดงผล (Sort Order)
              </label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="h-10 text-xs sm:text-sm rounded-xl"
                placeholder="1, 2, 3..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                ชื่อหัวข้อการ์ด (Title) <span className="text-rose-500 font-bold">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น Printer, Supply, Barcode & Scanner"
                className="h-10 text-xs sm:text-sm rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                ข้อความกำกับ (Subtitle)
              </label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="เช่น 2026 • Printing & Supply Solution"
                className="h-10 text-xs sm:text-sm rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              คำบรรยายภาพรวม (Description) <span className="text-rose-500 font-bold">*</span>
            </label>
            <Textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={3}
              placeholder="ข้อความบรรยายจุดเด่นของโซลูชันนี้..."
              className="text-xs sm:text-sm rounded-xl"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Key Features (พิมพ์แยกบรรทัดละ 1 ข้อ)
            </label>
            <Textarea
              value={typeof formData.key_features === "string" ? formData.key_features : ""}
              onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
              rows={3}
              placeholder="Laser & Inkjet Printer&#10;Thermal & Wristband Printer&#10;Large Format & Dot Matrix"
              className="text-xs sm:text-sm rounded-xl"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ระบบจะแปลงแต่ละบรรทัดให้เป็น Bullet Points สีน้ำเงินบนการ์ดหน้าแรกอัตโนมัติ
            </p>
          </div>

          <ImageUpload
            value={formData.cover_image_url}
            onChange={(val) => setFormData({ ...formData, cover_image_url: val })}
            label="รูปภาพประจำการ์ด (Cover Image)"
            description="อัปโหลดไฟล์รูปภาพ (PNG, JPG, WebP) หรือวาง URL รูปภาพ"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_toggle"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
              เปิดแสดงผลการ์ดนี้บนหน้าแรก (Is Active)
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบการ์ดโซลูชัน"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดนี้ออกจากระบบ? เมื่อลบแล้วการ์ดจะไม่แสดงบนหน้าแรกอีกต่อไป"
      />
    </div>
  );
}
