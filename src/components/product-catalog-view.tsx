"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Download,
  ExternalLink,
  Printer,
  Package,
  Layers,
  CheckCircle2,
  Tag,
  ArrowRight,
  PhoneCall,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { ProductItemResponse } from "@/app/api/products/route";

interface ProductCatalogViewProps {
  initialProducts?: ProductItemResponse[];
}

export function ProductCatalogView({
  initialProducts = [],
}: ProductCatalogViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial query params
  const initialType = searchParams.get("type") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductItemResponse[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [activeType, setActiveType] = useState<string>(initialType);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [search, setSearch] = useState<string>(initialQuery);
  const [detailProduct, setDetailProduct] = useState<ProductItemResponse | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    if (typeFromUrl && (typeFromUrl === "printer" || typeFromUrl === "supply" || typeFromUrl === "all")) {
      setActiveType(typeFromUrl);
    }
  }, [searchParams]);

  // Fetch products from API if not provided or to ensure fresh data
  useEffect(() => {
    let isMounted = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          if (json && json.success && Array.isArray(json.products)) {
            setProducts(json.products);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update URL search params gracefully
  const updateTypeFilter = (type: string) => {
    setActiveType(type);
    const params = new URLSearchParams(searchParams.toString());
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  };

  // Extract unique brands for filter
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    });
    return Array.from(brandsSet);
  }, [products]);

  // Counts
  const printerCount = useMemo(
    () => products.filter((p) => p.product_type === "printer").length,
    [products]
  );
  const supplyCount = useMemo(
    () => products.filter((p) => p.product_type === "supply").length,
    [products]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Type filter
      if (activeType === "printer" && p.product_type !== "printer") return false;
      if (activeType === "supply" && p.product_type !== "supply") return false;

      // Brand filter
      if (
        selectedBrand !== "all" &&
        p.brand?.toLowerCase() !== selectedBrand.toLowerCase()
      ) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        const matchSub = p.sub_category?.toLowerCase().includes(query);
        const matchBrand = p.brand?.toLowerCase().includes(query);
        const matchSpecs = p.specifications?.some(
          (s) =>
            s.label.toLowerCase().includes(query) ||
            s.value.toLowerCase().includes(query)
        );
        if (!matchName && !matchSku && !matchSub && !matchBrand && !matchSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeType, selectedBrand, search]);

  const handleInquireProduct = (productName: string) => {
    setDetailProduct(null);
    router.push(`/#contact?subject=${encodeURIComponent(productName)}`);
  };

  return (
    <div className="w-full">
      {/* 1. Header & Breadcrumb Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/60 via-slate-50/80 to-[#F8FAFC] border-b border-slate-200/80 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/#showcase" className="hover:text-blue-600 transition-colors">
              IT Solution & Product
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-medium">รายการสินค้า (Products)</span>
          </nav>

          {/* Title & Tagline */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hardware & Supply Solution Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              ศูนย์รวมเครื่องพิมพ์ & วัสดุสิ้นเปลือง
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 sm:mt-4 leading-relaxed font-normal">
              คัดสรรเครื่องพิมพ์เลเซอร์ เครื่องพิมพ์ฉลากยา สายรัดข้อมือผู้ป่วย และตลับหมึกคุณภาพสูงมาตรฐานสากล สำหรับโรงพยาบาลและองค์กร
            </p>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar & Controls */}
      <section className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs py-4">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category / Type Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <button
                type="button"
                onClick={() => updateTypeFilter("all")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeType === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                ทั้งหมด ({products.length})
              </button>

              <button
                type="button"
                onClick={() => updateTypeFilter("printer")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  activeType === "printer"
                    ? "bg-[#0066FF] text-white shadow-xs shadow-blue-500/20"
                    : "bg-blue-50/80 text-blue-700 hover:bg-blue-100 border border-blue-200/70"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>เครื่องพิมพ์ Printer ({printerCount})</span>
              </button>

              <button
                type="button"
                onClick={() => updateTypeFilter("supply")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  activeType === "supply"
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20"
                    : "bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>หมึกพิมพ์ & วัสดุสิ้นเปลือง Supply ({supplyCount})</span>
              </button>
            </div>

            {/* Search & Brand Filter */}
            <div className="flex items-center gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารุ่น, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Brand Selector */}
              {availableBrands.length > 0 && (
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="all">ทุกแบรนด์</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Catalog Grid Section - Matching User's Reference Card Design */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC] min-h-[600px]">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6">
          {/* Active Filter Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-slate-500">
              แสดงสินค้าทั้งหมด{" "}
              <span className="font-semibold text-slate-800">
                {filteredProducts.length}
              </span>{" "}
              รายการ
              {activeType !== "all" && (
                <span className="ml-1 text-blue-600 font-medium">
                  ({activeType === "printer" ? "เครื่องพิมพ์" : "หมึกพิมพ์ & วัสดุสิ้นเปลือง"})
                </span>
              )}
              {selectedBrand !== "all" && (
                <span className="ml-1 text-slate-700 font-medium">
                  • แบรนด์ {selectedBrand}
                </span>
              )}
            </p>

            {(selectedBrand !== "all" || search || activeType !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("all");
                  setSearch("");
                  updateTypeFilter("all");
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลสินค้า...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                ไม่พบสินค้าที่ตรงกับเงื่อนไข
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองแบรนด์ใหม่
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedBrand("all");
                  updateTypeFilter("all");
                }}
                className="px-4 py-2 text-xs bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                ดูสินค้าทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCardItem
                  key={prod.id}
                  product={prod}
                  onViewProduct={(p) => setDetailProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Product Detail Modal (Triggered by VIEW PRODUCT) */}
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

                          const matchedItem = products.find((p) => {
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
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
              <button
                type="button"
                onClick={() => handleInquireProduct(detailProduct.name)}
                className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>สอบถามข้อมูล / ขอใบเสนอราคา</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Contact Consultation Banner */}
      <section className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="w-[94%] max-w-[1680px] mx-auto px-2 sm:px-4 lg:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            ต้องการคำแนะนำในการเลือกรุ่นเครื่องพิมพ์หรือหมึกพิมพ์ที่เหมาะสม?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mb-6">
            ทีมวิศวกรและผู้เชี่ยวชาญพร้อมให้คำปรึกษา ออกแบบระบบ และจัดส่งใบเสนอราคาอย่างรวดเร็ว
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/#contact"
              className="px-6 py-3 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-medium transition-all shadow-lg shadow-blue-500/30"
            >
              ติดต่อฝ่ายขาย / ปรึกษาผู้เชี่ยวชาญ
            </Link>
            <a
              href="tel:021234567"
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-medium border border-slate-700 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>โทรปรึกษาฝ่ายขาย</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * ProductCardItem: Matching user's uploaded reference mockup
 * - Dark Navy rounded top container for the product image
 * - Small thumbnails row below main image (if gallery images exist)
 * - Displays ONLY the product photo and product name
 * - Action button changed to "view product"
 */
function ProductCardItem({
  product,
  onViewProduct,
}: {
  product: ProductItemResponse;
  onViewProduct: (product: ProductItemResponse) => void;
}) {
  const images = useMemo(() => {
    const list: string[] = [];
    if (product.cover_image_url) list.push(product.cover_image_url);
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      product.gallery_images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ["/images/printer-product.png"];
  }, [product]);

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="bg-white rounded-[24px] sm:rounded-[26px] border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-300 flex flex-col p-3.5 sm:p-4 group">
      {/* 1. Dark Top Container matching reference image */}
      <div className="relative w-full h-52 sm:h-56 rounded-[18px] sm:rounded-[20px] bg-[#182335] flex items-center justify-center p-5 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-radial from-slate-700/25 to-transparent pointer-events-none" />

        {/* Product Image */}
        <img
          src={activeImage}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
          loading="lazy"
        />
      </div>

      {/* 2. Thumbnail row (matching reference thumbnail strip if multiple images exist) */}
      {images.length > 1 && (
        <div className="flex items-center gap-1.5 mt-3 px-1">
          {images.map((img, idx) => {
            const isActive = img === activeImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-9 h-9 rounded-lg p-1 bg-slate-50 border transition-all cursor-pointer flex items-center justify-center overflow-hidden ${
                  isActive
                    ? "border-amber-500 ring-2 ring-amber-500/20 bg-white"
                    : "border-slate-200 hover:border-slate-300 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`thumbnail-${idx}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Product Info: ONLY Product Name as requested ("แสดงแค่ชื่อสินค้า และก็รูป") */}
      <div className="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Name Only */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* 4. Action Button: view product in Electric Blue Theme */}
        <div className="mt-4 pt-1">
          <button
            type="button"
            onClick={() => onViewProduct(product)}
            className="w-full py-3 px-4 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_6px_20px_rgba(0,102,255,0.25)] hover:shadow-[0_10px_28px_rgba(0,102,255,0.4)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer group/btn"
          >
            <span>view product</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
