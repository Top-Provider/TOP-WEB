import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { getActivity } from "@/lib/activity-repository";
import { activitySchema, recordId } from "@/lib/data-validation";
import { pgUpdate, pgDelete } from "@/lib/db";
import { formatActivityRow } from "@/lib/activities";
interface RouteParams { params: Promise<{ id: string }>; }
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const all = req.nextUrl.searchParams.get("all") === "true";
    if (all) await requireAdmin(req);
    const data = await getActivity(recordId.parse((await params).id), all);
    if (!data) throw new HttpError(404, "ไม่พบกิจกรรม");
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error); }
}
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const payload = activitySchema.partial().parse(await req.json());
    if (payload.event_date === "") payload.event_date = null;
    const data = await pgUpdate("TB_ACTIVITIES", payload, recordId.parse((await params).id));
    if (!data) throw new HttpError(404, "ไม่พบกิจกรรม");
    return NextResponse.json({ success: true, data: formatActivityRow(data) });
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try { await requireAdmin(req); const data = await pgDelete("TB_ACTIVITIES", recordId.parse((await params).id)); if (!data) throw new HttpError(404, "ไม่พบกิจกรรม"); return NextResponse.json({ success: true }); }
  catch (error) { return apiError(error); }
}
