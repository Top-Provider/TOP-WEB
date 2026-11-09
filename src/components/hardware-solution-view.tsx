"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  PhoneCall,
  FileText,
  X,
  ArrowRight,
  ExternalLink,
  Loader2,
  Monitor,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  Activity,
  Download,
  ScanBarcode,
  Laptop,
  Tv,
  BatteryCharging,
  Projector as ProjectorIcon,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItemResponse } from "@/app/api/products/route";

export const SOLUTION_CATEGORY_TABS = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing" },
  { id: "hardware", label: "Hardware Solution", href: "/solutions/hardware", active: true },
  { id: "software", label: "Software Solution", href: "/solutions/software" },
  { id: "network", label: "Network Solution", href: "/solutions/network" },
];

export interface ExtendedProductItem extends ProductItemResponse {
  is_new?: boolean;
  bullet_specs?: string[];
}

export const SIDEBAR_HARDWARE_CATEGORIES = [
  { value: "ALL", label: "สินค้าฮาร์ดแวร์ทั้งหมด (All)" },
  { value: "Handheld Barcode Scanner", label: "Handheld Barcode Scanner" },
  { value: "Barcode Scanner", label: "Barcode Scanner" },
  { value: "Computer", label: "Computer (All In One PC / Workstation)" },
  { value: "Display", label: "Display (จอภาพ)" },
  { value: "Scanner", label: "Scanner (เครื่องสแกนเนอร์ความเร็วสูง)" },
  { value: "UPS", label: "UPS (เครื่องสำรองไฟฟ้า)" },
  { value: "Projector", label: "Projector (เครื่องฉายภาพ)" },
  { value: "Mobile", label: "Mobile & Camera" },
];

interface HardwareSolutionViewProps {
  initialProducts?: ProductItemResponse[];
}

