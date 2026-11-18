"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";
import { cn } from "cn";

export interface DatePickerProps {
  id?: string;
  value?: string; // Format: "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
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

const DAYS_HEADER = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "เลือกวันที่จัดกิจกรรม...",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update floating popover position to ensure it is never clipped
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverHeight = popoverRef.current?.offsetHeight || 385;
    const popoverWidth = Math.min(320, window.innerWidth - 32);

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let top = openUpwards ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    let left = rect.left;

    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    // Clamp top within viewport boundaries
    if (top < 8) top = 8;
    if (top + popoverHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - popoverHeight - 8);
    }

    setPopoverPos({ top, left, width: popoverWidth });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Parse current value
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) return date;
    }
    return null;
  }, [value]);

  // Calendar view state (year and month currently displayed)
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Year range start for "years" view (shows 12 years per page)
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const y = parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
    return Math.floor(y / 12) * 12;
  });

  // Sync calendar view when value changes from outside
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
      setYearPageStart(Math.floor(parsedDate.getFullYear() / 12) * 12);
    }
  }, [value, parsedDate]);

  // Reset to days mode when opened
  useEffect(() => {
    if (isOpen) {
      setViewMode("days");
    }
  }, [isOpen]);

  // Close on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Navigate months (in "days" mode) or years (in "years" mode)
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "years") {
      setYearPageStart((y) => y - 12);
    } else if (viewMode === "months") {
      setViewYear((y) => y - 1);
    } else {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "years") {
      setYearPageStart((y) => y + 12);
    } else if (viewMode === "months") {
      setViewYear((y) => y + 1);
    } else {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      dateString: string;
      disabled: boolean;
    }[] = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, d);
      const str = formatDateToString(prevDate);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: str,
        disabled: isDateDisabled(str, minDate, maxDate),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(viewYear, viewMonth, d);
      const str = formatDateToString(curDate);
      days.push({
        date: curDate,
        isCurrentMonth: true,
        dateString: str,
        disabled: isDateDisabled(str, minDate, maxDate),
      });
    }

    // Next month days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d);
      const str = formatDateToString(nextDate);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: str,
        disabled: isDateDisabled(str, minDate, maxDate),
      });
    }

    return days;
  }, [viewYear, viewMonth, minDate, maxDate]);

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const str = formatDateToString(today);
    onChange(str);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setViewMode("days");
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Formatted display text
  const displayText = useMemo(() => {
    if (!parsedDate) return null;
    const d = parsedDate.getDate();
    const m = THAI_MONTHS_SHORT[parsedDate.getMonth()];
    const yBe = parsedDate.getFullYear() + 543;
    return `${d} ${m} ${yBe}`;
  }, [parsedDate]);

  // Today string for highlighting
  const todayStr = formatDateToString(new Date());

  // Years array for "years" view
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < 12; i++) {
      list.push(yearPageStart + i);
    }
    return list;
  }, [yearPageStart]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-3.5 py-2 text-left bg-white border border-slate-200/90 rounded-xl shadow-2xs text-xs sm:text-sm text-slate-800 flex items-center justify-between transition-all duration-150 outline-none cursor-pointer",
          "hover:border-blue-400/70 hover:shadow-xs",
          isOpen
            ? "border-blue-600 ring-3 ring-blue-500/15"
            : "focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50",
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
          {displayText ? (
            <span className="font-semibold text-slate-900">{displayText}</span>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="ล้างวันที่"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* Popover Calendar (Rendered in Portal to avoid overflow clipping) */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: `${popoverPos?.top ?? 0}px`,
            left: `${popoverPos?.left ?? 0}px`,
            width: `${popoverPos?.width ?? 320}px`,
            zIndex: 9999,
            pointerEvents: "auto",
          }}
          className="pointer-events-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/25 border border-slate-200/90 p-4 animate-in fade-in zoom-in-95 duration-150 select-none"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Middle Title / View Switchers */}
            <div className="flex items-center gap-1.5">
              {viewMode === "days" && (
                <>
                  {/* Select Month Trigger */}
                  <button
                    type="button"
                    onClick={() => setViewMode("months")}
                    className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 hover:bg-blue-50/70 py-1 px-2.5 rounded-lg border border-transparent hover:border-blue-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{THAI_MONTHS_FULL[viewMonth]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Select Year Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setYearPageStart(Math.floor(viewYear / 12) * 12);
                      setViewMode("years");
                    }}
                    className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 py-1 px-2.5 rounded-lg border border-blue-100 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{viewYear + 543}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </>
              )}

              {viewMode === "months" && (
                <button
                  type="button"
                  onClick={() => setViewMode("days")}
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  เลือกเดือน ({viewYear + 543})
                </button>
              )}

              {viewMode === "years" && (
                <button
                  type="button"
                  onClick={() => setViewMode("days")}
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {yearPageStart + 543} - {yearPageStart + 11 + 543}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW 1: Days Calendar Grid */}
          {viewMode === "days" && (
            <>
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {DAYS_HEADER.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      "text-[11px] font-bold py-1",
                      idx === 0 ? "text-rose-500" : idx === 6 ? "text-blue-500" : "text-slate-400"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell) => {
                  const isSelected = value === cell.dateString;
                  const isToday = cell.dateString === todayStr;

                  return (
                    <button
                      key={cell.dateString}
                      type="button"
                      disabled={cell.disabled}
                      onClick={() => !cell.disabled && handleSelectDay(cell.dateString)}
                      className={cn(
                        "h-8 sm:h-9 w-full rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer relative",
                        cell.isCurrentMonth ? "text-slate-800" : "text-slate-300",
                        !isSelected && !cell.disabled && "hover:bg-blue-50 hover:text-blue-600",
                        isToday && !isSelected && "border border-blue-500 text-blue-600 font-bold bg-blue-50/30",
                        isSelected && "bg-[#0062FF] text-white shadow-md shadow-blue-500/30 font-bold scale-[1.03]",
                        cell.disabled && "opacity-25 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <span>{cell.date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: Clean 12-Month Grid */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {THAI_MONTHS_FULL.map((m, idx) => {
                const isSelected = viewMonth === idx;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
                      isSelected
                        ? "bg-[#0062FF] text-white shadow-md shadow-blue-500/25 font-bold"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: Clean 12-Year Grid */}
          {viewMode === "years" && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {yearsList.map((y) => {
                const isSelected = viewYear === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewYear(y);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-center",
                      isSelected
                        ? "bg-[#0062FF] text-white shadow-md shadow-blue-500/25 font-bold"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                    )}
                  >
                    {y + 543}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Quick Action Buttons */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>วันนี้</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                ล้างวันที่
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function formatDateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isDateDisabled(dateStr: string, minDate?: string, maxDate?: string): boolean {
  if (minDate && dateStr < minDate) return true;
  if (maxDate && dateStr > maxDate) return true;
  return false;
}
