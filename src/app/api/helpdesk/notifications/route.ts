import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const [countRes, itemsRes] = await Promise.all([
      query(`SELECT count(*)::int AS new_count FROM public."TB_HD_TICKETS" WHERE status = 'NEW'`),
      query(
        `SELECT id, ticket_no, customer_org, title, priority, queue, created_at
         FROM public."TB_HD_TICKETS"
         WHERE status = 'NEW'
         ORDER BY id DESC
         LIMIT 10`
      ),
    ]);

    const newCount = Number((countRes.rows[0] as { new_count?: number } | undefined)?.new_count || 0);
    const items = itemsRes.rows as Array<{
      id: number;
      ticket_no: string;
      customer_org: string;
      title: string;
      priority: string;
      queue: string;
      created_at: string;
    }>;
    const latestNewId = items.length > 0 ? Number(items[0].id) : 0;

    return NextResponse.json(
      { success: true, newCount, latestNewId, items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiError(error);
  }
}
