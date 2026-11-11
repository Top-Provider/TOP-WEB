import { Metadata } from "next";
import { query } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ActivitiesView } from "@/components/activities-view";
import { ActivityItem } from "@/app/api/activities/route";
import { Sparkles, Calendar, HeartHandshake } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "กิจกรรมและภาพลักษณ์องค์กร | TOP PROVIDER SYSTEM GROUP",
  description:
    "บันทึกภาพกิจกรรม นิทรรศการนวัตกรรมระบบสารสนเทศโรงพยาบาล งานสัมมนาวิชาการ HealthTech กิจกรรมเพื่อสังคม (CSR) และวัฒนธรรมองค์กรของ TOP PROVIDER",
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
    category: String(row.category || "culture"),
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
        ORDER BY is_featured DESC, sort_order ASC, event_date DESC NULLS LAST, id DESC
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
        .order("is_featured", { ascending: false })
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

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="w-[92%] max-w-[1400px] mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              TOP PROVIDER ACTIVITIES & CULTURE
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              กิจกรรมและภาพลักษณ์องค์กร
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              บันทึกเรื่องราวความร่วมมือ กิจกรรมกระชับความสัมพันธ์ งานสัมมนาจัดแสดงนวัตกรรมระบบโรงพยาบาล
              และกิจกรรมเพื่อสังคม (CSR) ของทีมงาน TOP PROVIDER SYSTEM GROUP
            </p>
          </div>
        </section>

        {/* Content Container */}
        <div className="w-[92%] max-w-[1400px] mx-auto">
          <ActivitiesView initialActivities={initialActivities} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

