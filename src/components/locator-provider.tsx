"use client";

import { useEffect } from "react";

export function LocatorProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    import("@locator/runtime")
      .then((module) => {
        const setupLocatorUI = module.default || module.setup;
        if (typeof setupLocatorUI === "function") {
          setupLocatorUI();
        }
      })
      .catch((err) => {
        console.warn("[LocatorJS] Failed to initialize runtime:", err);
      });
  }, []);

  return null;
}


