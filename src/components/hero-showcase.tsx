"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroShowcase() {
  return (
    <section id="overview" className="relative pt-2 pb-6 sm:pt-3 sm:pb-8 flex items-center justify-center overflow-hidden">
      <div className="w-[94%] max-w-[2200px] mx-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          suppressHydrationWarning
          className="relative w-fit max-w-full rounded-2xl sm:rounded-[36px] overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/50 bg-white flex items-center justify-center"
        >
          <Image
            src="/images/3.Solution_Software-scaled.jpg"
            alt="Top Provider System Group - Panacea Plus Hospital Solution (PPHS)"
            width={2560}
            height={1490}
            priority
            sizes="(max-width: 2200px) 100vw, 2200px"
            className="w-auto h-auto max-w-full max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-130px)] object-contain block"
          />
        </motion.div>
      </div>
    </section>
  );
}
