import { NextRequest, NextResponse } from "next/server";
import { query, pgUpdate, pgDelete } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { ActivityItem } from "../route";

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return [];
    }
  }
  return [];
}

function formatActivityRow(row: Record<string, unknown>): ActivityItem {
  let eventDateStr = "";
  if (row.event_date) {
    if (row.event_date instanceof Date) {
      const d = row.event_date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      eventDateStr = `${year}-${month}-${day}`;
    } else {
      eventDateStr = String(row.event_date).split("T")[0];
    }
  }

  return {
    id: Number(row.id),
    title: String(row.title || ""),
    title_en: row.title_en ? String(row.title_en) : undefined,
    category: String(row.category || "culture"),
    event_date: eventDateStr || undefined,
    location: row.location ? String(row.location) : undefined,
    short_description: row.short_description ? String(row.short_description) : undefined,
    content: row.content ? String(row.content) : undefined,
    cover_image_url: row.cover_image_url ? String(row.cover_image_url) : undefined,
    gallery_images: parseJsonArray(row.gallery_images),
    tags: parseJsonArray(row.tags),
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: ดึงกิจกรรมตาม ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const res = await query(
        `SELECT * FROM public."TB_ACTIVITIES" WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (res.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: `ไม่พบกิจกรรมรหัส ${id}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: formatActivityRow(res.rows[0]),
      });
    }

    const { data, error } = await supabase
      .from("TB_ACTIVITIES")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: `ไม่พบกิจกรรมรหัส ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatActivityRow(data),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT: อัปเดตกิจกรรมตาม ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) payload.title = String(body.title).trim();
    if (body.title_en !== undefined) payload.title_en = body.title_en ? String(body.title_en).trim() : null;
    if (body.category !== undefined) payload.category = String(body.category).trim();
    if (body.event_date !== undefined) payload.event_date = body.event_date || null;
    if (body.location !== undefined) payload.location = body.location ? String(body.location).trim() : null;
    if (body.short_description !== undefined) payload.short_description = body.short_description ? String(body.short_description).trim() : null;
    if (body.content !== undefined) payload.content = body.content || null;
    if (body.cover_image_url !== undefined) payload.cover_image_url = body.cover_image_url || null;
    if (body.gallery_images !== undefined) payload.gallery_images = JSON.stringify(body.gallery_images);
    if (body.tags !== undefined) payload.tags = JSON.stringify(body.tags);
    if (body.is_featured !== undefined) payload.is_featured = Boolean(body.is_featured);
    if (body.is_active !== undefined) payload.is_active = Boolean(body.is_active);
    if (body.sort_order !== undefined) payload.sort_order = Number(body.sort_order) || 0;

    let updatedRow: Record<string, unknown> | null = null;

    if (process.env.DATABASE_URL) {
      updatedRow = await pgUpdate("TB_ACTIVITIES", payload, id);
    } else {
      const { data, error } = await supabase
        .from("TB_ACTIVITIES")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      updatedRow = data;
    }

    return NextResponse.json({
      success: true,
      message: "แก้ไขกิจกรรมเรียบร้อยแล้ว",
      data: updatedRow ? formatActivityRow(updatedRow) : null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE: ลบกิจกรรมตาม ID
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await pgDelete("TB_ACTIVITIES", id);
    } else {
      const { error } = await supabase.from("TB_ACTIVITIES").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: `ลบกิจกรรมรหัส ${id} เรียบร้อยแล้ว`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

