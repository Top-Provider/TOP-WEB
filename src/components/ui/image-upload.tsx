"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, RefreshCw, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "cn";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "รูปภาพ (Image)",
  description = "รองรับไฟล์ PNG, JPG, WebP หรือ SVG",
}: ImageUploadProps) {
  const [tab, setTab] = useState<"file" | "url">(value?.startsWith("http") ? "url" : "file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น (เช่น .jpg, .png, .webp, .svg)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden File Input - วางไว้ตลอดเวลาเพื่อไม่ให้ ref หาย */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer",
              tab === "file"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            เลือกไฟล์จากเครื่อง
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all cursor-pointer",
              tab === "url"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            ใส่ URL ลิงก์
          </button>
        </div>
      </div>

      {tab === "url" ? (
        // กล่องใส่ URL รูปภาพ
        <div className="space-y-3">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="https://example.com/image.png หรือ /images/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 font-mono bg-white"
            />
          </div>

          {value && (
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/printer-product.png";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    พรีวิวจาก URL
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate max-w-xs font-mono">
                    {value}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="ลบ URL นี้"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        // โหมดอัปโหลดไฟล์จากเครื่อง (Local File)
        <div>
          {value ? (
            // มีรูปภาพแล้ว: แสดงตัวอย่าง + ปุ่มเปลี่ยนรูป + ปุ่มลบ
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="Uploaded preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      เลือกรูปภาพแล้ว
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate max-w-xs mt-0.5 font-mono">
                    {value.startsWith("data:")
                      ? "ไฟล์รูปภาพพร้อมบันทึก (Data URL)"
                      : value}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เปลี่ยนรูป</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // ยังไม่มีรูปภาพ: กล่อง Drag & Drop ขนาดใหญ่ คลิกหรือลากไฟล์มาวางได้เลย
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer text-center group",
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-300 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-2xs group-hover:shadow-xs transition-all">
                <UploadCloud className="w-6 h-6 transition-transform group-hover:-translate-y-0.5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[10px] text-slate-400">{description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
