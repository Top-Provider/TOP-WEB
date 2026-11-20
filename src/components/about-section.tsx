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
            className="lg:col-span-6 relative min-h-[360px] sm:min-h-[440px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl shadow-slate-200/50 group bg-slate-100"
          >
            <Image
              src="/images/office-hq-new.jpg"
              alt="TOP PROVIDER SYSTEM GROUP CO., LTD. Headquarters"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>

          {/* Right Dual Stack Cards */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Card 1: Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              suppressHydrationWarning
              className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-7 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#0066FF] shadow-2xs shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Vision (วิสัยทัศน์)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                &ldquo;เป็นผู้นำด้านเทคโนโลยีและระบบบริหารจัดการโรงพยาบาลระดับภูมิภาค ที่สร้างมาตรฐานใหม่ของ Digital Healthcare Infrastructure
                โดยเชื่อมโยงข้อมูล ระบบ และอุปกรณ์ทางการแพทย์อย่างอัจฉริยะ เพื่อยกระดับคุณภาพการรักษา ความปลอดภัยของข้อมูล และประสิทธิภาพของระบบสาธารณสุขอย่างยั่งยืน&rdquo;
              </p>
            </motion.div>

            {/* Card 2: Mission */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              suppressHydrationWarning
              className="flex-1 bg-[#0066FF] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-500/25 flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Mission (พันธกิจ)
                </h3>
              </div>

              <ol className="space-y-2.5 text-xs sm:text-sm text-blue-50 leading-relaxed">
                {[
                  "พัฒนาและให้บริการระบบบริหารจัดการโรงพยาบาลแบบครบวงจร ตั้งแต่การให้คำปรึกษา การออกแบบระบบ การติดตั้งอุปกรณ์ ไปจนถึง IT Solutions เพื่อเพิ่มประสิทธิภาพการดำเนินงานของโรงพยาบาล",
                  "สร้างระบบ Digital Healthcare ที่เชื่อมต่อข้อมูลผู้ป่วยอย่างปลอดภัย ผ่าน HIS, Smart Medical Systems และ Data Integration ที่มีมาตรฐานสากล",
                  "รับฟังและตอบสนองความต้องการของลูกค้าอย่างลึกซึ้ง โดยออกแบบโซลูชันที่เหมาะสมกับบริบทของแต่ละโรงพยาบาล",
                  "รักษามาตรฐานด้านสุขภาพ ความปลอดภัย และการคุ้มครองข้อมูลส่วนบุคคล ให้สอดคล้องกับ PDPA และมาตรฐานสากลด้าน Cybersecurity และ Healthcare Compliance",
                  "ขับเคลื่อนนวัตกรรมเทคโนโลยีด้าน Healthcare IT อย่างต่อเนื่อง เพื่อยกระดับคุณภาพการรักษาและประสิทธิภาพของระบบสาธารณสุข",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
