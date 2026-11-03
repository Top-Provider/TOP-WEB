"use client";

import React, { useRef, useState } from "react";
import { FileText, UploadCloud, X, RefreshCw, Link as LinkIcon, ExternalLink } from "lucide-react";
import { cn } from "cn";

interface PdfUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  badge?: string;
}

export function PdfUpload({
  value,
  onChange,
  label,
  description = "รองรับไฟล์เอกสาร PDF (ขนาดไม่เกิน 25MB)",
  badge = "PDF",
}: PdfUploadProps) {
  const [tab, setTab] = useState<"file" | "url">(value?.startsWith("http") ? "url" : "file");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>(() => {
    if (!value) return "";
    if (value.startsWith("data:")) return "เอกสารที่อัปโหลด.pdf";
    return value.split("/").pop() || "document.pdf";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("กรุณาเลือกไฟล์เอกสาร PDF เท่านั้น");
      return;
    }

    setFileName(file.name);
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
    setFileName("");
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
      {/* Hidden File Input สำหรับเลือกไฟล์ PDF */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100">
            {badge}
          </span>
        </label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setTab("file")}
            className={cn(
              "px-2 py-0.5 rounded-md transition-all cursor-pointer",
              tab === "file"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            เลือกไฟล์ PDF
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "px-2 py-0.5 rounded-md transition-all cursor-pointer",
              tab === "url"
                ? "bg-white text-blue-600 shadow-2xs font-semibold"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            ใส่ URL
          </button>
        </div>
      </div>

      {tab === "url" ? (
        // โหมดใส่ URL
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="https://... หรือ /files/datasheet.pdf"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setFileName(e.target.value.split("/").pop() || "document.pdf");
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 font-mono bg-white"
            />
          </div>

          {value && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 block truncate">
                    {fileName || "เอกสาร PDF"}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate font-mono">
                    {value}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="เปิดดูไฟล์"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ลบ URL นี้"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // โหมดเลือกไฟล์ PDF จากเครื่อง (Local File)
        <div>
          {value ? (
            // มีไฟล์แล้ว: แสดงชื่อไฟล์ + ปุ่มเปิดดู + เปลี่ยนไฟล์ + ลบ
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {fileName || "เอกสารแนบ PDF"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate max-w-xs mt-0.5">
                    {value.startsWith("data:") ? "ไฟล์ PDF จากเครื่อง (พร้อมบันทึก)" : value}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* ลิงก์เปิดดู PDF พรีวิว */}
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="เปิดดูเอกสาร"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {/* ปุ่มเปลี่ยนไฟล์ */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เปลี่ยน</span>
                </button>
                {/* ปุ่มลบ */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="ลบไฟล์นี้"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // ยังไม่มีไฟล์: กล่อง Drag & Drop PDF
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "rounded-2xl border-2 border-dashed transition-all p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center group",
                isDragging
                  ? "border-rose-500 bg-rose-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/20"
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 group-hover:border-rose-200 flex items-center justify-center text-slate-400 group-hover:text-rose-600 shadow-2xs group-hover:shadow-xs transition-all">
                <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition-colors">
                  คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวาง
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

