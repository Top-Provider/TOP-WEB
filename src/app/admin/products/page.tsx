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
import { PdfUpload } from "@/components/ui/pdf-upload";
import { saveRecord, fetchRecords } from "@/lib/crud";
import { Plus, Search, FileText, Edit, Trash2, Loader2, Sparkles, Layers, X } from "lucide-react";

interface ProductFormState {
  name: string;
  sku: string;
  category_id: string;
  sub_category: string;
  brand: string;
  product_type: string;
  short_description: string;
  full_description: string;
  specifications: { label: string; value: string }[];
  bullet_points: string;
  cover_image_url: string;
  datasheet_en_url: string;
  tor_th_url: string;
  is_featured: boolean;
  is_active: boolean;
}

const defaultFormState: ProductFormState = {
  name: "",
  sku: "",
  category_id: "Printing",
  sub_category: "Color Laser Printer",
  brand: "Canon",
  product_type: "printer",
  short_description: "",
  full_description: "",
  specifications: [
    { label: "ความเร็ว", value: "27 แผ่น/นาที" },
    { label: "ความละเอียด", value: "600 x 600dpi" },
  ],
  bullet_points: "",
  cover_image_url: "",
  datasheet_en_url: "",
  tor_th_url: "",
  is_featured: false,
  is_active: true,
};

const CATEGORY_OPTIONS = [
  { value: "Printing", label: "Printing & Supply" },
  { value: "Hardware", label: "Hardware Solution" },
  { value: "Network", label: "Network Solution" },
  { value: "Medical", label: "Medical Equipment" },
  { value: "IoT", label: "Smart Solution (IoT)" },
];

