"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type SolutionTabId = "printing" | "hardware" | "software" | "network";

interface SolutionTab {
  id: string;
  label: string;
  href: string;
}

const DEFAULT_SOLUTION_TABS: SolutionTab[] = [
  { id: "printing", label: "Printing & Supply Solution", href: "/solutions/printing" },
  { id: "hardware", label: "Hardware Solution", href: "/solutions/hardware" },
  { id: "software", label: "Software Solution", href: "/solutions/software" },
  { id: "network", label: "Network Solution", href: "/solutions/network" },
];

function isTabActive(rawId: string, activeId: SolutionTabId): boolean {
  if (activeId === "hardware") return rawId === "hardware" || rawId.includes("hard");
  if (activeId === "software") return rawId === "software" || rawId.includes("software");
  if (activeId === "printing") return rawId === "printing" || rawId.includes("print");
  if (activeId === "network") return rawId === "network" || rawId.includes("network");
  return rawId === activeId;
}

export function SolutionCategoryTabs({ activeId }: { activeId: SolutionTabId }) {
  const [tabs, setTabs] = useState<SolutionTab[]>(DEFAULT_SOLUTION_TABS);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.categories) && json.categories.length > 0) {
          const dynamicTabs = json.categories
            .filter((c: { is_active?: boolean }) => c.is_active !== false)
            .map((c: { category_id: string; name: string }) => {
              const rawId = (c.category_id || "").toLowerCase();
              let href = "/#case-studies";
              if (rawId === "printing" || rawId.includes("print")) href = "/solutions/printing";
              else if (rawId === "software" || rawId.includes("software")) href = "/solutions/software";
              else if (rawId === "network" || rawId.includes("network")) href = "/solutions/network";
              else if (rawId === "hardware" || rawId.includes("hard")) href = "/solutions/hardware";

              return {
                id: rawId,
                label: c.name || c.category_id,
                href,
              };
            });
          if (dynamicTabs.length > 0) setTabs(dynamicTabs);
        }
      })
      .catch((err) => console.log("Category tabs API fallback:", err));
  }, []);

  return (
    <div className="w-full pt-4 pb-2">
      <div className="w-[94%] max-w-[1720px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const isActive = isTabActive(tab.id, activeId);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={true}
                className={`shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#0062FF] text-white shadow-sm shadow-blue-600/30 font-semibold border border-[#0062FF]"
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
