import { z } from "zod";
import { TABLE_COLUMNS } from "./table-columns";
import { HttpError } from "./api-error";
export const recordId = z.union([z.number().int().positive().safe(), z.string().regex(/^[1-9]\d{0,14}$/)]);
export function tableName(value: string) {
  const table = value.replace(/^public\./, "").toUpperCase();
  if (!Object.hasOwn(TABLE_COLUMNS, table)) throw new HttpError(400, "ตารางนี้ไม่ได้รับอนุญาต");
  return table;
}
export function columnName(table: string, column: string) {
  if (!TABLE_COLUMNS[tableName(table)].includes(column)) throw new HttpError(400, "คอลัมน์นี้ไม่ได้รับอนุญาต");
  return `"${column}"`;
}
export function selectColumns(table: string, select = "*") {
  return select === "*" ? "*" : select.split(",").map(v => columnName(table, v.trim())).join(", ");
}
const jsonValue: z.ZodType<unknown> = z.lazy(() => z.union([z.string().max(20_000_000), z.number().finite(), z.boolean(), z.null(), z.array(jsonValue).max(1000), z.record(jsonValue)]));
export const saveSchema = z.object({
  table: z.string().min(1).max(80), action: z.enum(["insert", "update", "upsert", "delete"]).optional(),
  data: z.union([z.record(jsonValue), z.array(z.record(jsonValue)).min(1).max(100)]).optional(),
  id: recordId.optional(), idColumn: z.string().default("id"), match: z.record(z.union([z.string().max(500), z.number().finite(), z.boolean()])).optional(),
}).strict();
export function validateData(table: string, data: Record<string, unknown>) {
  if (!Object.keys(data).length) throw new HttpError(400, "กรุณาระบุข้อมูล");
  for (const [key, value] of Object.entries(data)) {
    columnName(table, key);
    if (["is_active", "is_featured", "show_on_home"].includes(key) && typeof value !== "boolean") throw new HttpError(400, "สถานะต้องเป็น boolean");
    if (["sort_order", "display_order"].includes(key) && (!Number.isSafeInteger(value) || Number(value) < 0)) throw new HttpError(400, "ลำดับต้องเป็นจำนวนเต็มตั้งแต่ 0");
    if (["title", "name"].includes(key) && (typeof value !== "string" || !value.trim())) throw new HttpError(400, "กรุณาระบุชื่อ");
  }
  return data;
}
export const activitySchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(1).max(500), title_en: z.string().max(500).nullable().optional(),
  category: z.string().trim().min(1).max(100), event_date: z.union([z.string().date(), z.literal(""), z.null()]).optional(),
  location: z.string().max(1000).nullable().optional(), short_description: z.string().max(5000).nullable().optional(),
  content: z.string().max(100000).nullable().optional(), cover_image_url: z.string().max(20_000_000).nullable().optional(),
  gallery_images: z.array(z.string().max(20_000_000)).max(100).optional(), tags: z.array(z.string().max(100)).max(50).optional(),
  is_featured: z.boolean().optional(), is_active: z.boolean().optional(), sort_order: z.number().int().nonnegative().optional(),
}).strict();
