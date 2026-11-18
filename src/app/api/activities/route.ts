import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { listActivities, getActivity, ensureActivityVideoColumn } from "@/lib/activity-repository";
import { activitySchema, recordId } from "@/lib/data-validation";
import { pgInsert, pgUpdate, pgDelete } from "@/lib/db";
import { formatActivityRow } from "@/lib/activities";
export type { ActivityItem } from "@/lib/activities";
export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    const all = p.get("all") === "true";
    if (all) await requireAdmin(req);
    if (p.has("id")) {
      const data = await getActivity(recordId.parse(p.get("id")), all);
      if (!data) throw new HttpError(404, "ไม่พบกิจกรรม");
      return NextResponse.json({ success: true, data });
    }
    const result = await listActivities({ limit: p.get("limit") || undefined, offset: p.get("offset") || undefined, category: p.get("category") || undefined, search: p.get("search") || undefined, sort: p.get("sort") || undefined, featured: p.get("featured") === "true" }, all);
    return NextResponse.json({ success: true, count: result.data.length, ...result });
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureActivityVideoColumn();
    const body = activitySchema.parse(await req.json());
    const { customerId, ...activity } = body;
    const data = await pgInsert("TB_ACTIVITIES", {
      ...activity,
      customer_id: customerId ?? null,
      event_date: body.event_date || null,
    });
    return NextResponse.json({ success: true, data: formatActivityRow(data) }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureActivityVideoColumn();
    const { id, ...body } = await req.json();
    const payload = activitySchema.partial().parse(body);
    if (payload.event_date === "") payload.event_date = null;
    if (payload.video_url === `/api/activity-video/${id}`) {
      delete payload.video_url;
    }
    const { customerId, ...activity } = payload;
    const data = await pgUpdate(
      "TB_ACTIVITIES",
      customerId === undefined ? activity : { ...activity, customer_id: customerId },
      recordId.parse(id)
    );
    if (!data) throw new HttpError(404, "ไม่พบกิจกรรม");
    return NextResponse.json({ success: true, data: formatActivityRow(data) });
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    const id = recordId.parse(req.nextUrl.searchParams.get("id") || (await req.json()).id);
    const data = await pgDelete("TB_ACTIVITIES", id);
    if (!data) throw new HttpError(404, "ไม่พบกิจกรรม");
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
