import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const upsertCustomerAccountSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    username: z
      .string()
      .trim()
      .min(3)
      .max(254)
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9@._+-]{2,253}$/)
      .transform((v) => v.toLowerCase()),
    org_name: z.string().trim().min(1).max(300),
    password: z.string().min(8).max(256).optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const res = await query(
      `SELECT id, username, org_name, is_active, created_at
       FROM public.admin_accounts
       WHERE role = 'viewer'
       ORDER BY id ASC`
    );
    return NextResponse.json(
      { success: true, data: res.rows.map((r) => ({ ...r, id: Number(r.id) })) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = upsertCustomerAccountSchema.parse(await req.json());

    if (body.id) {
      const existing = await query(
        `SELECT id, role FROM public.admin_accounts WHERE id = $1`,
        [body.id]
      );
      if (!existing.rows.length || existing.rows[0].role !== "viewer") {
        throw new HttpError(404, "ไม่พบบัญชีลูกค้านี้");
      }

      if (body.password) {
        const hash = await hashPassword(body.password);
        await query(
          `UPDATE public.admin_accounts
           SET org_name = $1, password_hash = $2, is_active = COALESCE($3, is_active)
           WHERE id = $4`,
          [body.org_name, hash, body.is_active ?? null, body.id]
        );
        await query(`DELETE FROM public.admin_sessions WHERE account_id = $1`, [body.id]);
      } else {
        await query(
          `UPDATE public.admin_accounts
           SET org_name = $1, is_active = COALESCE($2, is_active)
           WHERE id = $3`,
          [body.org_name, body.is_active ?? null, body.id]
        );
      }
    } else {
      if (!body.password) {
        throw new HttpError(400, "กรุณากำหนดรหัสผ่านอย่างน้อย 8 ตัวอักษร");
      }
      const dup = await query(`SELECT id FROM public.admin_accounts WHERE username = $1`, [body.username]);
      if (dup.rows.length) {
        throw new HttpError(409, "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว");
      }
      const hash = await hashPassword(body.password);
      await query(
        `INSERT INTO public.admin_accounts (username, password_hash, role, org_name, is_active)
         VALUES ($1, $2, 'viewer', $3, $4)`,
        [body.username, hash, body.org_name, body.is_active ?? true]
      );
    }

    const listRes = await query(
      `SELECT id, username, org_name, is_active, created_at
       FROM public.admin_accounts
       WHERE role = 'viewer'
       ORDER BY id ASC`
    );
    await query(
      `INSERT INTO public."TBM_HD_HOSPITALS" (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [body.org_name]
    );
    return NextResponse.json({
      success: true,
      data: listRes.rows.map((r) => ({ ...r, id: Number(r.id) })),
    });
  } catch (error) {
    return apiError(error);
  }
}