const FILTER_CATEGORY_OPTIONS = [
  { value: "all", label: "ทุกหมวดหมู่ (All)" },
  ...CATEGORY_OPTIONS,
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Canon LBP-654CX",
      sku: "LBP-654CX",
      category_id: "Printing",
      sub_category: "Color Laser Printer",
      brand: "Canon",
      product_type: "printer",
      cover_image_url: "/images/printer-product.png",
      datasheet_en_url: "/files/datasheet-en.pdf",
      tor_th_url: "/files/tor-th.pdf",
      hasDatasheet: true,
      hasTor: true,
      is_active: true,
    },
    {
      id: 2,
      name: "Canon Cartridge 046H Series (BK/C/M/Y)",
      sku: "CANON-046H-SET",
      category_id: "Printing",
      sub_category: "Toner & Supply",
      brand: "Canon",
      product_type: "supply",
      cover_image_url: "/images/printer-product.png",
      datasheet_en_url: "/files/datasheet-en.pdf",
      tor_th_url: "/files/tor-th.pdf",
      hasDatasheet: true,
      hasTor: true,
      is_active: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(defaultFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadProducts = async () => {
    try {
      type ProductRecord = {
        id: number;
        name: string;
        sku: string;
        category_id: string;
        sub_category: string;
        brand: string;
        product_type: string;
        cover_image_url: string;
        datasheet_en_url: string;
        tor_th_url: string;
        short_description?: string;
        full_description?: string;
        specifications?: { label: string; value: string }[];
        is_active: boolean;
      };

      const [hardware, supplies] = await Promise.all([
        fetchRecords<ProductRecord>({
          table: "TBM_PRODUCT_HARDWARE",
          orderBy: "id",
          orderDir: "desc",
        }).catch(() => []),
        fetchRecords<ProductRecord>({
          table: "TBM_PRODUCT_SUPPLIES",
          orderBy: "id",
          orderDir: "desc",
        }).catch(() => []),
      ]);

      const records = [...hardware, ...supplies];

      if (records && records.length > 0) {
        setProducts(
          records.map((r) => ({
            id: r.id,
            name: r.name,
            sku: r.sku,
            category_id: r.category_id,
            sub_category: r.sub_category,
            brand: r.brand,
            product_type: r.product_type || (supplies.some(s => s.id === r.id) ? "supply" : "printer"),
            cover_image_url: r.cover_image_url || "/images/printer-product.png",
            datasheet_en_url: r.datasheet_en_url || "",
            tor_th_url: r.tor_th_url || "",
            hasDatasheet: Boolean(r.datasheet_en_url),
            hasTor: Boolean(r.tor_th_url),
            is_active: r.is_active ?? true,
          }))
        );
      }
    } catch (err) {
      console.log("Could not load from API (using fallback state):", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleAddSpecRow = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { label: "", value: "" }],
    });
  };

  const handleRemoveSpecRow = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const handleSpecChange = (index: number, field: "label" | "value", val: string) => {
    const updated = [...formData.specifications];
    updated[index][field] = val;
    setFormData({ ...formData, specifications: updated });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("👉 [handleSubmit Products] Submitting formData:", formData);

    if (!formData.name?.trim()) {
      alert("กรุณากรอกชื่อสินค้า (Product Name)");
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.sku
        ? formData.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const payload = {
        name: formData.name,
        sku: formData.sku,
        slug: slug || `product-${Date.now()}`,
        category_id: formData.category_id,
        sub_category: formData.sub_category,
        brand: formData.brand,
        product_type: formData.product_type || "printer",
        short_description: formData.short_description,
        full_description: formData.full_description,
        specifications: formData.specifications,
        cover_image_url: formData.cover_image_url || "/images/printer-product.png",
        datasheet_en_url: formData.datasheet_en_url,
        tor_th_url: formData.tor_th_url,
        is_active: formData.is_active,
      };

      // แยกบันทึกตามประเภทสินค้า: วัสดุสิ้นเปลือง (TBM_PRODUCT_SUPPLIES) หรือ ฮาร์ดแวร์ (TBM_PRODUCT_HARDWARE)
      const targetTable =
        formData.product_type === "supply"
          ? "TBM_PRODUCT_SUPPLIES"
          : "TBM_PRODUCT_HARDWARE";

      // บันทึกผ่าน API เส้นเดียว: /api/admin/save
      await saveRecord({
        table: targetTable,
        action: editingId ? "update" : "insert",
        id: editingId || undefined,
        data: payload,
      });

      await loadProducts();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("บันทึกข้อมูลไม่สำเร็จ: " + msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string, productType: string = "printer") => {
    if (!confirm(`ยืนยันการลบสินค้า "${name}" ?`)) return;

    try {
      const targetTable =
        productType === "supply"
          ? "TBM_PRODUCT_SUPPLIES"
          : "TBM_PRODUCT_HARDWARE";

      await saveRecord({
        table: targetTable,
        action: "delete",
        id,
      });
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("ลบข้อมูลไม่สำเร็จ: " + msg);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการ Master สินค้า (TBM_MASTER_PRODUCTS)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รายการสินค้า, เครื่องพิมพ์, หมึกพิมพ์, สเปกสินค้า, และไฟล์เอกสาร Datasheet / TOR
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="rounded-full px-5 py-2.5 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่ (Popup)</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="ค้นหาชื่อสินค้า, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={FILTER_CATEGORY_OPTIONS}
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">ชื่อสินค้า & SKU</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">ไฟล์เอกสาร</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      <Image
                        src={product.cover_image_url || "/images/printer-product.png"}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                    <p className="text-slate-400 mt-0.5">SKU: {product.sku} • แบรนด์: {product.brand}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-100">
                      {product.category_id}
                    </span>
                    <p className="text-slate-400 text-[10px] mt-1">{product.sub_category}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {product.hasDatasheet && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600">
                          <FileText className="w-3 h-3" />
                          <span>Datasheet (EN)</span>
                        </span>
                      )}
                      {product.hasTor && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                          <FileText className="w-3 h-3" />
                          <span>TOR (TH)</span>
                        </span>
                      )}
                    </div>
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
                          setEditingId(product.id);
                          setFormData({
                            ...defaultFormState,
                            name: product.name,
                            sku: product.sku,
                            category_id: product.category_id,
                            sub_category: product.sub_category,
                            brand: product.brand,
                            cover_image_url: product.cover_image_url,
                            datasheet_en_url: product.datasheet_en_url || "",
                            tor_th_url: product.tor_th_url || "",
                          });
                          setIsModalOpen(true);
                        }}
                        title="แก้ไข"
                      >
                        <Edit className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product.id, product.name, product.product_type)}
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
      {/* POPUP MODAL: ฟอร์มเพิ่ม / แก้ไขสินค้า Master Product                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่ (Master Product)"}
        description="กรอกข้อมูลสเปก รูปภาพ และลิงก์ดาวน์โหลด Datasheet / TOR"
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ข้อมูลทั่วไป (General Info)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อสินค้า (Product Name) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="เช่น Canon LBP-654CX"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รหัสรุ่นสินค้า (SKU / Model) *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="เช่น LBP-654CX"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หมวดหมู่หลัก (Category)
                </label>
                <Select
                  value={formData.category_id}
                  onChange={(val) => setFormData({ ...formData, category_id: val })}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หมวดหมู่ย่อย (Sub Category)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น Color Laser Printer"
                  value={formData.sub_category}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  แบรนด์ / ยี่ห้อ (Brand)
                </label>
                <Input
                  type="text"
                  placeholder="เช่น Canon, Zebra, HP"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="h-10 text-xs sm:text-sm rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                คำโปรยใต้ชื่อรุ่น (Short Description)
              </label>
              <Textarea
                rows={2}
                placeholder="เช่น เครื่องพิมพ์เลเซอร์สี ยี่ห้อ Canon รุ่น LBP654CX (ใช้กับหมึกพิมพ์รุ่น 046H)"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
            </div>
          </div>

          {/* สเปกสินค้าแบบตารางคู่ Key-Value */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>รายการสเปกสินค้า (SPECIFICATIONS)</span>
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleAddSpecRow}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                + เพิ่มแถวสเปก
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="ความเร็ว"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                    className="w-1/3 h-9 text-xs rounded-lg"
                  />
                  <Input
                    type="text"
                    placeholder="27 แผ่น/นาที"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="flex-1 h-9 text-xs rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveSpecRow(index)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="ลบแถวสเปกนี้"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* รูปภาพ (Component ImageUpload แบบเลือกไฟล์หรือ URL) & ลิงก์ดาวน์โหลด */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>รูปภาพ & ลิงก์ไฟล์เอกสารดาวน์โหลด (PDF)</span>
            </h4>

            {/* Component Image Upload */}
            <ImageUpload
              value={formData.cover_image_url}
              onChange={(val) => setFormData({ ...formData, cover_image_url: val })}
              label="รูปภาพสินค้า (Cover Image)"
              description="เลือกไฟล์จากเครื่อง (PNG, JPG, WebP) หรือสลับไปใส่ URL"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <PdfUpload
                value={formData.datasheet_en_url}
                onChange={(val) => setFormData({ ...formData, datasheet_en_url: val })}
                label="เอกสาร Datasheet (EN)"
                badge="EN"
                description="เลือกไฟล์ PDF จากเครื่อง หรือใส่ URL ลิงก์ตรง"
              />

              <PdfUpload
                value={formData.tor_th_url}
                onChange={(val) => setFormData({ ...formData, tor_th_url: val })}
                label="เอกสารคุณสมบัติเฉพาะ TOR (TH)"
                badge="TH"
                description="เลือกไฟล์ PDF จากเครื่อง หรือใส่ URL ลิงก์ตรง"
              />
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
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full px-6 text-xs font-semibold shadow-md shadow-blue-500/25"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกข้อมูลสินค้า</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
