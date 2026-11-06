"use client";

import React, { useRef, useState } from "react";
import { Video, UploadCloud, X, RefreshCw, Link as LinkIcon, PlaySquare } from "lucide-react";
import { cn } from "cn";

interface VideoUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export function VideoUpload({
  value,
  onChange,
  label = "วิดีโอคลิปสาธิต (Demo Video)",
  description = "รองรับไฟล์ MP4, WebM หรือลิงก์คลิป YouTube",
}: VideoUploadProps) {
  // ตรวจจับอัตโนมัติว่าค่าปัจจุบันเป็น URL หรือไฟล์
  const isYoutube = value?.includes("youtube.com") || value?.includes("youtu.be");
  const isHttp = value?.startsWith("http");
  const [tab, setTab] = useState<"file" | "url">(isYoutube || isHttp ? "url" : "file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("กรุณาเลือกไฟล์วิดีโอเท่านั้น (เช่น .mp4, .webm)");
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
      {/* Hidden File Input สำหรับเลือกวิดีโอ */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-purple-50 text-purple-600 border border-purple-100">
            VIDEO
          </span>
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
            แนบไฟล์วิดีโอ
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
            YouTube / URL
          </button>
        </div>
      </div>

      {tab === "url" ? (
        // โหมดใส่ URL / YouTube
        <div className="space-y-3">
          <div className="relative">
            <PlaySquare className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="https://www.youtube.com/embed/... หรือ https://.../video.mp4"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 font-mono bg-white"
            />
          </div>

          {value && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-3 text-white overflow-hidden shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-300 truncate">
                  พรีวิววิดีโอคลิป
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="ลบ URL นี้"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {isYoutube ? (
                  <iframe
                    src={value}
                    title="Video preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={value}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // โหมดแนบไฟล์วิดีโอจากเครื่อง (Local File Upload)
        <div>
          {value ? (
            // มีไฟล์วิดีโอแล้ว: แสดง Video Player พรีวิว + ปุ่มเปลี่ยนไฟล์ + ปุ่มลบ
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 truncate">
                        แนบไฟล์วิดีโอแล้ว
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs font-mono">
                      {value.startsWith("data:") ? "ไฟล์วิดีโอจากเครื่อง (พร้อมบันทึก)" : value}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>เปลี่ยนไฟล์</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="ลบวิดีโอนี้"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Player Preview */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <video
                  src={value}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            // ยังไม่มีไฟล์: กล่อง Drag & Drop Video
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center gap-2 cursor-pointer text-center group",
                isDragging
                  ? "border-purple-500 bg-purple-50/50 scale-[0.99]"
                  : "border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/20"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-purple-200 flex items-center justify-center text-slate-400 group-hover:text-purple-600 shadow-2xs group-hover:shadow-xs transition-all">
                <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
                  คลิกเพื่อเลือกไฟล์วิดีโอ หรือลากไฟล์มาวาง (MP4, WebM)
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

