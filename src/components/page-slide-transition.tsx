"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

// --- Global Route Loading Pub-Sub Manager ---
// ช่วยประสานงานระหว่าง Next.js Suspense (loading.tsx) กับ PageSlideTransition
// เพื่อให้หน้าจอแสดงผล Loader เพียงอันเดียวเสมอ (ไม่มี loading ซ้อนกัน)
let activeLoadersCount = 0;
const listeners = new Set<(isLoading: boolean) => void>();

export function registerRouteLoading() {
  activeLoadersCount++;
  listeners.forEach((cb) => cb(activeLoadersCount > 0));
  return () => {
    activeLoadersCount = Math.max(0, activeLoadersCount - 1);
    listeners.forEach((cb) => cb(activeLoadersCount > 0));
  };
}

export function getActiveLoadersCount() {
  return activeLoadersCount;
}

export function subscribeRouteLoading(cb: (isLoading: boolean) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function PageSlideTransition() {
  const pathname = usePathname();
  const router = useRouter();

  // สถานะการแสดงผล:
  // active: แสดง Overlay ใน DOM
  // position: 'left' (-100%) | 'center' (0%) | 'right' (100%)
  const [active, setActive] = useState(true);
  const [position, setPosition] = useState<"left" | "center" | "right">("center");

  const isNavigatingRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSuspendedRef = useRef(false);

  // ฟังก์ชันสั่งสไลด์ออกไปทางขวาอย่างนุ่มนวล
  const triggerSlideOut = useCallback(() => {
    if (exitAnimationTimeoutRef.current) {
      clearTimeout(exitAnimationTimeoutRef.current);
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    setPosition("right");
    exitAnimationTimeoutRef.current = setTimeout(() => {
      setActive(false);
      setPosition("left"); // รีเซ็ตไปฝั่งซ้าย เตรียมพร้อมสำหรับการคลิกครั้งต่อไป
      isNavigatingRef.current = false;
    }, 550);
  }, []);

  // 1. ตอนเปิดเว็บครั้งแรก หรือกดรีเฟรช (F5):
  // หน้าจอเริ่มที่ center แล้วรอให้หน้าพร้อม จากนั้นสไลด์ออกขวา
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setActive(false);
      return;
    }

    // รอให้หน้าเว็บแสดงตัวอย่างน้อย 400ms เพื่อความสมูท
    const initialTimer = setTimeout(() => {
      // ถ้าไม่มี Suspense ค้างอยู่ ให้สไลด์ออกขวาได้เลย
      if (activeLoadersCount === 0) {
        triggerSlideOut();
      }
    }, 450);

    return () => clearTimeout(initialTimer);
  }, [pathname, triggerSlideOut]);

  // 2. ติดตามสถานะ Suspense จาก loading.tsx ทั่วทั้งระบบ
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const unsubscribe = subscribeRouteLoading((isLoading) => {
      isSuspendedRef.current = isLoading;
      if (isLoading) {
        // เมื่อมีหน้ากำลัง Suspense ให้แสดงหน้า Transition ที่กึ่งกลาง
        setActive(true);
        setPosition("center");
      } else {
        // เมื่อหน้าโหลดเสร็จสมบูรณ์ ให้สไลด์ออกขวา
        setTimeout(() => {
          triggerSlideOut();
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [pathname, triggerSlideOut]);

  // 3. เมื่อ pathname เปลี่ยน (กรณีไม่ได้ติด Suspense หรือเป็น Static Route)
  useEffect(() => {
    if (!isNavigatingRef.current) return;
    if (pathname.startsWith("/admin")) {
      setActive(false);
      isNavigatingRef.current = false;
      return;
    }

    // ถ้าไม่มี Suspense ค้างอยู่ ให้สไลด์ออกได้เลย
    const timer = setTimeout(() => {
      if (!isSuspendedRef.current && activeLoadersCount === 0) {
        triggerSlideOut();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, triggerSlideOut]);

  // 4. ดักจับการคลิกลิงก์เพื่อสไลด์เข้าจากซ้าย (left -> center)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (pathname.startsWith("/admin") || isNavigatingRef.current) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // ข้ามลิงก์ภายนอก, อีเมล, เบอร์โทร, เปิดแท็บใหม่
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
      if (href.startsWith("#") || href.startsWith("/#")) return;

      // ข้ามลิงก์ที่ไปยังหน้าเดิมที่เปิดอยู่แล้ว
      if (href === pathname || href === `${pathname}/`) return;

      // ข้ามลิงก์ฝั่งแอดมิน
      if (href.startsWith("/admin")) return;

      // ป้องกันการโหลดหน้าทันที เพื่อให้แอนิเมชันสไลด์เข้าจากซ้ายทำงานก่อน
      e.preventDefault();
      isNavigatingRef.current = true;

      // ตั้งต้นที่ฝั่งซ้ายและเปิดใช้งาน Overlay
      setPosition("left");
      setActive(true);

      // สไลด์จากซ้ายเข้ามากลางจอ
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPosition("center");
        });
      });

      // เมื่อสไลด์เข้ามาปิดหน้าจอเรียบร้อยแล้ว (~360ms) จึงสั่งเปลี่ยนหน้า
      setTimeout(() => {
        router.push(href);
      }, 360);

      // Safety timeout: เผื่อเกิดข้อผิดพลาดหรือเน็ตช้าเกิน 4.5 วินาที ให้สไลด์ออกขวาอัตโนมัติ
      safetyTimeoutRef.current = setTimeout(() => {
        triggerSlideOut();
      }, 4500);
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      if (exitAnimationTimeoutRef.current) clearTimeout(exitAnimationTimeoutRef.current);
    };
  }, [pathname, router, triggerSlideOut]);

  if (!active) return null;

  let transformClass = "-translate-x-full pointer-events-none";
  if (position === "center") {
    transformClass = "translate-x-0 pointer-events-auto";
  } else if (position === "right") {
    transformClass = "translate-x-full pointer-events-none";
  }

  return (
    <div
      aria-hidden="true"
      style={{ willChange: "transform" }}
      className={`fixed inset-0 z-[99999] bg-[#F8FAFC] flex flex-col items-center justify-center shadow-2xl shadow-blue-950/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${transformClass}`}
    >
      <MedicalCrossLoader size="lg" />
    </div>
  );
}
