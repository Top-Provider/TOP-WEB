"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Layers, ShieldCheck, Headphones } from "lucide-react";

const partnerBadges = [
  { name: "Panacea Plus", tag: "Hospital HIS" },
  { name: "Vitanix Claim", tag: "e-Claim Engine" },
  { name: "HL7 / FHIR", tag: "Health Standard" },
  { name: "Smart EMR", tag: "Paperless Ward" },
  { name: "Medical Hardware", tag: "IP65 Grade" },
  { name: "Core Network", tag: "10G Backbone" },
  { name: "Smart Kiosk", tag: "Self-Service" },
  { name: "AI & RTLS IoT", tag: "Smart Hospital" },
];

const stats = [
  {
    icon: Award,
    badge: "EXPERIENCE",
    value: "15+ Years",
    label: "ประสบการณ์เชี่ยวชาญ",
    subtext: "ผู้นำด้านระบบสารสนเทศโรงพยาบาลครบวงจร",
  },
  {
    icon: Layers,
    badge: "SOLUTIONS",
    value: "12 Systems",
    label: "โซลูชันครอบคลุม",
    subtext: "ซอฟต์แวร์ ฮาร์ดแวร์ เครือข่าย และเครื่องมือแพทย์",
  },
  {
    icon: ShieldCheck,
    badge: "RELIABILITY",
    value: "99.9%",
    label: "ความเสถียรของระบบ",
    subtext: "พร้อมใช้งานต่อเนื่องและปลอดภัยสูงสุด",
  },
  {
    icon: Headphones,
    badge: "SUPPORT",
    value: "24/7",
    label: "บริการดูแลหลังการขาย",
    subtext: "ทีมวิศวกรพร้อมซัพพอร์ตตลอด 24 ชั่วโมง",
  },
];

export function StatsTicker() {
  return (
    <section id="stats" className="bg-[#F8FAFC]">
      {/* Top Partner & Technology Strip */}
      <div className="bg-white border-y border-slate-200/80 py-6">
        <div className="w-[92%] max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0066FF]">
              <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
              <span>ได้รับความไว้วางใจจากโรงพยาบาลและสถานพยาบาลชั้นนำทั่วประเทศ</span>
            </div>
            <span className="text-[11px] text-slate-400">
              รองรับมาตรฐาน HL7 / FHIR / PDPA และระบบคลาวด์ระดับสากล
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
            {partnerBadges.map((item) => (
              <div
                key={item.name}
                className="shrink-0 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50/70 border border-slate-200/80 text-xs font-semibold text-slate-700"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                <span>{item.name}</span>
                <span className="text-[10px] font-medium text-[#0066FF] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 4-Column Stats Grid */}
      <div className="py-14 sm:py-18 border-b border-slate-200/80">
        <div className="w-[92%] max-w-[1500px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-[#0066FF]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#0066FF] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      {stat.badge}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1.5">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {stat.subtext}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
