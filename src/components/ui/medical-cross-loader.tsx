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
      orbitBox: "w-64 h-64 sm:w-72 sm:h-72",
      innerInset: "inset-3 sm:inset-4",
      logoBox: "w-48 sm:w-56",
      dot1: "w-3.5 h-3.5 -top-1.75",
      dot2: "w-3 h-3 -bottom-1.5",
    },
    md: {
      orbitBox: "w-76 h-76 sm:w-88 sm:h-88 md:w-96 md:h-96",
      innerInset: "inset-4 sm:inset-5",
      logoBox: "w-56 sm:w-68 md:w-76",
      dot1: "w-4 h-4 -top-2",
      dot2: "w-3.5 h-3.5 -bottom-1.75",
    },
    lg: {
      orbitBox: "w-84 h-84 sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px]",
      innerInset: "inset-5 sm:inset-6",
      logoBox: "w-64 sm:w-80 md:w-92",
      dot1: "w-4.5 h-4.5 -top-2.25",
      dot2: "w-4 h-4 -bottom-2",
    },
    xl: {
      orbitBox: "w-96 h-96 sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px]",
      innerInset: "inset-6 sm:inset-8",
      logoBox: "w-72 sm:w-92 md:w-[400px]",
      dot1: "w-5 h-5 -top-2.5",
      dot2: "w-4.5 h-4.5 -bottom-2.25",
    },
  };

  const current = sizeMap[size] || sizeMap.lg;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none py-6 px-4 ${className}`}>
      {/* 1. Orbit Stage with Circles surrounding the Large Logo */}
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

        {/* Center: Extra-Large Logo Card inside the Orbit Rings */}
        <div
          className={`relative z-10 ${current.logoBox} px-5 sm:px-8 py-4 sm:py-6 rounded-3xl bg-white/95 backdrop-blur-md border border-blue-50 shadow-xl shadow-blue-500/10 flex flex-col items-center justify-center transition-all duration-300`}
        >
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
            className="w-full h-auto object-contain drop-shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}
