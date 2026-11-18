import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertHelpdeskTicketAccess, requireHelpdeskUser } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { getDbPool } from "@/lib/db";
import { getTicketDetail, type TicketRow } from "@/lib/helpdesk-repository";

interface RouteParams {
  params: Promise<{ ticketNo: string }>;
}

const customerActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm_close"),
    csat_score: z.number().int().min(1).max(5).optional(),
    csat_comment: z.string().trim().max(1000).optional(),
  }),
  z.object({
    action: z.literal("reopen"),
    reason: z.string().trim().min(1).max(1000),
  }),
  z.object({
    action: z.literal("reply"),
    sender_name: z.string().trim().min(1).max(200).optional(),
    message: z.string().trim().min(1).max(3000),
  }),
]);

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const account = await requireHelpdeskUser(req);
    const { ticketNo } = await params;
    const data = await getTicketDetail({ ticketNo }, true);
    if (!data) throw new HttpError(404, "ไม่พบเลขที่ใบแจ้งซ่อมนี้");
    assertHelpdeskTicketAccess(account, data.ticket);
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const account = await requireHelpdeskUser(req);
    const { ticketNo } = await params;
    const body = customerActionSchema.parse(await req.json());

    const client = await getDbPool().connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(
        `SELECT * FROM public."TB_HD_TICKETS" WHERE upper(ticket_no) = upper($1) FOR UPDATE`,
        [ticketNo]
      );
      if (!res.rows.length) throw new HttpError(404, "ไม่พบเลขที่ใบแจ้งซ่อมนี้");
      const ticket = res.rows[0] as TicketRow;
      assertHelpdeskTicketAccess(account, ticket);

      if (body.action === "confirm_close") {
        if (ticket.status !== "RESOLVED") {
          throw new HttpError(400, "สามารถยืนยันปิดงานได้เฉพาะงานที่สถานะ 'แก้ไขเสร็จแล้ว' เท่านั้น");
        }
        await client.query(
          `UPDATE public."TB_HD_TICKETS"
           SET status = 'CLOSED', closed_at = now(), csat_score = COALESCE($1, csat_score),
               csat_comment = COALESCE($2, csat_comment), updated_at = now()
           WHERE id = $3`,
          [body.csat_score ?? null, body.csat_comment ?? null, ticket.id]
        );
        await client.query(
          `INSERT INTO public."TB_HD_EVENTS" (ticket_id, event_type, actor, from_value, to_value, note)
           VALUES ($1, 'CSAT_SUBMITTED', $2, 'RESOLVED', 'CLOSED', $3)`,
          [
            ticket.id,
            ticket.contact_name,
            body.csat_score ? `ลูกค้ายืนยันปิดงาน · ให้คะแนน ${body.csat_score}/5` : "ลูกค้ายืนยันปิดงาน",
          ]
        );
      } else if (body.action === "reopen") {
        if (ticket.status !== "RESOLVED") {
          throw new HttpError(400, "สามารถแจ้งเปิดงานซ้ำได้เฉพาะงานที่สถานะ 'แก้ไขเสร็จแล้ว' เท่านั้น");
        }
        await client.query(
          `UPDATE public."TB_HD_TICKETS"
           SET status = 'IN_PROGRESS', resolved_at = NULL, updated_at = now()
           WHERE id = $1`,
          [ticket.id]
        );
        await client.query(
          `INSERT INTO public."TB_HD_MESSAGES" (ticket_id, sender_type, sender_name, is_internal, message)
           VALUES ($1, 'CUSTOMER', $2, false, $3)`,
          [ticket.id, ticket.contact_name, `แจ้งเปิดงานซ้ำ: ${body.reason}`]
        );
        await client.query(
          `INSERT INTO public."TB_HD_EVENTS" (ticket_id, event_type, actor, from_value, to_value, note)
           VALUES ($1, 'REOPENED', $2, 'RESOLVED', 'IN_PROGRESS', $3)`,
          [ticket.id, ticket.contact_name, body.reason]
        );
      } else if (body.action === "reply") {
        await client.query(
          `INSERT INTO public."TB_HD_MESSAGES" (ticket_id, sender_type, sender_name, is_internal, message)
           VALUES ($1, 'CUSTOMER', $2, false, $3)`,
          [ticket.id, body.sender_name || ticket.contact_name, body.message]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const updated = await getTicketDetail({ ticketNo }, true);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error);
  }
}

