"use client";

import Script from "next/script";

export function LocatorProvider() {
  // ใช้งานเฉพาะในโหมด Development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/@locator/runtime@0.4.3/dist/download/index.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (
          typeof window !== "undefined" &&
          // @ts-expect-error - setupLocatorUI is provided by CDN
          typeof window.setupLocatorUI === "function"
        ) {
          // @ts-expect-error - setupLocatorUI is provided by CDN
          window.setupLocatorUI();
        }
      }}
    />
  );
}
