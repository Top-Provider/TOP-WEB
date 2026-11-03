"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, CheckCircle2 } from "lucide-react";

export function AboutSection() {
  return (
    <section id="capabilities" className="py-16 sm:py-24 bg-white">
      <div className="w-[92%] max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#0066FF]">
                ABOUT US
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-[#0066FF] border border-blue-200/70">
                OUR COMPANY
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="block text-[#0066FF]">TOP PROVIDER</span>
              <span className="block text-[#F59E0B]">
                SYSTEM GROUP <span className="text-red-500">.</span>
              </span>
            </h2>
          </div>

          <p className="max-w-lg text-slate-600 text-xs sm:text-sm leading-relaxed">
            บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด ผู้นำด้านการพัฒนาซอฟต์แวร์ระบบบริหารจัดการโรงพยาบาล (HIS)
            และจัดจำหน่ายอุปกรณ์ไอที ฮาร์ดแวร์ ระบบเครือข่าย และเครื่องมือแพทย์แบบครบวงจร
            มุ่งมั่นยกระดับสถานพยาบาลสู่ Smart Hospital อย่างสมบูรณ์แบบ
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Large Photographic Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/50 group bg-slate-900"
          >
            <Image
              src="/images/office_hq.jpg"
              alt="TOP PROVIDER SYSTEM GROUP CO., LTD. Headquarters"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#0066FF] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                HEADQUARTERS • BANGKOK
              </span>
              <h3 className="text-base sm:text-lg font-extrabold tracking-wide text-white">
                TOP PROVIDER SYSTEM GROUP CO., LTD.
              </h3>
              <p className="text-xs text-slate-300">
                สำนักงานใหญ่ พร้อมศูนย์บริการและทีมวิศวกรดูแลทั่วประเทศ
              </p>
            </div>
          </motion.div>

          {/* Right Dual Stack Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Card 1: High-Trust Collaboration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#0066FF] mb-4 shadow-2xs">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                High-Trust Collaboration
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                ทำงานร่วมกับบุคลากรทางการแพทย์และฝ่ายไอทีของโรงพยาบาลอย่างใกล้ชิด
                ออกแบบและพัฒนาระบบให้ตอบโจทย์การทำงานจริงในทุกแผนกอย่างราบรื่น
              </p>
            </motion.div>

            {/* Card 2: Production-Grade Delivery */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 bg-[#0066FF] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/25 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                Production-Grade Delivery
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-blue-50 leading-relaxed">
                ส่งมอบระบบคุณภาพระดับ Enterprise ที่มีความเสถียรและปลอดภัยสูงสุด
                รองรับมาตรฐาน HA และ PDPA พร้อมทีมดูแลบำรุงรักษาแบบครบวงจร
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
