import { NextRequest } from "next/server";
import { pgSelect } from "@/lib/db";
import { recordId } from "@/lib/data-validation";
import { imageResponse } from "@/lib/image-response";
import { apiError, HttpError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [row] = await pgSelect({
      table: "TB_SOLUTION_TOPICS",
      select: "cover_image_url",
      id: recordId.parse((await params).id),
      where: { is_active: true },
    });
    if (!row) throw new HttpError(404, "ไม่พบภาพ");
    return imageResponse(row.cover_image_url, req.url, "/images/printer-product.png");
  } catch (error) {
    return apiError(error);
  }
}
