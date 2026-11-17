import { listPublicSoftware } from "@/lib/public-catalog";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SoftwareSolutionView } from "@/components/software-solution-view";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Software Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "โซลูชันซอฟต์แวร์บริหารจัดการโรงพยาบาลและระบบเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะ (Vitanix Claim, Panacea Plus HIS, Smart Queue, EMR)",
};

export default async function SoftwareSolutionPage() {
  let initialRecords: Record<string, unknown>[] = [];
  try {
    const records = await listPublicSoftware(30);
    initialRecords = records.map((item) => ({
      ...item,
      cover_image_url:
        typeof item.cover_image_url === "string" && item.cover_image_url
          ? item.cover_image_url
          : "/images/showcase-laptop.png",
      feature_1_image:
        typeof item.feature_1_image === "string" && item.feature_1_image
          ? item.feature_1_image
          : "/images/showcase-laptop.png",
      feature_2_image:
        typeof item.feature_2_image === "string" && item.feature_2_image
          ? item.feature_2_image
          : "/images/laptop_mockup.jpg",
    }));
  } catch (err) {
    console.error("Error loading software programs on server:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Software Solution UI */}
      <main className="flex-1">
        <SoftwareSolutionView initialRecords={initialRecords} />
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

