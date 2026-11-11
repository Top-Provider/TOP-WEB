import { supabase } from "@/lib/supabase";
import { pgSelect } from "@/lib/db";
import { Navbar } from "@/components/navbar";
import { HeroShowcase } from "@/components/hero-showcase";
import { HospitalDashboard } from "@/components/hospital-dashboard";
import { CaseStudies } from "@/components/case-studies";
import { TeamSection, TeamMember } from "@/components/team-section";
import { ActivitiesSection } from "@/components/activities-section";
import { ActivityItem } from "@/app/api/activities/route";
import { StatsTicker } from "@/components/stats-ticker";
import { AboutSection } from "@/components/about-section";
import { Footer } from "@/components/footer";

export const revalidate = 60;

function resolveSoftwareImageUrl(id: unknown, url: unknown, fallback: string): string {
  if (typeof url !== "string" || !url) return fallback;
  // ดึงรูปจริงจาก DB ผ่าน image endpoint เพื่อให้ Payload HTML เบา (~40KB) ไม่เกินลิมิต 20MB ของ Vercel
  if (url.startsWith("data:")) {
    return `/api/software-image/${id}`;
  }
  return url;
}

function resolveProductImageUrl(id: unknown, url: unknown, fallback: string): string {
  if (typeof url !== "string" || !url) return fallback;
  if (url.startsWith("data:")) {
    return `/api/product-image/${id}`;
  }
  return url;
}

