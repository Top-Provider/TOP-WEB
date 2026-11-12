"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Notify the transition curtain that the new page component is mounted and rendered
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("top-web:page-ready", {
          detail: { pathname },
        })
      );
    }
  }, [pathname]);

  return <>{children}</>;
}

