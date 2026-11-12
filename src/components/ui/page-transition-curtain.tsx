"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

type CurtainPhase = "idle" | "entering" | "active" | "exiting";

export function PageTransitionCurtain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<CurtainPhase>("idle");

  const enterStartTime = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const currentPathRef = useRef<string>(pathname);

  // Trigger Slide-In from Left
  const startTransition = useCallback(() => {
    enterStartTime.current = Date.now();
    isNavigating.current = true;
    setPhase("entering");
  }, []);

  // Trigger Slide-Out to Right
  const finishTransition = useCallback(() => {
    const elapsed = Date.now() - enterStartTime.current;
    const minDisplayTime = 380; // Ensure slide-in completes smoothly
    const remainingTime = Math.max(0, minDisplayTime - elapsed);

    const timer = setTimeout(() => {
      setPhase("exiting");
    }, remainingTime);

    return () => clearTimeout(timer);
  }, []);

  // Listen to clicks on internal <a> links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, target blank, modified keys, download, mailto, tel, hash-only
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      // Check if target is a different route
      const targetUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      // Same page anchor jump (e.g. /#team or /#capabilities)
      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search
      ) {
        return;
      }

      // Trigger the slide-in curtain
      startTransition();
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [startTransition]);

  // When pathname or searchParams change, the new page has arrived!
  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      currentPathRef.current = pathname;
      finishTransition();
    }
  }, [pathname, searchParams, finishTransition]);

  // Handle animation phase resets
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (phase === "entering") {
      setPhase("active");
    } else if (phase === "exiting") {
      // Finished sliding out to the right -> instantly reset to idle offscreen left
      setPhase("idle");
    }
  };

  // Determine inline styles for each animation phase
  const getCurtainStyle = (): React.CSSProperties => {
    switch (phase) {
      case "entering":
        return {
          transform: "translateX(0)",
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "auto",
        };
      case "active":
        return {
          transform: "translateX(0)",
          transition: "none",
          pointerEvents: "auto",
        };
      case "exiting":
        return {
          transform: "translateX(100%)",
          transition: "transform 420ms cubic-bezier(0.5, 0, 0.75, 0)",
          pointerEvents: "auto",
        };
      case "idle":
      default:
        return {
          transform: "translateX(-100%)",
          transition: "none",
          pointerEvents: "none",
        };
    }
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={getCurtainStyle()}
      className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col items-center justify-center select-none shadow-[25px_0_70px_rgba(0,98,255,0.14)] will-change-transform"
      aria-hidden={phase === "idle"}
    >
      {/* Soft Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-[#F8FAFC] to-blue-50/60 pointer-events-none" />

      {/* Decorative vertical trailing edge bar on slide-in/out */}
      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500/20 via-[#0062FF] to-blue-500/20" />
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500/20 via-[#0062FF] to-blue-500/20" />

      {/* Centered TOP PROVIDER Orbital Loader */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <MedicalCrossLoader size="lg" />
      </div>
    </div>
  );
}

export default PageTransitionCurtain;
