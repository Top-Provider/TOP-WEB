import { NextRequest, NextResponse } from "next/server";
import { pgSelect } from "@/lib/db";
import { recordId } from "@/lib/data-validation";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureActivityVideoColumn } from "@/lib/activity-repository";
import { apiError, HttpError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureActivityVideoColumn();
    const id = recordId.parse((await params).id);
    const isAdmin = await requireAdmin(req).then(
      () => true,
      () => false
    );
    const [row] = await pgSelect({
      table: "TB_ACTIVITIES",
      select: "video_url",
      id,
      where: isAdmin ? undefined : { is_active: true },
    });
    if (!row || typeof row.video_url !== "string" || !row.video_url) {
      throw new HttpError(404, "ไม่พบวิดีโอ");
    }

    const value = row.video_url;
    const match = value.match(
      /^data:(video\/(?:mp4|webm|ogg|quicktime));base64,([A-Za-z0-9+/=\s]+)$/
    );
    if (match) {
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      const total = buffer.length;
      const rangeHeader = req.headers.get("range");

      if (rangeHeader) {
        const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (rangeMatch) {
          const start = Number(rangeMatch[1]);
          const end = rangeMatch[2]
            ? Math.min(Number(rangeMatch[2]), total - 1)
            : total - 1;
          if (start >= total || start > end) {
            return new NextResponse(null, {
              status: 416,
              headers: { "Content-Range": `bytes */${total}` },
            });
          }
          const chunk = buffer.subarray(start, end + 1);
          return new NextResponse(chunk, {
            status: 206,
            headers: {
              "Content-Type": mimeType,
              "Content-Range": `bytes ${start}-${end}/${total}`,
              "Accept-Ranges": "bytes",
              "Content-Length": String(chunk.length),
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "public, max-age=300",
            },
          });
        }
      }

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Accept-Ranges": "bytes",
          "Content-Length": String(total),
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    if (/^https?:\/\//.test(value)) {
      return NextResponse.redirect(value, 307);
    }
    throw new HttpError(404, "ไม่พบวิดีโอ");
  } catch (error) {
    return apiError(error);
  }
}
