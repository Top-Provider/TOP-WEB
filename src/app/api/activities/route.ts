import { NextRequest, NextResponse } from "next/server";
import { query, pgSelect, pgInsert, pgUpdate, pgDelete } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export interface ActivityItem {
  id: number;
  title: string;
  title_en?: string;
  category: string;
  event_date?: string;
  location?: string;
  short_description?: string;
  content?: string;
  cover_image_url?: string;
  gallery_images: string[];
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

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

// ============================================================================
// GET: ดึงรายการกิจกรรมทั้งหมด หรือค้นหา / กรองตามหมวดหมู่ / ดึงรายตัว
// ============================================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const categoryParam = searchParams.get("category");
    const featuredParam = searchParams.get("featured");
    const searchParam = searchParams.get("search")?.toLowerCase().trim();
    const allParam = searchParams.get("all") === "true"; // สำหรับหลังบ้าน ดูทั้ง active / inactive
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

    let rows: Record<string, unknown>[] = [];

    // 1. ดึงจาก Local PostgreSQL เป็นหลัก
    if (process.env.DATABASE_URL) {
      try {
        if (idParam) {
          const res = await query(
            `SELECT * FROM public."TB_ACTIVITIES" WHERE id = $1 LIMIT 1`,
            [idParam]
          );
          if (res.rows.length === 0) {
            return NextResponse.json(
              { success: false, error: `ไม่พบกิจกรรมรหัส ${idParam}` },
              { status: 404 }
            );
          }
          return NextResponse.json({
            success: true,
            data: formatActivityRow(res.rows[0]),
          });
        }

        const conditions: string[] = [];
        const values: unknown[] = [];
        let valIndex = 1;

        if (!allParam) {
          conditions.push(`is_active = true`);
        }

        if (categoryParam && categoryParam !== "all") {
          conditions.push(`category = $${valIndex++}`);
          values.push(categoryParam);
        }

        if (featuredParam === "true") {
          conditions.push(`is_featured = true`);
        }

        if (searchParam) {
          conditions.push(
            `(LOWER(title) LIKE $${valIndex} OR LOWER(title_en) LIKE $${valIndex} OR LOWER(short_description) LIKE $${valIndex} OR LOWER(location) LIKE $${valIndex})`
          );
          values.push(`%${searchParam}%`);
          valIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `
          SELECT * FROM public."TB_ACTIVITIES"
          ${whereClause}
          ORDER BY is_featured DESC, sort_order ASC, event_date DESC NULLS LAST, id DESC
          LIMIT $${valIndex++} OFFSET $${valIndex++}
        `;
        values.push(limitParam, offsetParam);

        const res = await query(sql, values);
        rows = res.rows;
      } catch (pgErr) {
        console.warn("[PostgreSQL Activities GET Error, falling back to Supabase]:", pgErr);
      }
    }

    // 2. Fallback ไปยัง Supabase หากไม่มี DB_URL หรือ PG query ล้มเหลว
    if (rows.length === 0 && !idParam) {
      try {
        let sbQuery = supabase.from("TB_ACTIVITIES").select("*");

        if (!allParam) {
          sbQuery = sbQuery.eq("is_active", true);
        }
        if (categoryParam && categoryParam !== "all") {
          sbQuery = sbQuery.eq("category", categoryParam);
        }
        if (featuredParam === "true") {
          sbQuery = sbQuery.eq("is_featured", true);
        }
        if (idParam) {
          sbQuery = sbQuery.eq("id", idParam);
        }

        sbQuery = sbQuery
          .order("is_featured", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("event_date", { ascending: false })
          .range(offsetParam, offsetParam + limitParam - 1);

        const { data: sbData, error: sbError } = await sbQuery;
        if (!sbError && sbData) {
          rows = sbData;
        }
      } catch (sbErr) {
        console.error("[Supabase Activities GET Error]:", sbErr);
      }
    }

    // จัดรูปแบบข้อมูลผลลัพธ์
    const activities = rows.map(formatActivityRow);

    return NextResponse.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[GET /api/activities Error]:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: สร้างกิจกรรมใหม่
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      title_en,
      category = "culture",
      event_date,
      location,
      short_description,
      content,
      cover_image_url,
      gallery_images = [],
      tags = [],
      is_featured = false,
      is_active = true,
      sort_order = 0,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุชื่อกิจกรรม (title)" },
        { status: 400 }
      );
    }

    const payload = {
      title: String(title).trim(),
      title_en: title_en ? String(title_en).trim() : null,
      category: String(category).trim(),
      event_date: event_date || null,
      location: location ? String(location).trim() : null,
      short_description: short_description ? String(short_description).trim() : null,
      content: content || null,
      cover_image_url: cover_image_url || null,
      gallery_images: JSON.stringify(gallery_images),
      tags: JSON.stringify(tags),
      is_featured: Boolean(is_featured),
      is_active: Boolean(is_active),
      sort_order: Number(sort_order) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedRow: Record<string, unknown> | null = null;

    if (process.env.DATABASE_URL) {
      insertedRow = await pgInsert("TB_ACTIVITIES", payload);
    } else {
      const { data, error } = await supabase
        .from("TB_ACTIVITIES")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      insertedRow = data;
    }

    return NextResponse.json({
      success: true,
      message: "เพิ่มกิจกรรมเรียบร้อยแล้ว",
      data: insertedRow ? formatActivityRow(insertedRow) : null,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/activities Error]:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT: แก้ไขข้อมูลกิจกรรม
// ============================================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ id ของกิจกรรมที่ต้องการแก้ไข" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dataToUpdate.title !== undefined) payload.title = String(dataToUpdate.title).trim();
    if (dataToUpdate.title_en !== undefined) payload.title_en = dataToUpdate.title_en ? String(dataToUpdate.title_en).trim() : null;
    if (dataToUpdate.category !== undefined) payload.category = String(dataToUpdate.category).trim();
    if (dataToUpdate.event_date !== undefined) payload.event_date = dataToUpdate.event_date || null;
    if (dataToUpdate.location !== undefined) payload.location = dataToUpdate.location ? String(dataToUpdate.location).trim() : null;
    if (dataToUpdate.short_description !== undefined) payload.short_description = dataToUpdate.short_description ? String(dataToUpdate.short_description).trim() : null;
    if (dataToUpdate.content !== undefined) payload.content = dataToUpdate.content || null;
    if (dataToUpdate.cover_image_url !== undefined) payload.cover_image_url = dataToUpdate.cover_image_url || null;
    if (dataToUpdate.gallery_images !== undefined) payload.gallery_images = JSON.stringify(dataToUpdate.gallery_images);
    if (dataToUpdate.tags !== undefined) payload.tags = JSON.stringify(dataToUpdate.tags);
    if (dataToUpdate.is_featured !== undefined) payload.is_featured = Boolean(dataToUpdate.is_featured);
    if (dataToUpdate.is_active !== undefined) payload.is_active = Boolean(dataToUpdate.is_active);
    if (dataToUpdate.sort_order !== undefined) payload.sort_order = Number(dataToUpdate.sort_order) || 0;

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
    console.error("[PUT /api/activities Error]:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: ลบกิจกรรม
// ============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // No body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ id ของกิจกรรมที่ต้องการลบ" },
        { status: 400 }
      );
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
    console.error("[DELETE /api/activities Error]:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

