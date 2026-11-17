import { getDbPool, query } from "./db";
import { HttpError } from "./api-error";
import {
  ALLOWED_STATUS_TRANSITIONS,
  PAUSED_STATUSES,
  type EquipmentType,
  type SourceChannel,
  type TicketImpact,
  type TicketPriority,
  type TicketQueue,
  type TicketStatus,
  type TicketUrgency,
} from "./helpdesk-constants";
import {
  addBusinessMinutes,
  advanceToBusinessHours,
  calculatePriority,
  computeBusinessMinutesBetween,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_SLA_TARGETS,
  determineQueue,
  getSlaStatus,
  type BusinessHourRule,
  type SlaSnapshot,
  type SlaTargetRule,
} from "./helpdesk-sla";

export interface HelpdeskConfig {
  targets: Record<TicketPriority, SlaTargetRule>;
  businessHours: BusinessHourRule[];
  holidays: Array<{ id: number; holiday_date: string; name: string }>;
  holidayDates: string[];
}

export interface TicketRow {
  id: number;
  ticket_no: string;
  request_group_no?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  impact: TicketImpact;
  urgency: TicketUrgency;
  queue: TicketQueue;
  source_channel: SourceChannel;
  customer_org: string;
  customer_dept: string | null;
  contact_name: string;
  contact_phone: string;
  contact_line: string | null;
  equipment_type: EquipmentType;
  product_id: number | null;
  equipment_brand: string | null;
  equipment_model: string | null;
  serial_number: string | null;
  title: string;
  description: string | null;
  is_patient_care_critical: boolean;
  assigned_to: string | null;
  assigned_phone: string | null;
  scheduled_at: string | null;
  sla_started_at: string;
  first_response_due_at: string;
  onsite_due_at: string | null;
  resolve_due_at: string;
  first_responded_at: string | null;
  onsite_arrived_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla_paused_at: string | null;
  sla_paused_minutes: number;
  sla_breached: boolean;
  csat_score: number | null;
  csat_comment: string | null;
  client_request_id?: string | null;
  request_item_index?: number | null;
  resolution_summary?: string | null;
  root_cause?: string | null;
  parts_used?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  sla?: SlaSnapshot;
}

export async function getHelpdeskConfig(): Promise<HelpdeskConfig> {
  const [targetsRes, hoursRes, holidaysRes] = await Promise.all([
    query(`SELECT priority, label, first_response_minutes, onsite_minutes, resolve_minutes FROM public."TBM_HD_SLA_TARGETS" ORDER BY priority ASC`),
    query(`SELECT day_of_week, is_working_day, start_time, end_time FROM public."TBM_HD_BUSINESS_HOURS" ORDER BY day_of_week ASC`),
    query(`SELECT id, to_char(holiday_date, 'YYYY-MM-DD') AS holiday_date, name FROM public."TBM_HD_HOLIDAYS" ORDER BY holiday_date ASC`),
  ]);

  const targets: Record<TicketPriority, SlaTargetRule> = { ...DEFAULT_SLA_TARGETS };
  for (const row of targetsRes.rows) {
    const p = row.priority as TicketPriority;
    targets[p] = {
      priority: p,
      label: String(row.label),
      first_response_minutes: Number(row.first_response_minutes),
      onsite_minutes: row.onsite_minutes === null ? null : Number(row.onsite_minutes),
      resolve_minutes: Number(row.resolve_minutes),
    };
  }

  const businessHours: BusinessHourRule[] = hoursRes.rows.length
    ? hoursRes.rows.map((r) => ({
        day_of_week: Number(r.day_of_week),
        is_working_day: Boolean(r.is_working_day),
        start_time: String(r.start_time),
        end_time: String(r.end_time),
      }))
    : DEFAULT_BUSINESS_HOURS;

  const holidays = holidaysRes.rows.map((r) => ({
    id: Number(r.id),
    holiday_date: String(r.holiday_date),
    name: String(r.name),
  }));

  return {
    targets,
    businessHours,
    holidays,
    holidayDates: holidays.map((h) => h.holiday_date),
  };
}

