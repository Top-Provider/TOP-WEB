import { z } from "zod";
import { query } from "./db";
import { getCategoryLabel, formatActivityRow } from "./activities";

let videoColumnReady: Promise<void> | null = null;
export async function ensureActivityVideoColumn() {
  if (!videoColumnReady) {
    videoColumnReady = query(
      `ALTER TABLE public."TB_ACTIVITIES" ADD COLUMN IF NOT EXISTS video_url TEXT`
    )
      .then(() => undefined)
      .catch((err) => {
        videoColumnReady = null;
        throw err;
      });
  }
  return videoColumnReady;
}
export const activityQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().min(0).max(1000000).default(0),
  category: z.string().max(100).default("all"), search: z.string().trim().max(200).default(""),
  sort: z.enum(["asc", "desc"]).default("desc"), featured: z.boolean().default(false),
});
export function categoryAliases(category: string) {
  const legacy: Record<string, string[]> = { company_internal: ["culture"], seminar: ["exhibition", "การสัมนา"], hr_development: ["training"], orientation: ["Orieantation"], certification: ["แต่งตั้งรับรองผลัตภัณฑ์"] };
  return [...new Set([category, getCategoryLabel(category), ...(legacy[category] || [])])];
}
export function activityFilters(options: z.infer<typeof activityQuery>, all = false) {
  const conditions: string[] = all ? [] : ["a.is_active = true"];
  const values: unknown[] = [];
  if (options.category !== "all") { values.push(categoryAliases(options.category)); conditions.push(`a.category = ANY($${values.length}::text[])`); }
  if (options.featured) conditions.push("a.is_featured = true");
  if (options.search) {
    values.push(`%${options.search.replace(/[\\%_]/g, "\\$&")}%`);
    conditions.push(`(a.title ILIKE $${values.length} OR a.title_en ILIKE $${values.length} OR a.short_description ILIKE $${values.length} OR a.location ILIKE $${values.length} OR a.tags::text ILIKE $${values.length} OR c.name ILIKE $${values.length})`);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", values };
}
export async function listActivities(input: unknown = {}, all = false) {
  if (all) await ensureActivityVideoColumn();
  const options = activityQuery.parse(input);
  const { where, values } = activityFilters(options, all);
  const direction = options.sort === "asc" ? "ASC" : "DESC";
  const fields = all
    ? `a.id,a.customer_id,c.name AS customer_name,a.title,a.title_en,a.category,a.event_date,a.location,a.short_description,a.content,a.cover_image_url,a.gallery_images,a.tags,a.is_featured,a.is_active,a.sort_order,a.created_at,a.updated_at,
    CASE WHEN a.video_url LIKE 'data:%' THEN '/api/activity-video/' || a.id ELSE a.video_url END AS video_url`
    : `a.id,a.customer_id,c.name AS customer_name,a.title,a.title_en,a.category,a.event_date,a.location,a.short_description,a.is_featured,a.is_active,a.sort_order,
    CASE WHEN a.cover_image_url LIKE 'data:%' THEN '/api/activity-image/' || a.id ELSE a.cover_image_url END AS cover_image_url,
    CASE WHEN a.video_url LIKE 'data:%' THEN '/api/activity-video/' || a.id ELSE a.video_url END AS video_url,
    (CASE WHEN a.cover_image_url IS NOT NULL AND a.cover_image_url <> '' THEN 1 ELSE 0 END +
    CASE WHEN jsonb_typeof(a.gallery_images::jsonb) = 'array' THEN jsonb_array_length(a.gallery_images::jsonb) ELSE 0 END) AS photo_count`;
  // Count and page share one statement/snapshot, including an empty last page.
  const result = await query(`SELECT
    (SELECT count(*) FROM public."TB_ACTIVITIES" a LEFT JOIN public."TBM_HD_HOSPITALS" c ON c.id = a.customer_id ${where})::int AS total,
    COALESCE((SELECT json_agg(page) FROM (SELECT ${fields} FROM public."TB_ACTIVITIES" a LEFT JOIN public."TBM_HD_HOSPITALS" c ON c.id = a.customer_id ${where}
    ORDER BY a.event_date ${direction} NULLS LAST, a.id ${direction} LIMIT $${values.length + 1} OFFSET $${values.length + 2}) page), '[]'::json) AS items`, [...values, options.limit, options.offset]);
  const row = result.rows[0];
  return { data: (row.items as Record<string, unknown>[]).map(item => ({ ...formatActivityRow(item), photo_count: Number(item.photo_count || 0) })), total: Number(row.total), limit: options.limit, offset: options.offset };
}
export async function getActivity(id: string | number, all = false) {
  if (all) await ensureActivityVideoColumn();
  const result = await query(
    `SELECT a.*, c.name AS customer_name
     FROM public."TB_ACTIVITIES" a
     LEFT JOIN public."TBM_HD_HOSPITALS" c ON c.id = a.customer_id
     WHERE a.id = $1 ${all ? "" : "AND a.is_active = true"}`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return null;
  const formatted = formatActivityRow(row);
  if (formatted.video_url?.startsWith("data:")) {
    formatted.video_url = `/api/activity-video/${formatted.id}`;
  }
  return formatted;
}
