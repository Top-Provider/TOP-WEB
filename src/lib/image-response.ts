import { NextResponse } from "next/server";
export function imageResponse(value: unknown, requestUrl: string, fallback: string) {
  const url = typeof value === "string" ? value : "";
  const match = url.match(/^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/);
  if (match) return new NextResponse(Buffer.from(match[2], "base64"), { headers: { "Content-Type": match[1], "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=300" } });
  if (/^https?:\/\//.test(url)) return NextResponse.redirect(url, 307);
  return NextResponse.redirect(new URL(url.startsWith("/") && !url.startsWith("//") ? url : fallback, requestUrl), 307);
}
