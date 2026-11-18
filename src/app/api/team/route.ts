import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { listTeamMembers } from "@/lib/team";

export async function GET() {
  try {
    const data = await listTeamMembers();
    return NextResponse.json(
      { success: true, data, count: data.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}
