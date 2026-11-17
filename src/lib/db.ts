import { Pool } from "pg";
import { databaseConfig } from "./db-config";
import { columnName, selectColumns, tableName, validateData } from "./data-validation";
import { HttpError } from "./api-error";
const globalDb = globalThis as typeof globalThis & { topDbPool?: Pool };
export function getDbPool(): Pool {
  if (!globalDb.topDbPool) {
    globalDb.topDbPool = new Pool(databaseConfig());
    globalDb.topDbPool.on("error", err => console.error("[PostgreSQL pool]", err));
  }
  return globalDb.topDbPool;
}
export async function query(text: string, params?: unknown[]) { return getDbPool().query(text, params); }
export async function pgSelect(options: {
  table: string; select?: string; id?: string | number; idColumn?: string;
  orderBy?: string; orderDir?: "asc" | "desc"; limit?: number; offset?: number; where?: Record<string, unknown>;
}) {
  const { select = "*", id, idColumn = "id", orderBy, orderDir = "asc", limit, offset = 0, where = {} } = options;
  const table = tableName(options.table);
  const params: unknown[] = [];
  const conditions = Object.entries({ ...where, ...(id !== undefined ? { [idColumn]: id } : {}) }).map(([key, value]) => {
    params.push(value); return `${columnName(table, key)} = $${params.length}`;
  });
  let sql = `SELECT ${selectColumns(table, select)} FROM public."${table}"`;
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  if (orderBy) sql += ` ORDER BY ${columnName(table, orderBy)} ${orderDir === "desc" ? "DESC" : "ASC"}`;
  if (limit !== undefined) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new HttpError(400, "จำนวนรายการไม่ถูกต้อง");
    params.push(limit); sql += ` LIMIT $${params.length}`;
  }
  if (!Number.isSafeInteger(offset) || offset < 0) throw new HttpError(400, "ตำแหน่งรายการไม่ถูกต้อง");
  if (offset) { params.push(offset); sql += ` OFFSET $${params.length}`; }
  return (await query(sql, params)).rows;
}
function sqlValue(value: unknown) { return value !== null && typeof value === "object" ? JSON.stringify(value) : value ?? null; }
export async function pgInsert(table: string, data: Record<string, unknown>) {
  return (await pgWrite(table, "insert", data, {}))[0];
}
export async function pgUpdate(table: string, data: Record<string, unknown>, id: string | number, idColumn = "id") {
  return (await pgWrite(table, "update", data, { [idColumn]: id }))[0];
}
export async function pgDelete(table: string, id: string | number, idColumn = "id") {
  return (await pgWrite(table, "delete", undefined, { [idColumn]: id }))[0];
}
// Every mutation is atomic; neither failed writes nor empty reads switch databases.
export async function pgWrite(tableInput: string, action: "insert" | "update" | "upsert" | "delete", data: Record<string, unknown> | Record<string, unknown>[] | undefined, match: Record<string, unknown>, conflict = "id") {
  const table = tableName(tableInput);
  Object.keys(match).forEach(k => columnName(table, k));
  columnName(table, conflict);
  if ((action === "update" || action === "delete") && !Object.keys(match).length) throw new HttpError(400, "ต้องระบุเงื่อนไขรายการที่จะแก้ไขหรือลบ");
  const records = data ? (Array.isArray(data) ? data : [data]) : [];
  if (action !== "delete" && !records.length) throw new HttpError(400, "กรุณาระบุข้อมูล");
  if (action === "update" && records.length !== 1) throw new HttpError(400, "แก้ไขข้อมูลได้ครั้งละหนึ่งรายการ");
  records.forEach(row => validateData(table, row));
  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const output: Record<string, unknown>[] = [];
    if (action === "delete" || action === "update") {
      const record = records[0] || {};
      const keys = Object.keys(record).filter(k => !["id", "created_at", "updated_at"].includes(k));
      const values: unknown[] = action === "update" ? keys.map(k => sqlValue(record[k])) : [];
      const where = Object.entries(match).map(([key, value]) => { values.push(value); return `${columnName(table, key)} = $${values.length}`; });
      const sets = [...keys.map((key, i) => `${columnName(table, key)} = $${i + 1}`), '"updated_at" = now()'];
      const result = await client.query(`${action === "delete" ? "DELETE FROM" : "UPDATE"} public."${table}" ${action === "update" ? `SET ${sets.join(",")}` : ""} WHERE ${where.join(" AND ")} RETURNING *`, values);
      output.push(...result.rows);
    } else for (const record of records) {
      const keys = Object.keys(record);
      let sql = `INSERT INTO public."${table}" (${keys.map(k => columnName(table, k)).join(",")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")})`;
      if (action === "upsert") {
        const updates = keys.filter(k => ![conflict, "created_at", "updated_at"].includes(k)).map(k => `${columnName(table, k)} = EXCLUDED.${columnName(table, k)}`);
        updates.push('"updated_at" = now()');
        sql += ` ON CONFLICT (${columnName(table, conflict)}) DO UPDATE SET ${updates.join(",")}`;
      }
      const result = await client.query(`${sql} RETURNING *`, keys.map(k => sqlValue(record[k])));
      output.push(...result.rows);
    }
    await client.query("COMMIT"); return output;
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
