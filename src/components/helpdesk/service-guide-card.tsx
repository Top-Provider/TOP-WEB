"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  ListChecks,
  MonitorSmartphone,
  Send,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const GUIDE_STEPS = [
  {
    icon: Building2,
    number: "1",
    title: "ข้อมูลผู้แจ้ง",
    detail: "ตรวจสอบหน่วยงาน ระบุแผนก ชื่อผู้แจ้ง และเบอร์โทรศัพท์เป็นตัวเลข 6–15 หลัก",
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    icon: MonitorSmartphone,
    number: "2",
    title: "เลือกอุปกรณ์",
    detail: "เลือกประเภท รุ่น และระบุ Serial Number หากมี สามารถแจ้งหลายเครื่องในคำร้องเดียวได้",
    color: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    icon: ListChecks,
    number: "3",
    title: "อธิบายอาการ",
    detail: "ระบุอาการ ข้อความ Error ผลกระทบ และสิ่งที่ลองแก้ไขแล้วให้ชัดเจน",
    color: "bg-amber-50 text-amber-800 border-amber-100",
  },
  {
    icon: Camera,
    number: "4",
    title: "แนบรูปประกอบ",
    detail: "ถ่ายภาพตัวเครื่อง สติกเกอร์ S/N และหน้าจอ Error ให้ชัดเจน สูงสุด 5 รูปต่อเครื่อง",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
] as const;

export function ServiceGuideCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white px-6 py-7 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:px-8 sm:py-9">
        <div className="absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-sky-100/80 blur-2xl transition-transform duration-500 group-hover:scale-125" />
        <div className="relative flex h-full flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0874ff] text-white shadow-lg shadow-blue-200">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="text-2xl font-extrabold text-[#0d173d]">คู่มือคำแนะนำ</h2>
            <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">
              วิธีการแจ้งซ่อม การใช้งานระบบ และข้อมูลที่เกี่ยวข้อง
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#0874ff] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              อ่านคู่มือ
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex h-36 w-full max-w-[220px] items-center justify-center sm:h-44">
            <BookOpen className="h-28 w-28 text-[#0874ff] drop-shadow-[0_14px_12px_rgba(37,99,235,0.2)]" strokeWidth={1.5} aria-hidden="true" />
            <span className="absolute right-7 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-[#0874ff] shadow-lg ring-4 ring-blue-100">
              i
            </span>
            <div className="absolute bottom-4 h-3 w-44 rounded-full bg-blue-100 blur-sm" />
          </div>
        </div>
      </article>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="คู่มือการแจ้งซ่อมออนไลน์"
        description="เตรียมข้อมูลให้ครบเพื่อให้ทีมช่างวิเคราะห์และรับงานได้รวดเร็วขึ้น"
        maxWidth="2xl"
        closeOnBackdropClick
        footer={
          <Button type="button" onClick={() => setOpen(false)} className="bg-blue-600 text-white hover:bg-blue-700">
            เข้าใจแล้ว
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {GUIDE_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className={`rounded-2xl border p-4 ${step.color}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">ขั้นตอนที่ {step.number} · {step.title}</div>
                      <p className="mt-1 text-xs leading-5 opacity-90">{step.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Send className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
              <div>
                <div className="text-sm font-bold text-blue-950">ส่งใบแจ้งซ่อมและติดตามงาน</div>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  หลังส่งสำเร็จ ระบบจะแสดงเลข Ticket ระดับความเร่งด่วน และกำหนด SLA
                  จากนั้นติดตามสถานะ ส่งข้อความถึงทีมช่าง และยืนยันปิดงานได้ในระบบ
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-800">
            หากปัญหากระทบการดูแลผู้ป่วยหรือทำให้ระบบหลักหยุดทำงาน กรุณาเลือกระดับผลกระทบและความเร่งด่วนตามจริง
          </div>
        </div>
      </Modal>
    </>
  );
}
