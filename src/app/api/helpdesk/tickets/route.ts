import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireHelpdeskUser } from "@/lib/admin-auth";
import { apiError, HttpError } from "@/lib/api-error";
import { query } from "@/lib/db";
import {
  EQUIPMENT_TYPES,
  SOURCE_CHANNELS,
  TICKET_IMPACTS,
  TICKET_PRIORITIES,
  TICKET_URGENCIES,
} from "@/lib/helpdesk-constants";
import {
  createTicketBatch,
  listTickets,
  type TicketEquipmentItemInput,
} from "@/lib/helpdesk-repository";

const attachmentSchema = z.object({
  file_name: z.string().max(200),
  data_url: z
    .string()
    .max(5_000_000)
    .regex(/^data:image\/(?:jpeg|png|webp|gif);base64,[a-z0-9+/=\r\n]+$/i, "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WebP หรือ GIF"),
});

const equipmentItemSchema = z
  .object({
    equipment_type: z.enum(EQUIPMENT_TYPES),
    product_id: z.number().int().positive().nullable().optional(),
    equipment_brand: z.string().trim().max(150).nullable().optional(),
    equipment_model: z.string().trim().max(200).nullable().optional(),
    serial_number: z.string().trim().max(150).nullable().optional(),
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(5000).nullable().optional(),
    is_patient_care_critical: z.boolean().optional(),
    attachments: z.array(attachmentSchema).max(5).optional(),
  })
  .strict();

const sharedTicketFields = {
  source_channel: z.enum(SOURCE_CHANNELS).optional(),
  customer_org: z.string().trim().max(300).optional().default(""),
  customer_dept: z.string().trim().max(200).nullable().optional(),
  contact_name: z.string().trim().min(1).max(200),
  contact_phone: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 6-15 หลัก"),
  contact_line: z.string().trim().max(200).nullable().optional(),
  impact: z.enum(TICKET_IMPACTS).default("USER"),
  urgency: z.enum(TICKET_URGENCIES).default("NORMAL"),
  priority_override: z.enum(TICKET_PRIORITIES).optional(),
  client_request_id: z.string().uuid().optional(),
};

const createTicketSchema = z.union([
  z
    .object({
      ...sharedTicketFields,
      items: z.array(equipmentItemSchema).min(1).max(10),
    })
    .strict(),
  z
    .object({
      ...sharedTicketFields,
      equipment_type: z.enum(EQUIPMENT_TYPES),
      product_id: z.number().int().positive().nullable().optional(),
      equipment_brand: z.string().trim().max(150).nullable().optional(),
      equipment_model: z.string().trim().max(200).nullable().optional(),
      serial_number: z.string().trim().max(150).nullable().optional(),
      title: z.string().trim().min(1).max(300),
      description: z.string().trim().max(5000).nullable().optional(),
      is_patient_care_critical: z.boolean().optional(),
      attachments: z.array(attachmentSchema).max(5).optional(),
    })
    .strict(),
]);

async function resolveItemProduct(item: TicketEquipmentItemInput): Promise<TicketEquipmentItemInput> {
  if (!item.product_id) return item;

  const productResult = await query(
    `SELECT id, name, sku, sub_category, brand, product_type
     FROM public."TB_PRODUCTS"
     WHERE id = $1 AND is_active = true`,
    [item.product_id]
  );
  const product = productResult.rows[0];
  if (!product) throw new HttpError(400, "ไม่พบสินค้า/รุ่นที่เลือก");

  const equipmentByProductType: Record<string, string> = {
    printer: "PRINTER",
    hardware: "COMPUTER",
    network: "NETWORK",
    software: "SOFTWARE",
  };
  const expectedEquipment = equipmentByProductType[String(product.product_type).toLowerCase()];
  if (expectedEquipment && expectedEquipment !== item.equipment_type) {
    throw new HttpError(400, "ประเภทอุปกรณ์ไม่ตรงกับสินค้า/รุ่นที่เลือก");
  }

  return {
    ...item,
    equipment_brand: String(product.brand || "").trim() || null,
    equipment_model:
      String(product.sku || product.sub_category || product.name || "").trim() || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const p = req.nextUrl.searchParams;
    const data = await listTickets({
      status: p.get("status") || undefined,
      queue: p.get("queue") || undefined,
      priority: p.get("priority") || undefined,
      sla: p.get("sla") || undefined,
      search: p.get("search") || undefined,
    });
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const account = await requireHelpdeskUser(req);

    const body = createTicketSchema.parse(await req.json());
    const resolvedOrg =
      account.role === "viewer" && account.org_name
        ? account.org_name
        : body.customer_org.trim();
    if (!resolvedOrg) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุโรงพยาบาล / หน่วยงาน" },
        { status: 400 }
      );
    }

    const rawItems: TicketEquipmentItemInput[] =
      "items" in body
        ? body.items
        : [
            {
              equipment_type: body.equipment_type,
              product_id: body.product_id,
              equipment_brand: body.equipment_brand,
              equipment_model: body.equipment_model,
              serial_number: body.serial_number,
              title: body.title,
              description: body.description,
              is_patient_care_critical: body.is_patient_care_critical,
              attachments: body.attachments,
            },
          ];

    const resolvedItems = await Promise.all(rawItems.map(resolveItemProduct));

    const { request_group_no, tickets } = await createTicketBatch(
      {
        source_channel: body.source_channel,
        customer_org: resolvedOrg,
        customer_dept: body.customer_dept,
        contact_name: body.contact_name,
        contact_phone: body.contact_phone,
        contact_line: body.contact_line,
        impact: body.impact,
        urgency: body.urgency,
        priority_override: account.role === "admin" ? body.priority_override : undefined,
        created_by: account.username,
        client_request_id: body.client_request_id,
      },
      resolvedItems
    );

    return NextResponse.json(
      {
        success: true,
        data: tickets[0],
        items: tickets,
        request_group_no,
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error);
  }
}
