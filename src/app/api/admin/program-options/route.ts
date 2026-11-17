import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pgSelect, pgDelete, query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { recordId } from "@/lib/data-validation";
const schema = z.object({ option_type: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(200), label: z.string().max(500).optional(), display_order: z.number().int().nonnegative().default(0), is_active: z.boolean().default(true) }).strict();
export async function GET() {
  try {
    const rows = await pgSelect({ table: "TBM_PROGRAM_OPTIONS", where: { is_active: true }, orderBy: "display_order" });
    const options = (...types: string[]) => rows.filter(r => types.includes(r.option_type)).map(r => ({ value: r.value, label: r.label || r.value }));
    return NextResponse.json({ success: true, solutionGroups: options("solution_group"), programCategories: options("program_category"), printerCategories: options("printer", "printer_category"), supplyCategories: options("supply", "supply_category"), hardwareCategories: options("hardware", "hardware_category"), networkCategories: options("network", "network_category") });
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req); const data = schema.parse(await req.json());
    const result = await query(`INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (option_type,value) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active, updated_at = now() RETURNING *`,
      [data.option_type, data.value, data.label || data.value, data.display_order, data.is_active]);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: NextRequest) {
  try { await requireAdmin(req); const data = await pgDelete("TBM_PROGRAM_OPTIONS", recordId.parse(req.nextUrl.searchParams.get("id"))); if (!data) throw new HttpError(404, "ไม่พบรายการ"); return NextResponse.json({ success: true }); }
  catch (error) { return apiError(error); }
}
