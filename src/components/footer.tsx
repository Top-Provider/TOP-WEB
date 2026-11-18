"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-white border-t border-slate-200/80 pt-14 pb-10 overflow-hidden relative">
      <div className="w-[94%] max-w-[2200px] mx-auto px-2 sm:px-4 lg:px-6 relative z-10">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative h-10 w-28">
              <Image
                src="/images/logo.png"
                alt="TOP PROVIDER SYSTEM GROUP CO., LTD."
                fill
                sizes="112px"
                className="object-contain object-left"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด
              </h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                Provider System Group Co., Ltd.
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              ผู้นำด้านเทคโนโลยี โซลูชันระบบ และการพัฒนาซอฟต์แวร์ระดับองค์กร
              <br />
              เพื่อขับเคลื่อนประสิทธิภาพและความเติบโตอย่างยั่งยืน
            </p>
          </div>

          {/* Column: Navigation */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-4">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/" className="hover:text-[#0066FF] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#case-studies" className="hover:text-[#0066FF] transition-colors">
                  IT Solution &amp; Product
                </Link>
              </li>
              <li>
                <Link href="/service-solution" className="hover:text-[#0066FF] transition-colors">
                  Service Solution
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-[#0066FF] transition-colors">
                  News &amp; Activities
                </Link>
              </li>
              <li>
                <Link href="/#capabilities" className="hover:text-[#0066FF] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Connect */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-4">
              CONNECT
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/contact" className="hover:text-[#0066FF] transition-colors">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0066FF] transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0066FF] transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0066FF] transition-colors">
                  Line Official
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Standards */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] mb-4">
              STANDARDS
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#0066FF]" />
                <span>ISO 27001 Certified</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#0066FF]" />
                <span>Enterprise Cloud SLA 99.9%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#0066FF]" />
                <span>Fast-Track Deployment</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#0066FF]" />
                <span>24/7 Dedicated Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Back to Top Button Row */}
        <div className="pt-6 flex justify-end">
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:text-[#0066FF] hover:border-blue-200 shadow-2xs transition-all cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

        {/* Massive Watermark Typography */}
        <div className="py-6 text-center select-none overflow-hidden pointer-events-none">
          <span className="font-black text-[44px] sm:text-[84px] lg:text-[128px] tracking-tighter text-slate-100 uppercase block whitespace-nowrap leading-none">
            TOP PROVIDER
          </span>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>© 2026 TOP PROVIDER SYSTEM GROUP CO., LTD. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#overview" className="hover:text-slate-600">
              Privacy Policy
            </Link>
            <Link href="#overview" className="hover:text-slate-600">
              Terms of Service
            </Link>
            <Link href="#overview" className="hover:text-slate-600">
              Security
            </Link>
            <Link href="#overview" className="hover:text-slate-600">
              PDPA
            </Link>
            <Link href="/admin" className="hover:text-blue-600 text-slate-400">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
