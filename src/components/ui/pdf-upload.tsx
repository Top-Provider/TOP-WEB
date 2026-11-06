"use client";

import React, { useRef, useState } from "react";
import { FileText, UploadCloud, X, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "cn";
import { toast } from "@/components/ui/toast";

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
  description = "คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวาง",
  badge,
}: PdfUploadProps) {
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
      toast.warning("กรุณาเลือกไฟล์เอกสาร PDF เท่านั้น", "รูปแบบไฟล์ไม่ถูกต้อง");
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

      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-600 border border-rose-100">
              {badge}
            </span>
          )}
        </label>
      </div>

      {/* กล่องอัปโหลดไฟล์ PDF จากเครื่อง */}
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
          // ยังไม่มีไฟล์: กล่อง Drag & Drop PDF จากเครื่อง
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
                คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-[10px] text-slate-400">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
