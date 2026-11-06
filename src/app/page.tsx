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

function sanitizeCoverImage(url: unknown, fallback: string): string {
  if (typeof url !== "string" || !url) return fallback;
  // ป้องกัน Base64 ขนาดยักษ์ทำให้ Next.js ISR Payload บวมเกิน 20MB (Vercel FALLBACK_BODY_TOO_LARGE)
  if (url.startsWith("data:") && url.length > 25000) {
    return fallback;
  }
  return url;
}

export default async function Home() {
  let initialSoftwareRecords: Record<string, unknown>[] = [];
  let initialProducts: Record<string, unknown>[] = [];

  try {
    const [softRes, prodRes] = await Promise.all([
      supabase
        .from("TB_PRODUCT_SOFTWARE")
        .select(
          "id, name, program_code, category_id, client_subtitle, short_description, full_description, cover_image_url, video_url, key_features, metric_label, metric_value, is_active"
        )
        .eq("is_active", true)
        .order("id", { ascending: true })
        .limit(12),
      supabase
        .from("TB_PRODUCTS")
        .select(
          "id, name, sku, slug, category_id, sub_category, brand, product_type, short_description, cover_image_url, bullet_points, is_active"
        )
        .eq("is_active", true)
        .order("id", { ascending: true })
        .limit(24),
    ]);

    if (!softRes.error && softRes.data) {
      initialSoftwareRecords = softRes.data.map((item) => ({
        ...item,
        cover_image_url: sanitizeCoverImage(item.cover_image_url, "/images/vitanix-dashboard-hd.png"),
      }));
    }
    if (!prodRes.error && prodRes.data) {
      initialProducts = prodRes.data.map((item) => ({
        ...item,
        cover_image_url: sanitizeCoverImage(item.cover_image_url, "/images/printer-product.png"),
      }));
    }
  } catch (err) {
    console.error("Error loading data from database on home page:", err);
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
          initialSoftwareRecords={initialSoftwareRecords}
          initialProducts={initialProducts}
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
