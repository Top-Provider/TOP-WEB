"use client";

import React from "react";
import Image from "next/image";

interface MedicalCrossLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  showLogo?: boolean;
  logoSize?: "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  className?: string;
}

export function MedicalCrossLoader({
  size = "md",
  showLogo = true,
  logoSize = "lg",
  text = "กำลังโหลดข้อมูล...",
  subtext = "TOP PROVIDER SYSTEM GROUP CO., LTD.",
  className = "",
}: MedicalCrossLoaderProps) {
  const orbitSizes = {
    sm: { container: "w-20 h-20", centerBox: "w-10 h-10", dot1: "w-2 h-2", dot2: "w-1.5 h-1.5" },
    md: { container: "w-28 h-28", centerBox: "w-14 h-14", dot1: "w-2.5 h-2.5", dot2: "w-2 h-2" },
    lg: { container: "w-32 h-32", centerBox: "w-16 h-16", dot1: "w-3 h-3", dot2: "w-2.5 h-2.5" },
    xl: { container: "w-40 h-40", centerBox: "w-20 h-20", dot1: "w-3.5 h-3.5", dot2: "w-3 h-3" },
  };

  const logoSizes = {
    sm: "w-48 sm:w-56",
    md: "w-60 sm:w-72",
    lg: "w-72 sm:w-88 md:w-96",
    xl: "w-80 sm:w-96 md:w-[440px]",
  };

  const currentOrbit = orbitSizes[size] || orbitSizes.md;
  const currentLogo = logoSizes[logoSize] || logoSizes.lg;

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none py-4 px-2 ${className}`}>
      {/* 1. Medical Cross & Orbit Ring (วงแหวนสถานะหมุนวน) */}
      <div className={`relative ${currentOrbit.container} flex items-center justify-center my-2`}>
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl pointer-events-none animate-pulse" />

        {/* Outer Orbit Track */}
        <div className="absolute inset-0 rounded-full border border-blue-100/90" />

        {/* Outer Orbit Rotating Ring with Golden Bead */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] border-r-blue-400/50 animate-[spin_3s_linear_infinite]">
          {/* Orbiting Satellite Bead 1 (Amber / Gold from Logo) */}
          <span
            className={`absolute -top-1.5 left-1/2 -translate-x-1/2 ${currentOrbit.dot1} rounded-full bg-gradient-to-r from-amber-400 to-[#F59E0B] shadow-[0_0_12px_#F59E0B] ring-2 ring-white`}
          />
        </div>

        {/* Inner Orbit Track */}
        <div className="absolute inset-3 rounded-full border border-slate-100" />

        {/* Inner Orbit Reverse Rotating Ring with Blue Bead */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-[#F59E0B] border-l-amber-300/40 animate-[spin_2.2s_linear_infinite_reverse]">
          {/* Orbiting Satellite Bead 2 (Medical Blue from Logo) */}
          <span
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${currentOrbit.dot2} rounded-full bg-gradient-to-r from-blue-400 to-[#0066FF] shadow-[0_0_10px_#0066FF] ring-2 ring-white`}
          />
        </div>

        {/* Central Medical Cross Shield */}
        <div
          className={`relative z-10 ${currentOrbit.centerBox} rounded-2xl bg-white/95 backdrop-blur-md shadow-lg shadow-blue-500/10 border border-blue-100/90 flex items-center justify-center p-2 sm:p-2.5 transition-transform duration-300`}
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

            {/* Medical Cross Body */}
            <rect x="36" y="12" width="28" height="76" rx="8" fill="url(#medCrossBlue)" />
            <rect x="12" y="36" width="76" height="28" rx="8" fill="url(#medCrossBlue)" />

            {/* Inner Depth Glaze */}
            <rect x="39" y="15" width="22" height="70" rx="5" fill="white" opacity="0.16" />
            <rect x="15" y="39" width="70" height="22" rx="5" fill="white" opacity="0.16" />

            {/* Top Provider Dynamic Ribbon Wave */}
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

      {/* 2. Large Official Logo (โลโก้ TOP PROVIDER อันใหญ่ คมชัด) */}
      {showLogo && (
        <div className={`relative ${currentLogo} max-w-[92vw] my-3 px-2 flex items-center justify-center transition-all duration-300`}>
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
            className="w-full h-auto object-contain drop-shadow-sm"
          />
        </div>
      )}

      {/* 3. Text Info & Heartbeat Pulse Indicator */}
      {(text || subtext) && (
        <div className="mt-2 space-y-1.5 max-w-md mx-auto">
          {text && (
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
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
