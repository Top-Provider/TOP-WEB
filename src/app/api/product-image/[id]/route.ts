import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.redirect(new URL("/images/printer-product.png", req.url), 307);
    }

    const { data, error } = await supabase
      .from("TB_PRODUCTS")
      .select("cover_image_url")
      .eq("id", numId)
      .single();

    if (error || !data || !data.cover_image_url) {
      return NextResponse.redirect(new URL("/images/printer-product.png", req.url), 307);
    }

    const rawUrl = typeof (data as unknown as Record<string, unknown>)?.cover_image_url === "string"
      ? ((data as unknown as Record<string, unknown>).cover_image_url as string)
      : "";

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

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return NextResponse.redirect(rawUrl, 307);
    }

    return NextResponse.redirect(new URL(rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`, req.url), 307);
  } catch (err) {
    console.error("Error serving product image:", err);
    return NextResponse.redirect(new URL("/images/printer-product.png", req.url), 307);
  }
}

