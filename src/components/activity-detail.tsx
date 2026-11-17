"use client";
import { useEffect, useState } from "react";
import { Building2, Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { ActivityItem, formatThaiDate, getCategoryLabel } from "@/lib/activities";
import { Modal } from "@/components/ui/modal";

export function ActivityGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (!images.length) return null;
  const activeIndex = Math.min(index, images.length - 1);
  return <div className="space-y-3">
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
      <img src={images[activeIndex]} alt={`${title} ภาพที่ ${activeIndex + 1}`} className="h-full w-full object-contain" />
      {images.length > 1 && <>
        <button type="button" aria-label="ภาพก่อนหน้า" onClick={() => setIndex((activeIndex + images.length - 1) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white focus-visible:ring-2 focus-visible:ring-white"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" aria-label="ภาพถัดไป" onClick={() => setIndex((activeIndex + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white focus-visible:ring-2 focus-visible:ring-white"><ChevronRight className="h-5 w-5" /></button>
      </>}
      <span aria-live="polite" className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{activeIndex + 1} / {images.length}</span>
    </div>
    {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-1">{images.map((src, i) => <button key={`${src.slice(0, 40)}-${i}`} type="button" aria-label={`ดูภาพที่ ${i + 1}`} aria-pressed={i === activeIndex} onClick={() => setIndex(i)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:ring-2 focus-visible:ring-blue-500 ${i === activeIndex ? "border-blue-600" : "border-transparent opacity-60"}`}><img src={src} loading="lazy" alt="" className="h-full w-full object-cover" /></button>)}</div>}
  </div>;
}

export function ActivityDetail({ activity, onClose }: { activity: ActivityItem; onClose: () => void }) {
  const [detail, setDetail] = useState<ActivityItem | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/activities/${activity.id}`, { signal: controller.signal })
      .then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result.data; })
      .then(setDetail).catch(error => { if (!controller.signal.aborted) setError(error.message || "โหลดกิจกรรมไม่สำเร็จ"); });
    return () => controller.abort();
  }, [activity.id, attempt]);
  const images = detail ? [detail.cover_image_url, ...detail.gallery_images].filter((value): value is string => Boolean(value)) : [];
  return <Modal isOpen onClose={onClose} title={activity.title} maxWidth="4xl">
    {!detail && !error && <p role="status" className="py-12 text-center text-slate-500">กำลังโหลดรายละเอียดกิจกรรม...</p>}
    {error && <div role="alert" className="space-y-3 text-center"><p>{error}</p><button type="button" onClick={() => { setError(""); setAttempt(value => value + 1); }} className="rounded-lg bg-blue-600 px-4 py-2 text-white">ลองใหม่</button></div>}
    {detail && <div className="space-y-5">
      <ActivityGallery images={images} title={detail.title} />
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{getCategoryLabel(detail.category)}</span>
        {detail.event_date && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatThaiDate(detail.event_date)}</span>}
        {detail.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{detail.location}</span>}
        {detail.customerName && <span className="flex items-center gap-1 text-blue-700"><Building2 className="h-4 w-4" />{detail.customerName}</span>}
      </div>
      {detail.title_en && <p className="text-sm text-slate-500">{detail.title_en}</p>}
      {detail.short_description && <p className="rounded-xl bg-blue-50 p-4 text-sm leading-7 text-slate-700">{detail.short_description}</p>}
      {detail.content && <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{detail.content}</p>}
      <div className="flex flex-wrap gap-2">{detail.tags.map((tag, i) => <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">#{tag}</span>)}</div>
    </div>}
  </Modal>;
}
