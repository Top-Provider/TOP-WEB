"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { TeamMember } from "@/lib/team";

export type { TeamMember };

interface TeamSectionProps {
  initialMembers?: TeamMember[];
}

export function TeamSection({ initialMembers = [] }: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/team", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setMembers(json.data);
        }
      })
      .catch(() => {
        // Ignore abort/network errors when initialMembers is already rendered
      });
    return () => controller.abort();
  }, []);

  if (members.length === 0) return null;
  return (
    <section id="team" className="py-16 sm:py-24 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header: Left Title & Right Subtitle matching reference image */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#0066FF] mb-2">
              OUR SPECIALIST TEAM • LEADERSHIP
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">
              ทีมผู้เชี่ยวชาญระดับองค์กร
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            ทีมวิศวกรและผู้เชี่ยวชาญด้านระบบสารสนเทศโรงพยาบาลครบวงจร
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map((member, idx) => (
            <motion.div
              key={member.id ?? member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              suppressHydrationWarning
              className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <Image
                    src={member.imageSrc}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    unoptimized={member.imageSrc.startsWith("/api/") || member.imageSrc.startsWith("data:")}
                  />
                  <div className="absolute bottom-2.5 left-2.5 backdrop-blur-md bg-slate-950/75 text-white text-[10px] font-medium px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                    <span>{member.badge}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-1 pb-1">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#0066FF] mt-0.5">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
