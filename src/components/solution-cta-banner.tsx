"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openContactSocialModal } from "@/components/contact-social-modal";

export function SolutionCtaBanner() {
  return (
    <div className="rounded-[32px] sm:rounded-[36px] bg-gradient-to-r from-[#0B1C3D] via-[#0B328A] to-[#0066FF] p-8 sm:p-12 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
      <div className="relative z-10 max-w-4xl space-y-3.5">
        <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider bg-white/10 border border-white/15 px-3.5 py-1 rounded-full inline-block">
          TOP PROVIDER SYSTEM GROUP
        </span>
        <h3 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight leading-snug">
          พร้อมยกระดับองค์กรของคุณด้วยเทคโนโลยีที่ใช่หรือยัง?
        </h3>
        <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
          เราพร้อมเป็นส่วนหนึ่งในการขับเคลื่อนองค์กรของคุณ ด้วยโซลูชันเทคโนโลยีที่ตอบโจทย์ทุกความต้องการ
          <br className="hidden sm:inline" /> ไม่ว่าจะเป็นการพัฒนาระบบ การออกแบบซอฟต์แวร์ หรือระบบบริหารจัดการองค์กร
          <br className="hidden sm:inline" /> ให้ทีมงานของเราช่วยแนะนำแนวทางที่เหมาะสมสำหรับคุณ
        </p>

        <div className="pt-2">
          <Button
            type="button"
            onClick={openContactSocialModal}
            className="rounded-full bg-white hover:bg-slate-100 text-[#0062FF] font-bold text-xs sm:text-sm px-6 py-3 h-auto shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Our Team</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
