"use client";

import React, { useEffect } from "react";
import { registerRouteLoading } from "@/components/page-slide-transition";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

interface PageLoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  standalone?: boolean;
}

export function PageLoading({
  size = "lg",
  className = "",
  standalone = false,
}: PageLoadingProps = {}) {
  useEffect(() => {
    // แจ้งเตือนไปยัง PageSlideTransition ว่า Route กำลังโหลดข้อมูล (Suspense)
    const unregister = registerRouteLoading();
    return () => {
      // เมื่อ Route โหลดเสร็จและ Suspense unmount ให้แจ้งว่าโหลดเสร็จแล้ว
      unregister();
    };
  }, []);

  // กรณีต้องการเรนเดอร์แบบเดี่ยวๆ ภายใน component ย่อย
  if (standalone) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
        <MedicalCrossLoader size={size} />
      </div>
    );
  }

  // สำหรับการโหลดระดับหน้าเว็บ (Route Suspense):
  // ไม่เรนเดอร์ MedicalCrossLoader ซ้ำซ้อนลงในหน้าจอ เพราะ PageSlideTransition
  // จะทำหน้าที่แสดงหน้ากาก Slide-in / Slide-out พร้อม MedicalCrossLoader เพียงอันเดียวอยู่แล้ว
  // วิธีนี้จะแก้ปัญหา "loading ซ้อนกัน" ได้อย่างสมบูรณ์ 100%
  return null;
}

export default PageLoading;
