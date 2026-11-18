import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { recordId } from "@/lib/data-validation";
import { imageResponse } from "@/lib/image-response";
import { apiError, HttpError } from "@/lib/api-error";
import { ensureHospitalLogoColumn } from "@/lib/public-customers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureHospitalLogoColumn();
    const id = recordId.parse((await params).id);
    const result = await query(
      `SELECT logo_url FROM public."TBM_HD_HOSPITALS" WHERE id = $1 AND is_active = true LIMIT 1`,
      [id]
    );
    const row = result.rows[0] as { logo_url?: string | null } | undefined;
    if (!row) throw new HttpError(404, "ไม่พบภาพ");
    return imageResponse(row.logo_url, req.url, "/images/logo.png");
  } catch (error) {
    return apiError(error);
  }
}
