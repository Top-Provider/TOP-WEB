import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
import { getDbPool } from "@/lib/db";
import { TICKET_PRIORITIES } from "@/lib/helpdesk-constants";
import { getHelpdeskConfig } from "@/lib/helpdesk-repository";

const updateSettingsSchema = z.object({
  targets: z
    .array(
      z.object({
        priority: z.enum(TICKET_PRIORITIES),
        first_response_minutes: z.number().int().min(1).max(43200),
        onsite_minutes: z.number().int().min(1).max(43200).nullable(),
        resolve_minutes: z.number().int().min(1).max(86400),
      })
    )
    .optional(),
  businessHours: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        is_working_day: z.boolean(),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .optional(),
  addHoliday: z
    .object({
      holiday_date: z.string().date(),
      name: z.string().trim().min(1).max(200),
    })
    .optional(),
  deleteHolidayId: z.number().int().positive().optional(),
});

export async function GET() {
  try {
    const data = await getHelpdeskConfig();
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = updateSettingsSchema.parse(await req.json());
    const client = await getDbPool().connect();
    try {
      await client.query("BEGIN");
      if (body.targets?.length) {
        for (const t of body.targets) {
          await client.query(
            `UPDATE public."TBM_HD_SLA_TARGETS"
             SET first_response_minutes = $1, onsite_minutes = $2, resolve_minutes = $3, updated_at = now()
             WHERE priority = $4`,
            [t.first_response_minutes, t.onsite_minutes, t.resolve_minutes, t.priority]
          );
        }
      }
      if (body.businessHours?.length) {
        for (const h of body.businessHours) {
          await client.query(
            `UPDATE public."TBM_HD_BUSINESS_HOURS"
             SET is_working_day = $1, start_time = $2, end_time = $3, updated_at = now()
             WHERE day_of_week = $4`,
            [h.is_working_day, h.start_time, h.end_time, h.day_of_week]
          );
        }
      }
      if (body.addHoliday) {
        await client.query(
          `INSERT INTO public."TBM_HD_HOLIDAYS" (holiday_date, name)
           VALUES ($1, $2)
           ON CONFLICT (holiday_date) DO UPDATE SET name = EXCLUDED.name`,
          [body.addHoliday.holiday_date, body.addHoliday.name]
        );
      }
      if (body.deleteHolidayId) {
        await client.query(`DELETE FROM public."TBM_HD_HOLIDAYS" WHERE id = $1`, [body.deleteHolidayId]);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const updated = await getHelpdeskConfig();
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return apiError(error);
  }
}

