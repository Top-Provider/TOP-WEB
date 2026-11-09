import { Suspense } from "react";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HardwareSolutionView } from "@/components/hardware-solution-view";
import type { ProductItemResponse } from "@/app/api/products/route";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hardware Solution | TOP PROVIDER SYSTEM GROUP",
  description:
    "ศูนย์รวมอุปกรณ์ฮาร์ดแวร์ทางการแพทย์และไอทีระดับองค์กร (Handheld Barcode Scanner, Barcode Scanner, All-in-One PC, Scanner ความเร็วสูง, UPS, Display, Projector) พร้อม Datasheet และ TOR",
};

function resolveProductImageUrl(id: unknown, url: unknown, fallback: string): string {
  if (typeof url !== "string" || !url) return fallback;
  if (url.startsWith("data:")) {
    return `/api/product-image/${id}`;
  }
  return url;
}

export default async function HardwareSolutionPage() {
  let initialProducts: ProductItemResponse[] = [];
  try {
    const { data: records, error } = await supabase
      .from("TB_PRODUCTS")
      .select(
        "id, name, sku, slug, category_id, sub_category, brand, product_type, short_description, full_description, specifications, cover_image_url, gallery_images, compatible_products, datasheet_en_url, tor_th_url, is_active"
      )
      .eq("is_active", true)
      .ilike("category_id", "Hardware")
      .order("id", { ascending: true })
      .limit(100);

    const combinedRecords: Record<string, unknown>[] = records && Array.isArray(records) ? records : [];

    if (!error && combinedRecords.length > 0) {
      initialProducts = combinedRecords.map((item) => ({
        id: Number(item.id),
        name: String(item.name || ""),
        sku: String(item.sku || ""),
        slug: String(item.slug || `prod-${item.id}`),
        category_id: String(item.category_id || "Hardware"),
        sub_category: String(item.sub_category || ""),
        brand: String(item.brand || ""),
        product_type: String(item.product_type || "hardware"),
        short_description: String(item.short_description || ""),
        full_description: String(item.full_description || ""),
        specifications: Array.isArray(item.specifications) ? (item.specifications as { label: string; value: string }[]) : [],
        cover_image_url: resolveProductImageUrl(
          item.id,
          item.cover_image_url,
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
        ),
        gallery_images: Array.isArray(item.gallery_images)
          ? item.gallery_images.filter((img) => typeof img === "string" && (!img.startsWith("data:") || img.length <= 35000))
          : [],
        compatible_products: Array.isArray(item.compatible_products) ? (item.compatible_products as string[]) : [],
        datasheet_en_url: String(item.datasheet_en_url || ""),
        tor_th_url: String(item.tor_th_url || ""),
        is_active: item.is_active !== false,
      }));
    }
  } catch (err) {
    console.error("Error loading products on hardware solution page:", err);
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
