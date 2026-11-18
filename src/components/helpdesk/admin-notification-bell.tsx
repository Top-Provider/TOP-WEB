"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Volume2, VolumeX, Wrench, ArrowRight } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface NotificationItem {
  id: number;
  ticket_no: string;
  customer_org: string;
  title: string;
  priority: string;
  queue: string;
  created_at: string;
}

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch {
    // Audio playback may be blocked until first user interaction
  }
}

function formatRelativeThai(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "เมื่อสักครู่";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชม. ที่แล้ว`;
  return `${Math.floor(diffHr / 24)} วันที่แล้ว`;
}

export function AdminNotificationBell({
  onNewCountChange,
}: {
  onNewCountChange?: (count: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSeenIdRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_helpdesk_sound");
      if (saved === "false") setSoundEnabled(false);
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_helpdesk_sound", String(next));
      } catch {}
      return next;
    });
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/helpdesk/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success) return;

      const count = Number(json.newCount || 0);
      const latestId = Number(json.latestNewId || 0);
      const list = (json.items || []) as NotificationItem[];

      setNewCount(count);
      setItems(list);
      onNewCountChange?.(count);

      if (lastSeenIdRef.current !== null && latestId > lastSeenIdRef.current && list[0]) {
        const newest = list[0];
        toast.info(
          `มีงานแจ้งซ่อมใหม่: ${newest.ticket_no}`,
          `${newest.customer_org} — ${newest.title}`
        );
        if (soundEnabled) {
          playNotificationChime();
        }
      }
      lastSeenIdRef.current = latestId;
    } catch {
      // Ignore transient network errors during background polling
    }
  }, [onNewCountChange, soundEnabled]);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          fetchNotifications();
        }}
        aria-label="แจ้งเตือนงานแจ้งซ่อมใหม่"
        title="แจ้งเตือนงานแจ้งซ่อมใหม่"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {newCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm">
            {newCount > 99 ? "99+" : newCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <div>
              <div className="text-sm font-bold text-slate-900">
                แจ้งเตือนงานแจ้งซ่อมใหม่
              </div>
              <div className="text-[11px] text-slate-500">
                รอรับเรื่องทั้งหมด {newCount.toLocaleString("th-TH")} รายการ
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? "ปิดเสียงแจ้งเตือน" : "เปิดเสียงแจ้งเตือน"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-600" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                ไม่มีงานแจ้งซ่อมใหม่ที่รอรับเรื่อง
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/helpdesk?ticket=${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-blue-700">{item.ticket_no}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatRelativeThai(item.created_at)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.customer_org} · {item.priority}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <Link
              href="/admin/helpdesk"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>ดูคิวงานแจ้งซ่อมทั้งหมด</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
