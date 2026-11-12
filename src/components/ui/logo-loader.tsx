"use client";

import React from "react";
import Image from "next/image";

interface LogoLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showLine?: boolean;
}

const SIZE_CONFIGS = {
  sm: { width: 220, height: 62, lineWidth: 110, text: "text-xs" },
  md: { width: 320, height: 90, lineWidth: 150, text: "text-xs" },
  lg: { width: 440, height: 124, lineWidth: 200, text: "text-sm" },
  xl: { width: 540, height: 152, lineWidth: 240, text: "text-sm" },
};

export function LogoLoader({
  className = "",
  size = "md",
  label = "กำลังโหลดข้อมูล...",
  showLine = true,
}: LogoLoaderProps) {
  const current = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  return (
    <div
      className={`top-logo-loader ${className}`}
      style={
        {
          "--loader-width": `${current.width}px`,
          "--loader-height": `${current.height}px`,
        } as React.CSSProperties
      }
    >
      {/* 9 Sliced Perspective Slits with Scrolling 3D Effect */}
      <div className="stage">
        {/* Slice 1: 0% - 11.11% */}
        <div className="slice slice-1">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 2: 11.11% - 22.22% */}
        <div className="slice slice-2">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 3: 22.22% - 33.33% */}
        <div className="slice slice-3">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 4: 33.33% - 44.44% */}
        <div className="slice slice-4">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 5 (Center): 44.44% - 55.55% */}
        <div className="slice slice-5">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 6: 55.55% - 66.66% */}
        <div className="slice slice-6">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 7: 66.66% - 77.77% */}
        <div className="slice slice-7">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 8: 77.77% - 88.88% */}
        <div className="slice slice-8">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>

        {/* Slice 9: 88.88% - 100% */}
        <div className="slice slice-9">
          <img
            src="/images/top-provider-logo.png"
            alt="TOP PROVIDER"
            className="logo-img"
          />
        </div>
      </div>

      {/* Synchronized Wobble Laser Line */}
      {showLine && (
        <div
          className="scan-line"
          style={{ width: `${current.lineWidth}px` }}
        />
      )}

      {/* Optional Label */}
      {label && (
        <p className={`mt-3 font-medium text-slate-500 tracking-wider animate-pulse ${current.text}`}>
          {label}
        </p>
      )}
    </div>
  );
}
