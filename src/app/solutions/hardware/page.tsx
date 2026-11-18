import { Suspense } from "react";
import { Metadata } from "next";
import { listPublicProducts, mapProductRow } from "@/lib/public-catalog";
import { isDbConnectionError } from "@/lib/api-error";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HardwareSolutionView } from "@/components/hardware-solution-view";
import type { ProductItemResponse } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hardware Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมอุปกรณ์ฮาร์ดแวร์ทางการแพทย์และไอทีระดับองค์กร (Handheld Barcode Scanner, Barcode Scanner, All-in-One PC, Scanner ความเร็วสูง, UPS, Display, Projector) พร้อม Datasheet และ TOR",
};

export default async function HardwareSolutionPage() {
  let initialProducts: ProductItemResponse[] = [];
  try {
    const records = await listPublicProducts({ categoryId: "Hardware", limit: 100, orderDir: "asc" });
    initialProducts = records.map((item) =>
      mapProductRow(item, {
        defaultCategory: "Hardware",
        defaultProductType: "hardware",
        fallbackImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      })
    );
  } catch (err) {
    console.error("Error loading products on hardware solution page:", err);
    if (isDbConnectionError(err)) throw err;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Hardware Solution UI */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <HardwareSolutionView initialProducts={initialProducts} />
        </Suspense>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

