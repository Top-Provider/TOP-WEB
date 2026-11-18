import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkOrigin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-error";
import { query } from "@/lib/db";

const contactSchema = z
  .object({
    first_name: z.string().trim().min(1).max(150),
    last_name: z.string().trim().max(150).optional().default(""),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(60).optional().default(""),
    subject: z.string().trim().min(1).max(300),
    message: z.string().trim().min(1).max(5000),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const body = contactSchema.parse(await req.json());
    const res = await query(
      `INSERT INTO public."TB_CONTACT_MESSAGES" (first_name, last_name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        body.first_name,
        body.last_name || null,
        body.email,
        body.phone || null,
        body.subject,
        body.message,
      ]
    );
    return NextResponse.json({ success: true, data: res.rows[0] }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
