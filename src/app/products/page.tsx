import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCatalogView } from "@/components/product-catalog-view";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "ศูนย์รวมเครื่องพิมพ์ & วัสดุสิ้นเปลือง (Printers & Supplies) | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมเครื่องพิมพ์คุณภาพสูง หมึกพิมพ์ ริบบอนบาร์โค้ด และวัสดุสิ้นเปลืองทางการแพทย์สำหรับโรงพยาบาลและองค์กร พร้อมสเปกและเอกสาร Datasheet / TOR",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Catalog Content */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ProductCatalogView />
        </Suspense>
      </main>

      {/* Standard Footer */}
      <Footer />
    </div>
  );
}

