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
      orbitBox: "w-72 h-72 sm:w-[400px] sm:h-[400px] max-w-[94vw] max-h-[94vw]",
      innerInset: "inset-3 sm:inset-5",
      logoBox: "w-48 sm:w-64",
      dot1: "w-3.5 h-3.5 -top-1.75",
      dot2: "w-3 h-3 -bottom-1.5",
    },
    md: {
      orbitBox: "w-80 h-80 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] max-w-[94vw] max-h-[94vw]",
      innerInset: "inset-4 sm:inset-7 md:inset-9",
      logoBox: "w-56 sm:w-[350px] md:w-[420px]",
      dot1: "w-4.5 h-4.5 -top-2.25",
      dot2: "w-4 h-4 -bottom-2",
    },
    lg: {
      orbitBox: "w-[330px] h-[330px] sm:w-[560px] sm:h-[560px] md:w-[680px] md:h-[680px] lg:w-[740px] lg:h-[740px] max-w-[94vw] max-h-[94vw]",
      innerInset: "inset-4 sm:inset-8 md:inset-11",
      logoBox: "w-[250px] sm:w-[400px] md:w-[480px] lg:w-[520px]",
      dot1: "w-5 h-5 -top-2.5",
      dot2: "w-4.5 h-4.5 -bottom-2.25",
    },
    xl: {
      orbitBox: "w-[350px] h-[350px] sm:w-[620px] sm:h-[620px] md:w-[760px] md:h-[760px] lg:w-[840px] lg:h-[840px] max-w-[94vw] max-h-[94vw]",
      innerInset: "inset-5 sm:inset-10 md:inset-14",
      logoBox: "w-[270px] sm:w-[440px] md:w-[540px] lg:w-[600px]",
      dot1: "w-6 h-6 -top-3",
      dot2: "w-5 h-5 -bottom-2.5",
    },
  };

  const current = sizeMap[size] || sizeMap.lg;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none py-6 px-2 overflow-hidden ${className}`}>
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
