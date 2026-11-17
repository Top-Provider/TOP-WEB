import { NextRequest, NextResponse } from "next/server";
import { requireHelpdeskUser } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
import { query } from "@/lib/db";
import { getHelpdeskConfig, type TicketRow } from "@/lib/helpdesk-repository";
import { getSlaStatus } from "@/lib/helpdesk-sla";

export async function GET(req: NextRequest) {
  try {
    const account = await requireHelpdeskUser(req);
    const config = await getHelpdeskConfig();

    const params: unknown[] = [account.username];
    let whereSql = `created_by = $1`;
    if (account.org_name) {
      params.push(account.org_name);
      whereSql = `(created_by = $1 OR customer_org = $2)`;
    }

    const res = await query(
      `SELECT * FROM public."TB_HD_TICKETS" WHERE ${whereSql} ORDER BY created_at DESC LIMIT 200`,
      params
    );

    const now = new Date();
    const items = res.rows.map((row) => {
      const t = row as TicketRow;
      return {
        ...t,
        sla: getSlaStatus(t, now, config.businessHours, config.holidayDates),
      };
    });

    return NextResponse.json(
      { success: true, data: items, user: { username: account.username, org_name: account.org_name } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}
