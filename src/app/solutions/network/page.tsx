import { Suspense } from "react";
import { Metadata } from "next";
import { listPublicProducts, mapProductRow } from "@/lib/public-catalog";
import { isDbConnectionError } from "@/lib/api-error";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NetworkSolutionView } from "@/components/network-solution-view";
import type { ProductItemResponse } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Network & Server Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมโซลูชันระบบเครือข่ายและศูนย์ข้อมูลสำหรับโรงพยาบาลและองค์กร (Enterprise Server, SAN Storage, Next-Gen Firewall, Core Switch, Wi-Fi 6, Licenses)",
};

export default async function NetworkSolutionPage() {
  let initialProducts: ProductItemResponse[] = [];
  try {
    const records = await listPublicProducts({ categoryId: "Network", limit: 60, orderDir: "asc" });
    initialProducts = records.map((item) =>
      mapProductRow(item, {
        defaultCategory: "Network",
        defaultSubCategory: "Server",
        defaultBrand: "TOP PROVIDER",
        defaultProductType: "network",
        fallbackImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      })
    );
  } catch (err) {
    console.error("Error loading products on network solution page:", err);
    if (isDbConnectionError(err)) throw err;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Solution UI wrapped in Suspense for useSearchParams */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="w-full py-32 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">กำลังโหลด Network & Server Solution...</p>
            </div>
          }
        >
          <NetworkSolutionView initialProducts={initialProducts} />
        </Suspense>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

