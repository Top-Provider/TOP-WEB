import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SoftwareSolutionView } from "@/components/software-solution-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Software Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "โซลูชันซอฟต์แวร์บริหารจัดการโรงพยาบาลและระบบเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะ (Vitanix Claim, Panacea Plus HIS, Smart Queue, EMR)",
};

export default function SoftwareSolutionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Software Solution UI */}
      <main className="flex-1">
        <SoftwareSolutionView />
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

