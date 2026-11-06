"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Search,
  FileText,
  Download,
  ExternalLink,
  Printer,
  Package,
  Layers,
  CheckCircle2,
  Tag,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductItemResponse } from "@/app/api/products/route";

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: "printer" | "supply";
}

export function ProductCatalogModal({
  isOpen,
  onClose,
  productType,
}: ProductCatalogModalProps) {
  const [products, setProducts] = useState<ProductItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/products?type=${productType}`)
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
        console.error("Error loading products:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, productType]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

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

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(search.toLowerCase()));

      const matchBrand =
        selectedBrand === "all" || p.brand?.toLowerCase() === selectedBrand.toLowerCase();

      return matchSearch && matchBrand;
    });
  }, [products, search, selectedBrand]);

  const isPrinter = productType === "printer";
  const title = isPrinter
    ? "รายการสินค้าเครื่องพิมพ์ (Printer Products)"
    : "รายการสินค้าหมึกพิมพ์ & วัสดุสิ้นเปลือง (Supply Products)";

  const subtitle = isPrinter
    ? "ศูนย์รวมเครื่องพิมพ์เลเซอร์และอิงค์เจ็ทระดับองค์กร พร้อมสเปกและเอกสาร Datasheet / TOR"
    : "ตลับหมึกเลเซอร์ (Toner), ริบบอน, และวัสดุสิ้นเปลืองของแท้ คุณภาพสูง";

  const handleInquire = (productName: string) => {
    onClose();
    setTimeout(() => {
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/90 my-auto"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isPrinter
                      ? "bg-blue-600 text-white shadow-blue-500/20"
                      : "bg-emerald-600 text-white shadow-emerald-500/20"
                  }`}
                >
                  {isPrinter ? <Printer className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isPrinter
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {products.length} รายการ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารุ่นสินค้า, SKU หรือประเภท..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Brand Filter Chips */}
              {availableBrands.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">แบรนด์:</span>
                  <button
                    onClick={() => setSelectedBrand("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                      selectedBrand === "all"
                        ? "bg-blue-600 text-white font-semibold shadow-2xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        selectedBrand === brand
                          ? "bg-blue-600 text-white font-semibold shadow-2xs"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body: Products List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/40">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">กำลังโหลดรายการสินค้าจากฐานข้อมูล...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Package className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-600">ไม่พบรายการสินค้าที่ตรงกับคำค้นหา</p>
                  <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกแบรนด์เป็น "ทั้งหมด"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-4.5 flex flex-col justify-between gap-4 group"
                    >
                      <div className="space-y-3.5">
                        {/* Top: Badges & SKU */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.brand && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {product.brand}
                              </span>
                            )}
                            {product.sub_category && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                                {product.sub_category}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
                            SKU: {product.sku}
                          </span>
                        </div>

                        {/* Middle: Photo & Info */}
                        <div className="flex items-start gap-4">
                          {/* Image Box */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 border border-slate-200/80 p-2 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={product.cover_image_url || "/images/printer-product.png"}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/images/printer-product.png";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                              {product.name}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {product.short_description || product.full_description || "ไม่มีคำอธิบายเพิ่มเติม"}
                            </p>
                          </div>
                        </div>

                        {/* Specifications List */}
                        {product.specifications && product.specifications.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-blue-600" />
                              <span>คุณสมบัติสเปกเด่น:</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                              {product.specifications.slice(0, 4).map((spec, i) => (
                                <div
                                  key={i}
                                  className="text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center justify-between gap-1 truncate"
                                >
                                  <span className="font-semibold text-slate-700 shrink-0">{spec.label}:</span>
                                  <span className="truncate text-slate-500 text-right">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Compatible Products */}
                        {product.compatible_products && product.compatible_products.length > 0 && (
                          <div className="pt-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">ใช้ร่วมกับ:</span>
                              {product.compatible_products.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                  <span>{item}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Buttons: Downloads & Inquire */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        {/* Download Buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {product.datasheet_en_url ? (
                            <a
                              href={product.datasheet_en_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition-colors"
                              title="ดาวน์โหลด Datasheet ภาษาอังกฤษ"
                            >
                              <FileText className="w-3.5 h-3.5 text-rose-600" />
                              <span>Datasheet (EN)</span>
                              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic py-1">
                              ไม่มีไฟล์ Datasheet
                            </span>
                          )}

                          {product.tor_th_url && (
                            <a
                              href={product.tor_th_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors"
                              title="ดาวน์โหลด TOR คุณสมบัติเฉพาะภาษาไทย"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                              <span>TOR (TH)</span>
                              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                            </a>
                          )}
                        </div>

                        {/* Inquire Button */}
                        <button
                          type="button"
                          onClick={() => handleInquire(product.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-colors cursor-pointer shadow-2xs ml-auto"
                        >
                          <span>ขอใบเสนอราคา</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>สินค้าลิขสิทธิ์แท้ พร้อมการรับประกันและบริการ On-site Service ทั่วประเทศ</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

