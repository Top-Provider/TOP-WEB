import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const field = searchParams.get("field") || "cover_image_url";

    // Validate field name to prevent injection
    const allowedFields = ["cover_image_url", "feature_1_image", "feature_2_image"];
    const targetField = allowedFields.includes(field) ? field : "cover_image_url";

    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.redirect(new URL("/images/vitanix-dashboard-hd.png", req.url), 307);
    }

    const { data, error } = await supabase
      .from("TB_PRODUCT_SOFTWARE")
      .select(targetField)
      .eq("id", numId)
      .single();

    if (error || !data) {
      return NextResponse.redirect(new URL("/images/vitanix-dashboard-hd.png", req.url), 307);
    }

    const record = data as unknown as Record<string, unknown>;
    const rawUrl = typeof record[targetField] === "string" ? (record[targetField] as string) : "";
    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.redirect(new URL("/images/vitanix-dashboard-hd.png", req.url), 307);
    }

    // If it's a data URI (Base64)
    if (rawUrl.startsWith("data:")) {
      const match = rawUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      }
    }

    // If it's an external or relative URL
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return NextResponse.redirect(rawUrl, 307);
    }

    return NextResponse.redirect(new URL(rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`, req.url), 307);
  } catch (err) {
    console.error("Error serving software image:", err);
    return NextResponse.redirect(new URL("/images/vitanix-dashboard-hd.png", req.url), 307);
  }
}