export function HardwareSolutionView({
  initialProducts = [],
}: HardwareSolutionViewProps) {
  const searchParams = useSearchParams();

  // Combine initial products
  const [allProducts, setAllProducts] = useState<ExtendedProductItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p) => ({
        ...p,
        is_new: true,
        bullet_specs:
          Array.isArray(p.specifications) && p.specifications.length > 0
            ? p.specifications
                .slice(0, 3)
                .map((s) => (s.value ? `${s.label ? s.label + ": " : ""}${s.value.split("\n")[0]}` : s.label || ""))
                .filter(Boolean)
            : [],
      }));
    }
    return [];
  });

  // Active Category state
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [detailProduct, setDetailProduct] = useState<ExtendedProductItem | null>(null);

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [categoryTabs, setCategoryTabs] = useState(SOLUTION_CATEGORY_TABS);

  // Sub-categories list
  const [hardwareCategories, setHardwareCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_HARDWARE_CATEGORIES
  );

  // Dynamic additional sub-categories if user adds any new in DB
  const dynamicOtherCategories = useMemo(() => {
    const defaultVals = new Set(
      SIDEBAR_HARDWARE_CATEGORIES.map((c) => c.value.toLowerCase())
    );
    const list: string[] = [];
    allProducts.forEach((p) => {
      const sub = p.sub_category?.trim();
      if (sub && !defaultVals.has(sub.toLowerCase()) && !list.includes(sub)) {
        list.push(sub);
      }
    });
    return list;
  }, [allProducts]);

  // Fetch program options for Hardware categories
  useEffect(() => {
    fetch("/api/admin/program-options")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.hardwareCategories) && json.hardwareCategories.length > 0) {
          const formatted = [
            { value: "ALL", label: "สินค้าฮาร์ดแวร์ทั้งหมด (All)" },
            ...json.hardwareCategories.map((c: { value: string; label: string }) => ({
              value: c.value,
              label: c.label || c.value,
            })),
          ];
          setHardwareCategories(formatted);
        }
      })
      .catch((err) => console.log("Program options fetch error:", err));
  }, []);

  // Fetch live products from /api/products?category=Hardware
  useEffect(() => {
    if (allProducts.length === 0) {
      setLoading(true);
    }
    fetch("/api/products?category=Hardware")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.products)) {
          const dbProducts: ExtendedProductItem[] = json.products.map((p: ProductItemResponse) => ({
            ...p,
            is_new: true,
            bullet_specs:
              Array.isArray(p.specifications) && p.specifications.length > 0
                ? p.specifications
                    .slice(0, 3)
                    .map((s) => (s.value ? `${s.label ? s.label + ": " : ""}${s.value.split("\n")[0]}` : s.label || ""))
                    .filter(Boolean)
                : [],
          }));
          setAllProducts(dbProducts);
        }
      })
      .catch((err) => console.log("Products fetch fallback:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch active tabs from /api/admin/categories
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
              else if (rawId === "network") href = "/solutions/network";
              else if (rawId === "hardware" || rawId.includes("hard")) href = "/solutions/hardware";

              return {
                id: rawId,
                label: c.name || c.category_id,
                href,
                active: rawId === "hardware" || rawId.includes("hard"),
              };
            });
          if (dynamicTabs.length > 0) setCategoryTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  // Sync with URL query parameter (?type=... or ?sub=...)
  useEffect(() => {
    const subParam = searchParams.get("sub") || searchParams.get("type");
    if (subParam) {
      const match = hardwareCategories.find(
        (c) => c.value.toLowerCase() === subParam.toLowerCase()
      );
      if (match) {
        setSelectedSubCategory(match.value);
      }
    }
  }, [searchParams, hardwareCategories]);

  // Filter products based on subCategory & search query
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // Filter by sub_category
    if (selectedSubCategory && selectedSubCategory !== "ALL") {
      const target = selectedSubCategory.trim().toLowerCase();
      list = list.filter((p) => {
        if (!p.sub_category) return false;
        const sub = p.sub_category.trim().toLowerCase();
        if (target === "mobile") {
          return sub.includes("mobile") || sub.includes("camera");
        }
        return sub === target || sub.includes(target);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sub_category?.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          (p.bullet_specs && p.bullet_specs.some((b) => b.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [allProducts, selectedSubCategory, searchQuery]);

  // Helper icon for sub-categories
  const getSubCategoryIcon = (sub: string) => {
    const s = sub.toLowerCase();
    if (s.includes("handheld") || s.includes("barcode")) return <ScanBarcode className="w-4 h-4 text-blue-600" />;
    if (s.includes("computer")) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (s.includes("display")) return <Tv className="w-4 h-4 text-blue-600" />;
    if (s.includes("ups")) return <BatteryCharging className="w-4 h-4 text-blue-600" />;
    if (s.includes("projector")) return <ProjectorIcon className="w-4 h-4 text-blue-600" />;
    if (s.includes("mobile") || s.includes("camera")) return <Smartphone className="w-4 h-4 text-blue-600" />;
    return <Monitor className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP SOLUTION CATEGORY TABS (Active: Hardware Solution)                 */}
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
      {/* 2. MAIN CATALOG LAYOUT (SIDEBAR + 3-COLUMN PRODUCT GRID)                  */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR: HARDWARE SUB-CATEGORIES LIST                            */}
          {/* ===================================================================== */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
            
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider px-2 flex items-center justify-between">
                <span>HARDWARE SOLUTIONS</span>
                <span className="text-[10px] text-slate-500 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  {allProducts.length} รายการ
                </span>
              </h4>

              <div className="space-y-1">
                {hardwareCategories.map((cat) => {
                  const isSelected = selectedSubCategory === cat.value;
                  const count =
                    cat.value === "ALL"
                      ? allProducts.length
                      : allProducts.filter((p) => {
                          if (!p.sub_category) return false;
                          const sub = p.sub_category.toLowerCase();
                          const val = cat.value.toLowerCase();
                          if (val === "mobile") return sub.includes("mobile") || sub.includes("camera");
                          return sub === val || sub.includes(val);
                        }).length;

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {/* Dynamic categories from DB if any */}
                {dynamicOtherCategories.map((cat) => {
                  const isSelected = selectedSubCategory === cat;
                  const count = allProducts.filter(
                    (p) => p.sub_category?.trim().toLowerCase() === cat.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Hospital Assurance Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/80 space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="text-xs font-semibold">มาตรฐานโรงพยาบาล & องค์กร</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                อุปกรณ์ฮาร์ดแวร์ไอทีระดับองค์กร รองรับการทำงาน 24/7 ทนทาน มีเอกสาร Datasheet และ TOR ครบถ้วน
              </p>
              <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">ติดต่อฝ่ายขาย</span>
                <a
                  href="tel:021234567"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>ปรึกษาสเปก</span>
                </a>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: SEARCH + 3-COLUMN PRODUCT GRID                          */}
          {/* ===================================================================== */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search Bar + Header Filter Indicator */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Hardware Solution Catalog</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {filteredProducts.length} รายการ
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  หมวดหมู่: <span className="font-semibold text-slate-700">{selectedSubCategory === "ALL" ? "ทั้งหมด" : selectedSubCategory}</span>
                </p>
              </div>

              {/* Search Input Box */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรุ่น, ยี่ห้อ, สเปก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Product Loading State */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
                <p className="text-xs font-medium text-slate-500">กำลังโหลดรายการสินค้าฮาร์ดแวร์...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
                <Monitor className="w-12 h-12 text-slate-300 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-800">ไม่พบสินค้าในหมวดหมู่นี้</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  ไม่พบรายการสินค้าที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก ลองเลือกหมวดหมู่อื่น หรือล้างคำค้นหา
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSubCategory("ALL");
                    setSearchQuery("");
                  }}
                  className="mt-2 text-xs"
                >
                  ดูสินค้าฮาร์ดแวร์ทั้งหมด
                </Button>
              </div>
            ) : (
              /* ===================================================================== */
              /* 3-COLUMN PRODUCT GRID                                                 */
              /* ===================================================================== */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const fallbackImg = "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80";
                  const coverImg = product.cover_image_url || fallbackImg;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
                    >
                      {/* Product Image Area */}
                      <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden">
                        <Image
                          src={coverImg}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          unoptimized={coverImg.startsWith("/api/")}
                        />

                        {/* Top Category Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                            {product.sub_category || "Hardware"}
                          </span>
                        </div>

                        {/* Brand Badge */}
                        {product.brand && (
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-900/80 text-white shadow-2xs">
                              {product.brand}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h3
                            className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {product.sku && (
                            <p className="text-[11px] text-slate-500 font-mono">
                              SKU: {product.sku}
                            </p>
                          )}

                          {/* Bullet Specifications */}
                          {product.bullet_specs && product.bullet_specs.length > 0 ? (
                            <ul className="space-y-1 pt-1 border-t border-slate-100">
                              {product.bullet_specs.slice(0, 3).map((spec, idx) => (
                                <li
                                  key={idx}
                                  className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-tight"
                                >
                                  <span className="text-blue-500 font-bold shrink-0">•</span>
                                  <span className="line-clamp-1">{spec}</span>
                                </li>
                              ))}
                            </ul>
                          ) : product.short_description ? (
                            <p className="text-[11px] text-slate-600 line-clamp-2 pt-1 border-t border-slate-100">
                              {product.short_description}
                            </p>
                          ) : null}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailProduct(product)}
                            className="flex-1 text-[11px] font-medium h-8 border-slate-200 hover:border-blue-500 hover:text-blue-600"
                          >
                            <span>ดูสเปกและรายละเอียด</span>
                          </Button>
                          <a
                            href="https://lin.ee/xyz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-2.5 rounded-lg bg-[#0062FF] hover:bg-[#0052CC] text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors shrink-0 shadow-xs"
                            title="ขอใบเสนอราคา"
                          >
                            <span>ขอราคา</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCT DETAIL MODAL DIALOG                                            */}
      {/* ========================================================================= */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                  {detailProduct.sub_category || "Hardware Solution"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {detailProduct.name}
                </h3>
                {detailProduct.sku && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">SKU: {detailProduct.sku}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Product Cover Image */}
              <div className="relative aspect-[16/9] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                <Image
                  src={
                    detailProduct.cover_image_url ||
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={detailProduct.name}
                  fill
                  className="object-contain p-4"
                  unoptimized={Boolean(detailProduct.cover_image_url?.startsWith("/api/"))}
                />
              </div>

              {/* Description */}
              {(detailProduct.full_description || detailProduct.short_description) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    คำอธิบายสินค้า
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">
                    {detailProduct.full_description || detailProduct.short_description}
                  </p>
                </div>
              )}

              {/* Specifications Table */}
              {Array.isArray(detailProduct.specifications) && detailProduct.specifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    คุณสมบัติและสเปกทางเทคนิค
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-slate-100">
                        {detailProduct.specifications.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                            <td className="py-2.5 px-3.5 font-semibold text-slate-700 w-1/3 border-r border-slate-100">
                              {spec.label}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600 whitespace-pre-line">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Documents & Downloads */}
              {(detailProduct.datasheet_en_url || detailProduct.tor_th_url) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    เอกสารประกอบ (Datasheet / TOR)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detailProduct.datasheet_en_url && (
                      <a
                        href={detailProduct.datasheet_en_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลด Datasheet (EN)</span>
                      </a>
                    )}
                    {detailProduct.tor_th_url && (
                      <a
                        href={detailProduct.tor_th_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ดาวน์โหลด TOR สเปกราชการ (TH)</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                ต้องการข้อมูลเพิ่มเติมหรือเสนอราคาโครงการ
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailProduct(null)}
                  className="text-xs"
                >
                  ปิด
                </Button>
                <a
                  href={`https://lin.ee/xyz?text=${encodeURIComponent("สนใจสินค้า " + detailProduct.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#0062FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>ติดต่อฝ่ายขาย</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
