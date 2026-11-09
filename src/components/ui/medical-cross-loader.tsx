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
  subtext = "TOP PROVIDER SYSTEM GROUP CO., LTD.",
  className = "",
}: MedicalCrossLoaderProps) {
  const sizeMap = {
    sm: {
      orbitBox: "w-56 h-56 sm:w-64 sm:h-64",
      innerInset: "inset-3 sm:inset-4",
      logoBox: "w-36 sm:w-44",
      dot1: "w-3 h-3 -top-1.5",
      dot2: "w-2.5 h-2.5 -bottom-1.25",
      text: "text-xs sm:text-sm",
      sub: "text-[11px]",
    },
    md: {
      orbitBox: "w-68 h-68 sm:w-80 sm:h-80 md:w-88 md:h-88",
      innerInset: "inset-4 sm:inset-5",
      logoBox: "w-48 sm:w-56 md:w-64",
      dot1: "w-3.5 h-3.5 -top-1.75",
      dot2: "w-3 h-3 -bottom-1.5",
      text: "text-sm sm:text-base",
      sub: "text-xs",
    },
    lg: {
      orbitBox: "w-76 h-76 sm:w-88 sm:h-88 md:w-96 md:h-96",
      innerInset: "inset-5 sm:inset-6",
      logoBox: "w-52 sm:w-64 md:w-72",
      dot1: "w-4 h-4 -top-2",
      dot2: "w-3.5 h-3.5 -bottom-1.75",
      text: "text-base sm:text-lg",
      sub: "text-xs sm:text-sm",
    },
    xl: {
      orbitBox: "w-88 h-88 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px]",
      innerInset: "inset-6 sm:inset-8",
      logoBox: "w-60 sm:w-72 md:w-80",
      dot1: "w-4.5 h-4.5 -top-2.25",
      dot2: "w-4 h-4 -bottom-2",
      text: "text-lg sm:text-xl",
      sub: "text-sm",
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none py-6 px-4 ${className}`}>
      {/* 1. Orbit Stage with Circles surrounding the Logo */}
      <div className={`relative ${current.orbitBox} flex items-center justify-center`}>
        {/* Soft Ambient Radial Glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500/10 via-sky-400/10 to-amber-500/10 blur-2xl pointer-events-none animate-pulse" />

        {/* Outer Orbit Track */}
        <div className="absolute inset-0 rounded-full border border-blue-100/90" />

        {/* Outer Orbit Rotating Ring with Golden Satellite Bead */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] border-r-blue-400/50 animate-[spin_4s_linear_infinite]">
          {/* Golden / Amber Bead traveling along outer orbit */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot1} rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B] shadow-[0_0_14px_#F59E0B] ring-2 ring-white`}
          />
        </div>

        {/* Inner Orbit Track */}
        <div className={`absolute ${current.innerInset} rounded-full border border-slate-100/90`} />

        {/* Inner Orbit Reverse Rotating Ring with Medical Blue Satellite Bead */}
        <div
          className={`absolute ${current.innerInset} rounded-full border-2 border-transparent border-b-[#F59E0B] border-l-amber-300/40 animate-[spin_3s_linear_infinite_reverse]`}
        >
          {/* Medical Blue Bead traveling along inner orbit in reverse */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot2} rounded-full bg-gradient-to-r from-blue-400 to-[#0066FF] shadow-[0_0_12px_#0066FF] ring-2 ring-white`}
          />
        </div>

        {/* Center: Large Logo Card inside the Orbit Rings */}
        <div
          className={`relative z-10 ${current.logoBox} p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-blue-50 shadow-lg shadow-blue-500/5 flex flex-col items-center justify-center transition-all duration-300`}
        >
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
            className="w-full h-auto object-contain drop-shadow-xs"
          />
        </div>
      </div>

      {/* 2. Text Info & Pulse Indicator underneath the Orbit Logo */}
      {(text || subtext) && (
        <div className="mt-5 sm:mt-6 space-y-1.5 max-w-md mx-auto">
          {text && (
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] animate-ping" />
              <span>{text}</span>
            </div>
          )}
          {subtext && (
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
