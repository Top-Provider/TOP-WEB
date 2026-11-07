import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SoftwareSolutionView } from "@/components/software-solution-view";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Software Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "โซลูชันซอฟต์แวร์บริหารจัดการโรงพยาบาลและระบบเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะ (Vitanix Claim, Panacea Plus HIS, Smart Queue, EMR)",
};

function resolveSoftwareImageUrl(id: unknown, url: unknown, fallback: string, field = "cover_image_url"): string {
  if (typeof url !== "string" || !url) return fallback;
  if (url.startsWith("data:")) {
    return `/api/software-image/${id}${field !== "cover_image_url" ? `?field=${field}` : ""}`;
  }
  return url;
}

export default async function SoftwareSolutionPage() {
  let initialRecords: Record<string, unknown>[] = [];
  try {
    const { data: records, error } = await supabase
      .from("TB_PRODUCT_SOFTWARE")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true })
      .limit(30);

    if (!error && records && records.length > 0) {
      initialRecords = records.map((item) => ({
        ...item,
        cover_image_url: resolveSoftwareImageUrl(item.id, item.cover_image_url, "/images/vitanix-dashboard-hd.png", "cover_image_url"),
        feature_1_image: resolveSoftwareImageUrl(item.id, item.feature_1_image, "/images/vitanix-dashboard-hd.png", "feature_1_image"),
        feature_2_image: resolveSoftwareImageUrl(item.id, item.feature_2_image, "/images/vitanix-dashboard-hd.png", "feature_2_image"),
      })) as Record<string, unknown>[];
    }
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

