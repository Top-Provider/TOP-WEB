
import { pgSelect } from "@/lib/db";
import { listPublicProducts, listPublicSoftware, listPublicSolutionTopics } from "@/lib/public-catalog";
import { Navbar } from "@/components/navbar";
import { HeroShowcase } from "@/components/hero-showcase";
import { HospitalDashboard } from "@/components/hospital-dashboard";
import { CaseStudies } from "@/components/case-studies";
import { TeamSection, TeamMember } from "@/components/team-section";
import { listTeamMembers } from "@/lib/team";
import { StatsTicker } from "@/components/stats-ticker";
import { AboutSection } from "@/components/about-section";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialCategories: { id: number; category_id: string; name: string }[] = [];
  let initialSoftwareRecords: Record<string, unknown>[] = [];
  let initialProducts: Record<string, unknown>[] = [];
  let initialSolutionTopics: Record<string, unknown>[] = [];
  let initialTeamMembers: TeamMember[] = [];

  // 1. โหลดข้อมูลจาก Local PostgreSQL (ไม่ดึง base64 blob ลงมาใน HTML)
  {
    try {
      const [catData, softData, prodData, topicsData, teamData] = await Promise.all([
        pgSelect({ table: "TBM_PRODUCT_CATEGORIES", where: { is_active: true }, orderBy: "id", orderDir: "asc" }),
        listPublicSoftware(30),
        listPublicProducts({ limit: 300, orderDir: "asc" }),
        listPublicSolutionTopics(),
        listTeamMembers(),
      ]);

      initialCategories = (catData || []).map((c) => ({
        id: Number(c.id),
        category_id: String(c.category_id),
        name: String(c.name),
      }));
      initialSoftwareRecords = (softData || []).map((item) => ({
        ...item,
        cover_image_url:
          typeof item.cover_image_url === "string" && item.cover_image_url
            ? item.cover_image_url
            : "/images/showcase-laptop.png",
      }));
      initialProducts = (prodData || []).map((item) => {
        const isNetwork = String(item.category_id || "").toLowerCase().includes("network");
        const defaultFallback = isNetwork
          ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80"
          : "/images/printer-product.png";
        return {
          ...item,
          cover_image_url:
            typeof item.cover_image_url === "string" && item.cover_image_url
              ? item.cover_image_url
              : defaultFallback,
        };
      });
      initialSolutionTopics = topicsData || [];
      initialTeamMembers = teamData || [];
    } catch (pgErr) {
      throw pgErr;
    }
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
        <TeamSection initialMembers={initialTeamMembers} />

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
