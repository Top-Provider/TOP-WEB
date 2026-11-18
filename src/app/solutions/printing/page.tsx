import { Suspense } from "react";
import { Metadata } from "next";
import { listPublicProducts, mapProductRow } from "@/lib/public-catalog";
import { isDbConnectionError } from "@/lib/api-error";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrintingSolutionView } from "@/components/printing-solution-view";
import type { ProductItemResponse } from "@/app/api/products/route";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Printing & Supply Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมเครื่องพิมพ์คุณภาพสูง หมึกพิมพ์ ริบบอนบาร์โค้ด และวัสดุสิ้นเปลืองทางการแพทย์สำหรับโรงพยาบาลและองค์กร พร้อมสเปกและเอกสาร Datasheet / TOR",
};

export default async function PrintingSolutionPage() {
  let initialProducts: ProductItemResponse[] = [];
  try {
    const records = await listPublicProducts({ categoryId: "Printing", limit: 200, orderDir: "asc" });
    initialProducts = records.map((item) =>
      mapProductRow(item, {
        defaultCategory: "Printing",
        fallbackImage: "/images/printer-product.png",
        strictPrinterSupply: true,
      })
    );
  } catch (err) {
    console.error("Error loading products on printing solution page:", err);
    if (isDbConnectionError(err)) throw err;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Printing & Supply Solution UI */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <PrintingSolutionView initialProducts={initialProducts} />
        </Suspense>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

