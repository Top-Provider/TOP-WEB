"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Award, ShieldCheck, TrendingUp, Building2 } from "lucide-react";
import type { PublicCustomer } from "@/lib/public-customers";

const stats = [
  {
    icon: Zap,
    badge: "EXPERTISE",
    value: "10+ Years",
    label: "ประสบการณ์ความเชี่ยวชาญ",
    subtext: "วางแผน ออกแบบ และติดตั้งระบบโรงพยาบาลครบวงจร",
  },
  {
    icon: Award,
    badge: "SOLUTIONS",
    value: "12 Systems",
    label: "โซลูชันซอฟต์แวร์เฉพาะทาง",
    subtext: "ครอบคลุมตั้งแต่ฐานข้อมูลคนไข้ แอดมิด คิว ไปจนถึงระบบเคลม",
  },
  {
    icon: ShieldCheck,
    badge: "ISO",
    value: "99.9%",
    label: "เสถียรภาพและความปลอดภัย",
    subtext: "รักษาความปลอดภัยข้อมูลคนไข้ตามมาตรฐานสากล",
  },
  {
    icon: TrendingUp,
    badge: "VERIFIED",
    value: "24/7",
    label: "ทีมผู้เชี่ยวชาญดูแลครบวงจร",
    subtext: "ให้คำแนะนำ แก้ปัญหา และดูแลระบบ",
  },
];

interface StatsTickerProps {
  initialCustomers?: PublicCustomer[];
}

export function StatsTicker({ initialCustomers = [] }: StatsTickerProps) {
  const [customers, setCustomers] = useState<PublicCustomer[]>(initialCustomers);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/customers", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setCustomers(json.data);
        }
      })
      .catch(() => {
        // Ignore abort/network errors when initialCustomers is already rendered
      });
    return () => controller.abort();
  }, []);

  // Repeat enough items so the seamless -50% marquee loop fills wide screens smoothly
  const marqueeItems = useMemo(() => {
    if (customers.length === 0) return [];
    const minItemsPerHalf = Math.max(customers.length, 8);
    const half: PublicCustomer[] = [];
    while (half.length < minItemsPerHalf) {
      half.push(...customers);
    }
    return [...half, ...half];
  }, [customers]);

  return (
    <section id="stats" className="bg-[#F8FAFC]">
      {/* Top Partner & Hospital Customers Infinite Marquee */}
      <div className="bg-white border-y border-slate-200/80 py-6">
        <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0066FF]">
              <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
              <span>ได้รับความไว้วางใจจากโรงพยาบาลและสถานพยาบาลชั้นนำทั่วประเทศ</span>
            </div>
            <span className="text-[11px] text-slate-400">
              รองรับมาตรฐาน HL7 / FHIR / PDPA และระบบคลาวด์ระดับสากล
            </span>
          </div>

          {marqueeItems.length > 0 && (
            <div className="relative overflow-hidden py-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10" />
              <div
                className="animate-marquee-loop flex items-center gap-3.5"
                style={{ animation: "marquee-loop 35s linear infinite", width: "max-content" }}
              >
                {marqueeItems.map((customer, index) => (
                  <div
                    key={`${customer.customerId}-${index}`}
                    className="shrink-0 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    {customer.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={customer.logoUrl}
                        alt={customer.customerName}
                        className="w-6 h-6 rounded-full object-contain bg-white border border-slate-200/80 p-0.5 shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />
                      </span>
                    )}
                    <span className="whitespace-nowrap">{customer.customerName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom 4-Column Stats Grid */}
      <div className="bg-white py-14 sm:py-18 border-b border-slate-200/80">
        <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
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
                  suppressHydrationWarning
                  className="bg-[#F8FAFC] rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-2xs hover:border-blue-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#0066FF]">
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
