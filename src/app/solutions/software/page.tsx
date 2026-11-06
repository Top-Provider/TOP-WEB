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

export default async function SoftwareSolutionPage() {
  let initialRecords: Record<string, unknown>[] = [];
  try {
    const fetchPromise = supabase
      .from("TB_PRODUCT_SOFTWARE")
      .select("*")
      .order("id", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 500)
    );

    const { data: records, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && records && records.length > 0) {
      initialRecords = records as Record<string, unknown>[];
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

