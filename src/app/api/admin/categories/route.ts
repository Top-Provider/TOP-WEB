import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pgSelect, pgInsert, pgUpdate, pgDelete } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { recordId } from "@/lib/data-validation";
const schema = z.object({ category_id: z.string().trim().min(1).max(100), name: z.string().trim().min(1).max(200), is_active: z.boolean().optional() }).strict();
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    if (all) await requireAdmin(req);
    const categories = await pgSelect({ table: "TBM_PRODUCT_CATEGORIES", where: all ? {} : { is_active: true }, orderBy: "id" });
    return NextResponse.json({ success: true, categories, count: categories.length });
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try { await requireAdmin(req); const data = await pgInsert("TBM_PRODUCT_CATEGORIES", schema.parse(await req.json())); return NextResponse.json({ success: true, data }); }
  catch (error) { return apiError(error); }
}
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req); const { id, ...body } = await req.json();
    const data = await pgUpdate("TBM_PRODUCT_CATEGORIES", schema.partial().parse(body), recordId.parse(id));
    if (!data) throw new HttpError(404, "ไม่พบหมวดหมู่");
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req); const id = recordId.parse(req.nextUrl.searchParams.get("id") || (await req.json()).id);
    const data = await pgDelete("TBM_PRODUCT_CATEGORIES", id);
    if (!data) throw new HttpError(404, "ไม่พบหมวดหมู่");
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
