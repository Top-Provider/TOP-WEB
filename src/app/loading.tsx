import React from "react";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <MedicalCrossLoader size="lg" />
    </div>
  );
}

