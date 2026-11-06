import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

const supabase = createClient(cleanUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface ProductItemResponse {
  id: number;
  name: string;
  sku: string;
  slug: string;
  category_id: string;
  sub_category?: string;
  brand?: string;
  product_type: "printer" | "supply";
  short_description?: string;
  full_description?: string;
  specifications: { label: string; value: string }[];
  cover_image_url: string;
  gallery_images: string[];
  compatible_products: string[];
  datasheet_en_url?: string;
  tor_th_url?: string;
  is_active: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type")?.toLowerCase(); // 'printer' | 'supply'
    const categoryParam = searchParams.get("category"); // 'Printing'
    const searchParam = searchParams.get("search")?.toLowerCase();

    // ดึงข้อมูลจากตารางรวม TB_PRODUCTS
    let query = supabase
      .from("TB_PRODUCTS")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: false });

    if (categoryParam) {
      query = query.eq("category_id", categoryParam);
    }
    if (typeParam && typeParam !== "all") {
      query = query.eq("product_type", typeParam);
    }

    const { data: productsData } = await query;
    const allRecords: Record<string, unknown>[] = productsData && Array.isArray(productsData) ? productsData : [];

    let products: ProductItemResponse[] = [];

    if (allRecords.length > 0) {
      products = allRecords.map((item) => {
        const specs = Array.isArray(item.specifications)
          ? (item.specifications as { label: string; value: string }[])
          : [];
        const compat = Array.isArray(item.compatible_products) && item.compatible_products.length > 0
          ? (item.compatible_products as string[])
          : (Array.isArray(item.bullet_points) ? (item.bullet_points as string[]) : []);

        return {
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
          specifications: specs,
          cover_image_url: String(item.cover_image_url || "/images/printer-product.png"),
          gallery_images: Array.isArray(item.gallery_images) ? (item.gallery_images as string[]) : [],
          compatible_products: compat,
          datasheet_en_url: String(item.datasheet_en_url || ""),
          tor_th_url: String(item.tor_th_url || ""),
          is_active: item.is_active !== false,
        };
      });
    } else {
      products = [];
    }

    // Filter by search query if provided
    if (searchParam) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchParam) ||
          p.sku.toLowerCase().includes(searchParam) ||
          (p.brand && p.brand.toLowerCase().includes(searchParam))
      );
    }

    return NextResponse.json({
      success: true,
      source: "database",
      count: products.length,
      products,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg, products: [] },
      { status: 500 }
    );
  }
}

