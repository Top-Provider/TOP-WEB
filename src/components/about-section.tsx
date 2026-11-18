"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";

export function AboutSection() {
  return (
    <section id="capabilities" className="py-16 sm:py-24 bg-white">
      <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-slate-500">
                ABOUT US
              </span>
              <span className="w-8 h-px bg-slate-300" />
              <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0066FF] border border-blue-200/70">
                Company
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.15]">
              <span className="block text-[#0066FF]">TOP PROVIDER</span>
              <span className="block text-[#F59E0B]">
                SYSTEM GROUP .
              </span>
            </h2>
          </div>

          <p className="max-w-lg text-slate-600 text-xs sm:text-sm leading-relaxed">
            TOP PROVIDER SYSTEM GROUP CO., LTD.
            <br />
            (บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด)
            <br />
            ผู้นำด้านเทคโนโลยี โซลูชันระบบ และการพัฒนาซอฟต์แวร์ระดับองค์กร
            <br />
            เพื่อขับเคลื่อนประสิทธิภาพและความเติบโตอย่างยั่งยืน
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
            suppressHydrationWarning
            className="lg:col-span-7 relative min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/50 group bg-slate-100"
          >
            <Image
              src="/images/office-hq-new.jpg"
              alt="TOP PROVIDER SYSTEM GROUP CO., LTD. Headquarters"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>

          {/* Right Dual Stack Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              suppressHydrationWarning
              className="flex-1 bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#0066FF] mb-4 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                พันธกิจด้านการบริการและพันธมิตร
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                มุ่งมั่นส่งมอบบริการที่ปรึกษา วางแผน และดูแลรักษาระบบด้วยทีมงานมืออาชีพที่มีประสบการณ์กว่า 10 ปี เพื่อแก้ไขปัญหาอย่างรวดเร็วและช่วยให้บุคลากรทางการแพทย์ทำงานได้อย่างราบรื่นที่สุด
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              suppressHydrationWarning
              className="flex-1 bg-[#0066FF] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/25 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                พันธกิจด้านนวัตกรรมและมาตรฐานระบบ
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-blue-50 leading-relaxed">
                พัฒนาซอฟต์แวร์เทคโนโลยีโรงพยาบาลตั้งแต่ระบบฐานข้อมูลผู้ป่วย แอดมิด คิว เคลม ไปจนถึงอุปกรณ์การแพทย์ ด้วยเสถียรภาพระดับสากลและการรักษาความปลอดภัยของข้อมูลอย่างเคร่งครัด
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
