import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pgSelect, query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
const defaults = ["Canon", "HP", "Epson", "Brother", "Zebra", "TSC", "Bixolon", "Ricoh", "Fujifilm", "Kyocera", "Other"];
export async function GET() {
  try {
    const rows = await pgSelect({ table: "TBM_PROGRAM_OPTIONS", where: { option_type: "brand", is_active: true }, orderBy: "display_order" });
    return NextResponse.json({ success: true, brands: rows.map(r => ({ value: r.value, label: r.label || r.value })) });
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const rows = body.action === "seed" ? (z.object({ action: z.literal("seed") }).strict().parse(body), defaults.map((value, i) => ({ value, label: value, display_order: i + 1 }))) : [z.object({ value: z.string().trim().min(1).max(200), label: z.string().trim().min(1).max(500), display_order: z.number().int().nonnegative().default(50) }).strict().parse(body)];
    // One statement makes seeding atomic.
    const result = await query(`INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
      SELECT 'brand', value, label, display_order, true FROM jsonb_to_recordset($1::jsonb) AS x(value text, label text, display_order integer)
      ON CONFLICT (option_type,value) DO UPDATE SET label = EXCLUDED.label, display_order = EXCLUDED.display_order, updated_at = now() RETURNING *`, [JSON.stringify(rows)]);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) { return apiError(error); }
}
