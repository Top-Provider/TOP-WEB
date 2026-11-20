"use client";

import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, X } from "lucide-react";

const SERVER_UNAVAILABLE_STATUSES = new Set([502, 503, 504]);

function isSameOriginApiCall(input: RequestInfo | URL): boolean {
  try {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const parsed = new URL(rawUrl, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

export function ConnectionStatusBanner() {
  const [disconnected, setDisconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setDisconnected(true);
      setDismissed(false);
    };
    const handleOnline = () => {
      setDisconnected(false);
      setDismissed(false);
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const monitor = isSameOriginApiCall(input);
      try {
        const res = await originalFetch(input, init);
        if (monitor) {
          if (SERVER_UNAVAILABLE_STATUSES.has(res.status)) {
            setDisconnected(true);
            setDismissed(false);
          } else if (res.status < 500) {
            setDisconnected(false);
          }
        }
        return res;
      } catch (err) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        if (monitor && !isAbort) {
          setDisconnected(true);
          setDismissed(false);
        }
        throw err;
      }
    };

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.fetch = originalFetch;
    };
  }, []);

  if (!disconnected || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-1.5rem)] max-w-xl"
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/95 px-4 py-3 text-rose-900 shadow-xl shadow-rose-900/15 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <WifiOff className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-snug">
              ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้
            </p>
            <p className="text-xs text-rose-700">
              กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือลองใหม่อีกครั้ง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            ลองใหม่
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="ปิดการแจ้งเตือน"
            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
