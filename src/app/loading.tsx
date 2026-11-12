import React from "react";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <LogoLoader size="lg" label="TOP PROVIDER SYSTEM GROUP" />
    </div>
  );
}

