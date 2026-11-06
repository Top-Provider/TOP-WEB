"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { PdfUpload } from "@/components/ui/pdf-upload";
import { toast } from "@/components/ui/toast";
import { saveRecord, fetchRecords } from "@/lib/crud";
import { Plus, Search, FileText, Edit, Trash2, Loader2, Sparkles, Layers, X, UploadCloud, Link as LinkIcon, Image as ImageIcon, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

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
  gallery_images: string[];
  compatible_products: string[];
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
  brand: "",
  product_type: "printer",
  short_description: "",
  full_description: "",
  specifications: [],
  bullet_points: "",
  cover_image_url: "",
  gallery_images: [],
  compatible_products: [],
  datasheet_en_url: "",
  tor_th_url: "",
  is_featured: false,
  is_active: true,
};

const CATEGORY_OPTIONS = [
  { value: "Printing", label: "Printing & Supply" },
];

const FILTER_CATEGORY_OPTIONS = [
  { value: "all", label: "หมวดหมู่: Printing & Supply" },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: "printer", label: "Printer (เครื่องพิมพ์)" },
  { value: "supply", label: "Supply (หมึกพิมพ์ / วัสดุสิ้นเปลือง)" },
  { value: "hardware", label: "Hardware (อุปกรณ์ฮาร์ดแวร์ทั่วไป)" },
  { value: "network", label: "Network (ระบบเครือข่าย)" },
];

const FILTER_TYPE_OPTIONS = [
  { value: "all", label: "ทุกประเภท (All Products)" },
  { value: "printer", label: "เฉพาะ Printer (เครื่องพิมพ์)" },
  { value: "supply", label: "เฉพาะ Supply (หมึกพิมพ์)" },
  { value: "hardware", label: "เฉพาะ Hardware (ฮาร์ดแวร์)" },
  { value: "network", label: "เฉพาะ Network (เครือข่าย)" },
];

