import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { await requireAdmin(req); await query("SELECT 1"); return NextResponse.json({ success: true }); }
  catch (error) { return apiError(error); }
}
