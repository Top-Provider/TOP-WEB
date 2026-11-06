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

function sanitizeImageUrl(url: unknown, fallback: string): string {
  if (typeof url !== "string" || !url) return fallback;
  if (url.startsWith("data:") && url.length > 35000) {
    return fallback;
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
        cover_image_url: sanitizeImageUrl(item.cover_image_url, "/images/vitanix-dashboard-hd.png"),
        feature_1_image: sanitizeImageUrl(item.feature_1_image, "/images/vitanix-dashboard-hd.png"),
        feature_2_image: sanitizeImageUrl(item.feature_2_image, "/images/vitanix-dashboard-hd.png"),
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