const SUB_CATEGORY_PRINTER_OPTIONS = [
  { value: "Black & White Laser Printer", label: "Black & White Laser Printer" },
  { value: "Color Laser Printer", label: "Color Laser Printer" },
  { value: "Inkjet Printer", label: "Inkjet Printer" },
  { value: "Large Format Printer", label: "Large Format Printer" },
  { value: "Thermal Printer", label: "Thermal Printer" },
  { value: "Thermal Wristband Printer", label: "Thermal Wristband Printer" },
  { value: "Dot Matrix Printer", label: "Dot Matrix Printer" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

const SUB_CATEGORY_SUPPLY_OPTIONS = [
  { value: "Toner", label: "Toner" },
  { value: "Sticker", label: "Sticker" },
  { value: "Wristband", label: "Wristband" },
  { value: "Ribbon", label: "Ribbon" },
  { value: "Form", label: "Form" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

const SUB_CATEGORY_HARDWARE_OPTIONS = [
  { value: "Handheld Barcode Scanner", label: "Handheld Barcode Scanner" },
  { value: "Barcode Scanner", label: "Barcode Scanner" },
  { value: "Scanner", label: "Scanner" },
  { value: "UPS", label: "UPS" },
  { value: "Computer", label: "Computer" },
  { value: "Display", label: "Display" },
  { value: "Projector", label: "Projector" },
  { value: "Camera", label: "Camera" },
  { value: "Mobile", label: "Mobile" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

const SUB_CATEGORY_NETWORK_OPTIONS = [
  { value: "Server", label: "Server" },
  { value: "Storage", label: "Storage" },
  { value: "License", label: "License" },
  { value: "Software Install Client", label: "Software Install Client" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

const DEFAULT_BRAND_OPTIONS = [
  { value: "", label: "-- ไม่ระบุแบรนด์ (None / Generic) --" },
  { value: "Canon", label: "Canon" },
  { value: "HP", label: "HP" },
  { value: "Epson", label: "Epson" },
  { value: "Brother", label: "Brother" },
  { value: "Zebra", label: "Zebra" },
  { value: "TSC", label: "TSC" },
  { value: "Bixolon", label: "Bixolon" },
  { value: "Ricoh", label: "Ricoh" },
  { value: "Fujifilm", label: "Fujifilm" },
  { value: "Kyocera", label: "Kyocera" },
  { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
];

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  category_id: string;
  sub_category: string;
  brand: string;
  product_type: string;
  cover_image_url: string;
  gallery_images?: string[];
  compatible_products?: string[];
  short_description?: string;
  full_description?: string;
  specifications?: { label: string; value: string }[];
  datasheet_en_url: string;
  tor_th_url: string;
  hasDatasheet: boolean;
  hasTor: boolean;
  is_active: boolean;
}

function getFriendlyErrorMessage(err: unknown, fallback: string = "เกิดข้อผิดพลาดในการบันทึกข้อมูล"): string {
  if (!err) return fallback;
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg) return fallback;

  const lower = msg.toLowerCase();
  if (lower.includes("value too long") || lower.includes("character varying")) {
    return "ข้อมูลที่ระบุมีความยาวเกินกำหนด กรุณาตรวจสอบหรือลดขนาดข้อความ";
  }
  if (lower.includes("duplicate key") || lower.includes("23505")) {
    return "มีข้อมูลนี้อยู่ในระบบแล้ว (ข้อมูลซ้ำ)";
  }
  if (lower.includes("could not find") || lower.includes("pgrst")) {
    return "ไม่พบข้อมูลในระบบ หรือตารางข้อมูลยังไม่พร้อมใช้งาน";
  }
  if (lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
  }
  // ซ่อนข้อความภาษาอังกฤษทางเทคนิค ให้แสดงภาษาไทยสุภาพ
  if (/^[a-zA-Z0-9_\s:,()."'{}\[\]-]+$/.test(msg) && msg.length > 20) {
    return fallback;
  }
  return msg;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [formData, setFormData] = useState<ProductFormState>(defaultFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [compatInput, setCompatInput] = useState("");
  const [isCompatDropdownOpen, setIsCompatDropdownOpen] = useState(false);
  const compatDropdownRef = useRef<HTMLDivElement>(null);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [brandOptions, setBrandOptions] = useState(DEFAULT_BRAND_OPTIONS);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [printerCategoryOptions, setPrinterCategoryOptions] = useState(SUB_CATEGORY_PRINTER_OPTIONS);
  const [supplyCategoryOptions, setSupplyCategoryOptions] = useState(SUB_CATEGORY_SUPPLY_OPTIONS);
  const [hardwareCategoryOptions, setHardwareCategoryOptions] = useState(SUB_CATEGORY_HARDWARE_OPTIONS);
  const [networkCategoryOptions, setNetworkCategoryOptions] = useState(SUB_CATEGORY_NETWORK_OPTIONS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);
  const [draggedSpecIndex, setDraggedSpecIndex] = useState<number | null>(null);
  const [dragOverSpecIndex, setDragOverSpecIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedCategory]);

  // Click outside to close compatible products dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        compatDropdownRef.current &&
        !compatDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCompatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter compatible products list live by query (name, sku, brand, sub-category)
  const filteredCompatProducts = useMemo(() => {
    const defaultType = formData.product_type === "printer" ? "supply" : "printer";
    const q = compatInput.trim().toLowerCase();

    if (!q) {
      return products.filter((p) => p.product_type === defaultType);
    }

    return products.filter((p) => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku && p.sku !== "-" && p.sku.toLowerCase().includes(q);
      const matchBrand = p.brand && p.brand !== "-" && p.brand.toLowerCase().includes(q);
      const matchSub = p.sub_category?.toLowerCase().includes(q);
      return matchName || matchSku || matchBrand || matchSub;
    });
  }, [products, formData.product_type, compatInput]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "กรุณากรอกชื่อสินค้า";
    }
    if (!formData.product_type?.trim()) {
      errors.product_type = "กรุณาเลือกประเภทสินค้า";
    }

    setFormErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const elementMap: Record<string, string> = {
        name: "product-name-input",
        product_type: "product-type-select",
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

  const loadProducts = async () => {
    setIsLoading(true);
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
        gallery_images?: string[];
        compatible_products?: string[];
        bullet_points?: string[];
        datasheet_en_url: string;
        tor_th_url: string;
        short_description?: string;
        full_description?: string;
        specifications?: { label: string; value: string }[];
        is_active: boolean;
      };

      // ดึงจากตารางรวม TB_PRODUCTS
      const records = await fetchRecords<ProductRecord>({
        table: "TB_PRODUCTS",
        orderBy: "id",
        orderDir: "desc",
        select: "id,name,sku,category_id,sub_category,brand,product_type,cover_image_url,compatible_products,bullet_points,datasheet_en_url,tor_th_url,is_active",
      }).catch(() => []);

      if (records && Array.isArray(records)) {
        setProducts(
          records.map((r) => ({
            id: r.id,
            name: r.name,
            sku: r.sku,
            category_id: r.category_id,
            sub_category: r.sub_category,
            brand: r.brand,
            product_type: r.product_type || "printer",
            cover_image_url: r.cover_image_url || "/images/logo.png",
            gallery_images: r.gallery_images || [],
            compatible_products: (r.compatible_products && r.compatible_products.length > 0) ? r.compatible_products : (r.bullet_points || []),
            short_description: r.short_description || "",
            full_description: r.full_description || "",
            specifications: r.specifications || [],
            datasheet_en_url: r.datasheet_en_url || "",
            tor_th_url: r.tor_th_url || "",
            hasDatasheet: Boolean(r.datasheet_en_url),
            hasTor: Boolean(r.tor_th_url),
            is_active: r.is_active ?? true,
          }))
        );
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.log("Could not load from API:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrandOptions = async () => {
    try {
      const res = await fetch("/api/admin/brands");
      const json = await res.json();
      if (json && json.success && Array.isArray(json.brands) && json.brands.length > 0) {
        const hasNone = json.brands.some((b: { value: string }) => b.value === "");
        const formatted = hasNone
          ? json.brands
          : [{ value: "", label: "-- ไม่ระบุแบรนด์ (None / Generic) --" }, ...json.brands];
        setBrandOptions(formatted);
      }
    } catch (err) {
      console.log("Could not load brand options from API:", err);
    }
  };

  const loadProgramOptions = async () => {
    try {
      const res = await fetch("/api/admin/program-options");
      const json = await res.json();
      if (json && json.success) {
        if (Array.isArray(json.printerCategories) && json.printerCategories.length > 0) {
          setPrinterCategoryOptions([
            ...json.printerCategories,
            { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
          ]);
        }
        if (Array.isArray(json.supplyCategories) && json.supplyCategories.length > 0) {
          setSupplyCategoryOptions([
            ...json.supplyCategories,
            { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
          ]);
        }
        if (Array.isArray(json.hardwareCategories) && json.hardwareCategories.length > 0) {
          setHardwareCategoryOptions([
            ...json.hardwareCategories,
            { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
          ]);
        }
        if (Array.isArray(json.networkCategories) && json.networkCategories.length > 0) {
          setNetworkCategoryOptions([
            ...json.networkCategories,
            { value: "Other", label: "อื่นๆ (กำหนดเอง)" },
          ]);
        }
      }
    } catch (err) {
      console.log("Could not load program options from API:", err);
    }
  };

  useEffect(() => {
    Promise.all([
      loadProducts(),
      loadBrandOptions(),
      loadProgramOptions(),
    ]);
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setIsCustomBrand(false);
    setFormData(defaultFormState);
    setCompatInput("");
    setIsCompatDropdownOpen(false);
    setNewGalleryUrl("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAddCompatible = (valueToAdd: string) => {
    const trimmed = valueToAdd.trim();
    if (!trimmed) return;
    if (!formData.compatible_products.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        compatible_products: [...prev.compatible_products, trimmed],
      }));
    }
    setCompatInput("");
    setIsCompatDropdownOpen(false);
  };

  const handleRemoveCompatible = (itemToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      compatible_products: prev.compatible_products.filter((item) => item !== itemToRemove),
    }));
  };

  const handleAddGalleryImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData((prev) => ({
            ...prev,
            gallery_images: [...prev.gallery_images, e.target?.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddGalleryUrl = () => {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      gallery_images: [...prev.gallery_images, trimmed],
    }));
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index),
    }));
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

  const handleReorderSpec = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setFormData((prev) => {
      const updated = [...prev.specifications];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, specifications: updated };
    });
  };

  const handleMoveSpec = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formData.specifications.length) return;
    handleReorderSpec(index, targetIndex);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("[handleSubmit Products] Submitting formData:", formData);

    if (!validateForm()) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "ข้อมูลไม่ครบถ้วน",
        message: "กรุณาระบุข้อมูลที่จำเป็น (*) เช่น ชื่อสินค้า และประเภทสินค้า ให้ครบถ้วน",
      });
      return;
    }

    setIsSaving(true);

    try {
      const trimmedSku = formData.sku?.trim() || "";
      const trimmedBrand = formData.brand?.trim() || "";
      const rawSlug = trimmedSku || formData.name;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
      const slug = cleanSlug || `product-${Date.now()}`;

      const payload = {
        name: formData.name.trim(),
        sku: trimmedSku,
        slug: slug,
        category_id: formData.category_id || "Printing",
        sub_category: formData.sub_category,
        brand: trimmedBrand,
        product_type: formData.product_type || "printer",
        short_description: formData.short_description || formData.full_description?.slice(0, 150) || "",
        full_description: formData.full_description,
        specifications: formData.specifications.filter((s) => s.label.trim() || s.value.trim()),
        bullet_points: formData.compatible_products || [],
        cover_image_url: formData.cover_image_url || "/images/logo.png",
        gallery_images: formData.gallery_images,
        compatible_products: formData.compatible_products,
        datasheet_en_url: formData.datasheet_en_url,
        tor_th_url: formData.tor_th_url,
        is_active: formData.is_active,
      };

      // บันทึกผ่านตารางรวม TB_PRODUCTS
      await saveRecord({
        table: "TB_PRODUCTS",
        action: editingId ? "update" : "insert",
        id: editingId || undefined,
        data: payload,
      });

      await loadProducts();
      setIsModalOpen(false);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "บันทึกข้อมูลสำเร็จ",
        message: editingId
          ? `อัปเดตข้อมูลสินค้า "${formData.name}" เรียบร้อยแล้ว`
          : `เพิ่มสินค้าใหม่ "${formData.name}" ลงในระบบเรียบร้อยแล้ว`,
      });
    } catch (err: unknown) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "บันทึกข้อมูลไม่สำเร็จ",
        message: getFriendlyErrorMessage(err, "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`ยืนยันการลบสินค้า "${name}" ?`)) return;

    try {
      await saveRecord({
        table: "TB_PRODUCTS",
        action: "delete",
        id,
      });
      await loadProducts();
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "ลบสินค้าสำเร็จ",
        message: `ลบสินค้า "${name}" ออกจากระบบเรียบร้อยแล้ว`,
      });
    } catch (err: unknown) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "ลบสินค้าไม่สำเร็จ",
        message: getFriendlyErrorMessage(err, "เกิดข้อผิดพลาดในการลบสินค้า"),
      });
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || p.category_id === selectedCategory;
    const matchesType =
      selectedType === "all" || p.product_type === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = filtered.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการ Master สินค้า
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
      <Card className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs relative z-30 overflow-visible">
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

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-52">
            <Select
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              options={FILTER_TYPE_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={FILTER_CATEGORY_OPTIONS}
            />
          </div>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-xs sm:text-sm font-medium text-slate-600">
                        กำลังโหลดข้อมูลสินค้า...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ไม่พบข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <Image
                          src={
                            product.cover_image_url &&
                              product.cover_image_url !== "/images/printer-product.png"
                              ? product.cover_image_url
                              : "/images/logo.png"
                          }
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-contain p-1"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                      <p className="text-slate-400 mt-0.5 text-xs">
                        {product.sku && product.sku !== "-" ? `SKU: ${product.sku}` : "ไม่มีรหัส"}
                        {" • "}
                        {product.brand && product.brand !== "-" ? `แบรนด์: ${product.brand}` : "ไม่ระบุแบรนด์"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${product.product_type === "supply"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : product.product_type === "hardware"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : product.product_type === "network"
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                        >
                          {product.product_type === "supply"
                            ? "Supply"
                            : product.product_type === "hardware"
                              ? "Hardware"
                              : product.product_type === "network"
                                ? "Network"
                                : "Printer"}
                        </span>
                        {product.sub_category && (
                          <span className="text-xs font-semibold text-slate-800">
                            {product.sub_category}
                          </span>
                        )}
                      </div>
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
                          onClick={async () => {
                            setEditingId(product.id);
                            const isCustom = !!product.brand && product.brand !== "-" && !brandOptions.some(o => o.value === product.brand && o.value !== "Other");
                            setIsCustomBrand(isCustom);
                            setFormData({
                              ...defaultFormState,
                              name: product.name,
                              sku: product.sku === "-" ? "" : (product.sku || ""),
                              category_id: product.category_id,
                              sub_category: product.sub_category,
                              brand: product.brand === "-" ? "" : (product.brand || ""),
                              product_type: product.product_type || "printer",
                              short_description: product.short_description || "",
                              full_description: product.full_description || "",
                              specifications: product.specifications || [],
                              cover_image_url: product.cover_image_url,
                              gallery_images: product.gallery_images || [],
                              compatible_products: product.compatible_products || [],
                              datasheet_en_url: product.datasheet_en_url || "",
                              tor_th_url: product.tor_th_url || "",
                            });
                            setCompatInput("");
                            setNewGalleryUrl("");
                            setFormErrors({});
                            setIsModalOpen(true);

                            // โหลดรายละเอียดเต็มเฉพาะตอนกดแก้ไข (On-demand)
                            try {
                              const fullItems = await fetchRecords<Record<string, unknown>>({
                                table: "TB_PRODUCTS",
                                id: product.id,
                              });
                              if (fullItems && fullItems[0]) {
                                const fi = fullItems[0];
                                setFormData((prev) => ({
                                  ...prev,
                                  short_description: typeof fi.short_description === "string" ? fi.short_description : "",
                                  full_description: typeof fi.full_description === "string" ? fi.full_description : "",
                                  specifications: Array.isArray(fi.specifications) ? (fi.specifications as { label: string; value: string }[]) : [],
                                  gallery_images: Array.isArray(fi.gallery_images) ? (fi.gallery_images as string[]) : [],
                                  cover_image_url: typeof fi.cover_image_url === "string" && fi.cover_image_url ? fi.cover_image_url : prev.cover_image_url,
                                }));
                              }
                            } catch (e) {
                              console.log("Could not fetch full details:", e);
                            }
                          }}
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (แสดงผลทีละ 10 รายการ) */}
        <div className="py-3.5 px-4 sm:px-6 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>
              {isLoading ? (
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  กำลังโหลดข้อมูล...
                </span>
              ) : (
                <>
                  แสดง{" "}
                  <strong className="font-semibold text-slate-800">
                    {totalItems === 0 ? 0 : startIndex + 1}
                  </strong>{" "}
                  ถึง{" "}
                  <strong className="font-semibold text-slate-800">{endIndex}</strong>{" "}
                  จากทั้งหมด{" "}
                  <strong className="font-semibold text-slate-800">{totalItems}</strong>{" "}
                  รายการ (หน้าละ 10 รายการ)
                </>
              )}
            </span>
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg text-xs font-medium border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                <span>ก่อนหน้า</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safeCurrentPage) <= 1
                    );
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    typeof item === "string" ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${safeCurrentPage === item
                            ? "bg-[#0062FF] text-white shadow-xs shadow-blue-500/30"
                            : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg text-xs font-medium border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              >
                <span>ถัดไป</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          )}
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
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full px-5 text-xs font-medium cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full px-6 text-xs font-semibold shadow-md shadow-blue-500/25 cursor-pointer"
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
          </>
        }
      >
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // ป้องกันการเผลอกด Enter ขณะพิมพ์แล้วฟอร์มส่งข้อมูลหรือเด้งปิดอัตโนมัติ
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          noValidate
          className="space-y-6"
        >
          {/* ข้อมูลพื้นฐาน */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ข้อมูลทั่วไป (General Info)</span>
            </h4>

            {/* 1. ชื่อสินค้า & 2. รหัสสินค้า */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ชื่อสินค้า <span className="text-rose-500 font-bold">*</span>
                </label>
                <Input
                  id="product-name-input"
                  type="text"
                  required
                  placeholder="เช่น Canon LBP-654CX"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>รหัสสินค้า (SKU / Model)</span>
                  <span className="text-slate-400 font-normal text-[11px]">ไม่บังคับ</span>
                </label>
                <Input
                  id="product-sku-input"
                  type="text"
                  placeholder="เช่น LBP-654CX หรือเว้นว่างได้"
                  value={formData.sku}
                  onChange={(e) => {
                    setFormData({ ...formData, sku: e.target.value });
                    if (formErrors.sku) setFormErrors((prev) => ({ ...prev, sku: "" }));
                  }}
                  className="h-10 text-xs sm:text-sm rounded-xl font-mono transition-all"
                />
              </div>
            </div>

            {/* 3. ประเภท (select) & 4. แบรนด์ (select) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภท <span className="text-rose-500 font-bold">*</span>
                </label>
                <Select
                  id="product-type-select"
                  value={formData.product_type}
                  onChange={(val) => {
                    setFormData((prev) => {
                      let nextSub = prev.sub_category;
                      if (val === "hardware" && !SUB_CATEGORY_HARDWARE_OPTIONS.some((o) => o.value === prev.sub_category)) {
                        nextSub = "Handheld Barcode Scanner";
                      } else if (val === "network" && !SUB_CATEGORY_NETWORK_OPTIONS.some((o) => o.value === prev.sub_category)) {
                        nextSub = "Server";
                      } else if (val === "supply" && !SUB_CATEGORY_SUPPLY_OPTIONS.some((o) => o.value === prev.sub_category)) {
                        nextSub = "Toner";
                      } else if (val === "printer" && !SUB_CATEGORY_PRINTER_OPTIONS.some((o) => o.value === prev.sub_category)) {
                        nextSub = "Color Laser Printer";
                      }
                      return {
                        ...prev,
                        product_type: val,
                        sub_category: nextSub,
                      };
                    });
                    if (formErrors.product_type) setFormErrors((prev) => ({ ...prev, product_type: "" }));
                  }}
                  options={PRODUCT_TYPE_OPTIONS}
                  className={formErrors.product_type ? "ring-2 ring-rose-300 rounded-xl" : ""}
                />
                {formErrors.product_type && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {formErrors.product_type}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>แบรนด์</span>
                  <span className="text-slate-400 font-normal text-[11px]">ไม่บังคับ</span>
                </label>
                <Select
                  id="product-brand-input"
                  value={
                    isCustomBrand
                      ? "Other"
                      : brandOptions.some((o) => o.value === formData.brand)
                        ? formData.brand
                        : formData.brand
                          ? "Other"
                          : ""
                  }
                  onChange={(val) => {
                    if (val === "Other") {
                      setIsCustomBrand(true);
                      setFormData({ ...formData, brand: "" });
                    } else {
                      setIsCustomBrand(false);
                      setFormData({ ...formData, brand: val });
                    }
                  }}
                  options={brandOptions}
                />
                {(isCustomBrand ||
                  (formData.brand !== "" &&
                    !brandOptions.some((o) => o.value === formData.brand && o.value !== "Other"))) && (
                    <Input
                      type="text"
                      placeholder="พิมพ์ระบุชื่อแบรนด์..."
                      value={formData.brand}
                      onChange={(e) => {
                        setFormData({ ...formData, brand: e.target.value });
                      }}
                      className="h-8 text-xs rounded-xl mt-1.5"
                    />
                  )}
              </div>
            </div>

            {/* หมวดหมู่ย่อย (Sub-Category) */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หมวดหมู่ย่อย (Sub-Category)
              </label>
              {(() => {
                const subOptions =
                  formData.product_type === "supply"
                    ? supplyCategoryOptions
                    : formData.product_type === "hardware"
                      ? hardwareCategoryOptions
                      : formData.product_type === "network"
                        ? networkCategoryOptions
                        : printerCategoryOptions;
                const isPreset = subOptions.some((o) => o.value === formData.sub_category);
                return (
                  <div className="space-y-1.5">
                    <Select
                      value={isPreset ? formData.sub_category : "Other"}
                      onChange={(val) => {
                        if (val === "Other") {
                          setFormData({ ...formData, sub_category: "" });
                        } else {
                          setFormData({ ...formData, sub_category: val });
                        }
                      }}
                      options={subOptions}
                    />
                    {(!isPreset || formData.sub_category === "") && (
                      <Input
                        type="text"
                        placeholder="พิมพ์ระบุหมวดหมู่ย่อย..."
                        value={formData.sub_category}
                        onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                        className="h-8 text-xs rounded-xl"
                      />
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 5. รายการสเปกสินค้า (list) */}
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
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                + เพิ่มแถวสเปก
              </Button>
            </div>

            <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
              {formData.specifications.length === 0 ? (
                <div className="py-3 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs text-slate-400">ยังไม่มีรายการสเปก</p>
                </div>
              ) : (
                formData.specifications.map((spec, index) => {
                  const isDragging = draggedSpecIndex === index;
                  const isDragOver = dragOverSpecIndex === index && draggedSpecIndex !== index;

                  return (
                    <div
                      key={index}
                      draggable={draggableIndex === index}
                      onDragStart={(e) => {
                        setDraggedSpecIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(index));
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverSpecIndex !== index) {
                          setDragOverSpecIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverSpecIndex === index) {
                          setDragOverSpecIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedSpecIndex !== null && draggedSpecIndex !== index) {
                          handleReorderSpec(draggedSpecIndex, index);
                        }
                        setDraggedSpecIndex(null);
                        setDragOverSpecIndex(null);
                        setDraggableIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedSpecIndex(null);
                        setDragOverSpecIndex(null);
                        setDraggableIndex(null);
                      }}
                      className={`group flex items-start gap-1.5 p-1.5 rounded-xl transition-all border ${isDragging
                          ? "opacity-35 bg-blue-50/70 border-dashed border-blue-400 scale-[0.98]"
                          : isDragOver
                            ? "bg-blue-50/90 border-blue-500 shadow-sm"
                            : "border-transparent hover:bg-slate-50/80 hover:border-slate-200/60"
                        }`}
                    >
                      {/* Drag Handle */}
                      <div
                        onMouseDown={() => setDraggableIndex(index)}
                        onMouseUp={() => setDraggableIndex(null)}
                        onTouchStart={() => setDraggableIndex(index)}
                        onTouchEnd={() => setDraggableIndex(null)}
                        className="w-6 h-9 flex items-center justify-center text-slate-300 group-hover:text-slate-600 cursor-grab active:cursor-grabbing shrink-0 select-none touch-none rounded-lg hover:bg-slate-100 transition-colors mt-0.5"
                        title="คลิกค้างแล้วลากเพื่อย้ายลำดับ"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <Input
                        type="text"
                        placeholder="หัวข้อ (เว้นว่างได้)"
                        value={spec.label}
                        onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                        className="w-1/3 min-h-[36px] h-9 text-xs rounded-lg bg-white"
                      />
                      <Textarea
                        rows={spec.value.includes("\n") ? Math.min(6, Math.max(2, spec.value.split("\n").length)) : 1}
                        placeholder="ค่าสเปก หรือกด Enter เพื่อขึ้นบรรทัดใหม่..."
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                        className="flex-1 min-h-[36px] text-xs rounded-lg bg-white py-2 px-3 leading-snug resize-y"
                      />

                      {/* Quick Move Up/Down buttons */}
                      <div className="flex items-center shrink-0 opacity-40 group-hover:opacity-100 transition-opacity mt-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSpec(index, "up")}
                          className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100 rounded cursor-pointer"
                          title="ย้ายขึ้น"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formData.specifications.length - 1}
                          onClick={() => handleMoveSpec(index, "down")}
                          className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-100 rounded cursor-pointer"
                          title="ย้ายลง"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveSpecRow(index)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0 mt-0.5"
                        title="ลบแถวสเปกนี้"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 6. รูปภาพ (เพิ่มกี่รูปก็ได้) */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>รูปภาพ (เพิ่มกี่รูปก็ได้)</span>
            </h4>

            {/* รูปภาพหลัก (Cover Image) */}
            <ImageUpload
              value={formData.cover_image_url}
              onChange={(val) => setFormData({ ...formData, cover_image_url: val })}
              label="รูปภาพหลัก (Cover Image)"
              description="เลือกไฟล์จากเครื่อง (PNG, JPG, WebP) หรือใส่ URL"
            />

            {/* รูปภาพเพิ่มเติม (Gallery Images) */}
            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    รูปภาพเพิ่มเติม (เพิ่มกี่รูปก็ได้)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    อัปโหลดรูปภาพจากเครื่องหลายรูปพร้อมกัน หรือวาง URL รูปภาพ
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 shrink-0">
                  {formData.gallery_images.length} รูปภาพ
                </span>
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-colors shrink-0">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>เลือกรูปจากเครื่อง (หลายรูป)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddGalleryImages(e.target.files)}
                  />
                </label>

                <div className="flex items-center gap-2 w-full">
                  <Input
                    type="text"
                    placeholder="หรือวาง URL รูปภาพ..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddGalleryUrl();
                      }
                    }}
                    className="h-9 text-xs rounded-xl bg-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddGalleryUrl}
                    className="h-9 text-xs rounded-xl shrink-0 bg-white hover:bg-blue-50 text-blue-700 border-blue-200 cursor-pointer"
                  >
                    + เพิ่ม URL
                  </Button>
                </div>
              </div>

              {/* Gallery Thumbnails Grid */}
              {formData.gallery_images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {formData.gallery_images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-xs cursor-pointer"
                        title="ลบรูปภาพนี้"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. เอกสาร Datasheet (EN) เพิ่มไฟล์ & 8. เอกสารคุณสมบัติเฉพาะ TOR (TH) เพิ่มไฟล์ */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>เอกสารดาวน์โหลด (PDF)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PdfUpload
                value={formData.datasheet_en_url}
                onChange={(val) => setFormData({ ...formData, datasheet_en_url: val })}
                label="เอกสาร Datasheet (EN)"
                description="คลิกเลือกไฟล์ PDF หรือลากไฟล์มาวาง"
              />

              <PdfUpload
                value={formData.tor_th_url}
                onChange={(val) => setFormData({ ...formData, tor_th_url: val })}
                label="เอกสารคุณสมบัติเฉพาะ TOR (TH)"
                description="คลิกเลือกไฟล์ PDF หรือลากไฟล์มาวาง"
              />
            </div>
          </div>

          {/* 9. ใช้กับ Product ตัวอื่นได้ไหม (list) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>ใช้กับ Product ตัวอื่นได้ไหม (Compatible Products)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formData.product_type === "printer"
                  ? "เลือกหมึกพิมพ์ที่เข้ากับรุ่นนี้ (เพิ่มได้หลายอัน หรือพิมพ์ระบุรุ่นเพิ่ม)"
                  : "เลือกเครื่องพิมพ์ที่เข้ากับหมึกพิมพ์รุ่นนี้ (เพิ่มได้หลายอัน หรือพิมพ์ระบุรุ่นเพิ่ม)"}
              </p>
            </div>

            {/* Searchable Picker for Compatible Products */}
            <div className="relative z-40" ref={compatDropdownRef}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={
                      formData.product_type === "printer"
                        ? "พิมพ์ค้นหาหมึกพิมพ์ (Supply) ในระบบ เช่น ชื่อ, รุ่น, SKU หรือพิมพ์ระบุเอง..."
                        : "พิมพ์ค้นหาเครื่องพิมพ์ (Printer) ในระบบ เช่น ชื่อ, รุ่น, SKU หรือพิมพ์ระบุเอง..."
                    }
                    value={compatInput}
                    onChange={(e) => {
                      setCompatInput(e.target.value);
                      setIsCompatDropdownOpen(true);
                    }}
                    onFocus={() => setIsCompatDropdownOpen(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (compatInput.trim()) {
                          handleAddCompatible(compatInput.trim());
                        }
                      }
                    }}
                    className="pl-9.5 pr-8 h-10 text-xs rounded-xl"
                  />
                  {compatInput && (
                    <button
                      type="button"
                      onClick={() => setCompatInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="ล้างข้อความ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (compatInput.trim()) {
                      handleAddCompatible(compatInput.trim());
                    }
                  }}
                  disabled={!compatInput.trim()}
                  className="h-10 px-4 text-xs rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
                >
                  + เพิ่ม
                </Button>
              </div>

              {/* Dropdown Popover */}
              {isCompatDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 bg-slate-50/95 flex items-center justify-between text-[11px] text-slate-500 font-semibold sticky top-0 backdrop-blur-xs z-10 border-b border-slate-100">
                    <span>
                      {formData.product_type === "printer"
                        ? "รายการหมึกพิมพ์ (Supply) ในระบบ"
                        : "รายการเครื่องพิมพ์ (Printer) ในระบบ"}
                      {" ("}
                      {filteredCompatProducts.length} รายการ{")"}
                    </span>
                    <span className="text-[10px] text-slate-400">คลิกที่รายการเพื่อเพิ่มทันที</span>
                  </div>

                  {filteredCompatProducts.length > 0 ? (
                    <div className="divide-y divide-slate-100/70">
                      {filteredCompatProducts.map((p) => {
                        const itemLabel = p.name;
                        const isAdded =
                          formData.compatible_products.includes(itemLabel) ||
                          formData.compatible_products.includes(p.name);

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (!isAdded) {
                                handleAddCompatible(itemLabel);
                              }
                            }}
                            disabled={isAdded}
                            className={`w-full text-left px-3.5 py-2 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${isAdded
                                ? "bg-slate-50/70 opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-50/70"
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={p.cover_image_url || "/images/logo.png"}
                                  alt={p.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                                  }}
                                />
                              </div>
                              <p className="font-medium text-slate-800 leading-snug line-clamp-2">
                                {p.name}
                              </p>
                            </div>

                            <span
                              className={`text-[11px] font-semibold shrink-0 ${isAdded ? "text-slate-400" : "text-blue-600"
                                }`}
                            >
                              {isAdded ? "เลือกแล้ว" : "+ เพิ่ม"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400">
                      ไม่พบข้อมูลสินค้าที่ตรงกับคำค้นหา
                    </div>
                  )}

                  {/* Option to add custom text if user typed something */}
                  {compatInput.trim() && (
                    <div className="p-2 bg-slate-50 border-t border-slate-100 sticky bottom-0">
                      <button
                        type="button"
                        onClick={() => handleAddCompatible(compatInput.trim())}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มข้อความ &ldquo;{compatInput.trim()}&rdquo; เป็นรุ่นที่ใช้ร่วมกัน</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Badges / Chips list */}
            {formData.compatible_products.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                {formData.compatible_products.map((item, idx) => {
                  const rawCP = item.trim().toLowerCase();
                  const cleanCP = rawCP.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, "").trim();
                  const bracketMatches = Array.from(rawCP.matchAll(/[\(\[]([^\)\]]+)[\)\]]/g))
                    .map((m) => m[1].trim().toLowerCase())
                    .filter(Boolean);

                  const matched = products.find((p) => {
                    const pName = (p.name || "").trim().toLowerCase();
                    const pSku = (p.sku || "").trim().toLowerCase();
                    if (!pName && !pSku) return false;

                    if (pName && (rawCP === pName || cleanCP === pName)) return true;
                    if (pSku && (rawCP === pSku || cleanCP === pSku || bracketMatches.includes(pSku))) return true;
                    if (pSku && pSku.length >= 3 && pSku !== "-" && rawCP.includes(pSku)) return true;
                    if (pName && pName.length >= 3 && (rawCP.includes(pName) || (cleanCP.length >= 3 && pName.includes(cleanCP)))) return true;

                    return false;
                  });
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white text-blue-800 border border-blue-200 shadow-2xs group"
                    >
                      <div className="w-6 h-6 rounded-md border border-slate-200 bg-white p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={
                            matched?.cover_image_url && matched.cover_image_url !== "/images/printer-product.png"
                              ? matched.cover_image_url
                              : "/images/logo.png"
                          }
                          alt={item}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                          }}
                        />
                      </div>
                      <span className="leading-snug">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompatible(item)}
                        className="text-slate-400 hover:text-rose-600 ml-1 transition-colors cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic py-1">
                ยังไม่ได้ระบุสินค้าที่ใช้ร่วมกัน (สามารถเลือกจากรายการด้านบนหรือพิมพ์ระบุได้)
              </div>
            )}
          </div>

          {/* 10. คำอธิบายอื่นๆ (textarea) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                คำอธิบายอื่นๆ (Description / Notes)
              </label>
              <Textarea
                rows={3}
                placeholder="ระบุคำอธิบายเพิ่มเติม ข้อมูลสินค้า เงื่อนไขการรับประกัน หรือรายละเอียดอื่นๆ..."
                value={formData.full_description}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                className="text-xs sm:text-sm rounded-xl leading-relaxed"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Popup Alert แจ้งเตือนผลลัพธ์การบันทึก (สำเร็จ / ไม่สำเร็จ) */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        title={statusModal.type === "success" ? "แจ้งเตือนการทำรายการ" : "เกิดข้อผิดพลาด"}
        maxWidth="sm"
      >
        <div className="py-2 text-center space-y-4">
          <div className="flex justify-center">
            {statusModal.type === "success" ? (
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-in zoom-in-50 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm animate-in zoom-in-50 duration-200">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 px-2">
            <h3
              className={`text-base font-bold ${statusModal.type === "success" ? "text-slate-900" : "text-rose-700"
                }`}
            >
              {statusModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {statusModal.message}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
              className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold cursor-pointer ${statusModal.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-800 hover:bg-slate-900"
                }`}
            >
              ตกลง
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
