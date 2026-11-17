"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";

interface HospitalComboboxProps {
  value: string;
  onChange: (value: string) => void;
  hospitals: string[];
  onCreateHospital?: (name: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function HospitalCombobox({
  value,
  onChange,
  hospitals,
  onCreateHospital,
  placeholder = "เลือกหรือพิมพ์ชื่อโรงพยาบาล...",
  required = false,
}: HospitalComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = value.trim();
  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => h.toLowerCase().includes(q));
  }, [hospitals, trimmed]);

  const exactMatch = useMemo(
    () => hospitals.some((h) => h.toLowerCase() === trimmed.toLowerCase()),
    [hospitals, trimmed]
  );

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          name="hospital_org_combobox"
          autoComplete="off"
          required={required}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          aria-label="เปิดรายการโรงพยาบาล"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
          {filtered.map((name) => {
            const selected = name.toLowerCase() === trimmed.toLowerCase();
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between gap-2 hover:bg-blue-50 transition ${
                  selected ? "bg-blue-50/70 font-semibold text-blue-700" : "text-slate-700"
                }`}
              >
                <span className="truncate">{name}</span>
                {selected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}

          {trimmed && !exactMatch && (
            <button
              type="button"
              onClick={() => {
                onChange(trimmed);
                onCreateHospital?.(trimmed);
                setOpen(false);
              }}
              className="w-full px-3.5 py-2.5 text-left text-sm font-semibold text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 flex items-center gap-2 border-t border-slate-100"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>เพิ่มโรงพยาบาลใหม่: &ldquo;{trimmed}&rdquo;</span>
            </button>
          )}

          {filtered.length === 0 && !trimmed && (
            <div className="px-3.5 py-3 text-xs text-slate-400 text-center">
              ยังไม่มีรายชื่อโรงพยาบาล — พิมพ์ชื่อเพื่อเพิ่มใหม่ได้เลย
            </div>
          )}
        </div>
      )}
    </div>
  );
}