function bkkYearMonth(date: Date): string {
  const bkk = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const yy = String(bkk.getUTCFullYear()).slice(-2);
  const mm = String(bkk.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}${mm}`;
}

export interface CreateTicketInput {
  source_channel?: SourceChannel;
  customer_org: string;
  customer_dept?: string | null;
  contact_name: string;
  contact_phone: string;
  contact_line?: string | null;
  equipment_type: EquipmentType;
  product_id?: number | null;
  equipment_brand?: string | null;
  equipment_model?: string | null;
  serial_number?: string | null;
  title: string;
  description?: string | null;
  impact: TicketImpact;
  urgency: TicketUrgency;
  priority_override?: TicketPriority;
  is_patient_care_critical?: boolean;
  attachments?: Array<{ file_name: string; data_url: string }>;
  created_by?: string;
}

export interface TicketEquipmentItemInput {
  equipment_type: EquipmentType;
  product_id?: number | null;
  equipment_brand?: string | null;
  equipment_model?: string | null;
  serial_number?: string | null;
  title: string;
  description?: string | null;
  is_patient_care_critical?: boolean;
  attachments?: Array<{ file_name: string; data_url: string }>;
}

export interface CreateTicketSharedInput {
  source_channel?: SourceChannel;
  customer_org: string;
  customer_dept?: string | null;
  contact_name: string;
  contact_phone: string;
  contact_line?: string | null;
  impact: TicketImpact;
  urgency: TicketUrgency;
  priority_override?: TicketPriority;
  created_by?: string;
  client_request_id?: string;
}

export async function createTicketBatch(
  shared: CreateTicketSharedInput,
  items: TicketEquipmentItemInput[]
): Promise<{ request_group_no: string | null; tickets: TicketRow[] }> {
  if (!items.length) {
    throw new HttpError(400, "กรุณาระบุอุปกรณ์อย่างน้อย 1 รายการ");
  }
  const config = await getHelpdeskConfig();
  const now = new Date();
  const slaStartedAt = advanceToBusinessHours(now, config.businessHours, config.holidayDates);

  const client = await getDbPool().connect();
  try {
    await client.query("BEGIN");
    const ym = bkkYearMonth(now);
    const prefix = `HD-${ym}-`;
    if (shared.client_request_id) {
      await client.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [shared.client_request_id]);
      const duplicate = await client.query(
        `SELECT * FROM public."TB_HD_TICKETS"
         WHERE client_request_id = $1 AND created_by = $2
         ORDER BY request_item_index ASC, id ASC`,
        [shared.client_request_id, shared.created_by || "CUSTOMER"]
      );
      if (duplicate.rows.length) {
        await client.query("COMMIT");
        const tickets = duplicate.rows.map((row) => ({
          ...(row as TicketRow),
          sla: getSlaStatus(row as TicketRow, now, config.businessHours, config.holidayDates),
        }));
        return { request_group_no: tickets[0].request_group_no || null, tickets };
      }
    }
    await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [prefix]);
    const seqRes = await client.query(
      `SELECT ticket_no FROM public."TB_HD_TICKETS" WHERE ticket_no LIKE $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [`${prefix}%`]
    );
    let nextSeq = 1;
    if (seqRes.rows.length) {
      const lastNo = String(seqRes.rows[0].ticket_no);
      const parsed = Number(lastNo.split("-").pop());
      if (Number.isFinite(parsed)) nextSeq = parsed + 1;
    }

    let requestGroupNo: string | null = null;
    if (items.length > 1) {
      const reqPrefix = `REQ-${ym}-`;
      const reqRes = await client.query(
        `SELECT request_group_no FROM public."TB_HD_TICKETS" WHERE request_group_no LIKE $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
        [`${reqPrefix}%`]
      );
      let nextReqSeq = 1;
      if (reqRes.rows.length && reqRes.rows[0].request_group_no) {
        const parsedReq = Number(String(reqRes.rows[0].request_group_no).split("-").pop());
        if (Number.isFinite(parsedReq)) nextReqSeq = parsedReq + 1;
      }
      requestGroupNo = `${reqPrefix}${String(nextReqSeq).padStart(4, "0")}`;
    }

    const createdTickets: TicketRow[] = [];

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const ticketNo = `${prefix}${String(nextSeq + idx).padStart(4, "0")}`;
      const priority =
        shared.priority_override ??
        calculatePriority(shared.impact, shared.urgency, Boolean(item.is_patient_care_critical));
      const queue = determineQueue(item.equipment_type);
      const target = config.targets[priority];

      const firstResponseDueAt = addBusinessMinutes(
        slaStartedAt,
        target.first_response_minutes,
        config.businessHours,
        config.holidayDates
      );
      const onsiteDueAt = target.onsite_minutes
        ? addBusinessMinutes(slaStartedAt, target.onsite_minutes, config.businessHours, config.holidayDates)
        : null;
      const resolveDueAt = addBusinessMinutes(
        slaStartedAt,
        target.resolve_minutes,
        config.businessHours,
        config.holidayDates
      );

      const insertRes = await client.query(
        `INSERT INTO public."TB_HD_TICKETS" (
          ticket_no, request_group_no, status, priority, impact, urgency, queue, source_channel,
          customer_org, customer_dept, contact_name, contact_phone, contact_line,
          equipment_type, product_id, equipment_brand, equipment_model, serial_number,
          title, description, is_patient_care_critical,
          sla_started_at, first_response_due_at, onsite_due_at, resolve_due_at,
          created_by, client_request_id, request_item_index
        ) VALUES (
          $1, $2, 'NEW', $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17,
          $18, $19, $20,
          $21, $22, $23, $24,
          $25, $26, $27
        ) RETURNING *`,
        [
          ticketNo,
          requestGroupNo,
          priority,
          shared.impact,
          shared.urgency,
          queue,
          shared.source_channel || "WEB",
          shared.customer_org.trim(),
          shared.customer_dept?.trim() || null,
          shared.contact_name.trim(),
          shared.contact_phone.trim(),
          shared.contact_line?.trim() || null,
          item.equipment_type,
          item.product_id ?? null,
          item.equipment_brand?.trim() || null,
          item.equipment_model?.trim() || null,
          item.serial_number?.trim() || null,
          item.title.trim(),
          item.description?.trim() || null,
          Boolean(item.is_patient_care_critical),
          slaStartedAt.toISOString(),
          firstResponseDueAt.toISOString(),
          onsiteDueAt ? onsiteDueAt.toISOString() : null,
          resolveDueAt.toISOString(),
          shared.created_by || "CUSTOMER",
          shared.client_request_id || null,
          idx,
        ]
      );

      const ticket = insertRes.rows[0] as TicketRow;

      if (item.attachments?.length) {
        for (const att of item.attachments.slice(0, 10)) {
          await client.query(
            `INSERT INTO public."TB_HD_ATTACHMENTS" (ticket_id, stage, file_name, data_url) VALUES ($1, 'REPORT', $2, $3)`,
            [ticket.id, att.file_name || "image.webp", att.data_url]
          );
        }
      }

      await client.query(
        `INSERT INTO public."TB_HD_EVENTS" (ticket_id, event_type, actor, to_value, note) VALUES ($1, 'CREATED', $2, 'NEW', $3)`,
        [
          ticket.id,
          shared.created_by || shared.contact_name.trim(),
          `เปิด Ticket ผ่าน ${shared.source_channel || "WEB"}${requestGroupNo ? ` (กลุ่มคำร้อง ${requestGroupNo})` : ""} · Priority ${priority} · คิว ${queue}`,
        ]
      );

      createdTickets.push({
        ...ticket,
        sla: getSlaStatus(ticket, now, config.businessHours, config.holidayDates),
      });
    }

    await client.query(
      `INSERT INTO public."TBM_HD_HOSPITALS" (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [shared.customer_org.trim()]
    );

    await client.query("COMMIT");
    return { request_group_no: requestGroupNo, tickets: createdTickets };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function createTicket(input: CreateTicketInput): Promise<TicketRow> {
  const { tickets } = await createTicketBatch(input, [input]);
  return tickets[0];
}

export async function listTickets(filters: {
  status?: string;
  queue?: string;
  priority?: string;
  sla?: string;
  search?: string;
}) {
  const config = await getHelpdeskConfig();
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.status && filters.status !== "ALL") {
    if (filters.status === "ACTIVE") {
      where.push(`status NOT IN ('CLOSED', 'CANCELLED')`);
    } else {
      params.push(filters.status);
      where.push(`status = $${params.length}`);
    }
  }
  if (filters.queue && filters.queue !== "ALL") {
    params.push(filters.queue);
    where.push(`queue = $${params.length}`);
  }
  if (filters.priority && filters.priority !== "ALL") {
    params.push(filters.priority);
    where.push(`priority = $${params.length}`);
  }
  if (filters.search?.trim()) {
    const q = `%${filters.search.trim()}%`;
    params.push(q);
    const p = `$${params.length}`;
    where.push(
      `(ticket_no ILIKE ${p} OR customer_org ILIKE ${p} OR contact_name ILIKE ${p} OR title ILIKE ${p} OR COALESCE(serial_number,'') ILIKE ${p} OR COALESCE(contact_line,'') ILIKE ${p})`
    );
  }

  const sql = `SELECT * FROM public."TB_HD_TICKETS" ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT 300`;
  const res = await query(sql, params);
  const now = new Date();

  let items = res.rows.map((row) => {
    const t = row as TicketRow;
    return {
      ...t,
      sla: getSlaStatus(t, now, config.businessHours, config.holidayDates),
    };
  });

  if (filters.sla === "WARNING") {
    items = items.filter((t) => t.sla?.state === "WARNING");
  } else if (filters.sla === "BREACHED") {
    items = items.filter((t) => t.sla?.state === "BREACHED");
  }

  return items;
}

export async function getTicketDetail(idOrNo: { id?: number; ticketNo?: string }, publicOnly = false) {
  const config = await getHelpdeskConfig();
  const ticketRes = idOrNo.id
    ? await query(`SELECT * FROM public."TB_HD_TICKETS" WHERE id = $1`, [idOrNo.id])
    : await query(`SELECT * FROM public."TB_HD_TICKETS" WHERE upper(ticket_no) = upper($1)`, [idOrNo.ticketNo]);

  if (!ticketRes.rows.length) return null;
  const ticket = ticketRes.rows[0] as TicketRow;

  const [msgRes, attRes, evtRes] = await Promise.all([
    query(
      `SELECT id, ticket_id, sender_type, sender_name, is_internal, message, created_at
       FROM public."TB_HD_MESSAGES"
       WHERE ticket_id = $1 ${publicOnly ? "AND is_internal = false" : ""}
       ORDER BY created_at ASC`,
      [ticket.id]
    ),
    query(
      `SELECT id, ticket_id, stage, file_name, data_url, created_at
       FROM public."TB_HD_ATTACHMENTS"
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticket.id]
    ),
    query(
      `SELECT id, ticket_id, event_type, actor, from_value, to_value, note, created_at
       FROM public."TB_HD_EVENTS"
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticket.id]
    ),
  ]);

  const now = new Date();
  return {
    ticket: {
      ...ticket,
      sla: getSlaStatus(ticket, now, config.businessHours, config.holidayDates),
    },
    messages: msgRes.rows,
    attachments: attRes.rows,
    events: evtRes.rows,
    target: config.targets[ticket.priority],
  };
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  queue?: TicketQueue;
  assigned_to?: string | null;
  assigned_phone?: string | null;
  scheduled_at?: string | null;
  note?: string;
  message?: string;
  is_internal?: boolean;
  attachments?: Array<{ stage?: "BEFORE" | "AFTER" | "OTHER"; file_name: string; data_url: string }>;
  mark_onsite_arrived?: boolean;
  resolution_summary?: string;
  root_cause?: string;
  parts_used?: string;
}

