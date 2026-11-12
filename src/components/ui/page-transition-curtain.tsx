"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

type AnimStatus = "idle" | "in" | "waiting" | "out";

export function PageTransitionCurtain() {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<AnimStatus>("idle");
  const pendingHrefRef = useRef<string | null>(null);
  const routeLoadedRef = useRef<boolean>(false);
  const currentPathRef = useRef<string>(pathname);

  // Trigger Slide In
  const triggerNavigation = useCallback((href: string) => {
    pendingHrefRef.current = href;
    routeLoadedRef.current = false;
    setStatus("in");
  }, []);

  // When pathname changes, mark route as loaded
  useEffect(() => {
    if (status !== "idle" && pathname !== currentPathRef.current) {
      currentPathRef.current = pathname;
      routeLoadedRef.current = true;

      // If we are currently waiting (slide-in already finished), trigger slide-out immediately!
      if (status === "waiting") {
        const timer = setTimeout(() => {
          setStatus("out");
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, status]);

  // Handle Animation End from browser compositor
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (e.animationName === "curtainSlideIn") {
      // 1. Slide-in from left is complete! Execute the route change
      if (pendingHrefRef.current) {
        router.push(pendingHrefRef.current);
      }

      // Check if the new page has already arrived
      if (routeLoadedRef.current) {
        // Wait a small beat so user sees the logo, then slide out!
        setTimeout(() => {
          setStatus("out");
        }, 180);
      } else {
        // Wait for pathname to change
        setStatus("waiting");
      }
    } else if (e.animationName === "curtainSlideOut") {
      // 2. Slide-out to right is complete! Reset to idle
      setStatus("idle");
      pendingHrefRef.current = null;
      routeLoadedRef.current = false;
    }
  };

  // Fallback watchdog: if a route change takes too long or fails, always slide out after 2.5s
  useEffect(() => {
    if (status === "waiting") {
      const timeout = setTimeout(() => {
        setStatus("out");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  // Intercept click on internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        rawHref.startsWith("http://") ||
        rawHref.startsWith("https://") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.shiftKey
      ) {
        return;
      }

      try {
        const dest = new URL(anchor.href, window.location.href);
        const curr = new URL(window.location.href);

        // Same page anchor jump
        if (dest.pathname === curr.pathname && (rawHref.startsWith("#") || rawHref.startsWith("/#"))) {
          return;
        }

        // Same URL
        if (dest.pathname === curr.pathname && dest.search === curr.search) {
          return;
        }

        // Prevent instant page swap so slide-in from left plays!
        e.preventDefault();
        e.stopPropagation();

        triggerNavigation(rawHref);
      } catch {
        // Fallback
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [triggerNavigation]);

  if (status === "idle") return null;

  return (
    <>
      <style jsx global>{`
        @keyframes curtainSlideIn {
          0% {
            transform: translate3d(-100%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes curtainSlideOut {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(100%, 0, 0);
          }
        }
      `}</style>
      <div
        onAnimationEnd={handleAnimationEnd}
        style={{
          animationName:
            status === "in"
              ? "curtainSlideIn"
              : status === "out"
              ? "curtainSlideOut"
              : "none",
          animationDuration: "450ms",
          animationTimingFunction:
            status === "in"
              ? "cubic-bezier(0.16, 1, 0.3, 1)"
              : "cubic-bezier(0.5, 0, 0.75, 0)",
          animationFillMode: "forwards",
          transform: status === "waiting" ? "translate3d(0, 0, 0)" : undefined,
        }}
        className="fixed inset-0 z-[999999] bg-[#F8FAFC] flex flex-col items-center justify-center select-none shadow-[25px_0_70px_rgba(0,98,255,0.2)] will-change-transform pointer-events-auto"
      >
        {/* Soft Ambient Radial Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 via-[#F8FAFC] to-blue-100/40 pointer-events-none" />

        {/* Trailing and Leading Edge Glowing Accent Bars */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-blue-400 via-[#0062FF] to-amber-400 shadow-[0_0_20px_rgba(0,98,255,0.6)]" />
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-blue-400 via-[#0062FF] to-amber-400 shadow-[0_0_20px_rgba(0,98,255,0.6)]" />

        {/* Centered Grand TOP PROVIDER Orbital Loader */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <MedicalCrossLoader size="lg" />
        </div>
      </div>
    </>
  );
}

export default PageTransitionCurtain;
