"use client";

import React from "react";

interface MedicalCrossLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  className?: string;
}

export function MedicalCrossLoader({
  size = "md",
  text = "กำลังโหลดข้อมูล...",
  subtext = "TOP PROVIDER SYSTEM GROUP",
  className = "",
}: MedicalCrossLoaderProps) {
  const sizeMap = {
    sm: {
      container: "w-20 h-20",
      centerBox: "w-10 h-10",
      dot1: "w-2 h-2",
      dot2: "w-1.5 h-1.5",
      text: "text-xs",
      sub: "text-[10px]",
    },
    md: {
      container: "w-28 h-28",
      centerBox: "w-14 h-14",
      dot1: "w-2.5 h-2.5",
      dot2: "w-2 h-2",
      text: "text-sm sm:text-base",
      sub: "text-xs",
    },
    lg: {
      container: "w-36 h-36",
      centerBox: "w-16 h-16",
      dot1: "w-3 h-3",
      dot2: "w-2.5 h-2.5",
      text: "text-base sm:text-lg",
      sub: "text-xs sm:text-sm",
    },
    xl: {
      container: "w-44 h-44",
      centerBox: "w-20 h-20",
      dot1: "w-3.5 h-3.5",
      dot2: "w-3 h-3",
      text: "text-lg sm:text-xl",
      sub: "text-sm",
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Animation Stage */}
      <div className={`relative ${current.container} flex items-center justify-center my-2`}>
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl pointer-events-none animate-pulse" />

        {/* Outer Orbit Track */}
        <div className="absolute inset-0 rounded-full border border-blue-100/90" />

        {/* Outer Orbit Rotating Ring with Golden Bead */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] border-r-blue-400/50 animate-[spin_3s_linear_infinite]">
          {/* Orbiting Satellite Bead 1 (Amber / Gold from Logo) */}
          <span
            className={`absolute -top-1.5 left-1/2 -translate-x-1/2 ${current.dot1} rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B] shadow-[0_0_10px_#F59E0B] ring-2 ring-white`}
          />
        </div>

        {/* Inner Orbit Track */}
        <div className="absolute inset-3 rounded-full border border-slate-100" />

        {/* Inner Orbit Reverse Rotating Ring with Blue Bead */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#F59E0B] border-l-amber-300/40 animate-[spin_2.2s_linear_infinite_reverse]">
          {/* Orbiting Satellite Bead 2 (Medical Blue from Logo) */}
          <span
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${current.dot2} rounded-full bg-gradient-to-r from-blue-400 to-[#0066FF] shadow-[0_0_8px_#0066FF] ring-2 ring-white`}
          />
        </div>

        {/* Central Medical Cross Shield */}
        <div
          className={`relative z-10 ${current.centerBox} rounded-2xl bg-white/95 backdrop-blur-md shadow-lg shadow-blue-500/10 border border-blue-100/90 flex items-center justify-center p-2 sm:p-2.5 transition-transform duration-300`}
        >
          {/* Medical Cross SVG with Top Provider Curved Ribbon & Heartbeat Pulse */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            <defs>
              <linearGradient id="medCrossBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#004DBD" />
              </linearGradient>
              <linearGradient id="medCrossGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Medical Cross Body (Rounded Healthcare Cross) */}
            {/* Vertical Bar */}
            <rect x="36" y="12" width="28" height="76" rx="8" fill="url(#medCrossBlue)" />
            {/* Horizontal Bar */}
            <rect x="12" y="36" width="76" height="28" rx="8" fill="url(#medCrossBlue)" />

            {/* Inner Depth Glaze */}
            <rect x="39" y="15" width="22" height="70" rx="5" fill="white" opacity="0.16" />
            <rect x="15" y="39" width="70" height="22" rx="5" fill="white" opacity="0.16" />

            {/* Top Provider Dynamic Ribbon Wave (Passing gracefully across the cross) */}
            <path
              d="M 22 66 C 35 70, 44 48, 50 48 C 56 48, 65 30, 78 34 C 70 32, 58 54, 50 54 C 42 54, 33 72, 22 66 Z"
              fill="url(#medCrossGold)"
            />

            {/* Center Heartbeat Pulse Dot */}
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="2" fill="#0066FF" />
          </svg>
        </div>
      </div>

      {/* Text Info */}
      {(text || subtext) && (
        <div className="mt-3.5 space-y-1">
          {text && (
            <h4 className={`font-bold text-slate-800 tracking-tight ${current.text}`}>
              {text}
            </h4>
          )}
          {subtext && (
            <p className={`text-slate-400 font-medium ${current.sub}`}>
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

