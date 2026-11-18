import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";

let contactColumnReady: Promise<void> | null = null;

async function ensureContactReadColumn() {
  if (!contactColumnReady) {
    contactColumnReady = query(
      `ALTER TABLE public."TB_CONTACT_MESSAGES" ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`
    )
      .then(() => undefined)
      .catch((err) => {
        contactColumnReady = null;
        throw err;
      });
  }
  return contactColumnReady;
}

const patchSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    is_read: z.boolean(),
  })
  .strict();

const deleteSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureContactReadColumn();
    const res = await query(
      `SELECT id, first_name, last_name, email, phone, subject, message,
              COALESCE(is_read, false) AS is_read, created_at
       FROM public."TB_CONTACT_MESSAGES"
       ORDER BY id DESC
       LIMIT 500`
    );
    return NextResponse.json(
      { success: true, data: res.rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureContactReadColumn();
    const body = patchSchema.parse(await req.json());
    const res = await query(
      `UPDATE public."TB_CONTACT_MESSAGES"
       SET is_read = $1
       WHERE id = $2
       RETURNING id, is_read`,
      [body.is_read, body.id]
    );
    if (!res.rowCount) throw new HttpError(404, "ไม่พบข้อความนี้");
    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = deleteSchema.parse(await req.json());
    const res = await query(
      `DELETE FROM public."TB_CONTACT_MESSAGES" WHERE id = $1 RETURNING id`,
      [body.id]
    );
    if (!res.rowCount) throw new HttpError(404, "ไม่พบข้อความนี้");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
