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

export default async function Home() {
  let initialSoftwareRecords: Record<string, unknown>[] = [];
  let initialProducts: Record<string, unknown>[] = [];

  try {
    const [softRes, prodRes] = await Promise.all([
      supabase
        .from("TB_PRODUCT_SOFTWARE")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true }),
      supabase
        .from("TB_PRODUCTS")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true }),
    ]);

    if (!softRes.error && softRes.data) {
      initialSoftwareRecords = softRes.data as Record<string, unknown>[];
    }
    if (!prodRes.error && prodRes.data) {
      initialProducts = prodRes.data as Record<string, unknown>[];
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
