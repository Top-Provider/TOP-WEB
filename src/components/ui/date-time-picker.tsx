"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "cn";

export interface DateTimePickerProps {
  id?: string;
  value?: string; // Format: "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// Monday-first week header matching the reference design
const DAYS_HEADER = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function parseDateTime(val?: string) {
  if (!val) return null;
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hour: match[4],
    minute: match[5],
  };
}

function formatDisplay(val?: string) {
  const parsed = parseDateTime(val);
  if (!parsed) return "";
  const monthName = THAI_MONTHS_SHORT[parsed.month] || String(parsed.month + 1);
  const thaiYear = parsed.year + 543;
  return `${parsed.day} ${monthName} ${thaiYear} · ${parsed.hour}:${parsed.minute} น.`;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "วว/ดด/ปปปป --:--",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [mounted, setMounted] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseDateTime(value), [value]);
  const today = useMemo(() => new Date(), []);

  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [parsed]);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = popoverRef.current?.offsetHeight || 340;
    const popoverWidth = Math.min(368, window.innerWidth - 24);

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let top = openUpwards ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    let left = rect.left;

    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;
    if (top < 8) top = 8;
    if (top + popoverHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - popoverHeight - 8);
    }

    setPopoverPos({ top, left, width: popoverWidth });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Prevent Radix Dialog's react-remove-scroll on document from blocking wheel/touch scrolling inside the portal popover
  useEffect(() => {
    if (!isOpen) return;
    const el = popoverRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: true });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, [isOpen, popoverPos]);

  // Scroll active hour/minute into view when opening
  useEffect(() => {
    if (!isOpen) return;
    const h = parsed?.hour ?? String(today.getHours()).padStart(2, "0");
    const m = parsed?.minute ?? String(today.getMinutes()).padStart(2, "0");
    requestAnimationFrame(() => {
      hourListRef.current
        ?.querySelector(`[data-val="${h}"]`)
        ?.scrollIntoView({ block: "center" });
      minuteListRef.current
        ?.querySelector(`[data-val="${m}"]`)
        ?.scrollIntoView({ block: "center" });
    });
  }, [isOpen, parsed?.hour, parsed?.minute, today]);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun..6=Sat
    const mondayOffset = (firstDay + 6) % 7; // Convert to 0=Mon..6=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{ year: number; month: number; day: number; isCurrent: boolean }> = [];

    for (let i = mondayOffset - 1; i >= 0; i--) {
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ year: prevY, month: prevM, day: prevMonthDays - i, isCurrent: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ year: viewYear, month: viewMonth, day: d, isCurrent: true });
    }
    let nextDay = 1;
    while (cells.length < 42) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ year: nextY, month: nextM, day: nextDay++, isCurrent: false });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const commitDateTime = (
    year: number,
    month: number,
    day: number,
    hour: string,
    minute: string
  ) => {
    const yyyy = String(year);
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}T${hour}:${minute}`);
  };

  const activeHour = parsed?.hour ?? String(today.getHours()).padStart(2, "0");
  const activeMinute = parsed?.minute ?? String(today.getMinutes()).padStart(2, "0");

  const handleSelectDay = (cell: { year: number; month: number; day: number }) => {
    setViewYear(cell.year);
    setViewMonth(cell.month);
    commitDateTime(cell.year, cell.month, cell.day, activeHour, activeMinute);
  };

  const handleSelectHour = (h: string) => {
    const y = parsed?.year ?? today.getFullYear();
    const m = parsed?.month ?? today.getMonth();
    const d = parsed?.day ?? today.getDate();
    commitDateTime(y, m, d, h, activeMinute);
  };

  const handleSelectMinute = (min: string) => {
    const y = parsed?.year ?? today.getFullYear();
    const m = parsed?.month ?? today.getMonth();
    const d = parsed?.day ?? today.getDate();
    commitDateTime(y, m, d, activeHour, min);
  };

  const handleToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    commitDateTime(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0")
    );
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const displayStr = formatDisplay(value);
  const startYear = Math.floor(viewYear / 12) * 12;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setViewMode("days");
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3 text-left text-sm transition-all duration-150 outline-none shadow-2xs cursor-pointer",
          "hover:border-blue-400/70 hover:shadow-xs",
          isOpen && "border-blue-600 ring-3 ring-blue-500/15",
          disabled && "pointer-events-none cursor-not-allowed bg-slate-50 opacity-50"
        )}
      >
        <span className={cn("truncate", displayStr ? "text-slate-800" : "text-slate-400")}>
          {displayStr || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="ล้างวันเวลา"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <CalendarIcon className="h-4 w-4 text-slate-500" />
        </span>
      </button>

      {mounted &&
        isOpen &&
        popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              width: popoverPos.width,
              pointerEvents: "auto",
            }}
            className="pointer-events-auto z-[100] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex">
              {/* Left: Calendar */}
              <div className="flex-1 p-3.5 min-w-0">
                <div className="flex items-center justify-between mb-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === "days" ? "months" : prev === "months" ? "years" : "days"
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-blue-600 px-1.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <span>
                      {THAI_MONTHS_FULL[viewMonth]} {viewYear + 543}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={prevMonth}
                      aria-label="เดือนก่อนหน้า"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      aria-label="เดือนถัดไป"
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {viewMode === "days" && (
                  <>
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                      {DAYS_HEADER.map((d) => (
                        <div key={d} className="text-[11px] font-semibold text-slate-500 py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {calendarCells.map((cell) => {
                        const isSelected =
                          parsed &&
                          parsed.year === cell.year &&
                          parsed.month === cell.month &&
                          parsed.day === cell.day;
                        const isToday =
                          today.getFullYear() === cell.year &&
                          today.getMonth() === cell.month &&
                          today.getDate() === cell.day;
                        return (
                          <button
                            key={`${cell.year}-${cell.month}-${cell.day}`}
                            type="button"
                            onClick={() => handleSelectDay(cell)}
                            className={cn(
                              "h-8 w-full rounded-lg text-xs font-medium transition-colors cursor-pointer",
                              isSelected
                                ? "bg-blue-600 text-white font-bold shadow-xs"
                                : cell.isCurrent
                                ? "text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                                : "text-slate-400 hover:bg-slate-100",
                              !isSelected && isToday && "ring-1 ring-blue-500 text-blue-600 font-bold"
                            )}
                          >
                            {cell.day}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {viewMode === "months" && (
                  <div className="grid grid-cols-3 gap-1.5 py-2">
                    {THAI_MONTHS_FULL.map((mName, mIdx) => (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setViewMonth(mIdx);
                          setViewMode("days");
                        }}
                        className={cn(
                          "py-2 px-1 rounded-lg text-xs font-medium cursor-pointer",
                          viewMonth === mIdx
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-700 hover:bg-blue-50"
                        )}
                      >
                        {mName}
                      </button>
                    ))}
                  </div>
                )}

                {viewMode === "years" && (
                  <div className="grid grid-cols-3 gap-1.5 py-2">
                    {Array.from({ length: 12 }, (_, i) => startYear + i).map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setViewYear(yr);
                          setViewMode("months");
                        }}
                        className={cn(
                          "py-2 px-1 rounded-lg text-xs font-medium cursor-pointer",
                          viewYear === yr
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-700 hover:bg-blue-50"
                        )}
                      >
                        {yr + 543}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-1 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    ล้าง
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-1 rounded hover:bg-blue-50 cursor-pointer"
                  >
                    วันนี้
                  </button>
                </div>
              </div>

              {/* Right: Hour & Minute scrollable columns */}
              <div className="flex border-l border-slate-100 bg-slate-50/40 p-2 gap-1">
                <div
                  ref={hourListRef}
                  className="h-[272px] w-11 overflow-y-auto overscroll-contain no-scrollbar space-y-1 pr-0.5"
                >
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      data-val={h}
                      onClick={() => handleSelectHour(h)}
                      className={cn(
                        "w-full h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        activeHour === h
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <div
                  ref={minuteListRef}
                  className="h-[272px] w-11 overflow-y-auto overscroll-contain no-scrollbar space-y-1 pl-0.5"
                >
                  {MINUTES.map((min) => (
                    <button
                      key={min}
                      type="button"
                      data-val={min}
                      onClick={() => handleSelectMinute(min)}
                      className={cn(
                        "w-full h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        activeMinute === min
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      )}
                    >
                      {min}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
