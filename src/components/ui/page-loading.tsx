import React from "react";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

interface PageLoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PageLoading({ size = "lg", className = "" }: PageLoadingProps = {}) {
  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 animate-in fade-in slide-in-from-left duration-350 ${className}`}
    >
      <MedicalCrossLoader size={size} />
    </div>
  );
}

export default PageLoading;

