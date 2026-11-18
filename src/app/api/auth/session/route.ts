import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
export async function GET(req: NextRequest) {
  try { return NextResponse.json({ success: true, user: await requireAdmin(req) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return apiError(error); }
}
