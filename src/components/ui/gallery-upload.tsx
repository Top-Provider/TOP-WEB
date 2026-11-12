"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, Plus, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "cn";

interface GalleryUploadProps {
  images?: string[];
  onChange: (images: string[]) => void;
  label?: string;
  description?: string;
  maxFiles?: number;
}

export function GalleryUpload({
  images = [],
  onChange,
  label = "อัลบั้มภาพ (Photo Gallery)",
  description = "คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่ (เลือกได้หลายไฟล์พร้อมกัน)",
  maxFiles = 30,
}: GalleryUploadProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // บีบอัดและแปลงไฟล์รูปภาพเป็น WebP Data URL ความละเอียดสูง
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve("");
        return;
      }

      if (file.type === "image/svg+xml") {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const maxWidth = 1920;
          const maxHeight = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/webp", 0.9);
            resolve(compressed);
          } else {
            resolve((event.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((event.target?.result as string) || "");
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      alert(`สามารถอัปโหลดได้สูงสุด ${maxFiles} รูป`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const newBase64s = await Promise.all(filesToProcess.map(processFile));
    const validImages = newBase64s.filter(Boolean);

    if (validImages.length > 0) {
      onChange([...images, ...validImages]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (confirm("ต้องการลบรูปภาพทั้งหมดในอัลบั้มใช่หรือไม่?")) {
      onChange([]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            {images.length} รูป
          </span>
        </div>

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
            เพิ่มผ่าน URL
          </button>
        </div>
      </div>

      {/* Mode: URL Input */}
      {tab === "url" ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="วาง URL รูปภาพ เช่น https://images.unsplash.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 font-mono bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddUrl()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            เพิ่ม
          </button>
        </div>
      ) : (
        /* Mode: Drag & Drop Zone */
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center gap-2 cursor-pointer text-center group",
            isDragging
              ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
              : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-blue-300 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-2xs group-hover:shadow-xs transition-all">
            <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
              คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่
            </p>
            <p className="text-[10px] text-slate-400">{description}</p>
          </div>
        </div>
      )}

      {/* Gallery Image Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>รูปภาพในอัลบั้ม ({images.length} รูป)</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
            >
              ล้างรูปทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-2xs hover:shadow-sm transition-all"
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                  #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm hover:scale-110"
                  title="ลบรูปนี้"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Quick Add Card at end of grid */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="rounded-xl border border-dashed border-slate-300 hover:border-blue-400 aspect-video bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-all cursor-pointer group"
              title="เพิ่มรูปภาพเพิ่มเติม"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold">เพิ่มรูป</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
