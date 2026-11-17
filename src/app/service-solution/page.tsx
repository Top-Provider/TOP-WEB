import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceGuideCard } from "@/components/helpdesk/service-guide-card";

export const metadata: Metadata = {
  title: "Service Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ภาพรวมกระบวนการให้บริการ CS สำหรับโรงพยาบาล ตั้งแต่การรับแจ้ง การให้บริการนอกสถานที่ ไปจนถึงการบำรุงรักษาเชิงป้องกัน",
};

const highlights = [
  {
    icon: Zap,
    title: "รวดเร็ว",
    description: "ลดระยะเวลาทำงาน",
  },
  {
    icon: Coins,
    title: "ประหยัด",
    description: "ควบคุมค่าใช้จ่าย",
  },
  {
    icon: ShieldCheck,
    title: "มาตรฐาน",
    description: "รองรับระบบสากล",
  },
];

export default function ServiceSolutionPage() {
  return (
    <div className="min-h-screen bg-[#f7faff] text-slate-950 selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="overflow-hidden">
        <section className="relative isolate pb-14 pt-7 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_24%,rgba(96,165,250,0.2),transparent_31%),radial-gradient(circle_at_12%_20%,rgba(219,234,254,0.8),transparent_33%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_82%,#f7faff_100%)]" />
          <div className="absolute -bottom-28 left-1/2 -z-10 h-60 w-[130%] -translate-x-1/2 rounded-[50%] bg-white/80" />

          <div className="mx-auto grid w-[88%] max-w-[1500px] items-center gap-9 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-100/75 px-4 py-2 text-[11px] font-bold tracking-[0.12em] text-[#0066ff] shadow-sm shadow-blue-100/70 sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-[#0066ff]" />
                CS SERVICE SYSTEM
              </div>

              <h1 className="text-[clamp(2.05rem,4.1vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#0b153b]">
                Flow ภาพรวมการทำงานของ{" "}
                <span className="whitespace-nowrap text-[#0868ee]">CS</span>
              </h1>
              <p className="mt-4 text-lg font-bold text-[#162145] sm:text-2xl">
                ระบบบริการจัดการภายในโรงพยาบาลครบวงจร
              </p>
              <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base sm:leading-8">
                เพิ่มประสิทธิภาพในการจัดการโรงพยาบาลด้วยระบบที่ทันสมัย
                ช่วยลดค่าใช้จ่ายในการบริหารจัดการ ลดระยะเวลาทำงาน
                และพัฒนาการบริการอย่างมีประสิทธิภาพ
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-white bg-white/85 px-4 py-3 shadow-[0_12px_35px_rgba(37,99,235,0.12)] backdrop-blur"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0874ff]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[#101b42]">{title}</span>
                      <span className="block text-[11px] font-medium text-slate-500">{description}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[820px] lg:translate-x-8">
              <div className="absolute inset-x-[15%] bottom-[6%] h-[20%] rounded-full bg-blue-400/25 blur-3xl" />
              <Image
                src="/images/service-hospital-hero.png"
                alt="ภาพประกอบโรงพยาบาลและระบบบริหารงานบริการดิจิทัล"
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 1024px) 92vw, 56vw"
                className="relative h-auto w-full object-contain drop-shadow-[0_28px_30px_rgba(30,64,175,0.18)]"
              />
            </div>
          </div>
        </section>

        <section id="service-process" className="relative z-10 -mt-2 pb-10 sm:-mt-5 sm:pb-14">
          <div className="mx-auto w-[88%] max-w-[1500px] rounded-[28px] border border-white/90 bg-white/78 px-4 py-8 shadow-[0_25px_80px_rgba(59,130,246,0.12)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12">
            <div className="overflow-hidden rounded-[24px] border border-blue-100/80 bg-white p-2 shadow-[0_18px_45px_rgba(30,64,175,0.1)] sm:p-4">
              <Image
                src="/images/service-flow-process.png"
                alt="Service flow process ตั้งแต่การรับแจ้งจากโรงพยาบาล การให้บริการนอกสถานที่ และการบำรุงรักษาเชิงป้องกัน"
                width={1724}
                height={966}
                sizes="(max-width: 1500px) 88vw, 1320px"
                className="h-auto w-full rounded-[18px] object-contain"
              />
            </div>
          </div>
        </section>

        <section className="pb-10 pt-1 sm:pb-16">
          <div className="mx-auto grid w-[88%] max-w-[1500px] gap-6 lg:grid-cols-2">
            <article className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white px-6 py-7 shadow-[0_18px_45px_rgba(30,64,175,0.08)] sm:px-8 sm:py-9">
              <div className="absolute -bottom-20 -right-12 h-52 w-52 rounded-full bg-blue-100/70 blur-2xl transition-transform duration-500 group-hover:scale-125" />
              <div className="relative flex h-full flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
                <div>
                  <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0874ff] text-white shadow-lg shadow-blue-200">
                    <UserRound className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0d173d]">เข้าสู่ระบบ (Login)</h2>
                  <p className="mt-1.5 text-sm font-medium text-slate-500">สำหรับผู้ใช้งานระบบแจ้งซ่อม</p>
                  <Link
                    href="/helpdesk/login?force=true"
                    prefetch={false}
                    className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#0874ff] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
                  >
                    เข้าสู่ระบบ
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="relative flex h-36 w-full max-w-[220px] items-center justify-center sm:h-44">
                  <div className="absolute h-28 w-40 rotate-[-5deg] rounded-[20px] border-4 border-blue-200 bg-gradient-to-br from-white to-blue-100 shadow-xl" />
                  <div className="absolute top-7 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-8 ring-blue-100">
                    <UserRound className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <div className="absolute bottom-4 h-3 w-44 rounded-full bg-blue-100 blur-sm" />
                </div>
              </div>
            </article>

            <ServiceGuideCard />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
