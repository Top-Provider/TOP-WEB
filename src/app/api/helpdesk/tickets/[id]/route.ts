import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { recordId } from "@/lib/data-validation";
import { TICKET_PRIORITIES, TICKET_QUEUES, TICKET_STATUSES } from "@/lib/helpdesk-constants";
import { getTicketDetail, updateTicketById } from "@/lib/helpdesk-repository";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    queue: z.enum(TICKET_QUEUES).optional(),
    assigned_to: z.string().trim().max(200).nullable().optional(),
    assigned_phone: z
      .string()
      .trim()
      .regex(/^\d{6,15}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 6-15 หลัก")
      .nullable()
      .optional(),
    scheduled_at: z.string().max(100).nullable().optional(),
    note: z.string().trim().max(1000).optional(),
    message: z.string().trim().max(5000).optional(),
    is_internal: z.boolean().optional(),
    attachments: z
      .array(
        z.object({
          stage: z.enum(["BEFORE", "AFTER", "OTHER"]).optional(),
          file_name: z.string().max(200),
          data_url: z
            .string()
            .max(5_000_000)
            .regex(/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\r\n]+$/i),
        })
      )
      .max(5)
      .optional(),
    mark_onsite_arrived: z.boolean().optional(),
    resolution_summary: z.string().trim().max(5000).optional(),
    root_cause: z.string().trim().max(3000).optional(),
    parts_used: z.string().trim().max(3000).optional(),
  })
  .strict();

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin(req);
    const id = Number(recordId.parse((await params).id));
    const data = await getTicketDetail({ id }, false);
    if (!data) throw new HttpError(404, "ไม่พบ Ticket นี้");
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin(req);
    const id = Number(recordId.parse((await params).id));
    const body = updateTicketSchema.parse(await req.json());
    const data = await updateTicketById(id, body, admin.username);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return apiError(error);
  }
}

