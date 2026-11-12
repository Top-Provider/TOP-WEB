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
  const isPageReadyRef = useRef<boolean>(false);
  const currentPathRef = useRef<string>(pathname);

  // Trigger Slide In
  const triggerNavigation = useCallback((href: string) => {
    // Flag navigating attribute on html to hide any background loading.tsx duplicate spinners
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-navigating", "true");
    }
    pendingHrefRef.current = href;
    isPageReadyRef.current = false;
    setStatus("in");
  }, []);

  // Listen for the new page being fully mounted via template.tsx
  useEffect(() => {
    const handlePageReady = () => {
      isPageReadyRef.current = true;

      // If curtain is waiting (slide-in already finished), proceed to slide out!
      setStatus((curr) => {
        if (curr === "waiting") {
          setTimeout(() => {
            setStatus("out");
          }, 150);
          return "waiting";
        }
        return curr;
      });
    };

    window.addEventListener("top-web:page-ready", handlePageReady);
    return () => {
      window.removeEventListener("top-web:page-ready", handlePageReady);
    };
  }, []);

  // Secondary fallback: when pathname changes, record it
  useEffect(() => {
    if (pathname !== currentPathRef.current) {
      currentPathRef.current = pathname;
      // Mark ready if not already marked
      const timer = setTimeout(() => {
        isPageReadyRef.current = true;
        setStatus((curr) => {
          if (curr === "waiting") {
            return "out";
          }
          return curr;
        });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Handle Animation End from browser compositor
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if (e.animationName === "curtainSlideIn") {
      // 1. Slide-in from left is complete! Now execute the route change
      if (pendingHrefRef.current) {
        router.push(pendingHrefRef.current);
      }

      // If the target page is already mounted and ready, slide out after a pleasant beat
      if (isPageReadyRef.current) {
        setTimeout(() => {
          setStatus("out");
        }, 160);
      } else {
        // Wait for template.tsx to fire top-web:page-ready
        setStatus("waiting");
      }
    } else if (e.animationName === "curtainSlideOut") {
      // 2. Slide-out to right is complete! Remove navigating attribute and reset
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-navigating");
      }
      setStatus("idle");
      pendingHrefRef.current = null;
      isPageReadyRef.current = false;
    }
  };

  // Fallback watchdog: if waiting for new page exceeds 2.5s, always slide out
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

        // Same page anchor jump (e.g. #contact)
        if (dest.pathname === curr.pathname && (rawHref.startsWith("#") || rawHref.startsWith("/#") || dest.hash)) {
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

    // Handle browser Back/Forward buttons (popstate)
    const handlePopState = () => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-navigating", "true");
      }
      isPageReadyRef.current = false;
      setStatus("in");
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
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
          animationDuration: "420ms",
          animationTimingFunction:
            status === "in"
              ? "cubic-bezier(0.16, 1, 0.3, 1)"
              : "cubic-bezier(0.4, 0, 0.2, 1)",
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
