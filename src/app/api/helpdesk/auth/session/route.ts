import { NextRequest, NextResponse } from "next/server";
import { requireHelpdeskUser } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const user = await requireHelpdeskUser(req);
    return NextResponse.json(
      { success: true, user },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}
