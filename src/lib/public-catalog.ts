import { query } from "./db";
import type { ProductItemResponse } from "@/app/api/products/route";

export async function listPublicProducts(options: {
  categoryId?: string;
  limit?: number;
  orderDir?: "asc" | "desc";
} = {}): Promise<Record<string, unknown>[]> {
  const { categoryId, limit = 200, orderDir = "asc" } = options;
  const params: unknown[] = [];
  const conditions = [`is_active = true`];
  if (categoryId) {
    params.push(categoryId);
    conditions.push(`category_id = $${params.length}`);
  }
  params.push(Math.min(Math.max(1, Math.trunc(limit)), 1000));
  const dir = orderDir === "desc" ? "DESC" : "ASC";

  const sql = `SELECT
    id, name, sku, slug, category_id, sub_category, brand, product_type,
    short_description, full_description, specifications, bullet_points,
    compatible_products, datasheet_en_url, tor_th_url, is_featured, is_active,
    CASE WHEN cover_image_url LIKE 'data:%' THEN '/api/product-image/' || id ELSE cover_image_url END AS cover_image_url,
    COALESCE(
      (SELECT jsonb_agg(elem)
       FROM jsonb_array_elements_text(COALESCE(gallery_images, '[]'::jsonb)) elem
       WHERE elem NOT LIKE 'data:%' OR length(elem) <= 35000),
      '[]'::jsonb
    ) AS gallery_images
    FROM public."TB_PRODUCTS"
    WHERE ${conditions.join(" AND ")}
    ORDER BY id ${dir}
    LIMIT $${params.length}`;

  return (await query(sql, params)).rows as Record<string, unknown>[];
}

export function mapProductRow(
  item: Record<string, unknown>,
  options: {
    defaultCategory?: string;
    defaultSubCategory?: string;
    defaultBrand?: string;
    defaultProductType?: string;
    fallbackImage: string;
    strictPrinterSupply?: boolean;
  }
): ProductItemResponse {
  const rawType = String(item.product_type || options.defaultProductType || "printer");
  const productType = options.strictPrinterSupply
    ? rawType === "supply"
      ? "supply"
      : "printer"
    : rawType;

  return {
    id: Number(item.id),
    name: String(item.name || ""),
    sku: String(item.sku || ""),
    slug: String(item.slug || `prod-${item.id}`),
    category_id: String(item.category_id || options.defaultCategory || "Printing"),
    sub_category: String(item.sub_category || options.defaultSubCategory || ""),
    brand: String(item.brand || options.defaultBrand || ""),
    product_type: productType as ProductItemResponse["product_type"],
    short_description: String(item.short_description || ""),
    full_description: String(item.full_description || ""),
    specifications: Array.isArray(item.specifications)
      ? (item.specifications as { label: string; value: string }[])
      : [],
    cover_image_url:
      typeof item.cover_image_url === "string" && item.cover_image_url
        ? item.cover_image_url
        : options.fallbackImage,
    gallery_images: Array.isArray(item.gallery_images)
      ? (item.gallery_images as string[])
      : [],
    compatible_products: Array.isArray(item.compatible_products)
      ? (item.compatible_products as string[])
      : [],
    datasheet_en_url: String(item.datasheet_en_url || ""),
    tor_th_url: String(item.tor_th_url || ""),
    is_active: item.is_active !== false,
  };
}

export async function listPublicSoftware(limit = 30): Promise<Record<string, unknown>[]> {
  const safeLimit = Math.min(Math.max(1, Math.trunc(limit)), 100);
  const sql = `SELECT
    id, category_id, program_code, name, slug, client_subtitle, short_description, full_description,
    video_url, key_features, metric_label, metric_value, is_active, display_order,
    feature_1_badge, feature_1_title, feature_1_desc, feature_1_bullets,
    feature_2_badge, feature_2_title, feature_2_desc, feature_2_highlights, feature_2_tags,
    CASE WHEN cover_image_url LIKE 'data:%' THEN '/api/software-image/' || id ELSE cover_image_url END AS cover_image_url,
    CASE WHEN feature_1_image LIKE 'data:%' THEN '/api/software-image/' || id || '?field=feature_1_image' ELSE feature_1_image END AS feature_1_image,
    CASE WHEN feature_2_image LIKE 'data:%' THEN '/api/software-image/' || id || '?field=feature_2_image' ELSE feature_2_image END AS feature_2_image
    FROM public."TB_PRODUCT_SOFTWARE"
    WHERE is_active = true
    ORDER BY id ASC
    LIMIT $1`;
  return (await query(sql, [safeLimit])).rows as Record<string, unknown>[];
}

export async function listPublicSolutionTopics(): Promise<Record<string, unknown>[]> {
  const sql = `SELECT
    id, tab_category, title, subtitle, counter_text, short_description, full_description,
    key_features, cta_text, cta_link, sort_order, is_active,
    CASE WHEN cover_image_url LIKE 'data:%' THEN '/api/topic-image/' || id ELSE cover_image_url END AS cover_image_url
    FROM public."TB_SOLUTION_TOPICS"
    WHERE is_active = true
    ORDER BY sort_order ASC`;
  return (await query(sql)).rows as Record<string, unknown>[];
}
