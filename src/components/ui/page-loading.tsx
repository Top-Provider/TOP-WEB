import React from "react";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

interface PageLoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PageLoading({ size = "lg", className = "" }: PageLoadingProps = {}) {
  return (
    <div
      className={`fixed inset-0 z-50 h-screen w-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 overflow-hidden select-none ${className}`}
    >
      <MedicalCrossLoader size={size} />
    </div>
  );
}

export default PageLoading;