export async function updateTicketById(id: number, input: UpdateTicketInput, actor: string) {
  const config = await getHelpdeskConfig();
  const client = await getDbPool().connect();
  const now = new Date();

  try {
    await client.query("BEGIN");
    const currentRes = await client.query(`SELECT * FROM public."TB_HD_TICKETS" WHERE id = $1 FOR UPDATE`, [id]);
    if (!currentRes.rows.length) throw new HttpError(404, "ไม่พบ Ticket นี้");
    const current = currentRes.rows[0] as TicketRow;

    const updates: Record<string, unknown> = {};
    const events: Array<{ type: string; from?: string | null; to?: string | null; note?: string }> = [];

    if (input.status && input.status !== current.status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[current.status] || [];
      if (!allowed.includes(input.status)) {
        throw new HttpError(400, `ไม่สามารถเปลี่ยนสถานะจาก ${current.status} เป็น ${input.status} ได้`);
      }
      if (["PENDING_CUSTOMER", "PENDING_PARTS", "CANCELLED"].includes(input.status) && !input.note?.trim()) {
        throw new HttpError(400, "กรุณาระบุเหตุผลก่อนเปลี่ยนสถานะ");
      }
      if (input.status === "RESOLVED" && !input.resolution_summary?.trim()) {
        throw new HttpError(400, "กรุณาระบุสรุปวิธีแก้ไขก่อนเปลี่ยนสถานะเป็นแก้ไขเสร็จแล้ว");
      }
      updates.status = input.status;

      if (current.status === "NEW" && input.status !== "CANCELLED" && !current.first_responded_at) {
        updates.first_responded_at = now.toISOString();
      }

      const wasPaused = PAUSED_STATUSES.has(current.status);
      const willPause = PAUSED_STATUSES.has(input.status);

      if (!wasPaused && willPause) {
        updates.sla_paused_at = now.toISOString();
        events.push({ type: "SLA_PAUSED", from: current.status, to: input.status, note: "หยุดนับเวลา SLA ชั่วคราว" });
      } else if (wasPaused && !willPause && current.sla_paused_at) {
        const pausedDelta = computeBusinessMinutesBetween(
          new Date(current.sla_paused_at),
          now,
          config.businessHours,
          config.holidayDates
        );
        const totalPaused = Number(current.sla_paused_minutes || 0) + pausedDelta;
        updates.sla_paused_minutes = totalPaused;
        updates.sla_paused_at = null;
        if (pausedDelta > 0) {
          updates.resolve_due_at = addBusinessMinutes(
            new Date(current.resolve_due_at),
            pausedDelta,
            config.businessHours,
            config.holidayDates
          ).toISOString();
          if (current.onsite_due_at && !current.onsite_arrived_at) {
            updates.onsite_due_at = addBusinessMinutes(
              new Date(current.onsite_due_at),
              pausedDelta,
              config.businessHours,
              config.holidayDates
            ).toISOString();
          }
        }
        events.push({
          type: "SLA_RESUMED",
          from: current.status,
          to: input.status,
          note: `นับเวลา SLA ต่อ (หยุดพักไป ${pausedDelta} นาทีทำการ)`,
        });
      }

      if (input.status === "RESOLVED") {
        updates.resolved_at = now.toISOString();
        updates.resolution_summary = input.resolution_summary!.trim();
        updates.root_cause = input.root_cause?.trim() || null;
        updates.parts_used = input.parts_used?.trim() || null;
        const effectiveDue = new Date((updates.resolve_due_at as string) || current.resolve_due_at);
        if (now.getTime() > effectiveDue.getTime()) {
          updates.sla_breached = true;
        }
      }
      if (input.status === "CLOSED") {
        updates.closed_at = now.toISOString();
      }
      if (current.status === "RESOLVED" && input.status === "IN_PROGRESS") {
        updates.resolved_at = null;
      }

      events.push({
        type: "STATUS_CHANGED",
        from: current.status,
        to: input.status,
        note: input.note?.trim() || undefined,
      });
    }

    if (input.mark_onsite_arrived && !current.onsite_arrived_at) {
      updates.onsite_arrived_at = now.toISOString();
      events.push({ type: "ONSITE_ARRIVED", note: "ช่างถึงหน้างานแล้ว" });
    }

    if (input.priority && input.priority !== current.priority) {
      const target = config.targets[input.priority];
      const baseStart = new Date(current.sla_started_at);
      const pausedMin = Number((updates.sla_paused_minutes ?? current.sla_paused_minutes) || 0);
      updates.priority = input.priority;
      updates.first_response_due_at = addBusinessMinutes(
        baseStart,
        target.first_response_minutes + pausedMin,
        config.businessHours,
        config.holidayDates
      ).toISOString();
      updates.onsite_due_at = target.onsite_minutes
        ? addBusinessMinutes(
            baseStart,
            target.onsite_minutes + pausedMin,
            config.businessHours,
            config.holidayDates
          ).toISOString()
        : null;
      updates.resolve_due_at = addBusinessMinutes(
        baseStart,
        target.resolve_minutes + pausedMin,
        config.businessHours,
        config.holidayDates
      ).toISOString();
      events.push({
        type: "PRIORITY_CHANGED",
        from: current.priority,
        to: input.priority,
        note: `ปรับความเร่งด่วนเป็น ${input.priority}`,
      });
    }

    if (input.queue && input.queue !== current.queue) {
      updates.queue = input.queue;
    }

    if (input.assigned_to !== undefined && input.assigned_to !== current.assigned_to) {
      updates.assigned_to = input.assigned_to?.trim() || null;
      if (!current.first_responded_at && !updates.first_responded_at) {
        updates.first_responded_at = now.toISOString();
      }
      if (current.status === "NEW" || current.status === "OPEN") {
        if (!updates.status && input.assigned_to?.trim()) {
          updates.status = "ASSIGNED";
          events.push({ type: "STATUS_CHANGED", from: current.status, to: "ASSIGNED" });
        }
      }
      events.push({
        type: "ASSIGNED",
        from: current.assigned_to,
        to: input.assigned_to?.trim() || null,
        note: input.assigned_to?.trim() ? `มอบหมายให้ ${input.assigned_to.trim()}` : "ยกเลิกการมอบหมายช่าง",
      });
    }

    if (input.assigned_phone !== undefined) {
      updates.assigned_phone = input.assigned_phone?.trim() || null;
    }
    if (input.scheduled_at !== undefined) {
      updates.scheduled_at = input.scheduled_at || null;
    }

    if (Object.keys(updates).length) {
      const keys = Object.keys(updates);
      const sets = keys.map((k, idx) => `"${k}" = $${idx + 1}`);
      sets.push(`"updated_at" = now()`);
      const values = keys.map((k) => updates[k]);
      values.push(id);
      await client.query(
        `UPDATE public."TB_HD_TICKETS" SET ${sets.join(", ")} WHERE id = $${values.length}`,
        values
      );
    }

    if (input.message?.trim()) {
      await client.query(
        `INSERT INTO public."TB_HD_MESSAGES" (ticket_id, sender_type, sender_name, is_internal, message)
         VALUES ($1, 'STAFF', $2, $3, $4)`,
        [id, actor, Boolean(input.is_internal), input.message.trim()]
      );
      if (!current.first_responded_at && !updates.first_responded_at && !input.is_internal) {
        await client.query(
          `UPDATE public."TB_HD_TICKETS" SET first_responded_at = $1 WHERE id = $2`,
          [now.toISOString(), id]
        );
      }
    }

    if (input.attachments?.length) {
      for (const att of input.attachments.slice(0, 10)) {
        await client.query(
          `INSERT INTO public."TB_HD_ATTACHMENTS" (ticket_id, stage, file_name, data_url) VALUES ($1, $2, $3, $4)`,
          [id, att.stage || "OTHER", att.file_name || "image.webp", att.data_url]
        );
      }
    }

    for (const ev of events) {
      await client.query(
        `INSERT INTO public."TB_HD_EVENTS" (ticket_id, event_type, actor, from_value, to_value, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, ev.type, actor, ev.from || null, ev.to || null, ev.note || null]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return getTicketDetail({ id }, false);
}

