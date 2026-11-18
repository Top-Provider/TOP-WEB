import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { pgSelect, pgWrite } from "@/lib/db";
import { saveSchema, tableName, activitySchema } from "@/lib/data-validation";
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = saveSchema.parse(await req.json());
    const table = tableName(body.table);
    const action = body.action || (body.id !== undefined || body.match ? "update" : "insert");
    if (table === "TB_ACTIVITIES" && body.data) {
      for (const row of Array.isArray(body.data) ? body.data : [body.data]) {
        (action === "update" ? activitySchema.partial() : activitySchema).parse(row);
      }
    }
    const data = await pgWrite(table, action, body.data, body.id !== undefined ? { [body.idColumn]: body.id } : body.match || {}, body.idColumn);
    if (!data.length && ["update", "delete"].includes(action)) throw new HttpError(404, "ไม่พบรายการ");
    return NextResponse.json({ success: true, action, table, data, count: data.length });
  } catch (error) { return apiError(error); }
}
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const p = req.nextUrl.searchParams;
    const table = tableName(p.get("table") || "");
    const data = await pgSelect({ table, select: p.get("select") || "*", id: p.get("id") || undefined, idColumn: p.get("idColumn") || "id", orderBy: p.get("orderBy") || "id", orderDir: p.get("orderDir") === "desc" ? "desc" : "asc", limit: Number(p.get("limit") || 1000) });
    return NextResponse.json({ success: true, data, count: data.length }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
