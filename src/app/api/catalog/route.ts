import { NextRequest, NextResponse } from "next/server";
import { pgSelect } from "@/lib/db";
import { apiError, HttpError } from "@/lib/api-error";
import { tableName } from "@/lib/data-validation";
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const table = tableName(p.get("table") || "");
    if (!["TB_PRODUCT_SOFTWARE", "TB_SOLUTION_TOPICS"].includes(table)) throw new HttpError(404, "ไม่พบข้อมูล");
    const data = await pgSelect({ table, where: { is_active: true }, orderBy: p.get("orderBy") || "id", orderDir: p.get("orderDir") === "desc" ? "desc" : "asc", limit: Number(p.get("limit") || 100) });
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error); }
}
