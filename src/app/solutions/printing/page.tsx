import { Suspense } from "react";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PrintingSolutionView } from "@/components/printing-solution-view";
import type { ProductItemResponse } from "@/app/api/products/route";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Printing & Supply Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมเครื่องพิมพ์คุณภาพสูง หมึกพิมพ์ ริบบอนบาร์โค้ด และวัสดุสิ้นเปลืองทางการแพทย์สำหรับโรงพยาบาลและองค์กร พร้อมสเปกและเอกสาร Datasheet / TOR",
};

export default async function PrintingSolutionPage() {
  let initialProducts: ProductItemResponse[] = [];
  try {
    const fetchMerged = supabase
      .from("TB_PRODUCTS")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 3500)
    );

    const { data: records } = await Promise.race([fetchMerged, timeoutPromise]);
    const combinedRecords: Record<string, unknown>[] = records && Array.isArray(records) ? records : [];

    if (combinedRecords.length > 0) {
      initialProducts = combinedRecords.map((item) => ({
        id: Number(item.id),
        name: String(item.name || ""),
        sku: String(item.sku || ""),
        slug: String(item.slug || `prod-${item.id}`),
        category_id: String(item.category_id || "Printing"),
        sub_category: String(item.sub_category || ""),
        brand: String(item.brand || ""),
        product_type: (item.product_type === "supply" ? "supply" : "printer"),
        short_description: String(item.short_description || ""),
        full_description: String(item.full_description || ""),
        specifications: Array.isArray(item.specifications) ? item.specifications : [],
        cover_image_url: String(item.cover_image_url || "/images/printer-product.png"),
        gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : [],
        compatible_products: Array.isArray(item.compatible_products) ? item.compatible_products : [],
        datasheet_en_url: String(item.datasheet_en_url || ""),
        tor_th_url: String(item.tor_th_url || ""),
        is_active: item.is_active !== false,
      }));
    }
  } catch (err) {
    console.error("Error loading products on printing solution page:", err);
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

