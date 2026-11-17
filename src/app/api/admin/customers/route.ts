import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";

const customerName = z.string().trim().min(1, "กรุณาระบุชื่อโรงพยาบาล").max(300);
const createCustomerSchema = z.object({ customerName }).strict();
const updateCustomerSchema = z
  .object({
    customerId: z.coerce.number().int().positive(),
    customerName: customerName.optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => data.customerName !== undefined || data.isActive !== undefined, {
    message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข",
  });

interface CustomerRow {
  id: string | number;
  name: string;
  is_active: boolean;
  created_at: string;
}

function formatCustomer(row: CustomerRow) {
  return {
    customerId: Number(row.id),
    customerName: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

async function listCustomers(activeOnly = false) {
  const result = await query(
    `SELECT id, name, is_active, created_at
     FROM public."TBM_HD_HOSPITALS"
     ${activeOnly ? "WHERE is_active = true" : ""}
     ORDER BY name ASC`
  );
  return (result.rows as CustomerRow[]).map(formatCustomer);
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const data = await listCustomers(req.nextUrl.searchParams.get("activeOnly") === "true");
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = createCustomerSchema.parse(await req.json());
    const duplicate = await query(
      `SELECT id FROM public."TBM_HD_HOSPITALS" WHERE lower(name) = lower($1) LIMIT 1`,
      [body.customerName]
    );
    if (duplicate.rowCount) throw new HttpError(409, "ชื่อโรงพยาบาลนี้มีอยู่ในระบบแล้ว");

    await query(`INSERT INTO public."TBM_HD_HOSPITALS" (name) VALUES ($1)`, [body.customerName]);
    return NextResponse.json({ success: true, data: await listCustomers() }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = updateCustomerSchema.parse(await req.json());

    if (body.customerName !== undefined) {
      const duplicate = await query(
        `SELECT id FROM public."TBM_HD_HOSPITALS"
         WHERE lower(name) = lower($1) AND id <> $2 LIMIT 1`,
        [body.customerName, body.customerId]
      );
      if (duplicate.rowCount) throw new HttpError(409, "ชื่อโรงพยาบาลนี้มีอยู่ในระบบแล้ว");
    }

    const result = await query(
      `UPDATE public."TBM_HD_HOSPITALS"
       SET name = COALESCE($1, name), is_active = COALESCE($2, is_active)
       WHERE id = $3
       RETURNING id`,
      [body.customerName ?? null, body.isActive ?? null, body.customerId]
    );
    if (!result.rowCount) throw new HttpError(404, "ไม่พบลูกค้านี้");

    return NextResponse.json({ success: true, data: await listCustomers() });
  } catch (error) {
    return apiError(error);
  }
}
