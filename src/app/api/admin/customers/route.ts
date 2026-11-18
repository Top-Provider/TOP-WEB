import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";
import { ensureHospitalLogoColumn } from "@/lib/public-customers";

const customerName = z.string().trim().min(1, "กรุณาระบุชื่อโรงพยาบาล").max(300);
const logoUrlSchema = z.string().trim().max(10_000_000).nullable().optional();
const singleCustomerSchema = z.object({ customerName, logoUrl: logoUrlSchema }).strict();
const createCustomerSchema = z.union([
  singleCustomerSchema,
  z
    .object({
      items: z.array(singleCustomerSchema).min(1, "กรุณาระบุโรงพยาบาลอย่างน้อย 1 แห่ง").max(100),
    })
    .strict(),
]);
const updateCustomerSchema = z
  .object({
    customerId: z.coerce.number().int().positive(),
    customerName: customerName.optional(),
    logoUrl: logoUrlSchema,
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.customerName !== undefined ||
      data.logoUrl !== undefined ||
      data.isActive !== undefined,
    {
      message: "กรุณาระบุข้อมูลที่ต้องการแก้ไข",
    }
  );

interface CustomerRow {
  id: string | number;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

function formatCustomer(row: CustomerRow) {
  return {
    customerId: Number(row.id),
    customerName: row.name,
    logoUrl: row.logo_url || null,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

async function listCustomers(activeOnly = false) {
  await ensureHospitalLogoColumn();
  const result = await query(
    `SELECT id, name,
       CASE WHEN logo_url LIKE 'data:%' THEN '/api/customer-image/' || id ELSE logo_url END AS logo_url,
       is_active, created_at
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
    await ensureHospitalLogoColumn();
    const parsed = createCustomerSchema.parse(await req.json());
    const rawItems = "items" in parsed ? parsed.items : [parsed];

    // Deduplicate within batch (case-insensitive)
    const seen = new Set<string>();
    const items = rawItems.filter((item) => {
      const key = item.customerName.toLocaleLowerCase("th");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const existingResult = await query(`SELECT lower(name) AS lname FROM public."TBM_HD_HOSPITALS"`);
    const existingSet = new Set(
      (existingResult.rows as Array<{ lname: string }>).map((r) => r.lname)
    );

    const toInsert = items.filter((item) => !existingSet.has(item.customerName.toLowerCase()));
    const skippedCount = items.length - toInsert.length;

    if (toInsert.length === 0) {
      throw new HttpError(409, "ชื่อโรงพยาบาลที่ระบุมีอยู่ในระบบแล้วทั้งหมด");
    }

    for (const item of toInsert) {
      await query(
        `INSERT INTO public."TBM_HD_HOSPITALS" (name, logo_url) VALUES ($1, $2)`,
        [item.customerName, item.logoUrl || null]
      );
    }

    return NextResponse.json(
      {
        success: true,
        insertedCount: toInsert.length,
        skippedCount,
        data: await listCustomers(),
      },
      { status: 201 }
    );
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

    const hasLogoUpdate = body.logoUrl !== undefined;
    const result = await query(
      `UPDATE public."TBM_HD_HOSPITALS"
       SET name = COALESCE($1, name),
           is_active = COALESCE($2, is_active),
           logo_url = CASE WHEN $3 THEN $4 ELSE logo_url END
       WHERE id = $5
       RETURNING id`,
      [
        body.customerName ?? null,
        body.isActive ?? null,
        hasLogoUpdate,
        body.logoUrl || null,
        body.customerId,
      ]
    );
    if (!result.rowCount) throw new HttpError(404, "ไม่พบลูกค้านี้");

    return NextResponse.json({ success: true, data: await listCustomers() });
  } catch (error) {
    return apiError(error);
  }
}