export default async function Home() {
  let initialCategories: { id: number; category_id: string; name: string }[] = [];
  let initialSoftwareRecords: Record<string, unknown>[] = [];
  let initialProducts: Record<string, unknown>[] = [];
  let initialSolutionTopics: Record<string, unknown>[] = [];
  let initialTeamMembers: TeamMember[] = [];
  let initialActivities: ActivityItem[] = [];

  // Helper map users to team members
  const mapUsersToTeam = (users: Record<string, unknown>[]): TeamMember[] => {
    const executiveRoles = ["CEO", "MD", "CIO", "CFO", "CTO", "COO", "VP"];
    const filtered = users.filter((u) => {
      const showHome = Boolean(u.show_on_home);
      const roleStr = String(u.job_role || "").toUpperCase();
      return showHome || executiveRoles.includes(roleStr);
    });

    return filtered.map((u) => {
      const fullNameEn = [u.prefix_en, u.first_name_en, u.last_name_en]
        .filter(Boolean)
        .join(" ")
        .trim();
      const fullNameTh = [u.prefix_th, u.first_name_th, u.last_name_th]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        name: fullNameEn || fullNameTh || "บุคลากรผู้เชี่ยวชาญ",
        role: (u.position as string) || (u.department as string) || "",
        badge:
          (u.badge as string) ||
          (u.job_role as string) ||
          (u.position as string) ||
          "Executive",
        bio: (u.bio as string) || "",
        imageSrc: (u.avatar_url as string) || "/images/team_1.jpg",
      };
    });
  };

  // 1. โหลดข้อมูลจาก Local PostgreSQL เป็นหลัก
  if (process.env.DATABASE_URL) {
    try {
      const [catData, softData, prodData, topicsData, usersData, activitiesData] = await Promise.all([
        pgSelect({ table: "TBM_PRODUCT_CATEGORIES", where: { is_active: true }, orderBy: "id", orderDir: "asc" }),
        pgSelect({ table: "TB_PRODUCT_SOFTWARE", where: { is_active: true }, orderBy: "id", orderDir: "asc", limit: 30 }),
        pgSelect({ table: "TB_PRODUCTS", where: { is_active: true }, orderBy: "id", orderDir: "asc", limit: 300 }),
        pgSelect({ table: "TB_SOLUTION_TOPICS", where: { is_active: true }, orderBy: "sort_order", orderDir: "asc" }),
        pgSelect({ table: "TB_USERS", where: { is_active: true }, orderBy: "sort_order", orderDir: "asc" }),
        pgSelect({ table: "TB_ACTIVITIES", where: { is_active: true }, orderBy: "sort_order", orderDir: "asc", limit: 6 }),
      ]);

      initialCategories = (catData || []).map((c) => ({
        id: Number(c.id),
        category_id: String(c.category_id),
        name: String(c.name),
      }));
      initialSoftwareRecords = (softData || []) as Record<string, unknown>[];
      initialProducts = (prodData || []) as Record<string, unknown>[];
      initialSolutionTopics = (topicsData || []) as Record<string, unknown>[];

      if (usersData && usersData.length > 0) {
        initialTeamMembers = mapUsersToTeam(usersData as Record<string, unknown>[]);
      }

      if (activitiesData && activitiesData.length > 0) {
        initialActivities = (activitiesData as Record<string, unknown>[]).map((act) => {
          let dateStr = "";
          if (act.event_date) {
            dateStr = act.event_date instanceof Date ? act.event_date.toISOString().split("T")[0] : String(act.event_date).split("T")[0];
          }
          let gal: string[] = [];
          if (Array.isArray(act.gallery_images)) gal = act.gallery_images as string[];
          else if (typeof act.gallery_images === "string") {
            try { gal = JSON.parse(act.gallery_images); } catch {}
          }
          let tags: string[] = [];
          if (Array.isArray(act.tags)) tags = act.tags as string[];
          else if (typeof act.tags === "string") {
            try { tags = JSON.parse(act.tags); } catch {}
          }

          return {
            id: Number(act.id),
            title: String(act.title || ""),
            title_en: act.title_en ? String(act.title_en) : undefined,
            category: String(act.category || "culture"),
            event_date: dateStr || undefined,
            location: act.location ? String(act.location) : undefined,
            short_description: act.short_description ? String(act.short_description) : undefined,
            content: act.content ? String(act.content) : undefined,
            cover_image_url: act.cover_image_url ? String(act.cover_image_url) : undefined,
            gallery_images: gal,
            tags,
            is_featured: Boolean(act.is_featured),
            is_active: Boolean(act.is_active),
            sort_order: Number(act.sort_order || 0),
          };
        });
      }
    } catch (pgErr) {
      console.warn("[PostgreSQL Home Page load error, falling back to Supabase]:", pgErr);
    }
  }

  // 2. Fallback ไปยัง Supabase หากยังไม่มีข้อมูล
  if (initialCategories.length === 0) {
    try {
      const [catRes, softRes, prodRes, topicsRes] = await Promise.all([
        supabase
          .from("TBM_PRODUCT_CATEGORIES")
          .select("id, category_id, name, is_active")
          .eq("is_active", true)
          .order("id", { ascending: true }),
        supabase
          .from("TB_PRODUCT_SOFTWARE")
          .select(
            "id, name, program_code, category_id, client_subtitle, short_description, full_description, cover_image_url, video_url, key_features, metric_label, metric_value, is_active"
          )
          .eq("is_active", true)
          .order("id", { ascending: true })
          .limit(30),
        supabase
          .from("TB_PRODUCTS")
          .select(
            "id, name, sku, slug, category_id, sub_category, brand, product_type, short_description, full_description, specifications, cover_image_url, is_active"
          )
          .eq("is_active", true)
          .order("id", { ascending: true })
          .limit(300),
        supabase
          .from("TB_SOLUTION_TOPICS")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (!catRes.error && catRes.data) {
        initialCategories = catRes.data.map((c) => ({
          id: c.id,
          category_id: c.category_id,
          name: c.name,
        }));
      }

      if (!softRes.error && softRes.data) {
        initialSoftwareRecords = softRes.data;
      }

      if (!prodRes.error && prodRes.data) {
        initialProducts = prodRes.data;
      }

      if (!topicsRes.error && topicsRes.data) {
        initialSolutionTopics = topicsRes.data;
      }
    } catch (err) {
      console.error("[Home Page Fetch Exception]:", err);
    }
  }

  // Resolve image URLs for software and products
  initialSoftwareRecords = initialSoftwareRecords.map((item) => ({
    ...item,
    cover_image_url: resolveSoftwareImageUrl(item.id, item.cover_image_url, "/images/vitanix-dashboard-hd.png"),
  }));

  initialProducts = initialProducts.map((item) => {
    const isNetwork = String(item.category_id || "").toLowerCase().includes("network");
    const defaultFallback = isNetwork
      ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80"
      : "/images/printer-product.png";
    return {
      ...item,
      cover_image_url: resolveProductImageUrl(item.id, item.cover_image_url, defaultFallback),
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. PPHS Architecture Banner */}
        <HeroShowcase />

        {/* 2. Hospital Service Solutions Dashboard Carousel */}
        <HospitalDashboard />

        {/* 3. IT Solution & Product (Sticky Stacked Cards) */}
        <CaseStudies
          initialCategories={initialCategories}
          initialSoftwareRecords={initialSoftwareRecords}
          initialProducts={initialProducts}
          initialSolutionTopics={initialSolutionTopics}
        />

        {/* 4. Core Leadership & Specialist Team */}
        <TeamSection initialMembers={initialTeamMembers} />

        {/* 5. Corporate Activities & Highlights */}
        <ActivitiesSection initialActivities={initialActivities} />

        {/* 5. Partner Strip & Key Enterprise Metrics (15+ Years, 12 Systems, 99.9%, 24/7) */}
        <StatsTicker />

        {/* 6. About TOP PROVIDER SYSTEM GROUP */}
        <AboutSection />
      </main>

      {/* 7. Detailed Footer */}
      <Footer />
    </div>
  );
}
