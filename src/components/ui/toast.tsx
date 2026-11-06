"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let listeners: ToastListener[] = [];
let memoryToasts: ToastItem[] = [];

function notify() {
  listeners.forEach((listener) => listener([...memoryToasts]));
}

export const toast = {
  show: (type: ToastType, message: string, title?: string, duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, type, message, title, duration };
    memoryToasts = [newToast, ...memoryToasts].slice(0, 5);
    notify();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
  },
  success: (message: string, title?: string, duration?: number) => {
    toast.show("success", message, title || "ดำเนินการสำเร็จ", duration);
  },
  error: (message: string, title?: string, duration?: number) => {
    toast.show("error", message, title || "เกิดข้อผิดพลาด", duration);
  },
  warning: (message: string, title?: string, duration?: number) => {
    toast.show("warning", message, title || "แจ้งเตือนข้อมูล", duration);
  },
  info: (message: string, title?: string, duration?: number) => {
    toast.show("info", message, title || "ข้อมูล", duration);
  },
  dismiss: (id: string) => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notify();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>(memoryToasts);

  useEffect(() => {
    const handler: ToastListener = (newToasts) => setToasts(newToasts);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((t) => {
        const borderColors = {
          success: "border-emerald-200 bg-white/95 text-slate-800 shadow-emerald-500/10",
          error: "border-rose-200 bg-white/95 text-slate-800 shadow-rose-500/10",
          warning: "border-amber-200 bg-white/95 text-slate-800 shadow-amber-500/10",
          info: "border-blue-200 bg-white/95 text-slate-800 shadow-blue-500/10",
        };

        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
        };

        const topBarColors = {
          success: "bg-emerald-500",
          error: "bg-rose-500",
          warning: "bg-amber-500",
          info: "bg-blue-500",
        };

        return (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md p-4 transition-all animate-in fade-in slide-in-from-top-3 duration-250 ${borderColors[t.type]}`}
          >
            {/* Top Accent Strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${topBarColors[t.type]}`} />

            <div className="flex items-start gap-3">
              {iconMap[t.type]}

              <div className="flex-1 min-w-0 pr-2">
                {t.title && (
                  <h5 className="text-xs font-bold text-slate-900 tracking-tight mb-0.5">
                    {t.title}
                  </h5>
                )}
                <div className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-line">
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

