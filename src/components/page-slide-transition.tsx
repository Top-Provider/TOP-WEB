"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

export function PageSlideTransition() {
  const pathname = usePathname();
  const router = useRouter();

  // สถานะการแสดงผล:
  // active: แสดง Overlay ใน DOM
  // position: 'left' (-100%) | 'center' (0%) | 'right' (100%)
  const [active, setActive] = useState(true);
  const [position, setPosition] = useState<"left" | "center" | "right">("center");
  const isNavigating = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. ตอนโหลดหน้าเว็บครั้งแรก หรือตอนกด Refresh (F5):
  // เริ่มต้นอยู่ที่กลางจอ (center) แล้วสไลด์ออกไปทางขวา (right)
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setActive(false);
      return;
    }

    const initialTimer = setTimeout(() => {
      setPosition("right");
      setTimeout(() => {
        setActive(false);
        setPosition("left"); // รีเซ็ตไปฝั่งซ้าย เตรียมสำหรับคลิกครั้งถัดไป
      }, 550);
    }, 450);

    return () => clearTimeout(initialTimer);
  }, []);

  // 2. เมื่อหน้าใหม่โหลดเสร็จแล้ว (pathname เปลี่ยนแปลง):
  // สั่งให้สไลด์ออกไปทางขวา (right) เพื่อเปิดเผยหน้าใหม่
  useEffect(() => {
    if (!isNavigating.current) return;

    if (pathname.startsWith("/admin")) {
      setActive(false);
      isNavigating.current = false;
      return;
    }

    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    // หน้าใหม่พร้อมแล้ว ให้สไลด์ออกขวาอย่างนุ่มนวล
    const exitTimer = setTimeout(() => {
      setPosition("right");
      setTimeout(() => {
        setActive(false);
        setPosition("left");
        isNavigating.current = false;
      }, 550);
    }, 200);

    return () => clearTimeout(exitTimer);
  }, [pathname]);

  // 3. ดักจับการคลิกลิงก์เพื่อสไลด์เข้าจากทางซ้าย (left -> center) แล้วจึงนำทางไปหน้าใหม่
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (pathname.startsWith("/admin") || isNavigating.current) return;

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

      // ป้องกันการเปลี่ยนหน้าแบบกะทันหัน เพื่อให้แอนิเมชันสไลด์จากซ้ายเล่นได้อย่างสมบูรณ์
      e.preventDefault();
      isNavigating.current = true;

      // ตั้งต้นที่ฝั่งซ้ายและเปิดใช้งาน Overlay
      setPosition("left");
      setActive(true);

      // สไลด์จากซ้ายเข้ามากลางจอ
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPosition("center");
        });
      });

      // เมื่อสไลด์เข้ามาปิดหน้าจอเรียบร้อยแล้ว (~380ms) จึงสั่งให้เปลี่ยนหน้า
      setTimeout(() => {
        router.push(href);
      }, 380);

      // Safety timeout: เผื่อหน้าเว็บค้างเกิน 4 วินาที ให้สไลด์ออกขวาอัตโนมัติ
      safetyTimeoutRef.current = setTimeout(() => {
        setPosition("right");
        setTimeout(() => {
          setActive(false);
          setPosition("left");
          isNavigating.current = false;
        }, 550);
      }, 4000);
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, [pathname, router]);

  if (!active) return null;

  let transformClass = "-translate-x-full";
  if (position === "center") {
    transformClass = "translate-x-0";
  } else if (position === "right") {
    transformClass = "translate-x-full";
  }

  return (
    <div
      aria-hidden="true"
      style={{ willChange: "transform" }}
      className={`fixed inset-0 z-[99999] pointer-events-auto bg-[#F8FAFC] flex flex-col items-center justify-center shadow-2xl shadow-blue-950/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${transformClass}`}
    >
      <MedicalCrossLoader size="lg" />
    </div>
  );
}
