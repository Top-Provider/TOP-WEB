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
      orbitBox: "w-72 h-72 sm:w-84 sm:h-84",
      innerInset: "inset-3 sm:inset-4",
      logoBox: "w-56 sm:w-68",
      dot1: "w-3.5 h-3.5 -top-1.75",
      dot2: "w-3 h-3 -bottom-1.5",
    },
    md: {
      orbitBox: "w-80 h-80 sm:w-[440px] sm:h-[440px] md:w-[500px] md:h-[500px]",
      innerInset: "inset-4 sm:inset-6",
      logoBox: "w-64 sm:w-[380px] md:w-[440px]",
      dot1: "w-4 h-4 -top-2",
      dot2: "w-3.5 h-3.5 -bottom-1.75",
    },
    lg: {
      orbitBox: "w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[580px] md:h-[580px]",
      innerInset: "inset-5 sm:inset-8 md:inset-10",
      logoBox: "w-[280px] sm:w-[430px] md:w-[510px]",
      dot1: "w-5 h-5 -top-2.5",
      dot2: "w-4.5 h-4.5 -bottom-2.25",
    },
    xl: {
      orbitBox: "w-[360px] h-[360px] sm:w-[560px] sm:h-[560px] md:w-[660px] md:h-[660px]",
      innerInset: "inset-6 sm:inset-10 md:inset-12",
      logoBox: "w-[300px] sm:w-[490px] md:w-[580px]",
      dot1: "w-6 h-6 -top-3",
      dot2: "w-5 h-5 -bottom-2.5",
    },
  };

  const current = sizeMap[size] || sizeMap.lg;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none py-6 px-4 ${className}`}>
      {/* 1. Orbit Stage with Circles surrounding the Extra-Large Logo */}
      <div className={`relative ${current.orbitBox} flex items-center justify-center`}>
        {/* Soft Ambient Radial Glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-blue-500/10 via-sky-400/10 to-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

        {/* Outer Orbit Track */}
        <div className="absolute inset-0 rounded-full border border-blue-100/90" />

        {/* Outer Orbit Rotating Ring with Golden Satellite Bead */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] border-r-blue-400/50 animate-[spin_4s_linear_infinite]">
          {/* Golden / Amber Bead traveling along outer orbit */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot1} rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B] shadow-[0_0_16px_#F59E0B] ring-2 ring-white`}
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
            className={`absolute left-1/2 -translate-x-1/2 ${current.dot2} rounded-full bg-gradient-to-r from-blue-400 to-[#0066FF] shadow-[0_0_14px_#0066FF] ring-2 ring-white`}
          />
        </div>

        {/* Center: Extra-Large Logo Card inside the Orbit Rings */}
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
