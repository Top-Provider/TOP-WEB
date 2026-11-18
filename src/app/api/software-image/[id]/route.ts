import { NextRequest } from "next/server";
import { pgSelect } from "@/lib/db";
import { recordId } from "@/lib/data-validation";
import { imageResponse } from "@/lib/image-response";
import { apiError, HttpError } from "@/lib/api-error";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const requested = req.nextUrl.searchParams.get("field") || "cover_image_url";
    const allowed = "TB_PRODUCT_SOFTWARE" === "TB_PRODUCT_SOFTWARE" ? ["cover_image_url", "feature_1_image", "feature_2_image"] : ["cover_image_url"];
    const field = allowed.includes(requested) ? requested : "cover_image_url";
    const [row] = await pgSelect({ table: "TB_PRODUCT_SOFTWARE", select: field, id: recordId.parse((await params).id), where: { is_active: true } });
    if (!row) throw new HttpError(404, "ไม่พบภาพ");
    return imageResponse(row[field], req.url, "/images/logo.png");
  } catch (error) { return apiError(error); }
}