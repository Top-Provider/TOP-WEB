import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { HeroShowcase } from "@/components/hero-showcase";
import { HospitalDashboard } from "@/components/hospital-dashboard";
import { CaseStudies } from "@/components/case-studies";
import { TeamSection } from "@/components/team-section";
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

    if (!topicsRes.error && topicsRes.data) {
      initialSolutionTopics = topicsRes.data;
    }

    if (!softRes.error && softRes.data) {
      initialSoftwareRecords = softRes.data.map((item) => ({
        ...item,
        cover_image_url: resolveSoftwareImageUrl(item.id, item.cover_image_url, "/images/vitanix-dashboard-hd.png"),
      }));
    }

    if (!prodRes.error && prodRes.data) {
      initialProducts = prodRes.data.map((item) => {
        const isNetwork = String(item.category_id || "").toLowerCase().includes("network");
        const defaultFallback = isNetwork
          ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80"
          : "/images/printer-product.png";
        return {
          ...item,
          cover_image_url: resolveProductImageUrl(item.id, item.cover_image_url, defaultFallback),
        };
      });
    }
  } catch (err) {
    console.error("Error loading home page data from DB:", err);
  }

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
        <TeamSection />

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
