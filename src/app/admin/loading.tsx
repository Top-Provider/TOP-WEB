import React from "react";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center p-6">
      <LogoLoader size="sm" label="กำลังโหลดข้อมูลระบบแอดมิน..." />
    </div>
  );
}

