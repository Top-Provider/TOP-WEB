"use client";

import React from "react";

interface MedicalCrossLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function MedicalCrossLoader({
  size = "lg",
  className = "",
}: MedicalCrossLoaderProps) {
  const sizeMap = {
    sm: {
      orbitBox: "w-[min(65vmin,300px)] h-[min(65vmin,300px)] max-w-full max-h-full",
      innerInset: "inset-[9%]",
      logoBox: "w-[58%] max-w-[190px] px-3.5 py-2.5 rounded-2xl",
      dot1: "w-3 h-3 -top-1.5",
      dot2: "w-2.5 h-2.5 -bottom-1.25",
    },
    md: {
      orbitBox: "w-[min(70vmin,420px)] h-[min(70vmin,420px)] max-w-full max-h-full",
      innerInset: "inset-[9%]",
      logoBox: "w-[60%] max-w-[260px] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl",
      dot1: "w-3.5 h-3.5 -top-1.75",
      dot2: "w-3 h-3 -bottom-1.5",
    },
    lg: {
      orbitBox: "w-[min(72vmin,500px)] h-[min(72vmin,500px)] max-w-full max-h-full",
      innerInset: "inset-[9%]",
      logoBox: "w-[62%] max-w-[320px] px-5 sm:px-8 py-3.5 sm:py-5 rounded-2xl sm:rounded-3xl",
      dot1: "w-4.5 h-4.5 -top-2.25",
      dot2: "w-4 h-4 -bottom-2",
    },
    xl: {
      orbitBox: "w-[min(76vmin,580px)] h-[min(76vmin,580px)] max-w-full max-h-full",
      innerInset: "inset-[10%]",
      logoBox: "w-[62%] max-w-[380px] px-6 sm:px-9 py-4 sm:py-6 rounded-3xl",
      dot1: "w-5 h-5 -top-2.5",
      dot2: "w-4.5 h-4.5 -bottom-2.25",
    },
  };

  const current = sizeMap[size] || sizeMap.lg;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none p-2 overflow-hidden ${className}`}>
      {/* 1. Orbit Stage with Grand Expanded Circles surrounding the Logo */}
      <div className={`relative ${current.orbitBox} flex items-center justify-center shrink-0`}>
        {/* Soft Ambient Radial Glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-blue-500/10 via-sky-400/10 to-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

        {/* Outer Orbit Track */}
        <div className="absolute inset-0 rounded-full border border-blue-100/90" />

        {/* Outer Orbit Rotating Ring with Golden Satellite Bead */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] border-r-blue-400/50 animate-[spin_4.5s_linear_infinite]">
          {/* Golden / Amber Bead traveling along outer orbit */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot1} rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B] shadow-[0_0_18px_#F59E0B] ring-2 ring-white`}
          />
        </div>

        {/* Inner Orbit Track */}
        <div className={`absolute ${current.innerInset} rounded-full border border-slate-100/90`} />

        {/* Inner Orbit Reverse Rotating Ring with Medical Blue Satellite Bead */}
        <div
          className={`absolute ${current.innerInset} rounded-full border-2 border-transparent border-b-[#F59E0B] border-l-amber-300/40 animate-[spin_3.2s_linear_infinite_reverse]`}
        >
          {/* Medical Blue Bead traveling along inner orbit in reverse */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot2} rounded-full bg-gradient-to-r from-blue-400 to-[#0066FF] shadow-[0_0_16px_#0066FF] ring-2 ring-white`}
          />
        </div>

        {/* Center: Large Logo Card inside the Grand Orbit Rings */}
        <div
          className={`relative z-10 ${current.logoBox} px-6 sm:px-10 py-5 sm:py-8 rounded-3xl bg-white/95 backdrop-blur-md border border-blue-50/80 shadow-2xl shadow-blue-500/10 flex flex-col items-center justify-center transition-all duration-300`}
        >
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
            className="w-full h-auto object-contain drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
