"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

type TransitionPhase = "idle" | "prepare" | "slide-in" | "slide-out";

export function PageSlideTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const isFirstMount = useRef(true);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSafetyTimeout = () => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  };

  // เมื่อเปลี่ยนหน้าสำเร็จ (pathname เปลี่ยนแปลง) ให้สไลด์ออกไปทางขวา
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (pathname.startsWith("/admin")) {
      setPhase("idle");
      return;
    }

    // หน้าใหม่โหลดเสร็จแล้ว -> สไลด์ออกขวา
    setPhase("slide-out");
    clearSafetyTimeout();

    const exitTimer = setTimeout(() => {
      setPhase("idle");
    }, 450);

    return () => {
      clearTimeout(exitTimer);
      clearSafetyTimeout();
    };
  }, [pathname]);

  // ฟังก์ชันเริ่มสไลด์เข้าจากทางซ้าย
  const triggerSlideIn = useCallback(() => {
    if (pathname.startsWith("/admin")) return;

    clearSafetyTimeout();
    // 1. ตั้งต้นที่ตำแหน่งนอกจอฝั่งซ้าย (-100%)
    setPhase("prepare");

    // 2. ให้เริ่มเคลื่อนที่เข้ามาที่ 0% (ซ้าย -> กลาง)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("slide-in");
      });
    });

    // Safety timeout: ถ้าโหลดนานเกิน 4 วินาที ให้สไลด์ออกอัตโนมัติ ไม่ให้ค้าง
    safetyTimeoutRef.current = setTimeout(() => {
      setPhase("slide-out");
      setTimeout(() => setPhase("idle"), 450);
    }, 4000);
  }, [pathname]);

  // ดักจับการคลิกลิงก์ภายในเว็บทั้งหมดเพื่อเริ่มสไลด์จากซ้าย
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (pathname.startsWith("/admin")) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // ข้ามลิงก์ภายนอก, อีเมล, เบอร์โทร, ลิงก์ที่เปิดแท็บใหม่
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.getAttribute("download") !== null ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }

      // ข้ามลิงก์ Hash ในหน้าเดียวกัน เช่น /#contact, #team
      if (href.startsWith("#") || href.startsWith("/#")) {
        return;
      }

      // ข้ามลิงก์ที่ไปยังหน้าเดิมที่เปิดอยู่แล้ว
      if (href === pathname || href === `${pathname}/`) {
        return;
      }

      // ข้ามลิงก์ฝั่งแอดมิน
      if (href.startsWith("/admin")) {
        return;
      }

      // เป็นการนำทางเปลี่ยนหน้าในฝั่งหน้าบ้าน -> สไลด์เข้าจากซ้ายทันที!
      triggerSlideIn();
    };

    const handlePopState = () => {
      if (!pathname.startsWith("/admin")) {
        triggerSlideIn();
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      clearSafetyTimeout();
    };
  }, [pathname, triggerSlideIn]);

  if (phase === "idle") {
    return null;
  }

  // คำนวณคลาสของ CSS Transition:
  // prepare: อยู่นอกจอฝั่งซ้าย (-translate-x-full) ยังไม่มีแอนิเมชัน
  // slide-in: วิ่งจากซ้ายเข้ามากลางจอ (translate-x-0)
  // slide-out: วิ่งจากกลางจอออกไปทางขวา (translate-x-full)
  let transformClass = "-translate-x-full";
  let transitionClass = "transition-none";

  if (phase === "prepare") {
    transformClass = "-translate-x-full";
    transitionClass = "transition-none";
  } else if (phase === "slide-in") {
    transformClass = "translate-x-0";
    transitionClass = "transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]";
  } else if (phase === "slide-out") {
    transformClass = "translate-x-full";
    transitionClass = "transition-transform duration-450 ease-[cubic-bezier(0.16,1,0.3,1)]";
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] pointer-events-auto bg-[#F8FAFC] flex flex-col items-center justify-center shadow-2xl shadow-blue-950/20 ${transformClass} ${transitionClass}`}
    >
      <MedicalCrossLoader size="lg" />
    </div>
  );
}

