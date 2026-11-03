"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: "part-1",
    badge: "ส่วนที่ 1 • Hospital Information System (HIS)",
    subtitle: "ส่วนที่ 1 : ภาพรวมระบบบริหารจัดการโรงพยาบาลครบวงจร",
    embedUrl: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
  },
  {
    id: "part-2",
    badge: "ส่วนที่ 2 • Smart Claim & Audit Automation",
    subtitle: "ส่วนที่ 2 : ระบบตรวจสอบสิทธิและเบิกจ่ายค่ารักษาพยาบาลอัตโนมัติ",
    embedUrl: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
  },
  {
    id: "part-3",
    badge: "ส่วนที่ 3 • Operations & Enterprise Integration",
    subtitle: "ส่วนที่ 3 : กรอบการดำเนินงาน (Hospital Operations Framework)",
    embedUrl: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
  },
  {
    id: "part-4",
    badge: "ส่วนที่ 4 • Real-Time BI & Executive Analytics",
    subtitle: "ส่วนที่ 4 : แดชบอร์ดวิเคราะห์ข้อมูลสถิติสำหรับผู้บริหารแบบ Real-Time",
    embedUrl: "https://www.youtube.com/embed/TNXBrlFZ5ps?autoplay=1&mute=1&playsinline=1&rel=0&start=1",
  },
];

export function HospitalDashboard() {
  const [activeSlide, setActiveSlide] = useState(0);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[activeSlide];

  return (
    <section className="py-12 sm:py-16 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#0066FF] mb-2">
            HOSPITAL INTELLIGENCE • REAL-TIME BI
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
            แดชบอร์ด Hospital Service Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            ระบบวิเคราะห์ข้อมูลสถิติผู้มารับบริการและบริหารจัดการโรงพยาบาลแบบ Real-Time
          </p>
        </div>

        {/* Video Carousel Wrapper */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            aria-label="Previous video slide"
            className="hidden sm:flex absolute -left-4 md:-left-14 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 hover:border-slate-900 shadow-md items-center justify-center text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Main Rounded Video Player Container */}
          <div className="w-full max-w-4xl rounded-[24px] sm:rounded-[32px] bg-slate-950 border border-slate-200/90 shadow-[0_25px_70px_rgba(0,102,255,0.12)] overflow-hidden relative aspect-video">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                {/* Top-Left Live/Part Indicator Overlay */}
                <div className="absolute top-4 left-5 z-10 pointer-events-none flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide">
                    {currentSlide.badge}
                  </span>
                </div>

                {/* YouTube Iframe */}
                <iframe
                  src={currentSlide.embedUrl}
                  title={currentSlide.subtitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next video slide"
            className="hidden sm:flex absolute -right-4 md:-right-14 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 hover:border-slate-900 shadow-md items-center justify-center text-slate-700 hover:text-slate-950 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? "w-7 bg-[#0066FF]" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
