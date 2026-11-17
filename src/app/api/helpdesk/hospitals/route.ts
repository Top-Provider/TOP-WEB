import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
import { getDbPool, query } from "@/lib/db";

const addHospitalSchema = z.union([
  z.object({ name: z.string().trim().min(1).max(300) }).strict(),
  z.object({ names: z.array(z.string().trim().min(1).max(300)).min(1).max(5000) }).strict(),
]);

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const res = await query(
      `SELECT id, name FROM public."TBM_HD_HOSPITALS" WHERE is_active = true ORDER BY name ASC`
    );
    return NextResponse.json({ success: true, data: res.rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = addHospitalSchema.parse(await req.json());
    const rawNames = "names" in body ? body.names : [body.name];
    const uniqueNames = Array.from(
      new Set(rawNames.map((n) => n.trim()).filter((n) => n.length > 0))
    );

    let insertedCount = 0;
    if (uniqueNames.length > 0) {
      const client = await getDbPool().connect();
      try {
        await client.query("BEGIN");
        const insertRes = await client.query(
          `INSERT INTO public."TBM_HD_HOSPITALS" (name)
           SELECT unnest($1::text[])
           ON CONFLICT (name) DO NOTHING
           RETURNING id`,
          [uniqueNames]
        );
        insertedCount = insertRes.rowCount || 0;
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    const res = await query(
      `SELECT id, name FROM public."TBM_HD_HOSPITALS" WHERE is_active = true ORDER BY name ASC`
    );
    return NextResponse.json({
      success: true,
      insertedCount,
      totalSubmitted: uniqueNames.length,
      data: res.rows,
    });
  } catch (error) {
    return apiError(error);
  }
}
