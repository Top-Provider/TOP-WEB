import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { listPublicCustomers } from "@/lib/public-customers";

export async function GET() {
  try {
    const data = await listPublicCustomers();
    return NextResponse.json(
      { success: true, data, count: data.length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}
