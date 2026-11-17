"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Server,
  Shield,
  Wifi,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  Activity,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";
import type { ProductItemResponse } from "@/app/api/products/route";

export const SOLUTION_CATEGORY_TABS = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing" },
  { id: "hardware", label: "Hardware Solution", href: "/solutions/hardware" },
  { id: "software", label: "Software Solution", href: "/solutions/software" },
  { id: "network", label: "Network Solution", href: "/solutions/network", active: true },
];

export interface ExtendedProductItem extends ProductItemResponse {
  is_new?: boolean;
  bullet_specs?: string[];
}

export const SIDEBAR_NETWORK_CATEGORIES = [
  "Server",
  "Storage",
];

export const DEFAULT_NETWORK_PRODUCTS: ExtendedProductItem[] = [];

interface NetworkSolutionViewProps {
  initialProducts?: ProductItemResponse[];
}

export function NetworkSolutionView({
  initialProducts = [],
}: NetworkSolutionViewProps) {
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
                .map((s) => (s.value ? `${s.label ? s.label + ": " : ""}${s.value.split("\n")[0]}` : s.label || ""))
                .filter(Boolean)
            : [],
      }));
    }
    return [];
  });

  // Active Category state
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("Server");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [detailProduct, setDetailProduct] = useState<ExtendedProductItem | null>(null);

  // Dynamic Solution Category Tabs from /api/admin/categories
  const [categoryTabs, setCategoryTabs] = useState(SOLUTION_CATEGORY_TABS);

  // Sub-categories list
  const [networkCategories, setNetworkCategories] = useState<{ value: string; label: string }[]>(
    SIDEBAR_NETWORK_CATEGORIES.map((c) => ({ value: c, label: c }))
  );

  // Dynamic additional sub-categories if user adds any in DB
  const dynamicOtherCategories = useMemo(() => {
    const list: string[] = [];
    allProducts.forEach((p) => {
      const sub = p.sub_category?.trim();
      if (
        sub &&
        sub.toLowerCase() !== "server" &&
        sub.toLowerCase() !== "storage" &&
        !list.includes(sub)
      ) {
        list.push(sub);
      }
    });
    return list;
  }, [allProducts]);

  // Dedup guards to prevent double-fetching on mount/refresh
  const hasLoadedOptionsRef = useRef(false);
  const hasLoadedProductsRef = useRef(false);
  const hasLoadedCategoriesRef = useRef(false);

  // Fetch program options for Network categories (only once)
  useEffect(() => {
    if (hasLoadedOptionsRef.current) return;
    hasLoadedOptionsRef.current = true;
    fetch("/api/admin/program-options")
      .then((res) => res.json())
      .then((json) => {
        if (json && json.success && Array.isArray(json.networkCategories) && json.networkCategories.length > 0) {
          setNetworkCategories(json.networkCategories);
        }
      })
      .catch((err) => console.log("Program options fetch error:", err));
  }, []);

  // Fetch live products from /api/products only if initialProducts was empty
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setLoading(false);
      return;
    }
    if (hasLoadedProductsRef.current) return;
    hasLoadedProductsRef.current = true;
    setLoading(true);
    fetch("/api/products?category=Network")
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
                    .map((s: { label?: string; value: string }) =>
                      s.value ? `${s.label ? s.label + ": " : ""}${s.value.split("\n")[0]}` : s.label || ""
                    )
                    .filter(Boolean)
                : [],
          }));

          setAllProducts(dbProducts);

          setSelectedSubCategory((prev) => {
            const hasMatch = dbProducts.some((p) => {
              const sub = (p.sub_category || "").toLowerCase().trim();
              const target = prev.toLowerCase().trim();
              return sub === target || sub.includes(target) || target.includes(sub);
            });
            if (!hasMatch) {
              const firstWithCat = dbProducts.find((p) => p.sub_category && p.sub_category.trim());
              return firstWithCat?.sub_category ? firstWithCat.sub_category : prev;
            }
            return prev;
          });
        }
      })
      .catch((err) => console.log("Live network products fetch error:", err))
      .finally(() => {
        setLoading(false);
      });
  }, [initialProducts]);

  // Fetch dynamic category tabs (only once)
  useEffect(() => {
    if (hasLoadedCategoriesRef.current) return;
    hasLoadedCategoriesRef.current = true;
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
                active: rawId === "network",
              };
            });
          if (dynamicTabs.length > 0) setCategoryTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  // Sync with URL query parameter (?type=server or ?type=network or ?sub=...)
  useEffect(() => {
    const typeParam = searchParams.get("type")?.toLowerCase();
    const subParam = searchParams.get("sub");

    if (subParam) {
      setSelectedSubCategory(subParam);
    } else if (typeParam === "storage") {
      setSelectedSubCategory("Storage");
    } else if (typeParam === "all") {
      setSelectedSubCategory("all");
    } else {
      setSelectedSubCategory("Server");
    }
  }, [searchParams]);

  const currentGroupTitle =
    selectedSubCategory === "all"
      ? "สินค้าทั้งหมด"
      : selectedSubCategory === "Storage"
      ? "Storage"
      : selectedSubCategory || "Server";

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let list = allProducts;

    // 1. Filter by Sub-Category
    if (selectedSubCategory && selectedSubCategory !== "all") {
      const targetSub = selectedSubCategory.toLowerCase().trim();
      list = list.filter((p) => {
        const sub = (p.sub_category || "").toLowerCase().trim();
        return sub === targetSub || sub.includes(targetSub) || targetSub.includes(sub);
      });
    }

    // 2. Filter by Search Query
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
  }, [allProducts, selectedSubCategory, searchQuery]);

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-900 pb-20 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP SOLUTION CATEGORY TABS (Active: Network Solution)                 */}
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
      {/* 2. MAIN CATALOG LAYOUT (SIDEBAR + PRODUCT GRID)                           */}
      {/* ========================================================================= */}
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6 pt-6 sm:pt-8">
        {/* MOBILE CATEGORY SELECTOR (lg:hidden) */}
        <div className="lg:hidden w-full mb-6 space-y-1.5">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            หมวดหมู่เน็ตเวิร์ก &amp; เซิร์ฟเวอร์ :
          </p>
          <Select
            value={selectedSubCategory}
            onChange={(val) => setSelectedSubCategory(val)}
            options={["Server", "Storage", ...dynamicOtherCategories].map((cat) => ({
              value: cat,
              label: cat,
            }))}
            placeholder="เลือกหมวดหมู่..."
            triggerClassName="rounded-full text-xs sm:text-sm font-semibold shadow-2xs h-10 px-4"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR: SERVER & STORAGE (DESKTOP)                              */}
          {/* ===================================================================== */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6 lg:sticky lg:top-24">
            
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-[#0062FF] uppercase tracking-wider px-2">
                NETWORK & SERVER
              </h4>

              <div className="space-y-1">
                {/* Server */}
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory("Server")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                    selectedSubCategory === "Server"
                      ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  Server
                </button>

                {/* Storage */}
                <button
                  type="button"
                  onClick={() => setSelectedSubCategory("Storage")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                    selectedSubCategory === "Storage"
                      ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  Storage
                </button>

                {/* Dynamic categories if added in admin */}
                {dynamicOtherCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[13px] font-medium transition-all cursor-pointer block ${
                      selectedSubCategory === cat
                        ? "bg-[#EEF4FF] text-[#0062FF] font-semibold"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT PRODUCT DISPLAY AREA (PRODUCT CARDS GRID)                       */}
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
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสินค้า"
                  className="h-9 pl-9 pr-4 text-xs sm:text-sm"
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

            {/* Product Cards Grid */}
            {loading ? (
              <div className="min-h-[460px] rounded-3xl bg-white border border-slate-200/90 shadow-sm p-8 flex flex-col items-center justify-center text-center my-6">
                <MedicalCrossLoader size="md" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <NetworkProductCard
                    key={prod.id}
                    product={prod}
                    onViewProduct={(p) => setDetailProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <p className="text-slate-700 font-medium text-sm">
                  {searchQuery
                    ? `ไม่พบสินค้าตามคำค้นหา "${searchQuery}"`
                    : `ยังไม่มีรายการสินค้าในหมวดหมู่ "${selectedSubCategory}" ในฐานข้อมูล`}
                </p>
                <p className="text-xs text-slate-400">
                  คุณสามารถเพิ่มหรือจัดการสินค้าในหมวดหมู่นี้ได้จากระบบหลังบ้าน (Admin)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubCategory("Server");
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  แสดงสินค้าหมวดหมู่ที่มีในระบบ
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

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white inline-block">
              ENTERPRISE NETWORK & SERVER SOLUTIONS
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              ต้องการวางระบบโครงสร้างพื้นฐาน Network & Server สำหรับโรงพยาบาลและองค์กร?
            </h3>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
              ทีมวิศวกรผู้เชี่ยวชาญพร้อมให้คำปรึกษา ออกแบบสถาปัตยกรรมระบบเครือข่ายความปลอดภัยสูง ป้องกัน Ransomware ตามมาตรฐาน PDPA และบริการดูแลบำรุงรักษาแบบ Onsite ทั่วประเทศ
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-full bg-white text-[#0062FF] font-semibold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group cursor-pointer"
              >
                <span>ติดต่อขอคำปรึกษาและใบเสนอราคา</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 rounded-full bg-blue-700/60 hover:bg-blue-700/80 border border-white/20 text-white font-medium text-xs sm:text-sm transition-all"
              >
                ดูแคตตาล็อกสินค้าทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRODUCT DETAIL MODAL                                                   */}
      {/* ========================================================================= */}
      {detailProduct && (
        <div
          onClick={() => setDetailProduct(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {detailProduct.name}
                </h3>
                {detailProduct.sub_category && (
                  <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shrink-0">
                    {detailProduct.sub_category}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content: 2 Columns */}
            <div className="p-6 md:p-8 lg:p-10 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* ฝั่งซ้าย: รูปสินค้าหลัก และเอกสารดาวน์โหลด */}
                <div className="md:col-span-6 lg:col-span-5 xl:col-span-5 space-y-5 md:sticky md:top-0">
                  <div className="w-full aspect-square md:aspect-[4/3] max-h-[460px] lg:max-h-[520px] rounded-3xl bg-slate-50/60 border border-slate-200/90 flex items-center justify-center p-6 sm:p-8 shadow-xs overflow-hidden">
                    <img
                      src={detailProduct.cover_image_url || "/images/logo.png"}
                      alt={detailProduct.name}
                      className="max-h-full max-w-full object-contain rounded-xl transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
                      }}
                    />
                  </div>

                  {/* Gallery Thumbnails (ถ้ามี) */}
                  {detailProduct.gallery_images && detailProduct.gallery_images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {detailProduct.gallery_images.map((gImg, gIdx) => (
                        <div
                          key={gIdx}
                          className="w-20 h-20 rounded-2xl border border-slate-200 bg-white p-1.5 shrink-0 overflow-hidden shadow-xs hover:border-blue-400 transition-colors"
                        >
                          <img
                            src={gImg}
                            alt=""
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Download Documents */}
                  {(detailProduct.datasheet_en_url || detailProduct.tor_th_url) && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">
                        เอกสารดาวน์โหลด (PDF / Datasheet)
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
                            <span>Datasheet & Specification (EN)</span>
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
                <div className="md:col-span-6 lg:col-span-7 xl:col-span-7 space-y-6">
                  {/* Descriptions */}
                  {(detailProduct.short_description || detailProduct.full_description) && (
                    <div className="space-y-2">
                      {detailProduct.short_description && (
                        <p className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
                          {detailProduct.short_description}
                        </p>
                      )}
                      {detailProduct.full_description && (
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {detailProduct.full_description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Specifications Table */}
                  {detailProduct.specifications && detailProduct.specifications.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span>รายละเอียดสเปกทางเทคนิค (Specifications)</span>
                      </h4>
                      <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100">
                        <div className="space-y-1">
                          {detailProduct.specifications.map((s, i) => {
                            const hasLabel = Boolean(s.label && s.label.trim());
                            const hasValue = Boolean(s.value && s.value.trim());

                            if (!hasLabel && !hasValue) return null;

                            const normalizedVal = (s.value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
                            const isMultiLineValue =
                              hasValue &&
                              (normalizedVal.includes("\n") ||
                                (normalizedVal.includes(" - ") && normalizedVal.trim().startsWith("-")));

                            // กรณีที่ 1: มีหลายข้อ/หลายบรรทัด -> แยกแสดงทีละข้อเป็น Bullet Points ชัดเจน
                            if (isMultiLineValue) {
                              let lines = normalizedVal.includes("\n")
                                ? normalizedVal.split("\n").map((l) => l.trim()).filter(Boolean)
                                : normalizedVal.split(/\s+-\s+/).map((l) => l.trim()).filter(Boolean);

                              return (
                                <div
                                  key={i}
                                  className="py-2.5 border-b border-slate-200/60 last:border-0 space-y-2 text-left"
                                >
                                  {hasLabel && (
                                    <div className="font-bold text-slate-800 text-sm sm:text-[15px]">
                                      {s.label} :
                                    </div>
                                  )}
                                  <div className="pl-3 sm:pl-4 space-y-1.5">
                                    {lines.map((line, lineIdx) => {
                                      const cleanLine = line
                                        .replace(/^[\s•\-\*·●\u2022\u25CF]+/, "")
                                        .trim();
                                      if (!cleanLine) return null;
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

                            // กรณีที่ 2: ข้อความบรรทัดเดียว (แสดงแบบ Label : Value ชัดเจน)
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
                    </div>
                  )}

                  {/* Compatible Systems */}
                  {detailProduct.compatible_products && detailProduct.compatible_products.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>อุปกรณ์และระบบที่ทำงานร่วมกัน (Integration Ready)</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detailProduct.compatible_products.map((cp, i) => (
                          <span
                            key={i}
                            className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-xs font-medium flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>{cp}</span>
                          </span>
                        ))}
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
                className="px-5 py-2.5 rounded-xl bg-[#0062FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>ขอใบเสนอราคา & สเปกระบบ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * NetworkProductCard: 3-column card matching Printing & Supply catalog card design
 */
function NetworkProductCard({
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
        {/* Product Image */}
        <div className="w-full h-44 sm:h-48 flex items-center justify-center p-3 mb-2 overflow-hidden bg-slate-50/50 rounded-xl">
          <img
            src={product.cover_image_url || "/images/logo.png"}
            alt={product.name}
            className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/logo.png";
            }}
            loading="lazy"
          />
        </div>

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

