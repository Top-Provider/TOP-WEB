"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MedicalCrossLoader } from "@/components/ui/medical-cross-loader";

type CurtainState = "idle" | "entering" | "covered" | "exiting";

export function PageTransitionCurtain() {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<CurtainState>("idle");
  const pendingHref = useRef<string | null>(null);
  const targetPath = useRef<string | null>(null);
  const isNavigating = useRef<boolean>(false);
  const transitionStartRef = useRef<number>(0);

  // Trigger Slide-In from Left
  const triggerNavigation = useCallback((href: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    pendingHref.current = href;
    targetPath.current = href.split("?")[0].split("#")[0];
    transitionStartRef.current = Date.now();

    // 1. Start sliding in from the left to 0
    setState("entering");
  }, []);

  // When state changes to 'entering', after 380ms (slide-in complete), execute navigation
  useEffect(() => {
    if (state === "entering") {
      const enterTimer = setTimeout(() => {
        setState("covered");
        if (pendingHref.current) {
          router.push(pendingHref.current);
        }
      }, 380);

      return () => clearTimeout(enterTimer);
    }
  }, [state, router]);

  // When pathname changes, new page is rendered! Start sliding out to right
  useEffect(() => {
    if (isNavigating.current && (state === "covered" || state === "entering")) {
      const elapsed = Date.now() - transitionStartRef.current;
      const minDisplayTime = 420; // Ensure user clearly sees the logo and slide-in
      const delay = Math.max(80, minDisplayTime - elapsed);

      const exitTimer = setTimeout(() => {
        setState("exiting");
      }, delay);

      return () => clearTimeout(exitTimer);
    }
  }, [pathname, state]);

  // When exiting, after 400ms, reset back to idle offscreen left
  useEffect(() => {
    if (state === "exiting") {
      const finishTimer = setTimeout(() => {
        setState("idle");
        isNavigating.current = false;
        pendingHref.current = null;
        targetPath.current = null;
      }, 420);

      return () => clearTimeout(finishTimer);
    }
  }, [state]);

  // Intercept internal link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      // Ignore external, target blank, modified keys, mailto, tel, downloads
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

      // Check URL destination
      try {
        const dest = new URL(anchor.href, window.location.href);
        const curr = new URL(window.location.href);

        // Same page anchor jump (e.g. /#team or /#contact or #overview)
        if (dest.pathname === curr.pathname && (rawHref.startsWith("#") || rawHref.startsWith("/#"))) {
          return;
        }

        // Only transition if path or search differs
        if (dest.pathname === curr.pathname && dest.search === curr.search) {
          return;
        }

        // Prevent instant page jump so the slide animation plays!
        e.preventDefault();
        e.stopPropagation();

        triggerNavigation(rawHref);
      } catch {
        // Fallback for invalid URLs
      }
    };

    // Also handle browser Back/Forward buttons (popstate)
    const handlePopState = () => {
      setState("entering");
      setTimeout(() => {
        setState("exiting");
      }, 350);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
    };
  }, [triggerNavigation]);

  // Inline transform styles for buttery-smooth performance
  const getTransformStyle = (): React.CSSProperties => {
    switch (state) {
      case "entering":
        return {
          transform: "translate3d(0, 0, 0)",
          transition: "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: "auto",
        };
      case "covered":
        return {
          transform: "translate3d(0, 0, 0)",
          transition: "none",
          pointerEvents: "auto",
        };
      case "exiting":
        return {
          transform: "translate3d(100%, 0, 0)",
          transition: "transform 400ms cubic-bezier(0.5, 0, 0.75, 0)",
          pointerEvents: "auto",
        };
      case "idle":
      default:
        return {
          transform: "translate3d(-100%, 0, 0)",
          transition: "none",
          pointerEvents: "none",
        };
    }
  };

  return (
    <aside
      aria-hidden={state === "idle"}
      style={getTransformStyle()}
      className="fixed inset-0 z-[999999] bg-[#F8FAFC] flex flex-col items-center justify-center select-none shadow-[25px_0_60px_rgba(0,98,255,0.18)] will-change-transform"
    >
      {/* Soft Ambient Radial Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 via-[#F8FAFC] to-blue-100/40 pointer-events-none" />

      {/* Trailing and Leading Edge Glowing Accent Bars */}
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-[#0062FF] to-amber-400 shadow-[0_0_15px_rgba(0,98,255,0.5)]" />
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-[#0062FF] to-amber-400" />

      {/* Centered Grand TOP PROVIDER Orbital Loader */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <MedicalCrossLoader size="lg" />
      </div>
    </aside>
  );
}

export default PageTransitionCurtain;
