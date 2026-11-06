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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductItemResponse } from "@/app/api/products/route";

export const SOLUTION_CATEGORY_TABS = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing", active: true },
  { id: "hardware", label: "Hardware Solution", href: "/#case-studies" },
  { id: "software", label: "Software Solution", href: "/solutions/software" },
  { id: "network", label: "Network Solution", href: "/#case-studies" },
  { id: "medical", label: "Medical Equipment", href: "/#case-studies" },
  { id: "iot", label: "Smart Solution (IoT)", href: "/#case-studies" },
];

export interface ExtendedProductItem extends ProductItemResponse {
  is_new?: boolean;
  bullet_specs?: string[];
}

export const SIDEBAR_PRINTER_CATEGORIES = [
  "Black & White Laser Printer",
  "Color Laser Printer",
  "Inkjet Printer",
  "Large Format Printer",
  "Thermal Printer",
  "Thermal Wristband Printer",
  "Dot Matrix Printer",
];

export const SIDEBAR_SUPPLY_CATEGORIES = [
  "Toner",
  "Sticker",
  "Wristband",
  "Ribbon",
  "Form",
];

export const DEFAULT_CATALOG_PRODUCTS: ExtendedProductItem[] = [];

interface PrintingSolutionViewProps {
  initialProducts?: ProductItemResponse[];
}

