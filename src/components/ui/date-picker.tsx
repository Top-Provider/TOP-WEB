"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Sync calendar view when value changes from outside
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [value, parsedDate]);

  // Close on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
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

  // Generate Year options around viewYear (-5 to +5)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 8; y <= currentYear + 8; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

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
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 rounded-md">
            {parsedDate ? String(parsedDate.getFullYear()) : "ว/ด/ป"}
          </span>
        </div>
      </button>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-76 sm:w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header: Month & Year Controls */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent hover:bg-slate-50 py-1 px-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all outline-none cursor-pointer"
              >
                {THAI_MONTHS_FULL.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50/60 hover:bg-blue-50 py-1 px-2 rounded-lg border border-blue-100 outline-none cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y + 543} ({y})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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
                    // Current month vs other month
                    cell.isCurrentMonth ? "text-slate-800" : "text-slate-300",
                    // Hover
                    !isSelected && !cell.disabled && "hover:bg-blue-50 hover:text-blue-600",
                    // Today styling
                    isToday && !isSelected && "border border-blue-500 text-blue-600 font-bold bg-blue-50/30",
                    // Selected styling
                    isSelected && "bg-[#0062FF] text-white shadow-md shadow-blue-500/30 font-bold scale-[1.03]",
                    // Disabled
                    cell.disabled && "opacity-25 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <span>{cell.date.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Footer Action Buttons */}
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
        </div>
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

