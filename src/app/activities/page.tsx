import { Metadata } from "next";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ActivitiesView } from "@/components/activities-view";
import { ActivityItem } from "@/app/api/activities/route";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News & Activity | TOP PROVIDER SYSTEM GROUP",
  description:
    "อัปเดตข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด จาก บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด ผู้นำด้านเทคโนโลยีสารสนเทศโรงพยาบาลครบวงจร",
};

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return [];
    }
  }
  return [];
}

function formatRow(row: Record<string, unknown>): ActivityItem {
  let dateStr = "";
  if (row.event_date) {
    if (row.event_date instanceof Date) {
      const d = row.event_date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    } else {
      dateStr = String(row.event_date).split("T")[0];
    }
  }

  return {
    id: Number(row.id),
    title: String(row.title || ""),
    title_en: row.title_en ? String(row.title_en) : undefined,
    category: String(row.category || "news"),
    event_date: dateStr || undefined,
    location: row.location ? String(row.location) : undefined,
    short_description: row.short_description ? String(row.short_description) : undefined,
    content: row.content ? String(row.content) : undefined,
    cover_image_url: row.cover_image_url ? String(row.cover_image_url) : undefined,
    gallery_images: parseJsonArray(row.gallery_images),
    tags: parseJsonArray(row.tags),
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order || 0),
  };
}

export default async function ActivitiesPage() {
  let initialActivities: ActivityItem[] = [];

  // 1. โหลดจาก PostgreSQL เป็นหลัก
  if (process.env.DATABASE_URL) {
    try {
      const res = await query(`
        SELECT * FROM public."TB_ACTIVITIES"
        WHERE is_active = true
        ORDER BY sort_order ASC, event_date DESC NULLS LAST, id DESC
      `);
      if (res && res.rows.length > 0) {
        initialActivities = res.rows.map(formatRow);
      }
    } catch (pgErr) {
      console.warn("[PostgreSQL Activities Page load error, fallback to Supabase]:", pgErr);
    }
  }

  // 2. Fallback ไปยัง Supabase
  if (initialActivities.length === 0) {
    try {
      const { data, error } = await supabase
        .from("TB_ACTIVITIES")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("event_date", { ascending: false });

      if (!error && data) {
        initialActivities = data.map(formatRow);
      }
    } catch (sbErr) {
      console.error("[Supabase Activities Page load exception]:", sbErr);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      <main className="flex-1 pb-20 sm:pb-28">
        {/* ================================================================= */}
        {/* Hero Section (Matching User's Reference Mockup) */}
        {/* ================================================================= */}
        <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#E6F0FF] via-[#F0F6FF] to-[#F8FAFC]">
          {/* Floating Translucent Medical Crosses (+) */}
          <div className="absolute top-10 left-[8%] text-blue-200/40 select-none pointer-events-none hidden sm:block">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 3a2 2 0 0 1 4 0v5h5a2 2 0 1 1 0 4h-5v5a2 2 0 1 1-4 0v-5H5a2 2 0 1 1 0-4h5V3z" />
            </svg>
          </div>
          <div className="absolute top-28 left-[45%] text-blue-200/50 select-none pointer-events-none">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 3a2 2 0 0 1 4 0v5h5a2 2 0 1 1 0 4h-5v5a2 2 0 1 1-4 0v-5H5a2 2 0 1 1 0-4h5V3z" />
            </svg>
          </div>
          <div className="absolute top-8 right-[44%] text-blue-200/35 select-none pointer-events-none hidden lg:block">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 3a2 2 0 0 1 4 0v5h5a2 2 0 1 1 0 4h-5v5a2 2 0 1 1-4 0v-5H5a2 2 0 1 1 0-4h5V3z" />
            </svg>
          </div>

          <div className="w-[94%] max-w-[1580px] mx-auto px-2 sm:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Title & Description */}
              <div className="lg:col-span-6 space-y-4 sm:space-y-5 z-10 py-6 sm:py-10">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-[#0062FF] uppercase">
                    NEWS &amp; ACTIVITY
                  </span>
                  <span className="w-12 h-0.5 bg-[#0062FF]/50 rounded-full" />
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  News &amp; Activity
                </h1>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                  อัปเดตข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด จาก บริษัท ท็อป โปรไวเดอร์ ซิสเต็ม กรุ๊ป จำกัด
                </p>
              </div>

              {/* Right Column: Hospital Building Render / Visual */}
              <div className="lg:col-span-6 relative">
                <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[380px] rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 border border-white/80 bg-gradient-to-tr from-blue-100 to-white">
                  <img
                    src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern Smart Hospital Architecture - TOP PROVIDER"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle edge blend gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E6F0FF]/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent pointer-events-none" />

                  {/* Hospital Ecosystem Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-100 text-xs font-bold text-[#0062FF] flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SMART HOSPITAL ECOSYSTEM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Curve Transition */}
          <div className="absolute -bottom-1 left-0 right-0 h-10 bg-[#F8FAFC] [clip-path:ellipse(65%_100%_at_50%_100%)] pointer-events-none" />
        </section>

        {/* Content Container */}
        <div className="w-[94%] max-w-[1580px] mx-auto px-2 sm:px-4">
          <ActivitiesView initialActivities={initialActivities} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