export function PrintingSolutionView({
  initialProducts = [],
}: PrintingSolutionViewProps) {
  const searchParams = useSearchParams();

  // Combine initial products or fallback
  const [allProducts, setAllProducts] = useState<ExtendedProductItem[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p) => ({
        ...p,
        is_new: true,
        bullet_specs:
          Array.isArray(p.specifications) && p.specifications.length > 0
            ? p.specifications
                .slice(0, 2)
                .map((s) => s.value || s.label || "")
                .filter(Boolean)
            : [],
      }));
    }
    return [];
  });

  // Active Category state
  // "Black & White Laser Printer" is selected by default to match user's mockup!
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("Black & White Laser Printer");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [detailProduct, setDetailProduct] = useState<ExtendedProductItem | null>(null);

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [categoryTabs, setCategoryTabs] = useState(SOLUTION_CATEGORY_TABS);

  // Dynamic categories from /api/admin/program-options
  const [printerCategories, setPrinterCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_PRINTER_CATEGORIES.map((c) => ({ value: c, label: c }))
  );
  const [supplyCategories, setSupplyCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_SUPPLY_CATEGORIES.map((c) => ({ value: c, label: c }))
  );

  // Fetch program options for Printer & Supply categories
  useEffect(() => {
    fetch("/api/admin/program-options")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success) {
          if (Array.isArray(json.printerCategories) && json.printerCategories.length > 0) {
            setPrinterCategories(json.printerCategories);
          }
          if (Array.isArray(json.supplyCategories) && json.supplyCategories.length > 0) {
            setSupplyCategories(json.supplyCategories);
          }
        }
      })
      .catch((err) => console.log("Program options fetch error:", err));
  }, []);

  // Fetch live products from /api/products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.products)) {
          const dbProducts: ExtendedProductItem[] = json.products.map((p: ProductItemResponse) => ({
            ...p,
            is_new: true,
            bullet_specs:
              Array.isArray(p.specifications) && p.specifications.length > 0
                ? p.specifications
                    .slice(0, 2)
                    .map((s: { label?: string; value: string }) => s.value || s.label || "")
                    .filter(Boolean)
                : [],
          }));

          // Only take what exists in the API!
          setAllProducts(dbProducts);
        }
      })
      .catch((err) => console.log("Live products fetch error:", err));
  }, []);

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
                active: rawId === "printing",
              };
            });
          if (dynamicTabs.length > 0) setCategoryTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  // Sync with URL query parameter (?type=printer or ?type=supply or ?sub=...)
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const subParam = searchParams.get("sub");

    if (subParam) {
      setSelectedSubCategory(subParam);
    } else if (typeParam === "supply") {
      setSelectedSubCategory(supplyCategories[0]?.value || "Toner");
    } else if (typeParam === "printer") {
      setSelectedSubCategory(printerCategories[0]?.value || "Black & White Laser Printer");
    }
  }, [searchParams, supplyCategories, printerCategories]);

  // Determine current group header
  const isSupplySelected = useMemo(() => {
    const target = selectedSubCategory.toLowerCase();
    return supplyCategories.some(
      (c) => c.value.toLowerCase() === target || c.label.toLowerCase() === target
    );
  }, [supplyCategories, selectedSubCategory]);

  const currentGroupTitle = isSupplySelected ? "Supply" : "Printer";

  // Filter products based on subCategory & search query
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // 1. แยกประเภทสินค้าให้ถูกต้องเสมอ (Printer vs Supply)
    const expectedType = isSupplySelected ? "supply" : "printer";
    list = list.filter((p) => {
      if (p.product_type) {
        return p.product_type === expectedType;
      }
      return true;
    });

    // 2. กรองตามหมวดหมู่ย่อย (Sub-category) แบบตรงตัว ไม่ใช้ substring สั้นที่ทำให้คำว่า 'form' ปนกับ 'format'
    if (selectedSubCategory) {
      const target = selectedSubCategory.trim().toLowerCase();
      list = list.filter((p) => {
        if (!p.sub_category) return false;
        const sub = p.sub_category.trim().toLowerCase();
        if (sub === target) return true;
        if (sub.replace(/\s+/g, "") === target.replace(/\s+/g, "")) return true;
        return false;
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
          p.short_description?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allProducts, selectedSubCategory, searchQuery, isSupplySelected]);

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP SOLUTION CATEGORY TABS (Active: Printing & Supply Solution)       */}
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
          {/* LEFT SIDEBAR: PRINTER & SUPPLY CATEGORIES LIST                        */}
          {/* ===================================================================== */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
            
            {/* GROUP 1: PRINTER */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider px-2">
                PRINTER
              </h4>
              <div className="space-y-1">
                {printerCategories.map((cat) => {
                  const isSelected =
                    selectedSubCategory === cat.value || selectedSubCategory === cat.label;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GROUP 2: SUPPLY */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider px-2">
                SUPPLY
              </h4>
              <div className="space-y-1">
                {supplyCategories.map((cat) => {
                  const isSelected =
                    selectedSubCategory === cat.value || selectedSubCategory === cat.label;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedSubCategory(cat.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                          : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT PRODUCT DISPLAY AREA (3-COLUMN PRODUCT CARDS GRID)              */}
          {/* ===================================================================== */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header: Title, Product Count, and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedSubCategory || currentGroupTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสินค้า"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            {/* Product Cards Grid: 1 แถวแสดง 3 การ์ด */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <CatalogProductCard
                    key={prod.id}
                    product={prod}
                    onViewProduct={(p) => setDetailProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-slate-500 text-sm">
                  ไม่พบสินค้าในหมวดหมู่นี้ หรือคำค้นหา &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubCategory("Black & White Laser Printer");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  ล้างตัวกรองและแสดงสินค้าทั้งหมด
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALL TO ACTION BANNER (Vibrant Blue Enterprise matching mockup)        */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-14 sm:pt-16">
        <div className="rounded-[28px] sm:rounded-[34px] bg-[#0062FF] p-8 sm:p-12 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3.5">
            <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
              TOP PROVIDER SYSTEM GROUP
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
              พร้อมยกระดับองค์กรของคุณด้วยเทคโนโลยีที่ใช่หรือยัง?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-light">
              เราพร้อมเป็นส่วนหนึ่งในการขับเคลื่อนองค์กรของคุณ ด้วยโซลูชันเทคโนโลยีที่ตอบโจทย์ทุกความต้องการ ไม่ว่าจะเป็นการพัฒนาระบบ การออกแบบซอฟต์แวร์ หรือระบบบริหารจัดการองค์กร ให้ทีมงานผู้เชี่ยวชาญของเราช่วยแนะนำแนวทางที่เหมาะสมกับคุณ
            </p>

            <div className="pt-2">
              <Button
                asChild
                className="rounded-full bg-white hover:bg-slate-100 text-[#0062FF] font-bold text-xs sm:text-sm px-7 py-3.5 shadow-md transition-all cursor-pointer"
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

      {/* ========================================================================= */}
      {/* 4. PRODUCT DETAIL MODAL (Triggered by "View Product")                      */}
      {/* ========================================================================= */}
      {detailProduct && (
        <div
          onClick={() => setDetailProduct(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-4xl lg:max-w-5xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-slate-900 text-white uppercase tracking-wider">
                  {detailProduct.brand && detailProduct.brand !== "-"
                    ? detailProduct.brand
                    : "TOP PROVIDER"}
                </span>
                {detailProduct.sku &&
                  detailProduct.sku.trim() !== "" &&
                  detailProduct.sku.trim() !== "-" && (
                    <span className="text-xs sm:text-sm text-slate-600 font-mono font-medium">
                      SKU: {detailProduct.sku}
                    </span>
                  )}
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content: 2 Columns */}
            <div className="p-6 md:p-8 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* ฝั่งซ้าย: รูปสินค้าหลัก และเอกสารดาวน์โหลด */}
                <div className="md:col-span-5 space-y-4 md:sticky md:top-0">
                  <div className="w-full aspect-square max-h-[380px] rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center p-6 shadow-xs">
                    <img
                      src={
                        detailProduct.cover_image_url &&
                        detailProduct.cover_image_url.trim() !== "" &&
                        detailProduct.cover_image_url !== "/images/printer-product.png"
                          ? detailProduct.cover_image_url
                          : "/images/logo.png"
                      }
                      alt={detailProduct.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                      }}
                    />
                  </div>

                  {/* Gallery Thumbnails (ถ้ามี) */}
                  {detailProduct.gallery_images && detailProduct.gallery_images.length > 0 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {detailProduct.gallery_images.map((gImg, gIdx) => (
                        <div
                          key={gIdx}
                          className="w-16 h-16 rounded-xl border border-slate-200 bg-white p-1 shrink-0 overflow-hidden"
                        >
                          <img
                            src={gImg}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Download Documents */}
                  {(detailProduct.datasheet_en_url || detailProduct.tor_th_url) && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        เอกสารดาวน์โหลด (PDF)
                      </h4>
                      <div className="flex flex-col gap-2">
                        {detailProduct.datasheet_en_url ? (
                          <a
                            href={detailProduct.datasheet_en_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                          >
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Datasheet (EN)</span>
                          </a>
                        ) : null}

                        {detailProduct.tor_th_url ? (
                          <a
                            href={detailProduct.tor_th_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all"
                          >
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>คุณสมบัติเฉพาะ TOR (TH)</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* ฝั่งขวา: รายละเอียด สเปก และสินค้าที่ใช้ร่วมกัน */}
                <div className="md:col-span-7 space-y-6">
                  {/* Title & Description */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
                      {detailProduct.name}
                    </h2>
                    {detailProduct.sub_category && (
                      <p className="text-sm sm:text-base text-blue-600 font-semibold mt-1.5">
                        {detailProduct.sub_category}
                      </p>
                    )}
                    {detailProduct.short_description && (
                      <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
                        {detailProduct.short_description}
                      </p>
                    )}
                    {detailProduct.full_description && (
                      <p className="text-sm sm:text-base text-slate-500 mt-2.5 leading-relaxed">
                        {detailProduct.full_description}
                      </p>
                    )}
                  </div>

                  {/* Specifications */}
                  {detailProduct.specifications && detailProduct.specifications.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider mb-3">
                        คุณสมบัติและสเปก (SPECIFICATIONS)
                      </h4>
                      <div className="space-y-1">
                        {detailProduct.specifications.map((s, i) => {
                          const hasLabel = Boolean(s.label && s.label.trim());
                          const hasValue = Boolean(s.value && s.value.trim());

                          if (!hasLabel && !hasValue) return null;

                          const isMultiLineValue = hasValue && s.value.includes("\n");

                          // กรณีพิเศษ 1: มีหัวข้อ และค่าสเปกมีหลายบรรทัด (เช่น Interface : มีข้อย่อยหลายข้อ)
                          if (hasLabel && isMultiLineValue) {
                            const lines = s.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean);

                            return (
                              <div
                                key={i}
                                className="py-2.5 border-b border-slate-200/60 last:border-0 space-y-2 text-left"
                              >
                                <div className="font-bold text-slate-800 text-sm sm:text-[15px]">
                                  {s.label} :
                                </div>
                                <div className="pl-3 sm:pl-4 space-y-1.5">
                                  {lines.map((line, lineIdx) => {
                                    const cleanLine = line
                                      .replace(/^[\s•\-\*·●\u2022\u25CF]+/, "")
                                      .trim();
                                    return (
                                      <div
                                        key={lineIdx}
                                        className="text-sm sm:text-[14.5px] flex items-start gap-2.5 text-slate-700 leading-relaxed"
                                      >
                                        <svg
                                          className="w-2 h-2 text-[#0062FF] shrink-0 mt-2"
                                          viewBox="0 0 16 16"
                                          fill="currentColor"
                                          aria-hidden="true"
                                        >
                                          <circle cx="8" cy="8" r="4.5" />
                                        </svg>
                                        <span className="flex-1 break-words">
                                          {cleanLine}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // กรณีพิเศษ 2: ไม่มีหัวข้อ แต่ค่าสเปกมีหลายบรรทัด
                          if (!hasLabel && isMultiLineValue) {
                            const lines = s.value
                              .split("\n")
                              .map((line) => line.trim())
                              .filter(Boolean);

                            return (
                              <div
                                key={i}
                                className="py-1 border-b border-slate-200/60 last:border-0 space-y-1 text-left"
                              >
                                {lines.map((line, lineIdx) => {
                                  const cleanLine = line
                                    .replace(/^[\s•\-\*·●\u2022\u25CF]+/, "")
                                    .trim();
                                  return (
                                    <div
                                      key={lineIdx}
                                      className="text-sm sm:text-[15px] flex items-start gap-3 py-1.5 text-slate-700 leading-relaxed"
                                    >
                                      <svg
                                        className="w-2.5 h-2.5 text-[#0062FF] shrink-0 mt-1.5"
                                        viewBox="0 0 16 16"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <circle cx="8" cy="8" r="4.5" />
                                      </svg>
                                      <span className="flex-1 break-words font-medium">
                                        {cleanLine}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }

                          // กรณีที่ 1: กรอกช่องเดียว (ไม่มีหัวข้อ หรือไม่มีค่า) -> ชิดซ้าย ไม่มีเครื่องหมาย :
                          if (!hasLabel || !hasValue) {
                            const rawText = hasValue ? s.value : s.label;
                            const singleText = rawText
                              .replace(/^[\s•\-\*·●\u2022\u25CF]+/, "")
                              .trim();
                            return (
                              <div
                                key={i}
                                className="text-sm sm:text-[15px] flex items-start gap-3 py-2 border-b border-slate-200/60 last:border-0 text-left"
                              >
                                <svg
                                  className="w-2.5 h-2.5 text-[#0062FF] shrink-0 mt-1.5"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <circle cx="8" cy="8" r="4.5" />
                                </svg>
                                <span className="text-slate-700 leading-relaxed font-medium text-left flex-1 break-words">
                                  {singleText}
                                </span>
                              </div>
                            );
                          }

                          // กรณีที่ 2: กรอกครบทั้ง 2 ช่องแบบบรรทัดเดียว (ตารางคู่หัวข้อ-ค่า)
                          return (
                            <div
                              key={i}
                              className="text-sm sm:text-[15px] flex items-start justify-between gap-6 py-2.5 border-b border-slate-200/60 last:border-0"
                            >
                              <span className="text-slate-600 font-medium text-left shrink-0">
                                {s.label}:
                              </span>
                              <span className="text-slate-900 font-semibold text-right">
                                {s.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Compatible Products */}
                  {detailProduct.compatible_products && detailProduct.compatible_products.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider mb-3">
                        {detailProduct.product_type === "printer"
                          ? "หมึกพิมพ์ที่รองรับ"
                          : "ใช้กับเครื่องพิมพ์รุ่น"}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {detailProduct.compatible_products.map((cp, i) => {
                          const rawCP = cp.trim().toLowerCase();
                          const cleanCP = rawCP.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, "").trim();
                          const bracketMatches = Array.from(rawCP.matchAll(/[\(\[]([^\)\]]+)[\)\]]/g))
                            .map((m) => m[1].trim().toLowerCase())
                            .filter(Boolean);

                          const matchedItem = allProducts.find((p) => {
                            const pName = (p.name || "").trim().toLowerCase();
                            const pSku = (p.sku || "").trim().toLowerCase();
                            if (!pName && !pSku) return false;

                            if (pName && (rawCP === pName || cleanCP === pName)) return true;
                            if (pSku && (rawCP === pSku || cleanCP === pSku || bracketMatches.includes(pSku))) return true;
                            if (pSku && pSku.length >= 3 && pSku !== "-" && rawCP.includes(pSku)) return true;
                            if (pName && pName.length >= 3 && (rawCP.includes(pName) || (cleanCP.length >= 3 && pName.includes(cleanCP)))) return true;

                            return false;
                          });

                          const rawImg = matchedItem?.cover_image_url;
                          const hasValidImg =
                            rawImg &&
                            rawImg.trim() !== "" &&
                            rawImg !== "/images/printer-product.png";
                          const imgUrl = hasValidImg ? rawImg : "/images/logo.png";
                          const displayName = matchedItem?.name || cp;

                          return (
                            <div
                              key={i}
                              onClick={() => {
                                if (matchedItem) {
                                  setDetailProduct(matchedItem);
                                }
                              }}
                              className={`inline-flex items-center gap-3.5 p-3 pr-5 rounded-2xl border transition-all ${
                                matchedItem
                                  ? "bg-white border-blue-200/80 text-slate-800 hover:border-blue-500 hover:shadow-md cursor-pointer group"
                                  : "bg-blue-50/70 border-blue-100 text-blue-800"
                              }`}
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-200/80 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                                <img
                                  src={imgUrl}
                                  alt={displayName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                                  {displayName}
                                </span>
                                {matchedItem?.sku && matchedItem.sku !== "-" && (
                                  <span className="text-xs sm:text-[13px] text-slate-500 font-mono mt-1">
                                    SKU: {matchedItem.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <Link
                href={`/#contact?subject=${encodeURIComponent(detailProduct.name)}`}
                onClick={() => setDetailProduct(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>ขอใบเสนอราคา</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CatalogProductCard: Exactly matches user's uploaded mockup design
 * - White card with light gray border
 * - Top-left "NEW" green badge
 * - Centered product image
 * - Small blue/slate category label (e.g. "Black & White Printer")
 * - Bold product title (e.g. "Canon imageCLASS LBP226dw")
 * - Short description subtitle (e.g. "Monochrome Laser Printer with Wireless Connectivity")
 * - Bullet specs list (e.g. "• 38 ppm", "• Network Ready")
 * - Full width blue "View Product" button
 */
function CatalogProductCard({
  product,
  onViewProduct,
}: {
  product: ExtendedProductItem;
  onViewProduct: (product: ExtendedProductItem) => void;
}) {
  const modelText =
    product.sku && product.sku.trim() !== "" && product.sku.trim() !== "-"
      ? (product.sku.toLowerCase().startsWith("รุ่น") ? product.sku : `รุ่น: ${product.sku}`)
      : (product.short_description || "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative group">
      
      {/* Top Section: Product Image & Info */}
      <div>
        {/* Product Image (Centered on clean background) */}
        {(() => {
          const hasValidImage = Boolean(
            product.cover_image_url &&
              product.cover_image_url.trim() !== "" &&
              product.cover_image_url !== "/images/printer-product.png"
          );
          const displayImage = hasValidImage ? product.cover_image_url : "/images/logo.png";
          return (
            <div className="w-full h-44 sm:h-48 flex items-center justify-center p-3 mb-2 overflow-hidden bg-slate-50/50 rounded-xl">
              <img
                src={displayImage}
                alt={product.name}
                className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                  !hasValidImage ? "p-4 opacity-75" : ""
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                }}
                loading="lazy"
              />
            </div>
          );
        })()}

        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mt-1">
          {product.name}
        </h3>

        {/* Model (รุ่น) */}
        {modelText && (
          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-1">
            {modelText}
          </p>
        )}

        {/* Bullet Specs (แสดงเฉพาะเมื่อมีข้อมูลสเปกเท่านั้น) */}
        {product.bullet_specs && product.bullet_specs.length > 0 && (
          <ul className="text-xs text-slate-500 space-y-1 mt-2.5 mb-4">
            {product.bullet_specs.map((spec, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{spec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Section: View Product Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onViewProduct(product)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-medium tracking-wide text-center transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          View Product
        </button>
      </div>
    </div>
  );
}
