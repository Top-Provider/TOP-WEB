"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroShowcase() {
  return (
    <section id="overview" className="relative pt-6 pb-12 sm:pt-8 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-2xl sm:rounded-[36px] overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/50 bg-white"
        >
          <Image
            src="/images/3.Solution_Software-scaled.jpg"
            alt="Top Provider System Group - Panacea Plus Hospital Solution (PPHS)"
            width={2560}
            height={1490}
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="w-full h-auto object-contain block"
          />
        </motion.div>
      </div>
    </section>
  );
}
